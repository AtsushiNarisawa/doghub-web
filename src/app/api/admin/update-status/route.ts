import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendThankYouEmail } from "@/lib/email";

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
      .update({ [column]: Math.max(0, existing[column] + delta) })
      .eq("date", date);
  } else if (delta > 0) {
    await supabase.from("daily_capacity").insert({ date, [column]: delta });
  }
}

async function adjustCapacity(reservationId: string, direction: 1 | -1) {
  const { data: r } = await supabase
    .from("reservations")
    .select("plan, date, checkout_date, dog_count")
    .eq("id", reservationId)
    .single();

  if (!r) return;

  const dogCount = (r.dog_count || 1) * direction;
  const capacityColumn = r.plan === "stay" ? "stay_booked" : "day_booked";

  if (r.plan === "stay" && r.checkout_date) {
    // 宿泊：CI日〜CO前日のstay_booked
    const d = new Date(r.date);
    const end = new Date(r.checkout_date);
    while (d < end) {
      const dateStr = d.toISOString().split("T")[0];
      await updateCapacity(dateStr, capacityColumn, dogCount);
      d.setDate(d.getDate() + 1);
    }
    // CO日のday_booked
    await updateCapacity(r.checkout_date, "day_booked", dogCount);
  } else {
    await updateCapacity(r.date, capacityColumn, dogCount);
  }
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("doghub-admin-session");
  if (!session || session.value !== "authorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reservation_id, status } = await req.json();

    if (!reservation_id || !status) {
      return NextResponse.json({ error: "必須パラメータが不足" }, { status: 400 });
    }

    const validStatuses = ["confirmed", "pending", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "無効なステータス" }, { status: 400 });
    }

    // 現在のステータスを取得
    const { data: current } = await supabase
      .from("reservations")
      .select("status")
      .eq("id", reservation_id)
      .single();

    if (!current) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    const oldStatus = current.status;

    // ステータス更新
    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", reservation_id);

    if (error) {
      console.error("Status update error:", error);
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    // 容量調整
    const wasActive = oldStatus === "confirmed" || oldStatus === "pending";
    const isActive = status === "confirmed" || status === "pending";

    if (wasActive && !isActive) {
      // 確定/確認待ち → キャンセル/完了：容量を戻す
      await adjustCapacity(reservation_id, -1);
    } else if (!wasActive && isActive) {
      // キャンセル/完了 → 確定/確認待ち：容量を加算
      await adjustCapacity(reservation_id, 1);
    }

    // completedに変更された場合、お礼メールを送信
    if (status === "completed" && oldStatus !== "completed") {
      try {
        // 予約の顧客情報と犬情報を取得
        const { data: reservation } = await supabase
          .from("reservations")
          .select("customer_id, plan")
          .eq("id", reservation_id)
          .single();

        if (reservation) {
          const { data: customer } = await supabase
            .from("customers")
            .select("email, last_name, first_name")
            .eq("id", reservation.customer_id)
            .single();

          const { data: dogs } = await supabase
            .from("dogs")
            .select("name")
            .eq("customer_id", reservation.customer_id);

          // 初回利用かどうか判定（completedの予約が他にあるか）
          const { count } = await supabase
            .from("reservations")
            .select("id", { count: "exact", head: true })
            .eq("customer_id", reservation.customer_id)
            .eq("status", "completed")
            .neq("id", reservation_id);

          const isFirstVisit = (count ?? 0) === 0;

          const planNames: Record<string, string> = {
            spot: "スポット利用", "4h": "半日お預かり", "8h": "1日お預かり", stay: "ご宿泊",
          };

          if (customer?.email) {
            await sendThankYouEmail(
              customer.email,
              `${customer.last_name}${customer.first_name || ""}`,
              dogs?.map(d => d.name) || [],
              planNames[reservation.plan] || "お預かり",
              isFirstVisit,
            );
          }
        }
      } catch (emailErr) {
        console.error("Thank-you email error:", emailErr);
        // メール送信失敗しても予約ステータス更新は成功として返す
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Update status API error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
