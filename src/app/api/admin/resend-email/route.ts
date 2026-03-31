import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resendConfirmationEmail } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const session = req.cookies.get("doghub-admin-session");
  if (!session || session.value !== "authorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reservation_id } = await req.json();
    if (!reservation_id) {
      return NextResponse.json({ error: "reservation_id is required" }, { status: 400 });
    }

    const { data: res } = await supabase
      .from("reservations")
      .select("*, customers!inner(last_name, first_name, email), reservation_dogs(dogs(name, breed, weight))")
      .eq("id", reservation_id)
      .single();

    if (!res) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    const customer = res.customers;
    if (!customer?.email) {
      return NextResponse.json({ error: "メールアドレスが登録されていません" }, { status: 400 });
    }

    const dogList = (res.reservation_dogs || [])
      .map((rd: { dogs: { name: string; breed: string; weight: number } | null }) => rd.dogs)
      .filter(Boolean);

    await resendConfirmationEmail(res, customer, dogList);

    return NextResponse.json({ ok: true, sent_to: customer.email });
  } catch (err) {
    console.error("Resend email error:", err);
    return NextResponse.json({ error: "メール送信に失敗しました" }, { status: 500 });
  }
}
