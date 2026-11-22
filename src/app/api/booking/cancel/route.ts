import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendCancellationEmails } from "@/lib/email";
import { verifyPhoneLast4 } from "@/lib/booking-auth";
import { activeFootprint, diffFootprint } from "@/lib/booking-rules";
import { applyCapacityDelta } from "@/lib/capacity-server";
import { getJstToday } from "@/lib/datetime";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { reservation_id, cancel_reason, phone_last4 } = await req.json();

    if (!reservation_id) {
      return NextResponse.json({ error: "予約IDが必要です" }, { status: 400 });
    }

    // 予約を取得（容量戻し・通知に必要な情報をすべて取得）
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("id, status, date, plan, checkout_date, checkin_time, dog_count, checkout_extension_until, checkout_addon_plan, checkin_addon_plan, checkin_addon_from, customers(last_name, first_name, phone, email, line_id)")
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

    const today = getJstToday();
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

    // daily_capacity を戻す。戻す枠は lib/booking-rules.ts の footprint が正本
    // （宿泊＝CI日〜CO前日の stay_booked ＋ チェックアウト後の半日・1日があれば CO日の day_booked）。
    // 「有効だった状態 → 空」の差分なので、確定・仮予約以外（完了など）なら何も動かさない。
    const dogCount = reservation.dog_count || 1;
    await applyCapacityDelta(supabase, diffFootprint(activeFootprint(reservation), []));

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
        const { buildCancellationMessage } = await import("@/lib/line");
        const { sendLinePushAndRecord } = await import("@/lib/line-store");
        lineDelivered = await sendLinePushAndRecord(
          customer.line_id,
          buildCancellationMessage({
            customerName: `${customer.last_name}${customer.first_name || ""}`,
            plan: reservation.plan,
            date: reservation.date,
            cancelledBy: "customer",
          }),
          "cancel"
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
          checkout_addon_plan: reservation.checkout_addon_plan,
          checkin_addon_plan: reservation.checkin_addon_plan,
          checkin_addon_from: reservation.checkin_addon_from,
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
