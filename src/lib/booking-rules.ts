// 予約の受付ルールのうち「日付・時刻で決まるもの」の唯一の正本。
// 以前は同じ「前日17時以降の翌日予約＝仮予約」判定を、お客様側の3画面
// （step1-plan / step4-confirm / 完了画面）とサーバー（api/booking/route.ts）が
// それぞれ独立に書いており、境界時刻（17時ちょうど付近）で
// 「画面には仮予約と出ないのにDBはpending」といった食い違いが起こり得た（総点検 #27）。
//
// 日付・時刻の比較は必ず JST の "YYYY-MM-DD" 文字列で行う。
// Vercel のサーバーは UTC で動くため、new Date() からローカル日付を組み立てると
// JST 9時以降に1日ズレる（memory: feedback_timezone_bug_jst_after_9am）。

import { getJstToday, getJstHour, addDaysJst } from "./datetime";

/** この時刻（JST）以降に入った「翌日」のご予約は仮予約として受け付ける */
export const LATE_BOOKING_HOUR = 17;

/**
 * 前日17時以降に入った「翌日」のご予約か（＝仮予約になるか）。
 *
 * @param date 予約日 "YYYY-MM-DD"
 * @param today JST の今日 "YYYY-MM-DD"（省略時は現在時刻から取得）
 * @param hourJst JST の現在時（0-23。省略時は現在時刻から取得）
 */
export function isLateBooking(
  date: string,
  today: string = getJstToday(),
  hourJst: number = getJstHour()
): boolean {
  if (!date) return false;
  return date === addDaysJst(today, 1) && hourJst >= LATE_BOOKING_HOUR;
}

// ── キャンセル料の区分 ─────────────────────────────────────
// 規定そのものは既に FAQ（/faq）と予約確認画面（step4-confirm）に載っているもので、
// ここで新しい規定を作ってはいない。メール/LINE のリンクから開くセルフキャンセル画面
// （/booking/cancel/[id]）だけがこの案内を持っておらず、お客様が「いくらかかるのか」
// を知らないまま確定ボタンを押せてしまっていた（総点検 #20）。

/** キャンセルを申し出た時点の区分 */
export type CancellationTiming = "same_day" | "day_before" | "earlier";

/** 区分ごとのキャンセル料率（%）。0 は無料 */
export const CANCELLATION_FEE_PERCENT: Record<CancellationTiming, number> = {
  same_day: 100,
  day_before: 50,
  earlier: 0,
};

/**
 * ご予約日（チェックイン日）に対して、いまキャンセルするとどの区分になるか。
 *
 * 判定は必ず JST の "YYYY-MM-DD" 文字列どうしの比較で行う。
 * Vercel のサーバーは UTC で動くため new Date() からローカル日付を組み立てると
 * JST 9時以降に1日ズレる（memory: feedback_timezone_bug_jst_after_9am）。
 *
 * @param date  ご予約日（チェックイン日）"YYYY-MM-DD"
 * @param today JST の今日 "YYYY-MM-DD"（省略時は現在時刻から取得）
 */
export function getCancellationTiming(
  date: string,
  today: string = getJstToday()
): CancellationTiming {
  if (!date) return "earlier";
  // 過去日は画面側でキャンセル自体を止めているが、判定としては当日と同じ扱いにする
  if (date <= today) return "same_day";
  if (date === addDaysJst(today, 1)) return "day_before";
  return "earlier";
}

// ── 連泊で選べるチェックアウト日の範囲 ─────────────────────
// お泊まりになるのは「チェックイン日〜チェックアウト日の前日」の各泊。
// チェックアウト日そのものは帰るだけなので、定休日でもお引き取りは承れる
// （memory: feedback_closed_day_diagnostic「休業初日のCOは営業として可能」）。
// 以前はチェックアウト日だけが素の日付入力で、泊まれない日をまたぐ日程も
// 一度選べてしまい、あとから赤字エラーが出ていた（総点検 #19）。

/** 連泊の探索上限（泊）。定休日が毎週あるため実際には届かないが、無限ループを防ぐ歯止め */
export const MAX_STAY_NIGHTS = 60;

/**
 * チェックアウト日として選べる最終日を返す。
 *
 * チェックイン日から順に「その晩は泊まれるか」を見ていき、最初に泊まれない晩
 * （定休日 or 満室）が見つかったら、その日がチェックアウトの上限になる。
 *
 * @param checkin            チェックイン日 "YYYY-MM-DD"
 * @param isNightUnavailable その日の晩が泊まれない（定休日 or 満室）なら true
 */
export function lastCheckoutDate(
  checkin: string,
  isNightUnavailable: (dateStr: string) => boolean,
  maxNights: number = MAX_STAY_NIGHTS
): string {
  if (!checkin) return "";
  let night = checkin;
  for (let i = 0; i < maxNights; i++) {
    if (isNightUnavailable(night)) return night;
    night = addDaysJst(night, 1);
  }
  return night;
}
