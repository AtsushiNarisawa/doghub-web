// JST タイムゾーン対応の日時ユーティリティ。
// Vercel サーバーは UTC で動くため、new Date() の getHours/getDate などは
// 直接 JST にならない。Intl.DateTimeFormat で timeZone:"Asia/Tokyo" を
// 指定して文字列を取り出すパターンが安全（feedback_timezone_bug_jst_after_9am.md 参照）。

/** 「YYYY-MM-DD HH:mm」形式の JST 現在時刻 */
export function getJstNow(): string {
  return new Date().toLocaleString("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

/** 「YYYY-MM-DD」形式の JST 今日 */
export function getJstToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

/** JST の現在時刻（時のみ、0-23） */
export function getJstHour(): number {
  return parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo", hour: "2-digit", hour12: false,
    }).format(new Date()),
    10
  );
}

/** 「YYYY-MM-DD」形式で today + n 日後を返す */
export function addDaysJst(baseDate: string, days: number): string {
  const d = new Date(baseDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}
