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
  // no_show（無断キャンセル）は来店していないので false のまま＝「◯回利用」に入らない
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

/** 「何回目のご利用か」の算出に使う予約の最小情報 */
export type VisitOrdinalRow = {
  id: string;
  customer_id: string;
  date: string;
  checkin_time: string | null;
  created_at: string;
  status: string;
};

/**
 * 予約1件ごとの「何回目のご利用か」を算出する（顧客の通算回数ではない）。
 *
 * 定義: legacy_visit_count + その顧客の予約を来店日順に並べたときの順位
 *   - 並び順は 来店日 → チェックイン時刻 → 予約作成日時（予約を取った順ではなく来店の順）
 *   - キャンセル・無断キャンセルは来店ではないので数えず、結果にも含めない（＝バッジを出さない）
 *   - 仮予約(pending)は「確定すれば何回目になるか」を示すため順番に含める
 *
 * 例: 8/10と8/11に予約があるお客様は 8/10=1（初回）・8/11=2（2回目）。
 * 従来は顧客の通算回数を全予約行に貼っていたため、両方とも「2回目」と表示されていた（2026-08-09 修正）。
 */
export function computeVisitOrdinals(
  legacyByCustomer: Record<string, number>,
  rows: VisitOrdinalRow[]
): Record<string, number> {
  const byCustomer: Record<string, VisitOrdinalRow[]> = {};
  for (const r of rows) {
    // キャンセルと無断キャンセルは来店していないので数えない。
    // 「◯回利用」（LIVE_VISIT_STATUSES = confirmed/completed）と数え方を揃えている。
    if (r.status === "cancelled" || r.status === "no_show") continue;
    (byCustomer[r.customer_id] ??= []).push(r);
  }

  const ordinals: Record<string, number> = {};
  for (const [customerId, list] of Object.entries(byCustomer)) {
    list.sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (a.checkin_time ?? "").localeCompare(b.checkin_time ?? "") ||
        (a.created_at ?? "").localeCompare(b.created_at ?? "")
    );
    const base = legacyByCustomer[customerId] ?? 0;
    list.forEach((r, i) => {
      ordinals[r.id] = base + i + 1;
    });
  }
  return ordinals;
}

/**
 * 予約ID → 何回目のご利用か をまとめて取得する。
 * 返り値のキーは予約ID（顧客IDではない）。キャンセル予約は含まれない。
 *
 * 注意: fetchVisitCounts と同様、多数の顧客IDを一度に渡すとURLが肥大化する。
 */
export async function fetchVisitOrdinals(
  customerIds: string[]
): Promise<Record<string, number>> {
  const ids = [...new Set(customerIds.filter(Boolean))];
  if (ids.length === 0) return {};

  const [{ data: customers }, { data: rows }] = await Promise.all([
    supabase.from("customers").select("id, legacy_visit_count").in("id", ids),
    supabase
      .from("reservations")
      .select("id, customer_id, date, checkin_time, created_at, status")
      .in("customer_id", ids)
      .neq("status", "cancelled"),
  ]);

  const legacy: Record<string, number> = {};
  for (const c of customers ?? []) legacy[c.id] = c.legacy_visit_count ?? 0;

  return computeVisitOrdinals(legacy, (rows ?? []) as VisitOrdinalRow[]);
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
