import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchLineProfile } from "@/lib/line";

// 既存の LINE 会話に「誰なのか」を遡って埋めるバックフィル。
//
// 背景: 会話を記録する仕組み（Phase 2A）に顧客紐付けの処理が無かったため、
// 既存の会話はすべて display_name / customer_id が NULL のまま溜まっていた。
// 今後の会話は webhook 側（enrichConversation）で自動的に埋まるが、
// 過去分はここで一度だけ埋める。
//
// 実行（web/ で）:
//   bash scripts/line-backfill.sh dry    … 更新せず対象数だけ確認
//   bash scripts/line-backfill.sh run    … 実行
export const maxDuration = 60;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const supabase = getSupabase();

  const { data: conversations, error } = await supabase
    .from("line_conversations")
    .select("id, line_user_id, display_name, customer_id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 顧客側の line_id を一括で引いて突き合わせる（会話ごとに問い合わせない）
  const { data: linkedCustomers } = await supabase
    .from("customers")
    .select("id, line_id")
    .not("line_id", "is", null);
  const customerByLineId = new Map(
    (linkedCustomers ?? []).map((c) => [c.line_id as string, c.id as string])
  );

  const result = {
    total: conversations?.length ?? 0,
    nameFilled: 0,
    customerLinked: 0,
    nameUnavailable: 0,
    skipped: 0,
    dryRun,
  };

  for (const conv of conversations ?? []) {
    const patch: { display_name?: string; customer_id?: string } = {};

    if (!conv.display_name) {
      const profile = await fetchLineProfile(conv.line_user_id);
      if (profile?.displayName) {
        patch.display_name = profile.displayName;
        result.nameFilled++;
      } else {
        // ブロック済み・プロフィール取得に同意していない等
        result.nameUnavailable++;
      }
    }

    if (!conv.customer_id) {
      const customerId = customerByLineId.get(conv.line_user_id);
      if (customerId) {
        patch.customer_id = customerId;
        result.customerLinked++;
      }
    }

    if (Object.keys(patch).length === 0) {
      result.skipped++;
      continue;
    }

    if (!dryRun) {
      const { error: upErr } = await supabase
        .from("line_conversations")
        .update(patch)
        .eq("id", conv.id);
      if (upErr) console.error("backfill update error:", conv.id, upErr);
    }

    // LINE APIへの連続アクセスを抑える
    await new Promise((r) => setTimeout(r, 60));
  }

  return NextResponse.json(result);
}
