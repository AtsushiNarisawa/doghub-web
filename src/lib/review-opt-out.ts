import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 口コミ依頼（お礼メール／LINE 内の「Googleで口コミを書く」セクション）を
 * このお客様に出してよいかの単一判定。
 *
 * customers.review_request_opt_out = true のお客様には口コミ依頼を出さない。
 * ⚠️ 影響するのは口コミ依頼セクションだけ。お礼メッセージ本体・リマインド・
 *    予約確認メールの送信可否には一切影響しない。
 *
 * 取得に失敗した場合は「出さない」(true) を返す = fail-closed。
 * （列追加マイグレーション未適用／PostgRESTスキーマキャッシュ未更新でも、
 *   お礼の送信自体は止めず、口コミ依頼だけを落として安全側に倒す）
 */
export async function isReviewRequestOptedOut(
  supabase: SupabaseClient,
  customerId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("customers")
    .select("review_request_opt_out")
    .eq("id", customerId)
    .single();

  if (error) {
    console.warn(
      `review_request_opt_out lookup failed for customer ${customerId} (fail-closed):`,
      error.message,
    );
    return true;
  }

  return (data as { review_request_opt_out?: boolean } | null)?.review_request_opt_out === true;
}
