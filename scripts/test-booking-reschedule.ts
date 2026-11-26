// お客様ご自身の日付変更（/booking/modify・2026-11-25 CEO 決定）の判定テスト。
// 実コード（src/lib/booking-rules.ts の checkReschedule など）をそのまま実走する。DB には触れない。
// 実行: node --import ./scripts/ts-resolve-hook.mjs scripts/test-booking-reschedule.ts
import {
  checkReschedule,
  checkTimeChange,
  timeChangeIneligibleReason,
  rescheduleIneligibleReason,
  rescheduleChangeLines,
  checkinTimeOptions,
  type RescheduleDayRow,
  type RescheduleTarget,
  type RescheduleContext,
} from "../src/lib/booking-rules.ts";

let pass = 0;
const fails: string[] = [];
const check = (ok: boolean, label: string) => (ok ? pass++ : fails.push(`✗ ${label}`));

// 基準日: 2026-11-25(水)。11/26(木)定休・11/27(金)〜12/1(火)営業・12/2(水)定休
const TODAY = "2026-11-25";
const ctx = (over: Partial<RescheduleContext> = {}, rows: Record<string, RescheduleDayRow> = {}): RescheduleContext => ({
  today: TODAY,
  hourJst: 10,
  bookingWindowDays: 180,
  rowOf: (d) => rows[d] ?? null,
  isAfternoonOnly: () => false,
  limit: 15,
  ...over,
});
const day8h: RescheduleTarget = { plan: "8h", date: "2026-11-27", checkin_time: "07:00:00", dog_count: 1, status: "confirmed", notes: null };
const stay: RescheduleTarget = { plan: "stay", date: "2026-11-28", checkout_date: "2026-11-30", checkin_time: "15:00:00", dog_count: 2, status: "confirmed" };

// ── 対象かどうか ──
check(rescheduleIneligibleReason(day8h, TODAY, 10) === null, "1日・2日後・確定済み＝変更できる");
check(rescheduleIneligibleReason({ ...day8h, status: "cancelled" }, TODAY, 10) === "status", "キャンセル済みは不可");
check(rescheduleIneligibleReason({ ...day8h, status: "completed" }, TODAY, 10) === "status", "完了は不可");
check(rescheduleIneligibleReason({ ...day8h, status: "no_show" }, TODAY, 10) === "status", "無断キャンセルは不可");
check(rescheduleIneligibleReason({ ...day8h, status: "pending" }, TODAY, 10) === null, "仮予約は変更できる");
check(rescheduleIneligibleReason({ ...day8h, plan: "spot" }, TODAY, 10) === "plan", "スポットはお電話");
check(rescheduleIneligibleReason({ ...stay, checkout_addon_plan: "4h" }, TODAY, 10) === "attachments", "CO後の半日付きはお電話");
check(rescheduleIneligibleReason({ ...stay, checkin_addon_plan: "8h" }, TODAY, 10) === "attachments", "CI前の1日付きはお電話");
check(rescheduleIneligibleReason({ ...stay, checkin_extension_from: "10:00" }, TODAY, 10) === "attachments", "早預かり付きはお電話");
check(rescheduleIneligibleReason({ ...stay, checkout_extension_until: "13:00" }, TODAY, 10) === "attachments", "延長付きはお電話");
check(rescheduleIneligibleReason({ ...stay, notes: "【延長預かり】チェックアウト後〜13:00" }, TODAY, 10) === "attachments", "備考の【延長預かり】もお電話");
check(rescheduleIneligibleReason({ ...stay, notes: "【半日を付ける希望】チェックアウト後〜15:00" }, TODAY, 10) === "attachments", "11-22以前の【…を付ける希望】もお電話");
// 元の日の期限
check(rescheduleIneligibleReason({ ...day8h, date: TODAY }, TODAY, 10) === "deadline", "元の日が当日＝お電話");
check(rescheduleIneligibleReason({ ...day8h, date: "2026-11-26" }, TODAY, 16) === null, "元の日が翌日・16時＝変更できる");
check(rescheduleIneligibleReason({ ...day8h, date: "2026-11-26" }, TODAY, 17) === "deadline", "元の日が翌日・17時＝お電話");

