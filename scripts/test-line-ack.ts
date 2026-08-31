// LINE 受付返信（ACK）の決定論的テスト。実コード（src/lib/line-ack.ts）をそのまま実走する。
// 実行: node --import ./scripts/ts-resolve-hook.mjs scripts/test-line-ack.ts
//
// 検証するのは3つ:
//   A. 振り分け（自由文 → ①到着 / ②予約変更 / ③お礼 / ④その他）
//   B. 営業時間の判定が JST で行われ、サーバーのタイムゾーン設定に左右されないこと
//      （🔴 Vercel は UTC。memory: feedback_timezone_bug_jst_after_9am）
//   C. 文面の作り分け（お名前・営業時間外・①③は営業時間外でも差し替えない）
//
// ⚠️ 本文は実在のお客様のメッセージを写したものではなく、実データで見られた「言い回しの型」を
//    再現した合成ケース（個人情報をリポジトリに置かないため）。
import { matchFaqReply } from "../src/lib/line-faq.ts";
import {
  classifyAckKind,
  buildAckMessages,
  getJstMoment,
  isWithinBusinessHours,
  type AckKind,
} from "../src/lib/line-ack.ts";

let pass = 0;
const fails: string[] = [];

function check(ok: boolean, label: string) {
  if (ok) pass++;
  else fails.push(`✗ ${label}`);
}

// ───── A. 振り分け ─────
type Case = { text: string; expect: AckKind; note?: string };

const CASES: Case[] = [
  // ① 当日の到着・遅刻
  { text: "今向かっています。道が混んでいて9:30到着予定です", expect: "arrival", note: "CEO指摘の実例型" },
  { text: "あと5分で着きそうです！", expect: "arrival" },
  { text: "本日9時から1日のお預けをお願いしている者です。申し訳ありません、9:30までには到着できるかと思いますが少し過ぎます。", expect: "arrival", note: "お預け＝予約語に見えるが到着連絡" },
  { text: "高速が大渋滞しており、到着が10時半になりそうです。スタート時刻を後ろ倒しにできますか", expect: "arrival" },
  { text: "15分ほど遅れます。申し訳ございません", expect: "arrival" },
  { text: "当日は7:30〜8:00に到着します。よろしくお願いします。", expect: "arrival", note: "早朝お預かりの事前連絡" },

  // ② 予約の変更・空き確認
  { text: "23日と24日の宿泊を利用したいのですが空いていますか", expect: "booking" },
  { text: "旅行の日程が変わったので、予約を来週に変更させてください", expect: "booking" },
  { text: "都合が悪くなり行けなくなってしまいました", expect: "booking", note: "キャンセルの言い換え" },
  { text: "2泊で予約しましたが1泊に変更したいです", expect: "booking" },
  { text: "空き部屋はありますでしょうか？", expect: "booking" },

  // ③ お礼・ご挨拶（用件語をひとつも含まない短文だけ）
  { text: "当日はよろしくお願いします。", expect: "thanks" },
  { text: "ありがとうございます！当日はよろしくお願いします。", expect: "thanks" },
  { text: "お預かりしてくださるとのことでありがとうございます。宜しくお願い致します", expect: "thanks" },
  { text: "承知しました", expect: "thanks" },

  // ③ に寄せてはいけないもの（用件が混ざったお礼は必ず④以降へ）
  { text: "ありがとうございます。ところで到着が30分ほど遅れます", expect: "arrival", note: "お礼＋用件は用件が勝つ" },
  { text: "ありがとうございます。キャンセルをお願いできますか", expect: "booking", note: "お礼＋用件は用件が勝つ" },
  { text: "ありがとうございます。ワクチンの証明書は当日で大丈夫でしょうか", expect: "general" },
  { text: "ありがとうございます。滞在中の写真を送っていただけますか", expect: "general", note: "写真の要望は人が対応する" },
  { text: "料金はいくらですか", expect: "general", note: "料金は自動応答で答えない" },

  // ④ その他（人の判断が要るもの）
  { text: "狂犬病は接種していますが混合ワクチンは今年打っていません。預けられますか", expect: "general", note: "ワクチン相談" },
  { text: "8/18に予約している者です。持病の薬があるのですが預けられますか", expect: "general", note: "受入確認" },
  { text: "夕食の間だけ2時間お預けできますか。お迎えは19時過ぎになりそうです", expect: "general" },
  { text: "二重で予約してしまったかもしれません。ご確認お願いいたします", expect: "general" },
  { text: "本日ピックアップが難しそうなので、引き続きお散歩よろしくお願いいたします", expect: "general", note: "送迎語に誤爆させない" },
  { text: "ノコとモカです。", expect: "general" },
  { text: "", expect: "general" },
];

for (const c of CASES) {
  const kind = classifyAckKind(c.text, matchFaqReply(c.text).category);
  check(kind === c.expect, `"${c.text.slice(0, 28)}" → 期待=${c.expect} 実際=${kind}${c.note ? `  〈${c.note}〉` : ""}`);
}

