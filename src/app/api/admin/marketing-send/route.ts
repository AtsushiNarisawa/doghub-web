import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWinbackEmail } from "@/lib/email";

// 本番(Vercel)では service role を使う（RLS対象外でログ書込/顧客更新）。ビルド時のモジュール評価で
// undefined にならないよう anon key にフォールバック（既存 cron ルートと同じ方式）。
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// リピートエンジン：ウィンバック／季節先行案内メールの分割送信エンドポイント。
// 認証: Authorization: Bearer <CRON_SECRET>（cron と同じ方式。手動 curl でも叩ける）
// クエリ:
//   campaign  : キャンペーンキー（例 summer2026_b3）。送信ログの一意キーになる（再送防止）
//   segment   : 'vip'（2回以上×120日離反） | 'lapsed'（1回以上×90日離反）
//   limit     : 1回の送信上限（既定100・Gmail一括送信/迷惑判定回避のため分割）
//   dryRun=1  : 送信せず対象件数とサンプルのみ返す
//
// 二重送信防止: get_winback_recipients が送信済み(marketing_email_log)を除外し、
// さらに送信直前に (customer_id, campaign_key) の一意制約で"claim"してから送る。
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SUBJECT = "夏・連休のお預かり、承っています｜DogHub箱根仙石原";
const THROTTLE_MS = 250;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function maskEmail(email: string): string {
  const [u, d] = (email || "").split("@");
  if (!d) return "***";
  const head = u.length <= 2 ? u[0] || "*" : u.slice(0, 2);
  return `${head}***@${d}`;
}

type Recipient = {
  customer_id: string;
  email: string;
  last_name: string | null;
  first_name: string | null;
  unsubscribe_token: string;
  dog_names: string[] | null;
  past_cnt: number;
  last_visit: string;
};

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const campaign = sp.get("campaign") || "";
  const segment = sp.get("segment") || "";
  const limit = Math.max(0, Math.min(200, parseInt(sp.get("limit") || "100", 10)));
  const dryRun = sp.get("dryRun") === "1";

  if (!campaign || !["vip", "lapsed"].includes(segment)) {
    return NextResponse.json(
      { error: "campaign と segment(vip|lapsed) は必須です" },
      { status: 400 },
    );
  }

  // 対象抽出（opt_out除外・送信済み除外はRPC内で実施）
  const { data, error } = await supabase.rpc("get_winback_recipients", {
    p_segment: segment,
    p_campaign_key: campaign,
    p_limit: dryRun ? 1000 : limit,
  });
  if (error) {
    console.error("[marketing-send] rpc error:", error.message);
    return NextResponse.json({ error: "対象抽出に失敗しました", detail: error.message }, { status: 500 });
  }
  const recipients = (data || []) as Recipient[];

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      campaign,
      segment,
      eligible: recipients.length,
      sample: recipients.slice(0, 5).map((r) => ({
        name: `${r.last_name || ""}様`,
        email: maskEmail(r.email),
        past_visits: r.past_cnt,
        last_visit: r.last_visit,
      })),
    });
  }

  // 実送信（sequential + throttle）
  const batch = recipients.slice(0, limit);
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const r of batch) {
    // 1) claim: 一意制約で二重送信を防ぐ。既にログがあれば skip。
    const { data: claimed, error: claimErr } = await supabase
      .from("marketing_email_log")
      .upsert(
        {
          customer_id: r.customer_id,
          campaign_key: campaign,
          email: r.email,
          subject: SUBJECT,
          status: "sending",
        },
        { onConflict: "customer_id,campaign_key", ignoreDuplicates: true },
      )
      .select("id");
    if (claimErr) {
      console.error(`[marketing-send] claim error cust=${r.customer_id}:`, claimErr.message);
      failed++;
      continue;
    }
    if (!claimed || claimed.length === 0) {
      // 既に送信済み/送信中 → skip
      skipped++;
      continue;
    }

    // 2) send
    try {
      await sendWinbackEmail({
        to: r.email,
        customerName: r.last_name || "",
        unsubscribeToken: r.unsubscribe_token,
        campaignKey: campaign,
      });
      await supabase
        .from("marketing_email_log")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("customer_id", r.customer_id)
        .eq("campaign_key", campaign);
      sent++;
    } catch (err) {
      const msg = (err as Error).message?.slice(0, 300) || "unknown";
      console.error(`[marketing-send] send failed cust=${r.customer_id}:`, msg);
      await supabase
        .from("marketing_email_log")
        .update({ status: "failed", error: msg })
        .eq("customer_id", r.customer_id)
        .eq("campaign_key", campaign);
      failed++;
    }
    await sleep(THROTTLE_MS);
  }

  // 残りの未送信数（この segment/campaign でまだ送れる人数）
  const { data: remainRows } = await supabase.rpc("get_winback_recipients", {
    p_segment: segment,
    p_campaign_key: campaign,
    p_limit: 1000,
  });
  const remaining = (remainRows || []).length;

  return NextResponse.json({ campaign, segment, requested: batch.length, sent, failed, skipped, remaining });
}
