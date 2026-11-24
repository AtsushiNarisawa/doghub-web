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
import { getJstWeekday, DEFAULT_CLOSED_WEEKDAYS } from "./business-days";
import {
  findCheckoutAddon,
  findCheckinAddon,
  normalizeCheckinAddonFrom,
  PLANS,
  type CheckoutAddonPlan,
} from "../types/booking";

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

// ── 部屋数（daily_capacity）の増減：全経路の唯一の正本 ─────────────────
// 2026-11-22 改修（docs/specs/stay_addon_capacity_plan_2026-11-22.md）。
// 以前は予約・キャンセル・お客様の変更・スタッフの日程変更・状態変更の5か所が、
// それぞれ「宿泊＝CI日〜CO前日の stay_booked、日帰り＝その日の day_booked」を
// new Date() のループで別々に書いていた。宿泊に付ける半日・1日（チェックアウト後）が
// CO日の day_booked を使うようになったため、1か所でも書き漏らすと
// 「キャンセルしても枠が戻らない」が起きる。そこで
//   1. 予約1件が占める枠（footprint）をこの関数だけで決める
//   2. 操作の前後の footprint の差分だけを DB 関数 apply_capacity_delta に1回で渡す
// に揃えた。DB への反映は lib/capacity-server.ts の applyCapacityDelta が行う。

export type CapacityColumn = "stay_booked" | "day_booked";

export interface CapacityItem {
  /** "YYYY-MM-DD" */
  date: string;
  column: CapacityColumn;
  /** 増減する頭数（＝部屋数） */
  delta: number;
}

export interface FootprintInput {
  plan: string;
  /** チェックイン日（日帰りはその日） "YYYY-MM-DD" */
  date: string;
  checkout_date?: string | null;
  dog_count?: number | null;
  /** チェックアウト後の半日・1日（"4h"/"8h"）。付いていなければ null */
  checkout_addon_plan?: string | null;
  /** 予約の状態。activeFootprint でだけ見る */
  status?: string | null;
}

/** 枠を占める（＝部屋数に数える）予約の状態 */
export const ACTIVE_RESERVATION_STATUSES = ["confirmed", "pending"] as const;

export function isActiveReservationStatus(status: string | null | undefined): boolean {
  return status === "confirmed" || status === "pending";
}

/**
 * 予約1件が「有効な状態のとき」に占める枠。状態は見ない（見るのは activeFootprint）。
 *  - 宿泊: CI日〜CO前日の各日に stay_booked +頭数。
 *          チェックアウト後の半日・1日があれば CO日に day_booked +頭数。
 *          チェックイン前の半日・1日は足さない（CI日はすでに宿泊で1部屋数えている）。
 *  - 日帰り（4h/8h/spot）: その日に day_booked +頭数。
 * 日付は addDaysJst で "YYYY-MM-DD" 文字列のまま進める（new Date() のローカル日付は使わない）。
 */
export function capacityFootprint(r: FootprintInput): CapacityItem[] {
  if (!r.plan || !r.date) return [];
  const n = Math.max(1, r.dog_count || 1);
  if (r.plan !== "stay") {
    return [{ date: r.date, column: "day_booked", delta: n }];
  }
  const items: CapacityItem[] = [];
  const co = r.checkout_date || "";
  if (!co || co <= r.date) return items; // 日程が壊れた宿泊は枠を持たない（予約APIが先に弾く）
  let d = r.date;
  for (let i = 0; i < MAX_STAY_NIGHTS && d < co; i++) {
    items.push({ date: d, column: "stay_booked", delta: n });
    d = addDaysJst(d, 1);
  }
  if (r.checkout_addon_plan === "4h" || r.checkout_addon_plan === "8h") {
    items.push({ date: co, column: "day_booked", delta: n });
  }
  return items;
}

/** 状態まで見た footprint（キャンセル・完了・無断キャンセルは枠を持たない） */
export function activeFootprint(r: FootprintInput): CapacityItem[] {
  return isActiveReservationStatus(r.status) ? capacityFootprint(r) : [];
}