// ── 新しい日程 ──
const ok = (r: ReturnType<typeof checkReschedule>) => r.ok;
const msg = (r: ReturnType<typeof checkReschedule>) => (r.ok ? "" : r.message);
check(ok(checkReschedule(day8h, { date: "2026-11-28", checkinTime: "07:00" }, ctx())), "1日 11/27→11/28 は通る（実例）");
check(msg(checkReschedule(day8h, { date: "2026-11-27", checkinTime: "07:00" }, ctx())).includes("同じ日時"), "日帰りで日付も時間も同じなら止める");
{
  // 2026-11-26: 日帰りで同じ日・別の時間＝時間だけの変更として通す（枠は動かない）
  const r = checkReschedule(day8h, { date: "2026-11-27", checkinTime: "08:00" }, ctx());
  check(r.ok && r.capDelta.length === 0, "日帰りで同じ日・別の時間は通る（枠の差分なし）");
}
check(msg(checkReschedule(stay, { date: "2026-11-28", checkoutDate: "2026-11-30", checkinTime: "16:00" }, ctx())).includes("同じ日程"), "宿泊で日程が同じなら止める（到着時間は「変更できる項目」側）");
check(msg(checkReschedule(day8h, { date: "2026-12-02", checkinTime: "07:00" }, ctx())).includes("定休日"), "新しい日が定休日（行なしの水）＝不可");
check(ok(checkReschedule(day8h, { date: "2026-12-02", checkinTime: "07:00" }, ctx({}, { "2026-12-02": { closed: false } }))), "水でも臨時営業（行あり closed=false）なら可");
check(msg(checkReschedule(day8h, { date: "2026-11-28", checkinTime: "07:00" }, ctx({}, { "2026-11-28": { closed: true } }))).includes("臨時休業"), "臨時休業は不可");
check(msg(checkReschedule(day8h, { date: "2026-11-28", checkinTime: "07:00" }, ctx({}, { "2026-11-28": { web_closed: true } }))).includes("満席"), "Web受付停止の日は不可（お電話）");
check(msg(checkReschedule(day8h, { date: "2026-11-28", checkinTime: "07:00" }, ctx({}, { "2026-11-28": { day_booked: 10, stay_booked: 5 } }))).includes("満席"), "15室埋まっている日は不可");
check(ok(checkReschedule(day8h, { date: "2026-11-28", checkinTime: "07:00" }, ctx({}, { "2026-11-28": { day_booked: 9, stay_booked: 5 } }))), "14室なら1頭は入る");
check(ok(checkReschedule({ ...day8h, date: "2026-11-28" }, { date: "2026-11-26", checkinTime: "07:00" }, ctx({}, { "2026-11-26": { closed: false } }))), "新しい日が翌日（臨時営業）・17時前なら通る");
check(msg(checkReschedule({ ...day8h, date: "2026-11-28" }, { date: "2026-11-26", checkinTime: "07:00" }, ctx({ hourJst: 17 }, { "2026-11-26": { closed: false } }))).includes("前日17時以降"), "新しい日が翌日・17時以降＝お電話");
check(msg(checkReschedule(day8h, { date: TODAY, checkinTime: "07:00" }, ctx())).includes("前日17時以降"), "新しい日が当日＝お電話");
check(msg(checkReschedule(day8h, { date: "2027-06-01", checkinTime: "07:00" }, ctx())).includes("承っていない"), "受付期間（180日）より先は不可");
check(msg(checkReschedule(day8h, { date: "2026-11-28", checkinTime: "10:00" }, ctx())).includes("07:00〜09:00"), "1日の到着時刻は 7〜9時");
check(msg(checkReschedule({ ...day8h, plan: "4h", checkin_time: "09:00" }, { date: "2026-11-28", checkinTime: "14:00" }, ctx())).includes("09:00〜13:00"), "半日の到着時刻は 9〜13時");
check(msg(checkReschedule(day8h, { date: "2026-11-28", checkinTime: "07:00" }, ctx({ isAfternoonOnly: (d) => d === "2026-11-28" }))).includes("午後"), "午後から営業の日に日帰りは不可");

