// 営業日・定休日にまつわる「コード側の唯一の正本」。
//
// 定休日は水（3）・木（4）。以前はこの [3, 4] という配列が管理画面・予約API・
// リスケAPI・設定画面など8箇所に別々に書かれており、曜日を変えるときに
// 直し漏れが起きる状態だった（2026-08-30 予約システム総点検 #29）。
//
// 🔴 値の出どころは3層ある。混同しないこと:
//   1. DB `site_settings.closed_weekdays`（現在 '3,4'）… 実際の運用値。
//      fetchSiteSettings() がこれを読む。運用で変えるならここ。
//   2. このファイルの DEFAULT_CLOSED_WEEKDAYS … 1が読めないときのフォールバック、
//      および DB を読まない画面（管理画面のカレンダー等）が使う既定値。
//   3. Supabase の DB 関数（予約時の休業チェック等）… サーバー側の最終ガード。
//      🔴 DB 側の定義はこのファイルからは変えられない。物理的に曜日を変えるときは
//      1・2・3 を必ず一緒に直す。
//
// ⚠️ 休業まわりの「運用ルール」は実装からは導けない（memory: feedback_closed_day_diagnostic）。
//    ここは値の置き場所を1つにまとめただけで、判定の仕様は一切変えていない。
//
// 📌 未集約が1箇所だけ残っている: components/booking/step1-plan.tsx の useState 初期値。
//    直前の Batch 5 で触ったばかりのファイルのため、今回はあえて手を付けていない。
//    次に同ファイルを触るときに DEFAULT_CLOSED_WEEKDAYS へ差し替えること。

/** 定休日の曜日番号（0=日 … 6=土）。3=水・4=木。 */
export const DEFAULT_CLOSED_WEEKDAYS: number[] = [3, 4];

/**
 * "YYYY-MM-DD" の JST における曜日番号（0=日 … 6=土）を返す。
 *
 * Vercel のサーバーは UTC で動くため、`new Date("YYYY-MM-DDT00:00:00+09:00").getDay()` は
 * UTC 環境で前日の曜日を返してしまう（memory: feedback_timezone_bug_jst_after_9am）。
 * JST の正午を基準にして getUTCDay() を読むと、サーバー・ブラウザのどちらでもズレない。
 */
export function getJstWeekday(dateStr: string): number {
  return new Date(dateStr + "T12:00:00+09:00").getUTCDay();
}

/** "YYYY-MM-DD" が既定の定休日（水・木）にあたるか。臨時休業/臨時営業の上書きは含まない。 */
export function isDefaultClosedWeekday(dateStr: string): boolean {
  return DEFAULT_CLOSED_WEEKDAYS.includes(getJstWeekday(dateStr));
}
