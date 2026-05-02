import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { exceedsRoomLimit, ROOM_LIMIT } from "@/lib/capacity";

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

    // 純粋な追加日のみ容量チェック（重複日は元々 dogCount 含まれているのでスキップ）
    const oldSet = new Set(oldDates);
    const addedDates = newDates.filter((d) => !oldSet.has(d));
    for (const date of addedDates) {
      const { data: cap } = await supabase
        .from("daily_capacity")
        .select("day_booked, stay_booked, closed")
        .eq("date", date)
        .maybeSingle();
      if (cap) {
        if (cap.closed) {
          return NextResponse.json({ error: `${date}は臨時休業です` }, { status: 400 });
        }
        if (exceedsRoomLimit(cap, dogCount)) {
          return NextResponse.json({ error: `${date}は満室です（全${ROOM_LIMIT}室）` }, { status: 400 });
        }
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

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Reschedule error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
