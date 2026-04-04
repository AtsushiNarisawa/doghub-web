import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    // 旧日程の容量を戻す
    if (res.plan === "stay" && res.checkout_date) {
      const d = new Date(res.date);
      const end = new Date(res.checkout_date);
      while (d < end) {
        await updateCapacity(d.toISOString().split("T")[0], "stay_booked", -dogCount);
        d.setDate(d.getDate() + 1);
      }
      await updateCapacity(res.checkout_date, "day_booked", -dogCount);
    } else {
      await updateCapacity(res.date, capacityColumn, -dogCount);
    }

    // 予約を更新
    const updates: Record<string, unknown> = { date: new_date };
    if (new_checkin_time) updates.checkin_time = new_checkin_time;
    if (res.plan === "stay" && new_checkout_date) updates.checkout_date = new_checkout_date;

    await supabase.from("reservations").update(updates).eq("id", reservation_id);

    // 新日程の容量を加算
    const effectiveCheckout = (res.plan === "stay" && new_checkout_date) ? new_checkout_date : res.checkout_date;
    if (res.plan === "stay" && effectiveCheckout) {
      const d = new Date(new_date);
      const end = new Date(effectiveCheckout);
      while (d < end) {
        await updateCapacity(d.toISOString().split("T")[0], "stay_booked", dogCount);
        d.setDate(d.getDate() + 1);
      }
      await updateCapacity(effectiveCheckout, "day_booked", dogCount);
    } else {
      await updateCapacity(new_date, capacityColumn, dogCount);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Reschedule error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