// 宿泊
check(ok(checkReschedule(stay, { date: "2026-11-29", checkoutDate: "2026-12-01", checkinTime: "15:00" }, ctx())), "宿泊 11/28-30 → 11/29-12/1 は通る");
check(ok(checkReschedule(stay, { date: "2026-11-29", checkoutDate: "2026-12-02", checkinTime: "15:00" }, ctx())), "チェックアウト日は定休日（水）でも可");
check(msg(checkReschedule(stay, { date: "2026-11-30", checkoutDate: "2026-12-03", checkinTime: "15:00" }, ctx())).includes("定休日"), "泊まる晩に定休日（12/2水）を含むと不可");
check(msg(checkReschedule(stay, { date: "2026-11-29", checkoutDate: "2026-11-29", checkinTime: "15:00" }, ctx())).includes("翌日以降"), "CO<=CI は不可");
check(msg(checkReschedule(stay, { date: "2026-11-29", checkoutDate: "2026-12-01", checkinTime: "11:00" }, ctx())).includes("14:00〜17:00"), "宿泊の到着は14〜17時");
check(ok(checkReschedule(stay, { date: "2026-11-28", checkoutDate: "2026-12-01", checkinTime: "15:00" }, ctx())), "チェックアウト日だけの変更も通る");
// 重なる日は自分の分を二重に数えない: 11/29 が 15室埋まり（うち2頭は自分）でも、11/29 は増えないので通る
{
  const rows = { "2026-11-29": { stay_booked: 15 }, "2026-11-30": { stay_booked: 2 } };
  const r = checkReschedule(stay, { date: "2026-11-29", checkoutDate: "2026-12-01", checkinTime: "15:00" }, ctx({}, rows));
  check(r.ok, "重なる晩（11/29）は満室でも自分の分なので止めない");
  if (r.ok) {
    const s = JSON.stringify(r.capDelta);
    check(
      s === JSON.stringify([
        { date: "2026-11-28", column: "stay_booked", delta: -2 },
        { date: "2026-11-30", column: "stay_booked", delta: 2 },
      ]),
      `枠の差分は 11/28 -2・11/30 +2 だけ（実際 ${s}）`
    );
  }
  const r2 = checkReschedule(stay, { date: "2026-11-29", checkoutDate: "2026-12-01", checkinTime: "15:00" }, ctx({}, { "2026-11-30": { stay_booked: 14 } }));
  check(!r2.ok && msg(r2).includes("満席"), "新しく増える晩（11/30）に2頭入らなければ不可");
}
check(msg(checkReschedule(stay, { date: "2026-11-29", checkoutDate: "2026-12-01", checkinTime: "15:00" }, ctx({ isAfternoonOnly: (d) => d === "2026-11-30" }))).includes("午前の営業がない"), "翌朝が午後から営業になる宿泊は不可");
check(msg(checkReschedule({ ...stay, checkout_addon_plan: "8h" }, { date: "2026-11-29", checkoutDate: "2026-12-01", checkinTime: "15:00" }, ctx())).includes("お電話"), "付属ありは新しい日程の判定前に止まる");

// 変更内容の一行
check(
  JSON.stringify(rescheduleChangeLines(day8h, { date: "2026-11-28", checkinTime: "07:00" })) === JSON.stringify(["日付: 11/27(金) → 11/28(土)"]),
  "通知の一行「日付: 11/27(金) → 11/28(土)」"
);
check(
  rescheduleChangeLines(stay, { date: "2026-11-29", checkoutDate: "2026-12-01", checkinTime: "16:00" }).join("|") ===
    "チェックイン日: 11/28(土) → 11/29(日)|チェックアウト日: 11/30(月) → 12/1(火)|到着予定時間: 15:00 → 16:00",
  "宿泊はチェックイン日・チェックアウト日・到着時間を並べる"
);
check(checkinTimeOptions("stay").join(",") === "14:00,15:00,16:00,17:00", "宿泊の到着時刻の選択肢");

