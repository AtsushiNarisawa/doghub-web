import { NextResponse } from "next/server";
import { after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { exceedsRoomLimit, WEB_ROOM_LIMIT } from "@/lib/capacity";
import { verifyPhoneLast4 } from "@/lib/booking-auth";
import {
  afternoonOnlyDatesToCheck,
  findAfternoonOnlyViolation,
  afternoonOnlyCustomerMessage,
  activeFootprint,
  diffFootprint,
  increasedDates,
  checkoutAddonBlockReason,
  checkoutAddonCustomerMessage,
  formatDateJaWithWeekday,
  resolveAddonChange,
  isActiveReservationStatus,
  isLateBooking,
} from "@/lib/booking-rules";
import { getJstToday, getJstHour } from "@/lib/datetime";
import { checkoutAddonLabel, checkinAddonLabel } from "@/types/booking";
import { applyCapacityDelta } from "@/lib/capacity-server";
import { isDefaultClosedWeekday } from "@/lib/business-days";
import { sendReservationChangeEmail } from "@/lib/email";
import { buildReservationChangeMessage } from "@/lib/line";
import { sendLinePushAndRecord } from "@/lib/line-store";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const STAFF_EMAILS = [
  process.env.GMAIL_USER,
  "koi02121957@gmail.com",
].filter(Boolean) as string[];

const PLAN_NAMES: Record<string, string> = {
  spot: "スポットお預かり",
  "4h": "半日お預かり（4時間）",
  "8h": "1日お預かり（8時間）",
  stay: "宿泊お預かり",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reservationId, checkin_time, checkout_date, notes, phone_last4 } = body;

    if (!reservationId) {
      return NextResponse.json({ error: "reservationId is required" }, { status: 400 });
    }

    const { data: reservation, error: fetchErr } = await supabase
      .from("reservations")
      .select("*, customers(last_name, first_name, email, phone, line_id), reservation_dogs(dogs(name))")
      .eq("id", reservationId)
      .single();

    if (fetchErr || !reservation) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    // 本人確認（電話番号の下4桁）。UUIDだけの第三者操作を防ぐ。
    {
      const cust = reservation.customers as unknown as { phone: string } | null;
      if (!verifyPhoneLast4(cust?.phone, phone_last4)) {
        return NextResponse.json({ error: "本人確認に失敗しました" }, { status: 403 });
      }
    }

    if (reservation.status === "cancelled") {
      return NextResponse.json({ error: "キャンセル済みの予約は変更できません" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const changes: string[] = [];
    const dogCount = reservation.dog_count || 1;

    // ── 宿泊に付ける半日・1日の付け外し・付け替え（2026-11-22 第2段） ──
    // 項目を送ってこなければ「変更しない」。"" は外す、"4h"/"8h" は付ける（付け替え）。
    // 枠は下の footprint の差分だけで動く（CO後の半日⇄1日の付け替えは差分0・CI前は部屋数に入らない）。
    const addonReq = resolveAddonChange(body, reservation);
    if ("error" in addonReq) {
      return NextResponse.json({ error: addonReq.error }, { status: 400 });
    }
    const nextCoAddon = addonReq.coAddon;
    const nextCiAddon = addonReq.ciAddon;
    const nextCiAddonFrom = addonReq.ciAddonFrom;
    const coAddonChanged = (reservation.checkout_addon_plan ?? null) !== nextCoAddon;
    const ciAddonChanged =
      (reservation.checkin_addon_plan ?? null) !== nextCiAddon ||
      ((reservation.checkin_addon_from as string | null)?.slice(0, 5) ?? null) !== nextCiAddonFrom;

    if (coAddonChanged || ciAddonChanged) {
      if (!isActiveReservationStatus(reservation.status)) {
        return NextResponse.json({ error: "このご予約では半日・1日の変更はできません" }, { status: 400 });
      }
      // 締切: 新しくご予約いただくときと同じ（当日はお電話・前日17時以降の翌日分もお電話）。
      // 付け外しが影響する日＝CO後はチェックアウト日、CI前はチェックイン日。
      const today = getJstToday();
      const hour = getJstHour();
      const affected = [
        coAddonChanged ? reservation.checkout_date : null,
        ciAddonChanged ? reservation.date : null,
      ].filter(Boolean) as string[];
      if (affected.some((d) => d <= today || isLateBooking(d, today, hour))) {
        return NextResponse.json(
          { error: "直前の半日・1日のお預かりの変更は、お手数ですがお電話（0460-80-0290）でご連絡ください" },
          { status: 400 },
        );
      }
    }
    if (coAddonChanged) {
      updates.checkout_addon_plan = nextCoAddon;
      changes.push(`チェックアウト後: ${(checkoutAddonLabel(reservation.checkout_addon_plan) ?? "なし")} → ${(checkoutAddonLabel(nextCoAddon) ?? "なし")}`);
    }
    if (ciAddonChanged) {
      updates.checkin_addon_plan = nextCiAddon;
      updates.checkin_addon_from = nextCiAddonFrom;
      changes.push(
        `チェックイン前: ${(checkinAddonLabel(reservation.checkin_addon_plan, reservation.checkin_addon_from) ?? "なし")} → ${(checkinAddonLabel(nextCiAddon, nextCiAddonFrom) ?? "なし")}`,
      );
      // CI前の半日・1日があるときの到着時刻は 14:00 に揃える（予約APIと同じ・計画書 §1-2）
      if (nextCiAddon && reservation.checkin_time?.slice(0, 5) !== "14:00") updates.checkin_time = "14:00";
    }

    // CI前の半日・1日が付いている（付ける）予約は到着時刻を変えない（14:00 に揃えているため）
    if (!nextCiAddon && checkin_time && checkin_time !== reservation.checkin_time?.slice(0, 5)) {
      const oldTime = reservation.checkin_time?.slice(0, 5);
      updates.checkin_time = checkin_time;
      changes.push(`到着予定時間: ${oldTime} → ${checkin_time}`);
    }

    // CO日変更時は容量を再計算
    const coChanged = checkout_date && checkout_date !== reservation.checkout_date;
    if (coChanged) {
      updates.checkout_date = checkout_date;
      changes.push(`チェックアウト日: ${reservation.checkout_date} → ${checkout_date}`);
    }

    if (notes !== undefined && notes !== reservation.notes) {
      updates.notes = notes;
      changes.push("備考を更新");
    }

    if (changes.length === 0) {
      return NextResponse.json({ ok: true, message: "変更なし" });
    }

    if (coChanged && (reservation.plan !== "stay" || checkout_date <= reservation.date)) {
      return NextResponse.json({ error: "チェックアウト日はチェックイン日の翌日以降を選択してください" }, { status: 400 });
    }

    // CO日変更時の枠の差分（lib/booking-rules.ts の footprint が正本）。
    // チェックアウト後の半日・1日が付いている予約は、CO日を動かすとその分の枠も一緒に動く。
    const nextCheckoutDate: string | null = coChanged ? checkout_date : reservation.checkout_date;
    const capDelta = coChanged || coAddonChanged
      ? diffFootprint(
          activeFootprint(reservation),
          activeFootprint({ ...reservation, checkout_date: nextCheckoutDate, checkout_addon_plan: nextCoAddon }),
        )
      : [];

    // 事前チェック（新しく枠が増える日だけ）。最終判定は下の apply_capacity_delta（Web上限15）が原子的に行う。
    for (const date of increasedDates(capDelta)) {
      const { data: cap } = await supabase
        .from("daily_capacity")
        .select("day_booked, stay_booked, closed, web_closed")
        .eq("date", date)
        .maybeSingle();
      // チェックアウト日（半日・1日の分）: 定休日・臨時休業・Web受付停止・満席なら止める
      if (nextCoAddon && date === nextCheckoutDate) {
        const reason = checkoutAddonBlockReason(date, cap, { isStaff: false, addDogs: dogCount, limit: WEB_ROOM_LIMIT });
        if (reason) {
          // CO日はそのままで付けるだけ＝予約フォームと同じ文言（lib/booking-rules.ts）
          if (!coChanged) {
            return NextResponse.json({ error: checkoutAddonCustomerMessage(reason, date) }, { status: 400 });
          }
          const label = formatDateJaWithWeekday(date);
          const why =
            reason === "regular_closed" ? "定休日" :
            reason === "closed" ? "臨時休業" : "満席";
          return NextResponse.json(
            {
              error: `変更後のチェックアウト日（${label}）は${why}のため、半日・1日はお付けできません。` +
                (why === "満席" ? "お手数ですがお電話（0460-80-0290）でご相談ください" : "日程を選び直してください"),
            },
            { status: 400 },
          );
        }
        continue;
      }
      // 泊まる晩: 定休日（行なしの水木）・臨時休業・Web受付停止・満席なら止める
      if (cap ? cap.closed : isDefaultClosedWeekday(date)) {
        return NextResponse.json({ error: `${date}は休業日です` }, { status: 400 });
      }
      if (cap) {
        // Web受付停止日への延長はお客様側からは受けない（電話で相談いただく）
        if (cap.web_closed === true) {
          return NextResponse.json(
            { error: `${date}は満席です。お問い合わせください（TEL 0460-80-0290）` },
            { status: 400 },
          );
        }
        if (exceedsRoomLimit(cap, dogCount, WEB_ROOM_LIMIT)) {
          return NextResponse.json(
            { error: `${date}は満席です。お問い合わせください（TEL 0460-80-0290）` },
            { status: 400 },
          );
        }
      }
    }

    // 午後から営業（宿泊のみ）の日: お客様ご自身の変更で、新たにルールに触れる日程にはさせない。
    // 判定式は lib/booking-rules.ts が正本。すでに入っている予約（スタッフが警告を見て入れた分など）を
    // 理由に到着時刻や備考の変更まで止めないよう、「今回の変更で新しく触れたもの」だけを止める。
    if (reservation.plan === "stay" && (coChanged || updates.checkin_time || ciAddonChanged)) {
      const before = {
        plan: reservation.plan,
        date: reservation.date,
        checkoutDate: reservation.checkout_date,
        checkinTime: reservation.checkin_time,
        // チェックイン前の半日・1日も「14時より前のお預け」なので早預かりと同じに扱う（予約APIと同じ）
        checkinExtensionFrom: reservation.checkin_extension_from || reservation.checkin_addon_from || null,
      };
      const next = {
        ...before,
        checkoutDate: coChanged ? checkout_date : reservation.checkout_date,
        checkinTime: (updates.checkin_time as string | undefined) ?? reservation.checkin_time,
        checkinExtensionFrom: reservation.checkin_extension_from || nextCiAddonFrom || null,
      };
      const { data: aoRows } = await supabase
        .from("daily_capacity")
        .select("date")
        .in("date", [...new Set([...afternoonOnlyDatesToCheck(before), ...afternoonOnlyDatesToCheck(next)])])
        .eq("afternoon_only", true);
      const aoDates = new Set((aoRows || []).map((r) => r.date));
      const isAo = (d: string) => aoDates.has(d);
      const vNext = findAfternoonOnlyViolation(next, isAo);
      const vBefore = findAfternoonOnlyViolation(before, isAo);
      if (vNext && !(vBefore && vBefore.kind === vNext.kind && vBefore.date === vNext.date)) {
        return NextResponse.json({ error: afternoonOnlyCustomerMessage(vNext) }, { status: 400 });
      }
    }

    // 枠を先に動かす（原子的・Web上限15）。休業・満室のレースならここで止まり、予約は変わらない。
    if (capDelta.length > 0) {
      const cap = await applyCapacityDelta(supabase, capDelta, WEB_ROOM_LIMIT);
      if (!cap.ok) {
        return NextResponse.json(
          {
            error: cap.kind === "closed"
              ? `${cap.date}は休業日のため、この日程には変更できません`
              : `${cap.date}は満席です。お問い合わせください（TEL 0460-80-0290）`,
          },
          { status: 400 },
        );
      }
    }

    // DB更新
    const { error: updateErr } = await supabase
      .from("reservations")
      .update(updates)
      .eq("id", reservationId);

    if (updateErr) {
      // 先に動かした枠を戻す
      if (capDelta.length > 0) await applyCapacityDelta(supabase, diffFootprint(capDelta, []));
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    // お客様への変更控え。
    // 従来はスタッフ2名にしか送っておらず、画面に「スタッフにも変更内容を通知しました」と
    // 出るのにお客様の手元には何も残らなかった（2026-08-30 総点検 #3）。
    // お客様ご自身の操作＝完了画面をその場で見ているため、記録が残ればよい。
    // 二重通知を避けるのは従来どおりだが、優先順位を「LINE連携済みならLINEのみ・
    // 失敗時だけメール」に揃えた（2026-08-30 総点検 #10・CEO決定）。
    // 以前はここだけ「メール優先・メール未登録の方だけLINE」と他の経路と逆向きだった。
    // 送信はレスポンス後（after）。SMTPの詰まりで変更画面が固まるのを防ぐ。
    // ⚠️ スタッフ2名への通知は下の別ブロックで従来どおり必ず送る（ここでは止めない）。
    after(async () => {
      try {
        const cust = reservation.customers as unknown as {
          last_name: string; first_name: string | null; email: string | null; line_id: string | null;
        } | null;
        const changeParams = {
          plan: reservation.plan,
          date: reservation.date,
          checkin_time: (updates.checkin_time as string) ?? reservation.checkin_time,
          checkout_date: (updates.checkout_date as string) ?? reservation.checkout_date,
          checkout_addon_plan: nextCoAddon,
          checkin_addon_plan: nextCiAddon,
          checkin_addon_from: nextCiAddonFrom,
        };
        // 送れたかを確かめてからメールの要否を決めるため、メールより先に push する。
        let lineDelivered = false;
        if (cust?.line_id) {
          lineDelivered = await sendLinePushAndRecord(
            cust.line_id,
            buildReservationChangeMessage({
              customerName: `${cust.last_name}${cust.first_name || ""}`,
              plan: changeParams.plan,
              date: changeParams.date,
              checkinTime: changeParams.checkin_time,
              checkoutDate: changeParams.checkout_date,
              changes,
              reservationId,
              changedBy: "customer",
              checkoutAddonPlan: nextCoAddon,
              checkinAddonPlan: nextCiAddon,
              checkinAddonFrom: nextCiAddonFrom,
            }),
            "reschedule"
          ).catch((lineErr) => {
            console.error("[modify] LINE push error:", lineErr);
            return false;
          });
        }

        // 友だち解除・ブロック後は push が失敗する。そのときはメールに戻す
        // （LINE優先のまま黙ると、変更の控えがお客様の手元に一切残らないため）。
        if (!lineDelivered) {
          await sendReservationChangeEmail({
            reservationId,
            customer: cust,
            reservation: changeParams,
            changes,
            changedBy: "customer",
          });
        }
      } catch (notifyErr) {
        console.error("[modify] customer notify error:", notifyErr);
      }
    });

    // スタッフ通知メール
    const customer = reservation.customers;
    const dogNames = reservation.reservation_dogs
      ?.map((rd: { dogs: { name: string } | null }) => rd.dogs?.name)
      .filter(Boolean)
      .join("、") || "";

    const staffSubject = `📝 予約変更: ${customer?.last_name}${customer?.first_name || ""} 様（${PLAN_NAMES[reservation.plan] || reservation.plan}）`;
    const staffText = `予約内容が変更されました

お客様: ${customer?.last_name}${customer?.first_name || ""} 様
電話: ${customer?.phone}
ワンちゃん: ${dogNames}
プラン: ${PLAN_NAMES[reservation.plan] || reservation.plan}
日付: ${reservation.date}

変更内容:
${changes.map((c) => `・${c}`).join("\n")}

管理画面: https://dog-hub.shop/admin/reservations/${reservationId}`;

    const emailResults = await Promise.allSettled(
      STAFF_EMAILS.map((email) =>
        transporter.sendMail({
          from: `"DogHub箱根仙石原" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: staffSubject,
          text: staffText,
        })
      )
    );

    emailResults.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`[modify] email failed [${STAFF_EMAILS[i]}]:`, (r.reason as Error).message?.slice(0, 200));
      }
    });

    return NextResponse.json({ ok: true, changes });
  } catch (e) {
    console.error("[modify] error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
