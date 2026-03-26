import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendThankYouEmail } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PLAN_NAMES: Record<string, string> = {
  spot: "スポットお預かり",
  "4h": "半日お預かり（4時間）",
  "8h": "1日お預かり（8時間）",
  stay: "宿泊お預かり",
};

export async function GET(req: NextRequest) {
  // Vercel Cron認証チェック
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 前日の日付を計算（JST = UTC+9）
  const now = new Date();
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  jstNow.setDate(jstNow.getDate() - 1);
  const yesterdayStr = jstNow.toISOString().split("T")[0];

  // 日帰りプラン（spot, 4h, 8h）: date = 前日
  const { data: dayUseReservations, error: dayUseError } = await supabase
    .from("reservations")
    .select(`
      id, plan, date, checkout_date, customer_id,
      customers!inner(id, last_name, first_name, email),
      reservation_dogs(dogs(name))
    `)
    .eq("date", yesterdayStr)
    .in("plan", ["spot", "4h", "8h"])
    .in("status", ["confirmed", "completed"])
    .eq("thankyou_sent", false);

  // 宿泊プラン（stay）: checkout_date = 前日
  const { data: stayReservations, error: stayError } = await supabase
    .from("reservations")
    .select(`
      id, plan, date, checkout_date, customer_id,
      customers!inner(id, last_name, first_name, email),
      reservation_dogs(dogs(name))
    `)
    .eq("checkout_date", yesterdayStr)
    .eq("plan", "stay")
    .in("status", ["confirmed", "completed"])
    .eq("thankyou_sent", false);

  if (dayUseError || stayError) {
    console.error("Thankyou query error:", dayUseError || stayError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const reservations = [...(dayUseReservations || []), ...(stayReservations || [])];

  if (reservations.length === 0) {
    return NextResponse.json({
      message: `No reservations to thank for ${yesterdayStr}`,
      sent: 0,
    });
  }

  let sent = 0;
  let failed = 0;

  for (const r of reservations) {
    const customer = r.customers as unknown as {
      id: string;
      last_name: string;
      first_name: string;
      email: string;
    };
    if (!customer?.email) continue;

    const dogNames = (
      r.reservation_dogs as unknown as { dogs: { name: string } | null }[]
    )
      .map((rd) => rd.dogs?.name)
      .filter(Boolean) as string[];

    const customerName = `${customer.last_name} ${customer.first_name}`;
    const planName = PLAN_NAMES[r.plan] || r.plan;

    // isFirstVisit: その顧客の予約が1件のみかどうか
    const { count } = await supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", r.customer_id)
      .in("status", ["confirmed", "completed"]);

    const isFirstVisit = (count ?? 0) <= 1;

    try {
      await sendThankYouEmail(customer.email, customerName, dogNames, planName, isFirstVisit);

      // 送信成功後、thankyou_sent = true に更新
      const { error: updateError } = await supabase
        .from("reservations")
        .update({ thankyou_sent: true })
        .eq("id", r.id);

      if (updateError) {
        console.error(`Failed to update thankyou_sent for ${r.id}:`, updateError);
      }

      sent++;
    } catch (err) {
      console.error(`Thank-you email failed for ${r.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({
    message: `Thank-you emails for ${yesterdayStr}`,
    total: reservations.length,
    sent,
    failed,
  });
}
