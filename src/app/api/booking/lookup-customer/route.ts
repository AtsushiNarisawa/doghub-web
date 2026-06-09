import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 公開予約フォームのリピーター照合用。顧客/犬テーブルへの anon 直読みを廃し、
// service_role のサーバー経由に限定する（RLS で anon SELECT を全面禁止にしても動くようにする）。
// - line_id 照合（LIFF）: 本人の LINE userId で自分の登録情報を引く → 顧客＋犬を返す
// - phone 照合（Web）: 電話番号で犬情報のみ返す（氏名等の個人情報は返さない。Step3で本人入力）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { phone, line_id } = await req.json();

    if (line_id) {
      const { data: customer } = await supabase
        .from("customers")
        .select("*")
        .eq("line_id", line_id)
        .maybeSingle();
      if (!customer) return NextResponse.json({ found: false });
      const { data: dogs } = await supabase
        .from("dogs")
        .select("*")
        .eq("customer_id", customer.id);
      return NextResponse.json({ found: true, customer, dogs: dogs || [] });
    }

    if (phone) {
      const normalized = String(phone).replace(/[-\s]/g, "");
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", normalized)
        .maybeSingle();
      if (!customer) return NextResponse.json({ found: false });
      const { data: dogs } = await supabase
        .from("dogs")
        .select("*")
        .eq("customer_id", customer.id);
      // 電話照合では顧客の個人情報は返さない（犬情報のみ）。氏名・住所等は Step3 で本人が入力する。
      return NextResponse.json({ found: true, dogs: dogs || [] });
    }

    return NextResponse.json({ error: "phone or line_id required" }, { status: 400 });
  } catch (e) {
    console.error("lookup-customer error:", e);
    return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  }
}
