import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPhoneLast4 } from "@/lib/booking-auth";

// 公開のキャンセル/変更ページ用に、予約1件を id で取得する（service_role）。
// 予約テーブルへの anon 直読みを廃し、RLS で anon SELECT を全面禁止にしても動くようにする。
// id は予約確認メール内リンクの UUID（推測困難）。
// さらに本人確認として電話番号の下4桁(phone_last4)の一致を必須化する（IDOR対策）。
// 返すのは表示に必要な最小限のフィールドのみ（電話番号自体は返さない）。
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const phoneLast4Input = req.nextUrl.searchParams.get("phone_last4");
    if (!phoneLast4Input) {
      return NextResponse.json({ error: "本人確認が必要です" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("reservations")
      .select(
        "id, status, date, checkin_time, plan, checkout_date, notes, customers(last_name, first_name, phone), reservation_dogs(dogs(name, breed))"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // 本人確認: 電話番号の下4桁の一致
    const customer = data.customers as unknown as { last_name: string; first_name: string; phone: string } | null;
    if (!verifyPhoneLast4(customer?.phone, phoneLast4Input)) {
      return NextResponse.json({ error: "本人確認に失敗しました" }, { status: 403 });
    }

    // 電話番号は返さない（表示に不要・最小開示）
    const { customers, ...rest } = data;
    const safeCustomer = customers
      ? { last_name: (customers as unknown as { last_name: string }).last_name, first_name: (customers as unknown as { first_name: string }).first_name }
      : null;
    return NextResponse.json({ reservation: { ...rest, customers: safeCustomer } });
  } catch (e) {
    console.error("reservation lookup error:", e);
    return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  }
}