/**
 * before → after にするために DB へ足す差分。キャンセルは after=[]、新規は before=[]。
 * 同じ日・同じ列はまとめ、増減0は落とす。日付順に並べる（DB 側も日付順にロックする）。
 */
export function diffFootprint(before: CapacityItem[], after: CapacityItem[]): CapacityItem[] {
  const sum = new Map<string, number>();
  const add = (it: CapacityItem, sign: 1 | -1) => {
    const key = `${it.date}|${it.column}`;
    sum.set(key, (sum.get(key) || 0) + sign * it.delta);
  };
  before.forEach((it) => add(it, -1));
  after.forEach((it) => add(it, 1));
  const out: CapacityItem[] = [];
  for (const [key, delta] of sum) {
    if (delta === 0) continue;
    const [date, column] = key.split("|") as [string, CapacityColumn];
    out.push({ date, column, delta });
  }
  return out.sort((a, b) => (a.date === b.date ? a.column.localeCompare(b.column) : a.date < b.date ? -1 : 1));
}

/** 差分のうち「枠が増える日」だけ（事前チェック・休業チェックの対象） */
export function increasedDates(items: CapacityItem[]): string[] {
  const byDate = new Map<string, number>();
  items.forEach((it) => byDate.set(it.date, (byDate.get(it.date) || 0) + it.delta));
  return [...byDate].filter(([, v]) => v > 0).map(([d]) => d).sort();
}

// ── チェックアウト日に半日・1日を付けられるか ─────────────────────
// 11-22 CEO 決定（計画書 §1・§9）:
//   - 定休日（行なしの水木）・臨時休業（closed）＝お客様もスタッフも付けられない。電話への誘導はしない。
//     水木でも臨時営業（行あり closed=false）の日は通常どおり。
//   - Web受付停止（web_closed）・満席＝お客様は付けられない（「お電話でご相談ください」）。
//     スタッフは管理画面から付けられる（上限は物理19）。

export type CheckoutAddonBlockReason = "regular_closed" | "closed" | "web_closed" | "full";

export interface CheckoutDayRow {
  closed?: boolean | null;
  web_closed?: boolean | null;
  day_booked?: number | null;
  stay_booked?: number | null;
}

/**
 * チェックアウト日に半日・1日を付けられない理由（null＝付けられる）。
 *
 * @param coDate チェックアウト日 "YYYY-MM-DD"
 * @param row    その日の daily_capacity 行（無ければ null）
 * @param opts.isStaff        スタッフ（管理画面・電話予約）の操作なら true
 * @param opts.closedWeekdays 定休曜日（省略時は DEFAULT_CLOSED_WEEKDAYS）
 * @param opts.addDogs        いまから足す頭数（満席判定をするときだけ渡す）
 * @param opts.limit          満席判定の上限（お客様=15・スタッフ=19）
 */
export function checkoutAddonBlockReason(
  coDate: string,
  row: CheckoutDayRow | null | undefined,
  opts: { isStaff: boolean; closedWeekdays?: number[]; addDogs?: number; limit?: number }
): CheckoutAddonBlockReason | null {
  if (!coDate) return null;
  const weekdays = opts.closedWeekdays ?? DEFAULT_CLOSED_WEEKDAYS;
  if (row) {
    if (row.closed) return "closed";
  } else if (weekdays.includes(getJstWeekday(coDate))) {
    return "regular_closed";
  }
  if (!opts.isStaff && row?.web_closed === true) return "web_closed";
  if (opts.addDogs && opts.limit) {
    const used = (row?.day_booked || 0) + (row?.stay_booked || 0);
    if (used + opts.addDogs > opts.limit) return "full";
  }
  return null;
}

/** お客様向けの案内（予約API・予約フォーム・確認画面で同じ文言を出す） */
export function checkoutAddonCustomerMessage(reason: CheckoutAddonBlockReason, coDate: string): string {
  const label = formatDateJaWithWeekday(coDate);
  switch (reason) {
    case "regular_closed":
      return `チェックアウト日の${label}は定休日のため、半日・1日はお付けできません`;
    case "closed":
      return `チェックアウト日の${label}は臨時休業のため、半日・1日はお付けできません`;
    case "web_closed":
      return `チェックアウト日の${label}は満席のため、半日・1日はWebではお付けできません。お電話（0460-80-0290）でご相談ください`;
    case "full":
      return `チェックアウト日の${label}は満席のため、半日・1日はお付けできません。時間の延長か、お電話（0460-80-0290）でご相談ください`;
  }
}