// ── 日帰りの同じ日の時間だけの変更（2026-11-26 CEO 承認）──
// 実例の型: 半日 11/28(土) 9:00 → 10:00 にしたい（前々日の夜＝期限内）
{
  const half: RescheduleTarget = { plan: "4h", date: "2026-11-28", checkin_time: "09:00:00", dog_count: 1, status: "confirmed", notes: null };
  const tctx = (hourJst = 21, today = TODAY, isAfternoonOnly?: (d: string) => boolean) => ({ today, hourJst, isAfternoonOnly });
  const tmsg = (r: ReturnType<typeof checkTimeChange>) => (r.ok ? "" : r.message);
  check(checkTimeChange(half, "10:00", tctx()).ok, "半日 9:00→10:00・前々日の夜21時＝通る（実例）");
  check(timeChangeIneligibleReason(half, TODAY, 21) === null, "時間の変更の対象（半日・期限内）");
  check(checkTimeChange(half, "10:00", tctx(16, "2026-11-27")).ok, "前日16時＝通る");
  check(tmsg(checkTimeChange(half, "10:00", tctx(17, "2026-11-27"))).includes("前日17時以降"), "前日17時以降＝お電話");
  check(tmsg(checkTimeChange(half, "10:00", tctx(8, "2026-11-28"))).includes("当日"), "当日＝お電話");
  check(tmsg(checkTimeChange(half, "14:00", tctx())).includes("09:00〜13:00"), "半日は 9〜13時の範囲だけ");
  check(tmsg(checkTimeChange(half, "09:00", tctx())).includes("同じ時間"), "同じ時刻は変更なし");
  check(checkTimeChange({ ...half, plan: "8h", checkin_time: "07:00:00" }, "09:00", tctx()).ok, "1日 7:00→9:00 は通る");
  check(tmsg(checkTimeChange({ ...half, plan: "8h", checkin_time: "07:00:00" }, "10:00", tctx())).includes("07:00〜09:00"), "1日は 7〜9時の範囲だけ");
  check(tmsg(checkTimeChange({ ...half, plan: "spot" }, "10:00", tctx())).includes("お電話"), "スポットはお電話");
  check(tmsg(checkTimeChange({ ...half, checkin_extension_from: "08:00" }, "10:00", tctx())).includes("早預かり・延長"), "早預かり付きはお電話");
  check(tmsg(checkTimeChange({ ...half, checkout_extension_until: "15:00" }, "10:00", tctx())).includes("早預かり・延長"), "延長付きはお電話");
  check(tmsg(checkTimeChange({ ...half, notes: "【延長預かり】〜15:00" }, "10:00", tctx())).includes("お電話"), "備考の【延長預かり】もお電話");
  check(!checkTimeChange({ ...half, status: "cancelled" }, "10:00", tctx()).ok, "キャンセル済みは不可");
  // 午後から営業の日: お客様はそもそも日帰りを予約できない。スタッフが入れた分の時間変更は「新しく触れない」ので止めない
  check(checkTimeChange(half, "10:00", tctx(21, TODAY, (d) => d === "2026-11-28")).ok, "午後から営業の日の既存の日帰り＝時間の変更では新しく触れない");
  check(checkTimeChange({ ...stay }, "11:00", tctx()).ok, "宿泊はこの判定の対象外（従来どおり）");
  check(timeChangeIneligibleReason({ ...stay, date: TODAY }, TODAY, 10) === null, "宿泊の到着予定時間は当日でも従来どおり");
  // 日付の変更パネルから同じ日・別の時間を選んでも同じ判定
  check(ok(checkReschedule(half, { date: "2026-11-28", checkinTime: "10:00" }, ctx({ hourJst: 21 }))), "パネルから 11/28 10:00 を選ぶ＝通る");
  check(msg(checkReschedule(half, { date: "2026-11-28", checkinTime: "10:00" }, ctx({ today: "2026-11-27", hourJst: 18 }))).includes("前日17時以降"), "パネルからでも期限後は不可");
  check(
    rescheduleChangeLines(half, { date: "2026-11-28", checkinTime: "10:00" }).join("|") === "チェックイン時間: 09:00 → 10:00",
    "通知の一行「チェックイン時間: 09:00 → 10:00」"
  );
}

console.log(`日付変更テスト: ${pass}/${pass + fails.length} PASS`);
if (fails.length) {
  console.log(fails.join("\n"));
  process.exit(1);
}
console.log("\n✅ 全ケース PASS");
