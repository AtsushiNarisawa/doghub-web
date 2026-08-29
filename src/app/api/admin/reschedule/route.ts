import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { exceedsRoomLimit, PHYSICAL_ROOM_LIMIT } from "@/lib/capacity";
import { sendReservationChangeEmail } from "@/lib/email";
import { sendLinePushMessage, buildReservationChangeMessage } from "@/lib/line";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function updateCapacity(date: string, column: string, delta: number) {
  const { data: existing } = await supabase
    .from("daily_capacity")
    .select("*")
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("daily_capacity")
      .update({ [column]: Math.max(0, (existing[column] || 0) + delta) })
      .eq("date", date);
  } else if (delta > 0) {
    await supabase.from("daily_capacity").insert({ date, [column]: delta });
  }
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("doghub-admin-session");
  if (!session || session.value !== "authorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    const capacityColumn = res.plan === "stay" ? "stay_booked" : "day_booked";

    // 旧日程と新日程の占有日リストを構築
    const buildRange = (ciStr: string, coStr: string | null): string[] => {
      if (!coStr) return [];
      const dates: string[] = [];
      const d = new Date(ciStr);
      const end = new Date(coStr);
      while (d < end) {
        dates.push(d.toISOString().split("T")[0]);
        d.setDate(d.getDate() + 1);
      }
      return dates;
    };
    const oldDates = res.plan === "stay" && res.checkout_date
      ? buildRange(res.date, res.checkout_date)
      : [res.date];
    const effectiveCheckout = (res.plan === "stay" && new_checkout_date) ? new_checkout_date : res.checkout_date;
    const newDates = res.plan === "stay" && effectiveCheckout
      ? buildRange(new_date, effectiveCheckout)
      : [new_date];

    // 休業日判定（新規予約API route.ts と同一ロジック）。
    // daily_capacity 行が無い将来の水木には行が無いのが常態のため、cap=null のときは
    // 曜日で定休(水=3/木=4)を判定する。これを怠ると、新規予約では弾かれる「定休日をまたぐ/
    // 定休日に在室する連泊」をリスケで成立させられてしまう。
    const closedWeekdays = [3, 4];
    const isClosedDate = (date: string, cap: { closed: boolean } | null): boolean => {
      if (cap) return cap.closed;
      const dow = new Date(date + "T12:00:00+09:00").getUTCDay();
      return closedWeekdays.includes(dow);
    };

    // 純粋な追加日のみ容量チェック（重複日は元々 dogCount 含まれているのでスキップ）
    const oldSet = new Set(oldDates);
    const addedDates = newDates.filter((d) => !oldSet.has(d));
    for (const date of addedDates) {
      const { data: cap } = await supabase
        .from("daily_capacity")
        .select("day_booked, stay_booked, closed")
        .eq("date", date)
        .maybeSingle();
      if (isClosedDate(date, cap)) {
        return NextResponse.json({ error: `${date}は休業日のため、この日程には変更できません` }, { status: 400 });
      }
      if (cap && exceedsRoomLimit(cap, dogCount, PHYSICAL_ROOM_LIMIT)) {
        return NextResponse.json({ error: `${date}は満室です（全${PHYSICAL_ROOM_LIMIT}室）` }, { status: 400 });
      }
    }

    // 旧日程の容量を戻す
    for (const date of oldDates) {
      await updateCapacity(date, capacityColumn, -dogCount);
    }

    // 予約を更新
    const updates: Record<string, unknown> = { date: new_date };
    if (new_checkin_time) updates.checkin_time = new_checkin_time;
    if (res.plan === "stay" && new_checkout_date) updates.checkout_date = new_checkout_date;

    await supabase.from("reservations").update(updates).eq("id", reservation_id);

    // 新日程の容量を加算
    for (const date of newDates) {
      await updateCapacity(date, capacityColumn, dogCount);
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
            .select("plan, date, checkin_time, checkout_date, customers(last_name, first_name, email, line_id)")
            .eq("id", reservation_id)
            .single();
          const customer = full?.customers as unknown as {
            last_name: string; first_name: string | null; email: string | null; line_id: string | null;
          } | null;
          if (!full || !customer) return;

          await sendReservationChangeEmail({
            reservationId: reservation_id,
            customer,
            reservation: {
              plan: full.plan,
              date: full.date,
              checkin_time: full.checkin_time,
              checkout_date: full.checkout_date,
            },
            changes,
            changedBy: "staff",
          });

          if (customer.line_id) {
            await sendLinePushMessage(
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
              })
            );
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