// ── お客様ご自身の付け外し（/booking/modify・2026-11-22 第2段） ─────────────
// 項目を送ってこなければ「変更しない」。"" / null は外す、"4h"/"8h" は付ける（付け替え）。
// 同じ側に時間の延長・早預かりが付いている予約は、ここでは付けられない（DB の制約でも止まる）。

export interface AddonChangeInput {
  checkout_addon?: string | null;
  checkin_addon?: string | null;
  checkin_addon_from?: string | null;
}

export interface AddonCurrent {
  plan: string;
  checkout_addon_plan?: string | null;
  checkin_addon_plan?: string | null;
  checkin_addon_from?: string | null;
  checkout_extension_until?: string | null;
  checkin_extension_from?: string | null;
}

export type AddonChangeResult =
  | { coAddon: CheckoutAddonPlan | null; ciAddon: CheckoutAddonPlan | null; ciAddonFrom: string | null }
  | { error: string };

/** 送られてきた付け外しの希望を、変更後の値（変えない側は今の値）に直す。不正なら error */
export function resolveAddonChange(req: AddonChangeInput, cur: AddonCurrent): AddonChangeResult {
  const curCo = (findCheckoutAddon(cur.checkout_addon_plan)?.plan ?? null) as CheckoutAddonPlan | null;
  const curCi = (findCheckinAddon(cur.checkin_addon_plan)?.plan ?? null) as CheckoutAddonPlan | null;
  const curCiFrom = curCi ? (cur.checkin_addon_from || "").slice(0, 5) || null : null;
  let coAddon = curCo;
  let ciAddon = curCi;
  let ciAddonFrom = curCiFrom;
  const touchesCo = req.checkout_addon !== undefined;
  const touchesCi = req.checkin_addon !== undefined;
  if ((touchesCo || touchesCi) && cur.plan !== "stay") {
    return { error: "半日・1日を付けられるのは宿泊のご予約だけです" };
  }

  if (touchesCo) {
    const v = req.checkout_addon || "";
    if (v && !findCheckoutAddon(v)) return { error: "半日・1日のお預かりの内容が正しくありません" };
    coAddon = (v || null) as CheckoutAddonPlan | null;
    if (coAddon && coAddon !== curCo && cur.checkout_extension_until) {
      return {
        error: "チェックアウト後の時間の延長が付いているため、半日・1日はお付けできません。お手数ですがお電話（0460-80-0290）でご連絡ください",
      };
    }
  }
  if (touchesCi) {
    const v = req.checkin_addon || "";
    if (v && !findCheckinAddon(v)) return { error: "半日・1日のお預かりの内容が正しくありません" };
    ciAddon = (v || null) as CheckoutAddonPlan | null;
    if (ciAddon) {
      ciAddonFrom = normalizeCheckinAddonFrom(ciAddon, req.checkin_addon_from);
      if (!ciAddonFrom) return { error: "チェックイン前の1日お預かりの開始時刻をお選びください" };
      if (ciAddon !== curCi && cur.checkin_extension_from) {
        return {
          error: "チェックイン前の早預かりが付いているため、半日・1日はお付けできません。お手数ですがお電話（0460-80-0290）でご連絡ください",
        };
      }
    } else {
      ciAddonFrom = null;
    }
  }
  return { coAddon, ciAddon, ciAddonFrom };
}

/** スタッフ向け（管理画面の付け外し・日程変更で止めるとき） */
export function checkoutAddonStaffMessage(reason: CheckoutAddonBlockReason, coDate: string): string {
  const label = formatDateJaWithWeekday(coDate);
  switch (reason) {
    case "regular_closed":
      return `チェックアウト日の${label}は定休日のため、半日・1日は付けられません`;
    case "closed":
      return `チェックアウト日の${label}は臨時休業のため、半日・1日は付けられません`;
    case "web_closed":
      return `チェックアウト日の${label}はWeb受付停止の日です`;
    case "full":
      return `チェックアウト日の${label}は満室です（全19室）`;
  }
}

