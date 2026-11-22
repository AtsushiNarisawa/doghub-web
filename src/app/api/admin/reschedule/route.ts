import { NextRequest, NextResponse } from "next/server";
import { verifyAdminBearer } from "@/lib/admin-auth";
import { after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { exceedsRoomLimit, PHYSICAL_ROOM_LIMIT } from "@/lib/capacity";
import { isDefaultClosedWeekday } from "@/lib/business-days";
import { sendReservationChangeEmail } from "@/lib/email";
import { buildReservationChangeMessage } from "@/lib/line";
import { sendLinePushAndRecord } from "@/lib/line-store";
import {
  activeFootprint,
  diffFootprint,
  increasedDates,
  checkoutAddonBlockReason,
  checkoutAddonStaffMessage,
} from "@/lib/booking-rules";
import { applyCapacityDelta } from "@/lib/capacity-server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  if (!(await verifyAdminBearer(req))) {
    return NextResponse.json(
      { error: "ログインの有効期限が切れました。ログインし直してください。" },
      { status: 401 },
    );
  }

  try {
    const { reservation_id, new_date, new_checkin_time, new_checkout_date } = await req.json();

    if (!reservation_id || !new_date) {
      return NextResponse.json({ error: "必須パラメータが不足" }, { status: 400 });
    }

    // 現在の予約を取得
    const { data: res } = await supabase
      .from("reservations")
      .select("*")
      .eq("id", reservation_id)
      .single();

    if (!res) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    const dogCount = res.dog_count || 1;
    const effectiveCheckout = (res.plan === "stay" && new_checkout_date) ? new_checkout_date : res.checkout_date;
    if (res.plan === "stay" && (!effectiveCheckout || effectiveCheckout <= new_date)) {
      return NextResponse.json({ error: "チェックアウト日はチェックイン日の翌日以降にしてください" }, { status: 400 });
    }

    // 枠の差分（lib/booking-rules.ts の footprint が正本）。
    // 🔴 キャンセル済み・完了・無断キャンセルの予約は枠を持たないので、日程を動かしても枠は動かない
    //    （以前は状態を見ずに旧日程を引き新日程を足していた＝キャンセル済みをリスケすると枠が増えた）。
    // チェックアウト後の半日・1日が付いていれば CO日の分も一緒に動く。
    const fpBefore = activeFootprint(res);
    const fpAfter = activeFootprint({ ...res, date: new_date, checkout_date: res.plan === "stay" ? effectiveCheckout : null });
    const capDelta = diffFootprint(fpBefore, fpAfter);

    // 休業日判定（新規予約API route.ts と同一ロジック）。
    // daily_capacity 行が無い将来の水木には行が無いのが常態のため、cap=null のときは
    // 曜日で定休(水=3/木=4)を判定する。曜日の値と JST 曜日の求め方は lib/business-days.ts が正本。
    const isClosedDate = (date: string, cap: { closed: boolean } | null): boolean => {
      if (cap) return cap.closed;
      return isDefaultClosedWeekday(date);
    };

    // 新しく枠が増える日だけ事前にチェック（最終判定は apply_capacity_delta が原子的に行う）
    for (const date of increasedDates(capDelta)) {
      const { data: cap } = await supabase
        .from("daily_capacity")
        .select("day_booked, stay_booked, closed, web_closed")
        .eq("date", date)
        .maybeSingle();
      // チェックアウト後の半日・1日の日: 定休日・臨時休業はスタッフも不可（11-22 CEO 決定）
      if (res.plan === "stay" && res.checkout_addon_plan && date === effectiveCheckout) {
        const reason = checkoutAddonBlockReason(date, cap, { isStaff: true, addDogs: dogCount, limit: PHYSICAL_ROOM_LIMIT });
        if (reason) {
          return NextResponse.json(
            { error: `${checkoutAddonStaffMessage(reason, date)}。半日・1日を外してから日程を変更してください` },
            { status: 400 },
          );
        }
        continue;
      }
      if (isClosedDate(date, cap)) {
        return NextResponse.json({ error: `${date}は休業日のため、この日程には変更できません` }, { status: 400 });
      }
      if (cap && exceedsRoomLimit(cap, dogCount, PHYSICAL_ROOM_LIMIT)) {
        return NextResponse.json({ error: `${date}は満室です（全${PHYSICAL_ROOM_LIMIT}室）` }, { status: 400 });
      }
    }

    // 枠を先に動かす（旧日程の解放と新日程の確保を1トランザクションで）
    if (capDelta.length > 0) {
      const cap = await applyCapacityDelta(supabase, capDelta, PHYSICAL_ROOM_LIMIT);
      if (!cap.ok) {
        return NextResponse.json(
          {
            error: cap.kind === "closed"
              ? `${cap.date}は休業日のため、この日程には変更できません`
              : `${cap.date}は満室です（全${PHYSICAL_ROOM_LIMIT}室）`,
          },
          { status: 400 },
        );
      }
    }

    // 予約を更新
    const updates: Record<string, unknown> = { date: new_date };
    if (new_checkin_time) updates.checkin_time = new_checkin_time;
    if (res.plan === "stay" && new_checkout_date) updates.checkout_date = new_checkout_date;

    const { error: updErr } = await supabase.from("reservations").update(updates).eq("id", reservation_id);
    if (updErr) {
      if (capDelta.length > 0) await applyCapacityDelta(supabase, diffFootprint(capDelta, []));
      return NextResponse.json({ error: "日程の変更に失敗しました" }, { status: 500 });
    }

    // お客様への変更通知（メール + LINE）。
    // 従来はこのAPIに通知が一切なく、スタッフが日程を動かしてもお客様は気づけなかった
    // （2026-08-30 総点検 #2）。お客様が操作していない変更なので、確定・キャンセルと同様に
    // メールとLINEの両方へ送る（LINE予約はメール未登録がありうるため片方だけでは届かない）。
    // 通知の失敗で日程変更そのものを失敗扱いにはしない（変更はすでに確定済み）。
    //
    // 送信はレスポンス送出後に after() で行う。Gmail SMTP が詰まるとスタッフの画面が
    // 固まり、再クリック→二重リスケ（容量の二重加減算）を招くため
    // （予約API route.ts と同じ理由・同じ手当て）。
    const oldCheckin = res.checkin_time?.slice(0, 5) || "";
    const newCheckin = (new_checkin_time || res.checkin_time || "").slice(0, 5);
    const changes: string[] = [];
    if (new_date !== res.date) changes.push(`日付: ${res.date} → ${new_date}`);
    if (newCheckin && newCheckin !== oldCheckin) {
      changes.push(`チェックイン時間: ${oldCheckin} → ${newCheckin}`);
    }
    if (res.plan === "stay" && new_checkout_date && new_checkout_date !== res.checkout_date) {
      changes.push(`チェックアウト日: ${res.checkout_date} → ${new_checkout_date}`);
    }

    if (changes.length > 0) {
      after(async () => {
        try {
          const { data: full } = await supabase
            .from("reservations")
            .select("plan, date, checkin_time, checkout_date, checkout_addon_plan, checkin_addon_plan, checkin_addon_from, customers(last_name, first_name, email, line_id)")
            .eq("id", reservation_id)
            .single();
          const customer = full?.customers as unknown as {
            last_name: string; first_name: string | null; email: string | null; line_id: string | null;
          } | null;
          if (!full || !customer) return;

          // LINE友だち登録済みのお客様はLINEを優先し、同じ内容のメールは送らない
          // （2026-08-30 総点検 #10・CEO決定）。従来この経路はメールとLINEの両方を
          // 送っており、お客様には同じ変更内容が2通届いていた。
          // 送れたかを確かめてからメールの要否を決めるため、メールより先に push する。
          let lineDelivered = false;
          if (customer.line_id) {
            lineDelivered = await sendLinePushAndRecord(
              customer.line_id,
              buildReservationChangeMessage({
                customerName: `${customer.last_name}${customer.first_name || ""}`,
                plan: full.plan,
                date: full.date,
                checkinTime: full.checkin_time,
                checkoutDate: full.checkout_date,
                changes,
                reservationId: reservation_id,
                changedBy: "staff",
                checkoutAddonPlan: full.checkout_addon_plan,
                checkinAddonPlan: full.checkin_addon_plan,
                checkinAddonFrom: full.checkin_addon_from,
              }),
              "reschedule"
            ).catch((lineErr) => {
              console.error("Reschedule LINE push error:", lineErr);
              return false;
            });
          }

          // 友だち解除・ブロック後は push が失敗する。そのときはメールに戻す
          // （LINE優先のまま黙ると、日程が変わったことがお客様に一切伝わらないため）。
          if (!lineDelivered) {
            await sendReservationChangeEmail({
              reservationId: reservation_id,
              customer,
              reservation: {
                plan: full.plan,
                date: full.date,
                checkin_time: full.checkin_time,
                checkout_date: full.checkout_date,
                checkout_addon_plan: full.checkout_addon_plan,
                checkin_addon_plan: full.checkin_addon_plan,
                checkin_addon_from: full.checkin_addon_from,
              },
              changes,
              changedBy: "staff",
            });
          }
        } catch (notifyErr) {
          console.error("Reschedule notify error:", notifyErr);
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Reschedule error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
