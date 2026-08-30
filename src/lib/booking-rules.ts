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
