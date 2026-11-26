// LINE「予約内容の確認」自動回答の決定論的テスト。実コード（src/lib/line-booking-status.ts）をそのまま実走する。
// 実行: node --import ./scripts/ts-resolve-hook.mjs scripts/test-line-booking-status.ts
// ⚠️ 本文・予約は実データの「型」を再現した合成ケース（個人情報をリポジトリに置かない）。
import {
  isBookingStatusQuery,
  isChangeDoneQuestion,
  bookingStatusQueryKind,
  decideBookingStatus,
  buildBookingStatusReply,
  type StatusReservation,
} from "../src/lib/line-booking-status.ts";

let pass = 0;
const fails: string[] = [];
const check = (ok: boolean, label: string) => (ok ? pass++ : fails.push(`✗ ${label}`));

// ───── A. 判定 ─────
const YES = [
  "予約内容確認",
  "予約できていますでしょうか？確認をお願いします",
  "予約完了のメールが届いていないのですが、予約はできていますか",
  "このLINEでも予約確認をさせていただきたく情報をお願いいたします",
  "二重で予約してしまったかもしれません。ご確認お願いいたします",
];
YES.push(
  "予約している到着時間が分からなくなってしまいました。予約時間を教えてください",
  "予約の時間を忘れてしまいました",
);
const NO = [
  "予約内容確認できました。よろしくお願いします", // お礼
  "予約時間についてですが、9時半からでも大丈夫でしょうか", // 時間の相談
  "半日プランを予約しましたが、2時間のお預かりを希望しています", // 希望
  "予約を変更したいのですが確認お願いします", // 変更
  "予約のキャンセルをお願いします",
  "予約の空きを確認したいです",
  "お迎えの時間を確認したいです。予約は明日です",
  "持ち物を確認したいです", // 予約の語なし
  "ワクチンの証明書が必要か、予約前に確認したいです",
  "予約の時間を忘れたので、変更したいです", // 変更の意思
  "持ち物を教えてください", // 予約の話ではない
];
for (const t of YES) check(isBookingStatusQuery(t), `予約確認と判定: ${t}`);
for (const t of NO) check(!isBookingStatusQuery(t), `予約確認と判定しない: ${t}`);

// ───── B. 答えてよいか ─────
const base: StatusReservation = {
  id: "00000000-0000-0000-0000-000000000001",
  plan: "stay",
  date: "2026-10-31",
  checkout_date: "2026-11-02",
  checkin_time: "15:00:00",
  status: "confirmed",
  walk_option: false,
  checkin_extension_from: null,
  checkout_extension_until: null,
  notes: null,
  admin_notes: null,
  dogs: [{ name: "もも", sex: "female" }],
};
check(decideBookingStatus([base]).ok, "通常の確定予約は答える");
check(!decideBookingStatus([]).ok, "予約が無ければ答えない");
check(!decideBookingStatus([{ ...base, status: "pending" }]).ok, "仮予約は答えない");
check(!decideBookingStatus([{ ...base, checkout_extension_until: "13:00:00" }]).ok, "お迎え延長があれば答えない");
check(!decideBookingStatus([{ ...base, checkin_extension_from: "12:00:00" }]).ok, "早預かりがあれば答えない");
check(!decideBookingStatus([{ ...base, admin_notes: "電話で13時お迎えに変更" }]).ok, "スタッフメモがあれば答えない");
check(!decideBookingStatus([{ ...base, notes: "【延長預かり】チェックアウト後〜13:00" }]).ok, "備考に延長があれば答えない");
check(decideBookingStatus([{ ...base, notes: "人見知りです" }]).ok, "時刻と無関係の備考なら答える");
check(!decideBookingStatus([base, { ...base, status: "pending", id: "2" }]).ok, "1件でも危うければ全体を答えない");
check(!decideBookingStatus([base, { ...base, id: "2" }, { ...base, id: "3" }, { ...base, id: "4" }]).ok, "4件以上は答えない");
check(decideBookingStatus([{ ...base, status: "cancelled" }, base]).ok, "キャンセル済みは無視して答える");

// ───── C. 文面 ─────
const d = decideBookingStatus([base]);
const text = d.ok ? (buildBookingStatusReply(d.reservations, { greeting: "山田様、", outsideBusinessHours: true })[0] as { text: string }).text : "";
check(text.startsWith("山田様、ご予約内容のご確認です"), "お名前で始まる");
check(text.includes("10月31日（土）〜11月2日（月）") && text.includes("（2泊）"), "日程と泊数");
check(text.includes("チェックイン 15:00") && text.includes("9:00〜11:00"), "チェックイン・チェックアウト");
check(text.includes("ももちゃん"), "わんちゃんの名前（性別でちゃん）");
check(text.includes("/booking/modify/00000000-0000-0000-0000-000000000001"), "変更リンク");
check(text.includes("次の営業日") && !text.includes("お急ぎの場合はお電話"), "営業時間外の締め");
check(!/0\d{9,10}|@|〒/.test(text.replace(/https:\/\/\S+/g, "")), "電話・メール・住所を出さない（リンクを除く本文）");
const day = decideBookingStatus([{ ...base, plan: "8h", checkout_date: null, checkin_time: "07:30:00", dogs: [{ name: "くま", sex: null }] }]);
const dayText = day.ok ? (buildBookingStatusReply(day.reservations)[0] as { text: string }).text : "";
check(dayText.includes("1日お預かり（8時間）") && dayText.includes("お預け 7:30") && !dayText.includes("チェックアウト"), "日帰りの書き方");
check(dayText.includes("🐕 くま") && !dayText.includes("くまくん") && !dayText.includes("くまちゃん"), "性別不明なら くん/ちゃん を付けない");

