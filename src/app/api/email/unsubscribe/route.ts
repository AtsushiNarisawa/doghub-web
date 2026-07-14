import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 本番(Vercel)では service role を使う。ビルド時のモジュール評価で undefined にならないよう
// anon key にフォールバック（既存 cron ルートと同じ方式・ビルド時は実行されない）。
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// 配信停止エンドポイント。
// - メールクライアントのワンクリック（RFC 8058）: token をクエリに付けて POST が飛んでくる
// - 確認ページ（/unsubscribe）からの POST: token をクエリ or JSON body で受ける
// いずれも customers.email_opt_out = true に更新する（token が本人性の担保）。
async function optOut(token: string | null): Promise<{ ok: boolean; reason?: string }> {
  if (!token) return { ok: false, reason: "missing_token" };
  const { data, error } = await supabase
    .from("customers")
    .update({ email_opt_out: true })
    .eq("unsubscribe_token", token)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("[unsubscribe] db error:", error.message);
    return { ok: false, reason: "db_error" };
  }
  if (!data) return { ok: false, reason: "not_found" };
  return { ok: true };
}

export async function POST(req: NextRequest) {
  let token = req.nextUrl.searchParams.get("token");
  if (!token) {
    // 確認ページからの JSON body も許容
    try {
      const body = await req.json();
      if (body && typeof body.token === "string") token = body.token;
    } catch {
      // form-encoded（ワンクリック List-Unsubscribe=One-Click）等は body 無視でOK
    }
  }
  const result = await optOut(token);
  // メールクライアントのワンクリックは 200 を期待するため、失敗でも 200 で返す（本人には影響なし）
  return NextResponse.json(result, { status: result.ok ? 200 : 200 });
}
