import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendCancellationEmails } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PLAN_NAMES_TOP: Record<string, string> = {
  "4h": "半日お預かり", "8h": "1日お預かり", stay: "宿泊お預かり",
};

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
    const { reservation_id, cancel_reason } = await req.json();

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

    // キャンセル通知メール（お客様 + スタッフ）
    try {
      const customer = reservation.customers as unknown as { last_name: string; first_name: string; phone: string; email: string } | null;
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
      });
    } catch (emailErr) {
      console.error("Cancel notification email error:", emailErr);
    }

    // LINE通知（line_idがある場合）
    const customerData = reservation.customers as unknown as { last_name: string; first_name: string; line_id: string | null } | null;
    if (customerData?.line_id) {
      try {
        const { sendLinePushMessage } = await import("@/lib/line");
        const days = ["日","月","火","水","木","金","土"];
        const d = new Date(reservation.date + "T00:00:00");
        const dateStr = `${d.getMonth()+1}/${d.getDate()}（${days[d.getDay()]}）`;
        await sendLinePushMessage(customerData.line_id, [
          {
            type: "text" as const,
            text: `${customerData.last_name}${customerData.first_name || ""}様\n\n❌ ご予約がキャンセルされました\n\n📅 ${dateStr}\n📋 ${PLAN_NAMES_TOP[reservation.plan] || reservation.plan}\n\nまたのご利用をお待ちしております🐾`,
          },
        ]);
      } catch (lineErr) {
        console.error("Cancel LINE notification error:", lineErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Cancel API error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
