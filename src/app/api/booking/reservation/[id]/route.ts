import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 公開のキャンセル/変更ページ用に、予約1件を id で取得する（service_role）。
// 予約テーブルへの anon 直読みを廃し、RLS で anon SELECT を全面禁止にしても動くようにする。
// id は予約確認メール内リンクの UUID（推測困難）。返すのは表示に必要な最小限のフィールドのみ。
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { data, error } = await supabase
      .from("reservations")
      .select(
        "id, status, date, checkin_time, plan, checkout_date, notes, customers(last_name, first_name), reservation_dogs(dogs(name, breed))"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ reservation: data });
  } catch (e) {
    console.error("reservation lookup error:", e);
    return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  }
}
