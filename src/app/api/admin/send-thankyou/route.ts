import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendThankYouEmail } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PLAN_NAMES: Record<string, string> = {
  spot: "スポット利用",
  "4h": "半日お預かり",
  "8h": "1日お預かり",
  stay: "ご宿泊",
};

export async function POST(req: NextRequest) {
  const session = req.cookies.get("doghub-admin-session");
  if (!session || session.value !== "authorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reservation_id } = await req.json();

    if (!reservation_id) {
      return NextResponse.json({ error: "予約IDが必要です" }, { status: 400 });
    }

    // 予約情報を取得
    const { data: reservation } = await supabase
      .from("reservations")
      .select("customer_id, plan")
      .eq("id", reservation_id)
      .single();

    if (!reservation) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    // 顧客情報を取得
    const { data: customer } = await supabase
      .from("customers")
      .select("email, last_name, first_name")
      .eq("id", reservation.customer_id)
      .single();

    if (!customer?.email) {
      return NextResponse.json({ error: "メールアドレスが登録されていません" }, { status: 400 });
    }

    // 犬情報を取得
    const { data: dogs } = await supabase
      .from("dogs")
      .select("name")
      .eq("customer_id", reservation.customer_id);

    // 初回利用かどうか判定
    const { count } = await supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", reservation.customer_id)
      .eq("status", "completed")
      .neq("id", reservation_id);

    const isFirstVisit = (count ?? 0) === 0;

    await sendThankYouEmail(
      customer.email,
      `${customer.last_name}${customer.first_name || ""}`,
      dogs?.map(d => d.name) || [],
      PLAN_NAMES[reservation.plan] || "お預かり",
      isFirstVisit,
    );

    return NextResponse.json({ success: true, isFirstVisit });
  } catch (e) {
    console.error("Send thank-you email error:", e);
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