// ───── B. 営業時間の判定（JST・タイムゾーン非依存）─────
// 2026-08-29(土) 09:17 JST = 2026-08-29T00:17Z → 営業時間内
const inHours = new Date("2026-08-29T00:17:00Z");
// 2026-08-28(金) 20:04 JST = 2026-08-28T11:04Z → 営業時間外（同じUTC日でもJSTでは夜）
const afterClose = new Date("2026-08-28T11:04:00Z");
// 2026-08-29(土) 00:30 JST = 2026-08-28T15:30Z → JSTでは日付が変わっている（UTC解釈だと前日昼）
const midnight = new Date("2026-08-28T15:30:00Z");

check(getJstMoment(inHours).date === "2026-08-29" && getJstMoment(inHours).minutes === 9 * 60 + 17, "JST変換 09:17");
check(getJstMoment(midnight).date === "2026-08-29" && getJstMoment(midnight).minutes === 30, "JST変換 深夜0:30（UTCでは前日15:30）");
check(getJstMoment(inHours).weekday === 6, "JST曜日 土曜");
check(isWithinBusinessHours(getJstMoment(inHours)) === true, "9:17は営業時間内");
check(isWithinBusinessHours(getJstMoment(afterClose)) === false, "20:04は営業時間外");
check(isWithinBusinessHours(getJstMoment(midnight)) === false, "深夜0:30は営業時間外");
// 境界: 9:00 は内、17:00 ちょうどは外
check(isWithinBusinessHours({ date: "2026-08-29", weekday: 6, minutes: 9 * 60 }) === true, "9:00ちょうどは営業時間内");
check(isWithinBusinessHours({ date: "2026-08-29", weekday: 6, minutes: 17 * 60 }) === false, "17:00ちょうどは営業時間外");
// 定休日（水・木）と、daily_capacity の上書き（臨時営業/臨時休業）
check(isWithinBusinessHours({ date: "2026-09-02", weekday: 3, minutes: 12 * 60 }) === false, "水曜の正午は定休日");
check(
  isWithinBusinessHours({ date: "2026-08-12", weekday: 3, minutes: 12 * 60 }, { closedOverride: false }) === true,
  "水曜でも臨時営業（closed=false の行あり）なら営業時間内"
);
check(
  isWithinBusinessHours({ date: "2026-08-29", weekday: 6, minutes: 12 * 60 }, { closedOverride: true }) === false,
  "土曜でも臨時休業（closed=true）なら営業時間外"
);

// ───── C. 文面 ─────
const arrival = buildAckMessages("arrival", { lastName: "成澤" })[0];
const general = buildAckMessages("general")[0];
const generalNight = buildAckMessages("general", { outsideBusinessHours: true })[0];
const arrivalNight = buildAckMessages("arrival", { outsideBusinessHours: true })[0];
const thanksNight = buildAckMessages("thanks", { outsideBusinessHours: true })[0];
const bookingNight = buildAckMessages("booking", { outsideBusinessHours: true })[0];
const noName = buildAckMessages("general", { lastName: "  " })[0];

check(arrival.type === "text" && arrival.text.startsWith("成澤様、承りました"), "連携済みは姓＋様で始まる");
check(noName.type === "text" && noName.text.startsWith("メッセージありがとうございます"), "姓が空なら名前なしにフォールバック");
check(general.type === "text" && !general.text.includes("必要に応じて"), "④から「必要に応じて」が消えている");
check(general.type === "text" && general.text.includes("お時間をいただくことがあります"), "④は返信に時間がかかることを正直に書く");
check(arrival.type === "text" && !/¥|円|料金/.test(arrival.text), "①に金額を書かない");
check(generalNight.type === "text" && generalNight.text.includes("次の営業日にご返信いたします"), "④は営業時間外の文面に差し替わる");
check(bookingNight.type === "text" && bookingNight.text.includes("次の営業日にご返信いたします"), "②は営業時間外の文面に差し替わる");
check(
  generalNight.type === "text" && !generalNight.text.includes("お急ぎの場合はお電話"),
  "営業時間外に「お急ぎはお電話へ」と書かない"
);
check(arrivalNight.type === "text" && arrivalNight.text.startsWith("承りました🐾"), "①は営業時間外でも①のまま（早朝7時のお預かりがある）");
check(thanksNight.type === "text" && thanksNight.text.startsWith("ありがとうございます🐾"), "③は営業時間外でも③のまま（返信を約束していないため）");
check(
  buildAckMessages("thanks")[0].type === "text" &&
    !(buildAckMessages("thanks")[0] as { text: string }).text.includes("担当より"),
  "③で「担当より連絡します」と言わない"
);

// ───── 結果 ─────
const total = pass + fails.length;
console.log(`\nLINE 受付返信（ACK）テスト: ${pass}/${total} PASS\n`);
if (fails.length) {
  console.log(fails.join("\n"));
  console.log(`\n❌ ${fails.length} 件 FAIL`);
  process.exit(1);
}
console.log("✅ 全ケース PASS（振り分け・JST営業時間判定・文面）");