// ── お客様ご自身の日付変更（/booking/modify・2026-11-25 CEO 決定） ─────────────
// それまで変更画面では日付を変えられず「一度キャンセルして再予約を」と小さく出すだけだった。
// 決まり（11-25 CEO）:
//   - 期限は新規予約と同じ（当日・前日17時以降の翌日分はお電話）。元の予約日と新しい日付の両方にかける
//   - 期限内の日付変更はキャンセル料なし（画面にキャンセル料を出さない）
//   - 宿泊に半日・1日（前後）・早預かり・延長が付いている予約は、日付変更はお電話
//   - プラン・頭数・わんちゃんは変えない（日付と到着時間のみ。宿泊はチェックイン日とチェックアウト日）
//   - 状態が confirmed / pending 以外（キャンセル・完了・無断キャンセル）は不可
// 画面（app/booking/modify/[id]/page.tsx）と API（app/api/booking/modify/route.ts）が
// 同じ関数を呼ぶ。最終の枠の確保は API の applyCapacityDelta（Web上限15）が原子的に行う。

export const STORE_TEL = "0460-80-0290";

/** "2026-11-27" → "11/27(金)"（変更内容の一行に使う） */
export function formatDateShortJa(dateStr: string): string {
  if (!dateStr) return "";
  const [, m, d] = dateStr.split("-").map(Number);
  const w = ["日", "月", "火", "水", "木", "金", "土"][getJstWeekday(dateStr)];
  return `${m}/${d}(${w})`;
}

/** お客様ご自身の操作の期限を過ぎているか（当日以前・前日17時以降の翌日） */
export function isPastSelfServiceDeadline(
  date: string,
  today: string = getJstToday(),
  hourJst: number = getJstHour()
): boolean {
  return !date || date <= today || isLateBooking(date, today, hourJst);
}

/** プランごとのチェックイン（到着）時刻の選択肢 "HH:00"。正本は types/booking.ts の PLANS.checkinRange */
export function checkinTimeOptions(plan: string): string[] {
  const p = PLANS.find((x) => x.id === plan);
  if (!p) return [];
  const start = parseInt(p.checkinRange.start, 10);
  const end = Math.max(start, parseInt(p.checkinRange.end, 10));
  const out: string[] = [];
  for (let h = start; h <= end; h++) out.push(`${String(h).padStart(2, "0")}:00`);
  return out;
}

export interface RescheduleTarget extends FootprintInput {
  checkin_time?: string | null;
  checkin_addon_plan?: string | null;
  checkin_addon_from?: string | null;
  checkin_extension_from?: string | null;
  checkout_extension_until?: string | null;
  notes?: string | null;
}

/** 備考に残る付属の印（11-22 以前の「…を付ける希望」も含む） */
const ATTACHMENT_NOTE_MARKERS = ["【延長預かり】", "【早預かり】", "を付ける希望】"];

/** 半日・1日（前後）・早預かり・延長のどれかが付いているか */
export function hasBookingAttachments(r: RescheduleTarget): boolean {
  if (r.checkout_addon_plan || r.checkin_addon_plan || r.checkin_extension_from || r.checkout_extension_until) {
    return true;
  }
  const notes = r.notes || "";
  return ATTACHMENT_NOTE_MARKERS.some((m) => notes.includes(m));
}

export type RescheduleIneligibleReason = "status" | "plan" | "attachments" | "deadline";

/**
 * このご予約をお客様ご自身で日付変更できない理由（null＝できる）。
 * 期限は元の予約日（チェックイン日）にかける。新しい日付の期限は checkReschedule が見る。
 */
