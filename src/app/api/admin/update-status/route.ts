import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  // 管理画面セッション確認
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

    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", reservation_id);

    if (error) {
      console.error("Status update error:", error);
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Update status API error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
