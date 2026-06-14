import { supabase } from "@/lib/supabase";

/**
 * 「○回利用」の正準カウントを扱う唯一のソース。
 *
 * 定義: visit_count = legacy_visit_count + 確定/完了の予約数
 *   - legacy_visit_count: 移行前(2026-03-16 AirReserve切替以前)の凍結来店履歴（customersカラム・不変）
 *   - 確定/完了の予約数: 新システムの reservations を status='confirmed'|'completed' で集計（ライブ）
 *
 * total_visits（キャンセルで減算されない累積カウンタ）は表示に使わない。
 * 予約→キャンセル→再予約で膨張し、初回客が常連表示される不具合の原因だったため。
 * 2026-06-14 恒久対策で全管理画面をこの定義に統一。
 */

/** ライブ集計に含める予約ステータス */
export const LIVE_VISIT_STATUSES = ["confirmed", "completed"] as const;

/** 予約ステータスがライブ来店としてカウント対象か */
export function isLiveVisit(status: string): boolean {
  return status === "confirmed" || status === "completed";
}

/**
 * すでに取得済みのデータから正準カウントを計算する純関数。
 * 顧客一覧のようにネストで予約を取得済みの画面で使う。
 */
export function computeVisitCount(
  legacyVisitCount: number | null | undefined,
  reservationStatuses: string[]
): number {
  const live = reservationStatuses.filter(isLiveVisit).length;
  return (legacyVisitCount ?? 0) + live;
}

/**
 * 複数顧客分の正準カウントをまとめて取得する（N+1回避）。
 * 返り値は customer_id → 利用回数。要求したIDは必ずキーに含まれる（0埋め）。
 *
 * 注意: 多数の顧客IDを一度に渡すとURLが肥大化するため、
 * 顧客一覧のような全件画面では使わず computeVisitCount を使うこと。
 */
export async function fetchVisitCounts(
  customerIds: string[]
): Promise<Record<string, number>> {
  const ids = [...new Set(customerIds.filter(Boolean))];
  if (ids.length === 0) return {};

  const counts: Record<string, number> = {};
  for (const id of ids) counts[id] = 0;

  // 1) 凍結された移行前履歴
  const { data: customers } = await supabase
    .from("customers")
    .select("id, legacy_visit_count")
    .in("id", ids);
  for (const c of customers ?? []) {
    counts[c.id] = c.legacy_visit_count ?? 0;
  }

  // 2) 新システムの確定/完了予約数
  const { data: rows } = await supabase
    .from("reservations")
    .select("customer_id")
    .in("customer_id", ids)
    .in("status", LIVE_VISIT_STATUSES as unknown as string[]);
  for (const r of rows ?? []) {
    counts[r.customer_id] = (counts[r.customer_id] ?? 0) + 1;
  }

  return counts;
}
