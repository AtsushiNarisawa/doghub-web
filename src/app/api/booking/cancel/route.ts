import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendCancellationEmails } from "@/lib/email";
import { verifyPhoneLast4 } from "@/lib/booking-auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 容量を更新する共通関数
async function updateCapacity(date: string, column: string, delta: number) {
  const { data: existing } = await supabase
    .from("daily_capacity")
    .select("*")
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("daily_capacity")
      .update({ [column]: Math.max(0, existing[column] + delta) })
      .eq("date", date);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reservation_id, cancel_reason, phone_last4 } = await req.json();

    if (!reservation_id) {
      return NextResponse.json({ error: "予約IDが必要です" }, { status: 400 });
    }

    // 予約を取得（容量戻し・通知に必要な情報をすべて取得）
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("id, status, date, plan, checkout_date, checkin_time, dog_count, checkout_extension_until, customers(last_name, first_name, phone, email, line_id)")
      .eq("id", reservation_id)
      .single();

    if (fetchError || !reservation) {
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
      return NextResponse.json({ error: "この予約は既にキャンセルされています" }, { status: 400 });
    }

    const jstNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    const today = `${jstNow.getFullYear()}-${String(jstNow.getMonth()+1).padStart(2,"0")}-${String(jstNow.getDate()).padStart(2,"0")}`;
    if (reservation.date < today) {
      return NextResponse.json({ error: "過去の予約はキャンセルできません" }, { status: 400 });
    }

    // ステータスをcancelledに更新
    const { error: updateError } = await supabase
      .from("reservations")
      .update({ status: "cancelled", cancel_reason: cancel_reason || null })
      .eq("id", reservation_id);

    if (updateError) {
      console.error("Cancel error:", updateError);
      return NextResponse.json({ error: "キャンセル処理に失敗しました" }, { status: 500 });
    }

    // daily_capacity を戻す（頭数分 × 全日程）
    const dogCount = reservation.dog_count || 1;
    const capacityColumn = reservation.plan === "stay" ? "stay_booked" : "day_booked";
    const datesToRelease: string[] = [];

    if (reservation.plan === "stay" && reservation.checkout_date) {
      const d = new Date(reservation.date);
      const end = new Date(reservation.checkout_date);
      while (d < end) {
        datesToRelease.push(d.toISOString().split("T")[0]);
        d.setDate(d.getDate() + 1);
      }
    } else {
      datesToRelease.push(reservation.date);
    }

    for (const date of datesToRelease) {
      await updateCapacity(date, capacityColumn, -dogCount);
    }
    // CO日のday_booked戻しは廃止（CO日加算自体を停止したため）

    const customer = reservation.customers as unknown as { last_name: string; first_name: string; phone: string; email: string; line_id: string | null } | null;

    // LINE通知（line_idがある場合）。文面は管理画面からのキャンセルと共通化してある
    // （lib/line.ts の buildCancellationMessage）。
    //
    // LINE友だち登録済みのお客様はLINEを優先し、同じ内容のメールは送らない
    // （2026-08-30 総点検 #10）。送れたかを確かめてからメールの要否を決めるため、
    // メールより先に push する。
    let lineDelivered = false;
    if (customer?.line_id) {
      try {
        const { sendLinePushMessage, buildCancellationMessage } = await import("@/lib/line");
        lineDelivered = await sendLinePushMessage(
          customer.line_id,
          buildCancellationMessage({
            customerName: `${customer.last_name}${customer.first_name || ""}`,
            plan: reservation.plan,
            date: reservation.date,
            cancelledBy: "customer",
          })
        );
      } catch (lineErr) {
        console.error("Cancel LINE notification error:", lineErr);
      }
    }

    // キャンセル通知メール（お客様 + スタッフ）。
    // 友だち解除・ブロック後は push が失敗する。そのときはメールに戻す
    // （LINE優先のまま黙ると、キャンセルの控えが丸ごと消えるため）。
    // スタッフ宛2通は skipCustomerEmail に関係なく必ず送られる。
    try {
      await sendCancellationEmails({
        reservationId: reservation_id,
        reservation: {
          plan: reservation.plan,
          date: reservation.date,
          checkin_time: reservation.checkin_time,
          checkout_date: reservation.checkout_date,
        },
        customer,
        dogCount,
        cancelReason: cancel_reason || null,
        cancelledBy: "customer",
        skipCustomerEmail: lineDelivered,
      });
    } catch (emailErr) {
      console.error("Cancel notification email error:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Cancel API error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