export function rescheduleIneligibleReason(
  r: RescheduleTarget,
  today: string = getJstToday(),
  hourJst: number = getJstHour()
): RescheduleIneligibleReason | null {
  if (!isActiveReservationStatus(r.status)) return "status";
  // スポットは Web で選べないプラン（電話・現地枠）＝日付の変更もお電話
  if (!checkinTimeOptions(r.plan).length) return "plan";
  if (hasBookingAttachments(r)) return "attachments";
  if (isPastSelfServiceDeadline(r.date, today, hourJst)) return "deadline";
  return null;
}

export function rescheduleIneligibleMessage(reason: RescheduleIneligibleReason): string {
  switch (reason) {
    case "status":
      return "このご予約は日付を変更できません";
    case "plan":
      return `このプランの日付の変更は、お手数ですがお電話（${STORE_TEL}）でご連絡ください`;
    case "attachments":
      return `半日・1日のお預かりや、早預かり・延長が付いているご予約の日付の変更は、お手数ですがお電話（${STORE_TEL}）でご連絡ください`;
    case "deadline":
      return `ご予約日の当日、および前日17時以降の日付の変更は、お手数ですがお電話（${STORE_TEL}）でご連絡ください`;
  }
}

export interface RescheduleRequest {
  /** 新しいチェックイン日（日帰りはその日） */
  date: string;
  /** 宿泊の新しいチェックアウト日 */
  checkoutDate?: string | null;
  /** 新しい到着時刻 "HH:mm" */
  checkinTime: string;
}

export interface RescheduleDayRow {
  closed?: boolean | null;
  web_closed?: boolean | null;
  day_booked?: number | null;
  stay_booked?: number | null;
}

export interface RescheduleContext {
  today: string;
  hourJst: number;
  /** 何日先まで受け付けるか（site_settings.booking_window_days・既定180） */
  bookingWindowDays: number;
  /** その日の daily_capacity 行（無ければ null） */
  rowOf: (date: string) => RescheduleDayRow | null;
  isAfternoonOnly: (date: string) => boolean;
  /** 部屋数の上限（お客様＝WEB_ROOM_LIMIT） */
  limit: number;
  closedWeekdays?: number[];
}

export type RescheduleCheck =
  | { ok: true; capDelta: CapacityItem[] }
  | { ok: false; message: string };

/** その日が休業か（行があればその closed、無ければ定休の曜日） */
function isClosedOn(date: string, row: RescheduleDayRow | null, closedWeekdays: number[]): boolean {
  if (row) return !!row.closed;
  return closedWeekdays.includes(getJstWeekday(date));
}

/**
 * お客様ご自身の日付変更を受けてよいか。新規予約（api/booking/route.ts）と同じ受付条件を新しい日程にかける:
 *   当日・前日17時以降の翌日は不可／受付期間（booking_window_days）の先は不可／
 *   プランごとの到着時刻の範囲／宿泊はチェックアウト日がチェックイン日より後・泊まる晩に休業がない
 *   （チェックアウト日だけは定休日でもよい）／Web受付停止・満席（Web上限）の日は不可／
 *   午後から営業の日のルール。
 * 部屋数は「いまの予約が占める枠 → 新しい日程の枠」の差分で見る（重なる日は自分の分を二重に数えない）。
 */