// ───── D. 「変更できましたか？」（変更の結果の確かめ・2026-11-26）─────
// 実例の型（11/25 夜・半日のお客様。お名前は置かない）
const REAL_REQUEST = "10時に変更してください";
const REAL_DONE_Q = "これで、28日9時の予約から、10時の予約に変更できましたか？";
check(bookingStatusQueryKind(REAL_DONE_Q) === "change_done", `実例: 完了の確かめ＝自動回答の対象: ${REAL_DONE_Q}`);
check(bookingStatusQueryKind(REAL_REQUEST) === null, `実例: 依頼は対象にしない: ${REAL_REQUEST}`);
const DONE_YES = [
  "予約の変更できましたか？",
  "予約の変更ができているか教えてください。変更できていますか",
  "予約の日付を変更したのですが、ちゃんと変更されていますか？",
  "予約が10時に変更になっていますか",
  "予約、変更できてますか?",
  "先ほど予約を変更しましたが、変更できていますでしょうか",
  "予約の時間を変えたのですが、変わっていますか？",
  "到着時間の予約変更、できましたか？",
  "予約の時間を変更していただけましたか",
];
const DONE_NO = [
  "10時に変更してください", // 依頼（予約の語もなし）
  "予約を10時に変更してください", // 依頼
  "予約を変更できますか？", // 可否の質問
  "予約の変更は可能ですか", // 可否
  "予約を変更したいです", // 意思
  "予約の変更できました！ありがとうございます", // 報告・お礼（疑問でない）
  "予約の変更できましたか？あと延長もお願いしたいです", // 別の用件が混ざる
  "予約の変更できましたか？まだなら10時に変更してください", // 依頼が混ざる
  "予約変更できましたか？キャンセル料はかかりますか", // 料金・キャンセル
  "変更できましたか？", // 予約の話か分からない（住所・電話の変更もありうる）
  "予約の日付って変更できたら嬉しいです", // 仮定
];
for (const t of DONE_YES) check(isChangeDoneQuestion(t) && bookingStatusQueryKind(t) === "change_done", `完了の確かめと判定: ${t}`);
for (const t of DONE_NO) check(!isChangeDoneQuestion(t), `完了の確かめと判定しない: ${t}`);
for (const t of DONE_NO) check(bookingStatusQueryKind(t) === null, `自動回答の対象にしない: ${t}`);
check(bookingStatusQueryKind("予約内容確認") === "status", "ふつうの予約確認は status のまま");
{
  // 実例: 取り直した 10:00 の半日（備考なし）＝答えられる。文面は「変更できました」と言い切らない
  const half: StatusReservation = { ...base, plan: "4h", date: "2026-11-28", checkout_date: null, checkin_time: "10:00:00", dogs: [{ name: "シンバ", sex: "male" }] };
  const dd = decideBookingStatus([half]);
  check(dd.ok, "実例: 10:00 の半日だけが残っている＝答える");
  const t = dd.ok
    ? (buildBookingStatusReply(dd.reservations, { greeting: "山田様、", outsideBusinessHours: true, kind: "change_done" })[0] as { text: string }).text
    : "";
  check(t.startsWith("山田様、ご予約内容のご確認です🐾\n現在承っているご予約は下記のとおりです。"), "変更の確かめ＝「現在承っているご予約は下記のとおりです」");
  check(!t.includes("変更できました") && !t.includes("変更いたしました") && !t.includes("変更されました"), "「変更できました」と言い切らない");
  check(t.includes("11月28日（土）") && t.includes("お預け 10:00") && t.includes("シンバくん"), "日付・時刻・お名前（男の子＝くん）");
  check(t.includes("次の営業日") && !t.includes("お急ぎの場合はお電話"), "時間外の締め（お電話へと書かない）");
  // 安全条件は緩めていない: 仮予約・スタッフメモ・備考の時刻があれば答えない
  check(!decideBookingStatus([{ ...half, status: "pending" }]).ok, "変更の確かめでも仮予約は答えない");
  check(!decideBookingStatus([{ ...half, notes: "9時には間に合いそうもないので、10時にしてください" }]).ok, "備考に時刻があれば答えない");
  check(!decideBookingStatus([{ ...half, admin_notes: "電話で11時に変更" }]).ok, "スタッフメモがあれば答えない");
}

const total = pass + fails.length;
console.log(`\nLINE 予約内容の自動回答テスト: ${pass}/${total} PASS\n`);
if (fails.length) {
  console.log(fails.join("\n"));
  process.exit(1);
}
console.log("✅ 全ケース PASS");
