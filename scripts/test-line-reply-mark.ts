// 「LINEで送りました」の控え（2026-11-27）の判定テスト。
// 実コード（src/lib/line-notification.ts）をそのまま実走する。DB には触れない。
// 実行: node --import ./scripts/ts-resolve-hook.mjs scripts/test-line-reply-mark.ts
import {
  lineAwaitingReply,
  isStaffReplyMark,
  isNotificationType,
  STAFF_REPLY_MARKED_TYPE,
} from "../src/lib/line-notification.ts";

let pass = 0;
const fails: string[] = [];
const check = (ok: boolean, label: string) => (ok ? pass++ : fails.push(`✗ ${label}`));

const cust = { direction: "inbound", sender: "customer" };
const bot = { direction: "outbound", sender: "bot" };
const notif = { direction: "outbound", sender: "bot" }; // notification:* も sender=bot
const staff = { direction: "outbound", sender: "staff" };

// ── 返信待ちかどうか ──
check(lineAwaitingReply([]) === false, "メッセージなし＝返信待ちではない");
check(lineAwaitingReply([cust, bot]) === true, "お客様→自動応答（控えなし）＝返信待ち（従来どおり拾う）");
check(lineAwaitingReply([cust, bot, staff]) === false, "お客様→自動応答→控え＝返信済み（11-27 の拾い直しを防ぐ）");
check(lineAwaitingReply([cust, cust, bot, staff]) === false, "控えより前の複数のメッセージはまとめて返信済み");
check(lineAwaitingReply([cust, staff, cust, bot]) === true, "控えの後に新しいお客様のメッセージ＝また拾う");
check(lineAwaitingReply([cust, staff, notif]) === false, "控えの後に当店の通知だけ＝返信待ちではない");
check(lineAwaitingReply([cust, staff, bot]) === false, "控えの後に自動応答だけ＝返信待ちではない");
check(lineAwaitingReply([cust, staff, cust, staff]) === false, "2回目の控えで再び返信済み");
check(lineAwaitingReply([bot, notif]) === false, "当店からだけ＝返信待ちではない");

// ── message_type の値 ──
check(STAFF_REPLY_MARKED_TYPE === "staff_reply_marked", "控えの message_type は staff_reply_marked");
check(isStaffReplyMark("staff_reply_marked"), "控えを見分けられる");
check(!isStaffReplyMark("text") && !isStaffReplyMark("notification:cancel"), "ほかの種類は控えではない");
// 要返信チェックの SQL は「not like 'notification:%'」で通知を除いている＝控えはその除外に巻き込まれない
// （控えは sender='staff' の条件で別に扱う）
check(!isNotificationType(STAFF_REPLY_MARKED_TYPE), "控えは当店の通知（notification:*）とは別物");

console.log(`LINE返信済みの控えテスト: ${pass}/${pass + fails.length} PASS`);
if (fails.length) {
  console.log(fails.join("\n"));
  process.exit(1);
}
console.log("\n✅ 全ケース PASS");
