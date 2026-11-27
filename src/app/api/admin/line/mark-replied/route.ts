import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminBearer } from "@/lib/admin-auth";
import { recordStaffReplyMark } from "@/lib/line-store";

// 管理画面「LINEのやり取り」で「LINEで送りました」／「LINEアプリで返信済みにする」を押したときの控え（2026-11-27）。
//
// スタッフが LINE アプリから送った返信は LINE の仕様上こちらに届かないため、
// 押した事実を line_messages に1行だけ残す（outbound・sender=staff・message_type=staff_reply_marked）。
// 毎朝の要返信チェックは、その会話で最後の控えより前のお客様のメッセージを拾わない。
//
// - LINE へは何も送らない。下書き（line_reply_drafts）の削除は画面側が今までどおり行う。
// - 記録は service_role 限定の DB 関数 record_line_message 経由（列・RLS・関数は変えていない）。
// - 記録に失敗しても 200 で { recorded: false } を返す＝画面の操作（下書きを消す）を止めない。

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BODY = 5000;

export async function POST(req: NextRequest) {
  if (!(await verifyAdminBearer(req))) {
    return NextResponse.json(
      { error: "ログインの有効期限が切れました。ログインし直してください。" },
      { status: 401 },
    );
  }

  let conversationId = "";
  let body: string | null = null;
  try {
    const json = await req.json();
    conversationId = typeof json?.conversation_id === "string" ? json.conversation_id : "";
    body = typeof json?.body === "string" ? json.body : null;
  } catch {
    return NextResponse.json({ error: "内容が読み取れませんでした" }, { status: 400 });
  }
  if (!UUID_RE.test(conversationId)) {
    return NextResponse.json({ error: "やり取りの指定が正しくありません" }, { status: 400 });
  }
  if (body && body.length > MAX_BODY) body = body.slice(0, MAX_BODY);

  try {
    const { data: conv, error } = await supabase
      .from("line_conversations")
      .select("line_user_id")
      .eq("id", conversationId)
      .maybeSingle();
    if (error || !conv?.line_user_id) {
      if (error) console.error("mark-replied conversation fetch error:", error);
      return NextResponse.json({ recorded: false });
    }
    const recorded = await recordStaffReplyMark(conv.line_user_id, body);
    return NextResponse.json({ recorded });
  } catch (e) {
    console.error("mark-replied failed:", e);
    return NextResponse.json({ recorded: false });
  }
}