export function checkReschedule(
  r: RescheduleTarget,
  req: RescheduleRequest,
  ctx: RescheduleContext
): RescheduleCheck {
  const ng = (message: string): RescheduleCheck => ({ ok: false, message });
  const weekdays = ctx.closedWeekdays ?? DEFAULT_CLOSED_WEEKDAYS;
  const isStay = r.plan === "stay";

  const reason = rescheduleIneligibleReason(r, ctx.today, ctx.hourJst);
  if (reason) return ng(rescheduleIneligibleMessage(reason));

  const date = req.date || "";
  const co = isStay ? req.checkoutDate || "" : "";
  const isDateStr = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
  if (!isDateStr(date) || (isStay && !isDateStr(co))) return ng("日付を選び直してください");

  if (date === r.date && (!isStay || co === r.checkout_date)) {
    return ng("変更前と同じ日程です");
  }
  if (isPastSelfServiceDeadline(date, ctx.today, ctx.hourJst)) {
    return ng(`当日、および前日17時以降の翌日への変更は、お手数ですがお電話（${STORE_TEL}）でご連絡ください`);
  }
  if (date > addDaysJst(ctx.today, ctx.bookingWindowDays)) {
    return ng(`${formatDateJaWithWeekday(date)}はまだご予約を承っていない日です。日付を選び直してください`);
  }

  const time = (req.checkinTime || "").slice(0, 5);
  const times = checkinTimeOptions(r.plan);
  if (!times.includes(time)) {
    return ng(`到着時間は${times[0]}〜${times[times.length - 1]}の間でお選びください`);
  }

  // 新しい日程でお店が開いている必要がある日（宿泊＝泊まる晩・日帰り＝その日）
  let openDays: string[];
  if (isStay) {
    if (co <= date) return ng("チェックアウト日はチェックイン日の翌日以降を選択してください");
    openDays = capacityFootprint({ plan: "stay", date, checkout_date: co }).map((it) => it.date);
    if (addDaysJst(date, MAX_STAY_NIGHTS) < co) return ng("お泊まりの日数が長すぎます。お電話でご相談ください");
  } else {
    openDays = [date];
  }
  for (const d of openDays) {
    const row = ctx.rowOf(d);
    if (isClosedOn(d, row, weekdays)) {
      const why = row ? "臨時休業" : "定休日";
      return ng(
        isStay
          ? `お預かり期間中の${formatDateJaWithWeekday(d)}が${why}です（チェックアウト日は定休日でもお引き取りいただけます）。日程を選び直してください`
          : `${formatDateJaWithWeekday(d)}は${why}です。日付を選び直してください`
      );
    }
  }

  // 午後から営業（宿泊のみ）の日。日付を選び直す＝新規予約と同じく、新しい日程が触れたら止める
  // （到着時刻・備考だけの変更と違い「もともと入っていた予約だから」は理由にしない）
  const aoNext = findAfternoonOnlyViolation(
    { plan: r.plan, date, checkoutDate: isStay ? co : null, checkinTime: time },
    ctx.isAfternoonOnly
  );
  if (aoNext) return ng(afternoonOnlyCustomerMessage(aoNext));

  // 部屋数: いまの予約の枠を外して新しい日程の枠を足した差分。増える日だけ Web受付停止・満席を見る
  const capDelta = diffFootprint(
    activeFootprint(r),
    activeFootprint({ ...r, date, checkout_date: isStay ? co : null })
  );
  const incByDate = new Map<string, number>();
  capDelta.forEach((it) => incByDate.set(it.date, (incByDate.get(it.date) || 0) + it.delta));
  for (const d of increasedDates(capDelta)) {
    const row = ctx.rowOf(d);
    const used = (row?.day_booked || 0) + (row?.stay_booked || 0);
    if (row?.web_closed === true || used + (incByDate.get(d) || 0) > ctx.limit) {
      return ng(`${formatDateJaWithWeekday(d)}は満席です。お手数ですがお電話（${STORE_TEL}）でお問い合わせください`);
    }
  }
  return { ok: true, capDelta };
}

/** 変更内容の一行（通知に載せる）。例「日付: 11/27(金) → 11/28(土)」 */
export function rescheduleChangeLines(
  r: { plan: string; date: string; checkout_date?: string | null; checkin_time?: string | null },
  req: RescheduleRequest
): string[] {
  const lines: string[] = [];
  const isStay = r.plan === "stay";
  if (req.date !== r.date) {
    lines.push(`${isStay ? "チェックイン日" : "日付"}: ${formatDateShortJa(r.date)} → ${formatDateShortJa(req.date)}`);
  }
  if (isStay && req.checkoutDate && req.checkoutDate !== r.checkout_date) {
    lines.push(`チェックアウト日: ${formatDateShortJa(r.checkout_date || "")} → ${formatDateShortJa(req.checkoutDate)}`);
  }
  const oldTime = (r.checkin_time || "").slice(0, 5);
  const newTime = (req.checkinTime || "").slice(0, 5);
  if (newTime && newTime !== oldTime) {
    lines.push(`${isStay ? "到着予定時間" : "チェックイン時間"}: ${oldTime} → ${newTime}`);
  }
  return lines;
}
