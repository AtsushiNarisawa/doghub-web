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
import { getJstWeekday } from "./business-days";

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

// ── 午後から営業（宿泊のみ）の日 ─────────────────────────────
// daily_capacity.afternoon_only = true の日。午前はお店が無人になる日で、
// 受け付けるのは「14時からの宿泊のチェックイン」だけ（2026-09-13 CEO決定・初回は 10/31）。
//
//   - 日帰り（4h/8h）は受けない
//   - 14時より前のお預け（宿泊の早預かり・スポット）は受けない
//     → Webでは選ばせず「お電話でご相談ください」。スタッフが個別に判断して入力する
//   - 前の晩からの宿泊（その日の朝のお迎え・連泊でその日の朝をまたぐ）も受けない
//     ＝ 朝は完全に無人（CEO回答 (a)）
//
// お客様（Web/LINE）はこのルールで止める。スタッフ（source=phone）は止めず、
// 管理画面で警告を見たうえで入力できる（Web受付停止 web_closed と同じ考え方）。
//
// 🔴 店を閉めるのは closed、Web予約を全部止めるのは web_closed。これは別の3つ目のフラグ。

/** 午後から営業の日の、受付開始時刻（宿泊のチェックイン開始と同じ） */
export const AFTERNOON_OPEN_TIME = "14:00";

export type AfternoonOnlyViolationKind =
  /** その日の日帰り（4h/8h） */
  | "day_plan"
  /** その日の14時より前のお預け（宿泊の早預かり・14時前のスポット） */
  | "early_checkin"
  /** 前の晩からの宿泊（その日の朝のお迎え・連泊での通過） */
  | "overnight_before";

export interface AfternoonOnlyViolation {
  kind: AfternoonOnlyViolationKind;
  /** ルールに触れた「午後から営業」の日 "YYYY-MM-DD" */
  date: string;
}

export interface AfternoonOnlyBookingInput {
  plan: string;
  /** チェックイン日 "YYYY-MM-DD" */
  date: string;
  /** 宿泊のチェックアウト日 "YYYY-MM-DD" */
  checkoutDate?: string | null;
  /** チェックイン（到着予定）時刻 "HH:mm" または "HH:mm:ss" */
  checkinTime?: string | null;
  /** 宿泊の早預かり開始時刻（早預かりを付けないなら空） */
  checkinExtensionFrom?: string | null;
}

/**
 * 判定に必要な日付の一覧（この日付の afternoon_only をDBから引けば足りる）。
 * 日帰り＝その日だけ／宿泊＝チェックイン日〜チェックアウト日（両端含む。
 * チェックアウト日の朝もお店に人が要るため、休業チェックと違ってCO日も含める）。
 */
export function afternoonOnlyDatesToCheck(booking: AfternoonOnlyBookingInput): string[] {
  if (!booking.date) return [];
  if (booking.plan !== "stay" || !booking.checkoutDate || booking.checkoutDate <= booking.date) {
    return [booking.date];
  }
  const dates: string[] = [];
  let d = booking.date;
  for (let i = 0; i <= MAX_STAY_NIGHTS && d <= booking.checkoutDate; i++) {
    dates.push(d);
    d = addDaysJst(d, 1);
  }
  return dates;
}

/**
 * 予約内容が「午後から営業」の日のルールに触れるか。触れなければ null。
 *
 * @param booking         判定したい予約内容
 * @param isAfternoonOnly その日が「午後から営業」なら true
 */
export function findAfternoonOnlyViolation(
  booking: AfternoonOnlyBookingInput,
  isAfternoonOnly: (dateStr: string) => boolean
): AfternoonOnlyViolation | null {
  if (!booking.plan || !booking.date) return null;
  const time = (booking.checkinTime || "").slice(0, 5);

  if (booking.plan !== "stay") {
    if (!isAfternoonOnly(booking.date)) return null;
    // スポットは時間単位の枠。14時以降なら「午後の営業時間内」なので受けてよい
    if (booking.plan === "spot") {
      return time && time < AFTERNOON_OPEN_TIME ? { kind: "early_checkin", date: booking.date } : null;
    }
    return { kind: "day_plan", date: booking.date };
  }

  // 宿泊：チェックイン日が午後から営業なら、14時前の到着・早預かりは受けない
  if (isAfternoonOnly(booking.date)) {
    const ext = (booking.checkinExtensionFrom || "").slice(0, 5);
    if (ext || (time && time < AFTERNOON_OPEN_TIME)) {
      return { kind: "early_checkin", date: booking.date };
    }
  }

  // 宿泊：泊まる各晩の「翌朝」が午後から営業なら受けない（朝は無人のため）。
  // 翌朝 ＝ チェックイン翌日〜チェックアウト日。
  if (booking.checkoutDate && booking.checkoutDate > booking.date) {
    let morning = addDaysJst(booking.date, 1);
    for (let i = 0; i < MAX_STAY_NIGHTS && morning <= booking.checkoutDate; i++) {
      if (isAfternoonOnly(morning)) return { kind: "overnight_before", date: morning };
      morning = addDaysJst(morning, 1);
    }
  }
  return null;
}

/** "2026-10-31" → "10月31日（土）" */
export function formatDateJaWithWeekday(dateStr: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  const w = ["日", "月", "火", "水", "木", "金", "土"][getJstWeekday(dateStr)];
  return `${m}月${d}日（${w}）`;
}

/** お客様向けの案内文（予約API・予約フォームで同じ文言を出す） */
export function afternoonOnlyCustomerMessage(v: AfternoonOnlyViolation): string {
  const label = formatDateJaWithWeekday(v.date);
  switch (v.kind) {
    case "day_plan":
      return `${label}は午後（${AFTERNOON_OPEN_TIME}）からの営業のため、日帰りのお預かりはお受けしておりません。宿泊のお預かりは${AFTERNOON_OPEN_TIME}からのご到着で承ります`;
    case "early_checkin":
      return `${label}は午後（${AFTERNOON_OPEN_TIME}）からの営業です。${AFTERNOON_OPEN_TIME}より前のお預けは、お手数ですがお電話（0460-80-0290）でご相談ください`;
    case "overnight_before":
      return `${label}は午前の営業がないため、前日からのお泊まり（${label}の朝のお迎え・連泊）はお受けしておりません。日程をご確認ください`;
  }
}

/** スタッフ向けの警告文（管理画面の確認ダイアログ・注意書き） */
export function afternoonOnlyStaffWarning(v: AfternoonOnlyViolation): string {
  const label = formatDateJaWithWeekday(v.date);
  const head = `${label}は「午後から営業（宿泊のみ）」の日です（午前は無人）。`;
  switch (v.kind) {
    case "day_plan":
      return `${head}\nこの日の日帰りのお預かりはお客様のWeb予約では止めています。`;
    case "early_checkin":
      return `${head}\n${AFTERNOON_OPEN_TIME}より前のお預けになります。当日の出勤体制を確認してください。`;
    case "overnight_before":
      return `${head}\n前の晩からの宿泊になり、${label}の朝にお店に人が必要です。`;
  }
}
