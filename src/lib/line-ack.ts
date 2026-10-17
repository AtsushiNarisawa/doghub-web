// ───── LINE 自由文への「受付返信（ACK）」──────────────────────────────
// 2026-08-31 新設。それまでは自由文（リッチメニューのボタン以外＝お客様が自分で
// 打った文章）すべてに、たった1つの定型文を返していた:
//
//   「内容を確認いたしました。必要に応じて、担当より改めてご連絡いたします」
//
// 実データ（本番 line_messages・2026-08-31 時点）は、お客様からのテキスト134件のうち
//   ・99件 = リッチメニューのボタンと完全一致（うち「到着時間の変更・遅刻」だけで14件）
//   ・35件 = 自分で打った自由文
// で、自由文35件の中身は「当日の到着・遅刻」8件／「予約の変更・空き確認」7件／
// 「お礼・相槌」5件／その他15件。ボタンの14件と合わせると、到着・遅刻の連絡が最大の用件。
// それなのに「今向かっています、9:30到着予定です」にまで上の文面を返していた
// （CEO 指摘 2026-08-30）。「必要に応じて」は "返事が来ないかもしれない" と読まれる。
//
// 🔴 文面に埋め込んである事実（CEO 確認 2026-08-30）:
//   - 到着が30分程度前後するのは問題ない。1日お預かり(8h)は8時間の枠内なら料金も変わらない
//     （遅れると利用時間が短くなるだけ）＝ だから自動応答に金額は書かない。
//   - スタッフのLINE返信は数時間かかることがほとんど＝「まもなく」と書かない。
//     「お時間をいただくことがあります」と正直に書く。
//   - 営業時間外に「お急ぎはお電話へ」とは書かない（誰も出られないため）。
//     お預かり中の急用に限って電話をご案内する。
//
// ⚠️ このファイルは「受付返信の言い方」だけを持つ。料金・受け入れ可否といった判断は
//    一切しない（人が答える）。FAQ のキーワード表（line-faq.ts）は変更していない。
import type { LineMessage } from "./line";
import { TEL } from "./line-faq";
import { DEFAULT_CLOSED_WEEKDAYS } from "./business-days";

// ───── 1. 営業時間の判定（JST）─────────────────────────────────────
//
// 🔴 Vercel のサーバーは UTC で動く。new Date().getHours() や toLocaleString の
//    ローカル解釈を使うと最大15時間ずれる（memory: feedback_timezone_bug_jst_after_9am）。
//    必ず timeZone:"Asia/Tokyo" を明示した文字列から時刻を取り出す。
//    "sv-SE" ロケールは "YYYY-MM-DD HH:mm:ss" のISO風・24時間表記で、深夜0時も "00" になる
//    （en-GB の hour12:false は環境によって "24:00" を返すため使わない）。

/** 営業開始 9:00 を「0時からの分数」で表したもの */
export const OPEN_MINUTES = 9 * 60;
/** 営業終了 17:00 を「0時からの分数」で表したもの */
export const CLOSE_MINUTES = 17 * 60;

export interface JstMoment {
  /** "YYYY-MM-DD"（JST） */
  date: string;
  /** 0=日 … 6=土（JST） */
  weekday: number;
  /** 0時からの分数（JST。9:30 なら 570） */
  minutes: number;
}

/** いまの JST の日付・曜日・時刻を取り出す。サーバーのTZ設定に依存しない。 */
export function getJstMoment(now: Date = new Date()): JstMoment {
  const s = now.toLocaleString("sv-SE", { timeZone: "Asia/Tokyo" }); // "YYYY-MM-DD HH:mm:ss"
  const date = s.slice(0, 10);
  const minutes = Number(s.slice(11, 13)) * 60 + Number(s.slice(14, 16));
  // 日付文字列から曜日を出す（JSTの正午を基準にすればUTC環境でもズレない）。business-days.ts と同じ流儀。
  const weekday = new Date(date + "T12:00:00+09:00").getUTCDay();
  return { date, weekday, minutes };
}

export interface BusinessHoursOptions {
  /**
   * その日の daily_capacity.closed。臨時休業=true / 臨時営業=false / 行が無い=null|undefined。
   * 🔴 予約APIと同じ作法:「行があればその closed 値、無ければ曜日で判定」
   *    （お盆に水木を臨時営業した実績があるため、曜日だけで決めてはいけない）。
   * 🔴 web_closed（Web受付停止）は休業ではない＝ここでは絶対に見ない
   *    （memory: feedback_closed_day_diagnostic）。
   */
  closedOverride?: boolean | null;
  /** 定休日の曜日。既定は水(3)・木(4)。 */
  closedWeekdays?: number[];
}

/** いま営業時間内か（定休日・臨時休業なら常に false）。 */
export function isWithinBusinessHours(
  moment: JstMoment,
  opts: BusinessHoursOptions = {}
): boolean {
  const closedWeekdays = opts.closedWeekdays ?? DEFAULT_CLOSED_WEEKDAYS;
  const closed = opts.closedOverride ?? closedWeekdays.includes(moment.weekday);
  if (closed) return false;
  return moment.minutes >= OPEN_MINUTES && moment.minutes < CLOSE_MINUTES;
}

// ───── 2. 自由文の振り分け ────────────────────────────────────────
//
// ⚠️ ここは「どの受付文を返すか」を決めるだけ。誤って振り分けても、スタッフ宛の
//    アラートメールは全ての自由文で必ず飛ぶ（webhook/route.ts）＝そこが安全網。
//    だから「迷ったら④（既定）に落とす」で構わない。

export type AckKind =
  | "arrival" // ① 当日の到着・遅刻・お迎え
  | "booking" // ② 予約の変更・空き確認
  | "thanks" //  ③ お礼・ご挨拶
  | "booked" //  ⑤ 予約を入れた直後のご挨拶（2026-10-17）
  | "mistake" // ⑥ 押し間違い・誤送信のお知らせ（2026-10-17）
  | "general"; // ④ それ以外すべて（既定）

/**
 * ③ お礼と判定してよい語。ここに該当し、かつ用件語をひとつも含まない短文だけを
 * 「お礼・相槌」とみなす。
 */
const THANKS_WORDS = [
  "ありがとう", "有難う", "有り難う", "感謝",
  "よろしくお願い", "宜しくお願い", "よろしくおねがい", "よろしくです",
  "承知", "了解", "かしこまり", "助かります", "嬉しい", "うれしい", "楽しみ",
];

/**
 * 用件語。ひとつでも含まれていたら ③ にはしない（＝④以降へ落とす）。
 * 🔴 CEO 指示どおり「保守的に」＝お礼と用件が混ざったものはお礼扱いにしない。
 *    お礼を④で受けても失礼ではないが、用件を③（当日お待ちしております）で
 *    受け流すのは実害になるため、非対称に倒している。
 */
const ERRAND_WORDS = [
  // 予約まわり
  "変更", "キャンセル", "取り消し", "取消", "空き", "空いて", "空室", "予約", "延泊", "日程",
  // 当日の動き
  "到着", "着きま", "着きそう", "遅れ", "遅刻", "間に合", "向かって", "渋滞", "迎え", "延長", "伺え", "伺いま",
  // 条件・料金・持ち物など個別回答が要るもの
  "何時", "時間", "料金", "いくら", "値段", "支払", "ワクチン", "証明書", "写真", "動画",
  // 質問・依頼の形
  "確認", "教えて", "相談", "可能", "希望", "ですか", "ますか", "でしょうか", "ください", "大丈夫",
];

/** ③ とみなす文の長さの上限（空白を除いた文字数）。長文はお礼だけということがまず無い。 */
const THANKS_MAX_LENGTH = 80;

/**
 * ② 予約の変更・空き確認。
 * ⚠️ 「予約」単体は入れない。「◯月◯日に予約している△△です」と名乗ってから
 *    別の質問をする文が非常に多く、それを②（空き状況をお調べします）で受けると的外れになる。
 *    予約を"動かしたい"意思が読める形だけを拾う。
 * ⚠️ 「預け」「預かり」も入れない（当日の到着連絡で頻出するため。実例: 林様
 *    「本日9時から1日のお預けをお願いしている…9:30までには到着…」は①が正しい）。
 */
const BOOKING_WORDS = [
  "空き", "空いて", "空室", "キャンセル", "取り消し", "取消", "リスケ", "日程", "変更", "延泊",
  "予約したい", "予約でき", "予約を", "予約は", "ご予約の", "予約可能", "予約取れ",
  // ⚠️ 「利用したい」は外した（2026-10-17）。実例「おにぎりカフェだけ利用したい」が
  //    ②（ご予約の変更・空き状況をお調べします）に落ちていた。宿泊の意思は「泊まりたい」で拾える。
  "泊まりたい",
  "行けなく", "行けません", "伺えなく", "行けそうにな",
];

/** 名乗りの言い回し（②の判定前に取り除く）。2026-10-17 */
const BOOKING_INTRO_PHRASES =
  /(宿泊|ホテルの?|お預かりの?|半日の?|1日の?)?予約を?(して(い|お)る|してます|しており|している|させて(いただ|頂)いて(い|お)る|させて(いただ|頂)きました|しました|完了しました|が完了しました|確定ありがとう)/g;
/** 予約を動かす意思がはっきりしている語（「確認」と混ざっていても②にする） */
const BOOKING_STRONG_WORDS = [
  "空き", "空いて", "空室", "キャンセル", "取り消し", "取消", "リスケ", "日程", "変更", "延泊",
  "泊まりたい", "行けなく", "行けません", "伺えなく", "行けそうにな",
];

/**
 * ① 当日の到着・遅刻・お迎え。
 * ⚠️ 「ピックアップ」は入れない（当店では送迎の問い合わせ語でもあり、実例
 *    「本日ピックアップが難しそうなので、引き続きお散歩よろしく」は①ではなく④が正しい）。
 * ⚠️ 「お迎え」単体も入れない（「お迎えは何時まで？」という営業時間の質問に誤爆するため）。
 */
const ARRIVAL_WORDS = [
  "到着", "着きま", "着きそう", "着く予定", "つきます", "つきそう",
  "向かって", "向かいま", "遅れ", "遅刻", "遅くなり", "間に合", "渋滞", "後ろ倒し",
];

/**
 * ① の弱い手がかり（2026-10-17 追加）。実例「伺えるのが10:00-11:00の間になると思います」が
 * ③（当日お待ちしております）に落ちていた。ただし「何時に伺えばいいですか」のような
 * 質問にも現れるため、質問の形を含まないときだけ①とみなす。
 */
const ARRIVAL_SOFT_WORDS = ["伺え", "伺いま", "お伺い"];
const QUESTION_FORMS = ["ですか", "ますか", "でしょうか", "ください", "教えて", "？", "?"];

/**
 * ⑤ 予約を入れた直後のご挨拶（2026-10-17 追加）。
 * 実例「先ほど11月21日一泊で予約を入れた高橋です。よろしくお願いいたします。」が
 * ②（変更・空き状況をお調べします）／営業時間外文面に落ちていた。挨拶に「返事を待って」と返すのは不自然。
 * 🔴 確認・質問・変更の依頼が混ざっていたら⑤にしない（実例「予約いれましたが、3匹とも入っているか、
 *    ご確認お願いします」「予約完了のメールが届いていない」は人が答える）。
 */
const BOOKED_WORDS = [
  "予約を入れ", "予約をいれ", "予約入れ", "予約いれ", "予約しました", "予約をしました", "予約した",
  "予約をした", "予約させて", "予約を取らせ", "予約完了しました", "予約が完了しました", "予約をさせて",
];
const BOOKED_BLOCK_WORDS = [
  ...QUESTION_FORMS, "確認", "変更", "キャンセル", "取り消", "取消", "届い", "できて", "入って",
  "大丈夫", "可能", "相談", "追加", "間違", "ワクチン", "料金", "持病", "伺え", "到着",
];
const BOOKED_MAX_LENGTH = 120;

/** ⑥ 押し間違い・誤送信（2026-10-17 追加）。短文のみ。実例「すみません、間違いです」 */
const MISTAKE_WORDS = ["間違い", "間違え", "まちがい", "まちがえ", "誤送信", "押し間違", "誤って", "ミスです"];
const MISTAKE_MAX_LENGTH = 30;

/**
 * 「確認できました」は用件ではなくお礼（2026-10-17）。実例「ありがとうございます！！確認でしました✨」
 * （「確認」が用件語に当たり、お礼なのに「次の営業日にご返信します」を返していた）。
 * 判定の前にこの言い回しだけ取り除く。
 */
const CONFIRMED_PHRASES = /ご?確認(でき|でし|し|いたし|させていただき)ました|ご確認(いただき)?(ありがとう)/g;

/**
 * 人が個別に判断するしかないカテゴリ（line-faq.ts のカテゴリ名）。
 * ここに当たったら①②③の定型文は返さず、必ず④（スタッフより返信します）にする。
 *  - ワクチン相談の文中に「8/18予約の◯◯です」と名乗りがあっても②にしない。
 *  - 「引き続きお散歩よろしくお願いします」のような “お礼の形をしたご依頼” を
 *    ③（当日お待ちしております）で受け流さない。だから③より先に判定する。
 */
const HUMAN_JUDGEMENT_CATEGORIES = [
  "受入確認",
  "体調・急病時の対応",
  "ワクチン",
  "対応外サービス",
  "大型犬",
  "お散歩オプション",
  "様子確認",
];

function isThanksOnly(text: string): boolean {
  const compact = text.replace(/\s+/g, "").replace(CONFIRMED_PHRASES, "$3");
  if (!compact || compact.length > THANKS_MAX_LENGTH) return false;
  if (!THANKS_WORDS.some((w) => compact.includes(w))) return false;
  if (ERRAND_WORDS.some((w) => compact.includes(w))) return false;
  if (/[？?]/.test(compact)) return false; // 疑問符があれば必ず用件
  return true;
}

/**
 * 自由文をどの受付文で受けるか決める。
 * @param text お客様の本文
 * @param faqCategory line-faq.ts の matchFaqReply が返したカテゴリ（部分一致の目安）
 */
export function classifyAckKind(text: string, faqCategory: string): AckKind {
  const t = (text ?? "").trim();
  if (!t) return "general";
  // 人の判断が要るカテゴリは、どんな言い回しでも定型で答えない（③より先に見る）
  if (HUMAN_JUDGEMENT_CATEGORIES.includes(faqCategory)) return "general";
  // ③ お礼・相槌（用件語をひとつでも含めば下へ落ちる）
  if (isThanksOnly(t)) return "thanks";

  // ⑥ 押し間違い（短文だけ）
  const compact = t.replace(/\s+/g, "");
  if (compact.length <= MISTAKE_MAX_LENGTH && MISTAKE_WORDS.some((w) => compact.includes(w))) {
    return "mistake";
  }

  // ⑤ 予約を入れた直後のご挨拶（②より先。BOOKING_WORDS の「予約を」に当たってしまうため）
  if (
    compact.length <= BOOKED_MAX_LENGTH &&
    BOOKED_WORDS.some((w) => compact.includes(w)) &&
    !BOOKED_BLOCK_WORDS.some((w) => compact.includes(w))
  ) {
    return "booked";
  }
  // ② 予約を動かしたい／空きを知りたい（①より先。「空きがあれば当日でも…」のような
  //    到着と予約が混ざった文は、予約側で受けたほうが噛み合うため）
  // 名乗りの「◯日に予約している△△です」は②の根拠にしない（2026-10-17）。実例: 星野様
  // 「11/7にペットホテルを予約をしている星野と申します…トイレトレーはありますか」が②に落ちていた。
  const forBooking = t.replace(BOOKING_INTRO_PHRASES, "");
  const strongBooking = BOOKING_STRONG_WORDS.some((w) => forBooking.includes(w));
  // 「予約できているか確認してほしい」は空き・変更ではない＝④で人が答える（実例 10/5）
  const confirmOnly = forBooking.includes("確認") && !strongBooking;
  if (!confirmOnly && BOOKING_WORDS.some((w) => forBooking.includes(w))) return "booking";
  // ① 当日の到着・遅刻
  if (faqCategory === "到着時間の変更・遅刻" || ARRIVAL_WORDS.some((w) => t.includes(w))) {
    return "arrival";
  }
  if (ARRIVAL_SOFT_WORDS.some((w) => t.includes(w)) && !QUESTION_FORMS.some((w) => t.includes(w))) {
    return "arrival";
  }
  return "general";
}

// ───── 3. 文面 ───────────────────────────────────────────────────

// ① 到着・遅刻・お迎え。🔴 金額は書かない（30分程度の前後は料金に影響しないため）。
const ARRIVAL_TEXT =
  "承りました🐾\n" +
  "30分程度の前後でしたら、そのままお越しください。お預かりに支障はありません。\n" +
  `それ以上に遅れそうなとき・ご不安なときは、お電話（${TEL}）をいただけると確実です。\n` +
  "\n" +
  "運転にはくれぐれもお気をつけて。お待ちしております。";

// ② 予約の変更・空き確認。自分で直せる範囲（到着予定時間・備考）は自己解決に誘導する。
const BOOKING_TEXT =
  "承りました。ご予約の変更・空き状況は、スタッフがお調べしてご連絡いたします。\n" +
  `お返事までお時間をいただくことがあります。お急ぎの場合はお電話（${TEL}）へお願いいたします。\n` +
  "\n" +
  "なお、到着予定時間と備考の変更は、ご予約時のメール・LINEにある「変更・キャンセルはこちら」から、その場でお手続きいただけます。";

// ③ お礼・ご挨拶。🔴 ここで「担当より連絡します」と言わない（事務的な印象の元凶だったため）。
const THANKS_TEXT = "ありがとうございます🐾 当日お待ちしております。";
// ③ のうち、ご予約が確かめられない方（予約前のお問い合わせへのお礼・LINE未連携の方など）。2026-10-17 追加。
// 実例: 予約前の質問に答えたお礼に「当日お待ちしております」と返していた。
// ⚠️ 未連携の方は予約があっても照合できない＝予約の有無どちらに当たっても不自然にならない言い方にする。
const THANKS_NO_BOOKING_TEXT = "ありがとうございます🐾 お会いできるのを楽しみにしております。";

// ⑤ 予約を入れた直後のご挨拶。返信は約束しない（挨拶に「お返事をお待ちください」は不自然）。
const BOOKED_TEXT = "ご予約ありがとうございます🐾 当日お待ちしております。";

// ⑥ 押し間違い・誤送信。
const MISTAKE_TEXT = "承知いたしました。どうぞお気になさらないでください🐾";

// ④ 既定。🔴 旧文面の「必要に応じて」を削る（返事が来ないかもしれない、と読まれていた）。
const GENERAL_TEXT =
  "メッセージありがとうございます🐾\n" +
  `内容を確認し、スタッフよりご返信いたします。お返事までお時間をいただくことがありますので、お急ぎの場合はお電話（${TEL}）へお願いいたします。`;

// B 営業時間外・定休日。🔴 「お急ぎはお電話へ」とは書かない（誰も出られないため）。
//   電話をご案内するのは「お預かり中の急用」に限る。
const AFTER_HOURS_TEXT =
  "ただいま営業時間外です（金〜火 9:00〜17:00／水・木定休）。\n" +
  "内容を確認のうえ、次の営業日にご返信いたします。\n" +
  "お預かり中のワンちゃんのことで急を要する場合のみ、お電話をお願いいたします。";

const TEXT_BY_KIND: Record<AckKind, string> = {
  arrival: ARRIVAL_TEXT,
  booking: BOOKING_TEXT,
  thanks: THANKS_TEXT,
  booked: BOOKED_TEXT,
  mistake: MISTAKE_TEXT,
  general: GENERAL_TEXT,
};

// ───── 4. 決まっている内容の案内（2026-10-17 追加）─────────────────────
//
// 自由文の中に「答えが決まっている話題」があれば、受付文の前にその案内を添える。
// 🔴 案内を添えても受付文（スタッフより返信します／次の営業日に返信します）は外さない。
//    スタッフ宛アラートも従来どおり飛ぶ＝誤爆しても「余計な案内が1つ付いた」で済む。
// 🔴 ここに書く内容は CEO 確認済みの事実だけ。
//    - カフェ: CLAUDE.md §2・memory reference_cafe_dogrun_access_conditions（曜日で全部変わる）
//    - お部屋の備品: 2026-10-17 CEO 回答（トレー・シート・水皿は用意／マナーパッドは持参）
//    - ワクチン証明書の写真: /guide の持ち物「ワクチン証明書を撮影した写真でも可」
export type InfoTopic = "cafe" | "room_supplies" | "vaccine_photo";

const CAFE_WORDS = ["カフェ", "おむすび", "おにぎり", "スープ", "ランチ", "イートイン", "テイクアウト"];
const ROOM_SUPPLY_WORDS = [
  "トイレ", "トレー", "トレイ", "ペットシーツ", "シーツ", "食器", "お皿", "給水", "お水", "水飲", "水を飲",
  "マナーパッド", "マナーベルト",
];
const VACCINE_WORDS = ["ワクチン", "証明書", "接種"];
// 「写真で良いか」を尋ねる形だけ拾う。「昨年のワクチンの写真をお送りします」（未接種の相談）には
// 出さない＝「写真でも大丈夫」が受け入れの返事に読めてしまうため（実データで確認・2026-10-17）。
const PHOTO_WORDS = ["原本", "写真で", "写真でも", "画像で", "画像でも", "コピーで", "コピーでも", "スクショで", "データで"];

/** 本文に含まれる「答えが決まっている話題」を返す（該当なしなら空配列）。 */
export function detectInfoTopics(text: string): InfoTopic[] {
  const t = (text ?? "").replace(/\s+/g, "");
  const topics: InfoTopic[] = [];
  if (CAFE_WORDS.some((w) => t.includes(w))) topics.push("cafe");
  if (ROOM_SUPPLY_WORDS.some((w) => t.includes(w))) topics.push("room_supplies");
  if (VACCINE_WORDS.some((w) => t.includes(w)) && PHOTO_WORDS.some((w) => t.includes(w))) {
    topics.push("vaccine_photo");
  }
  return topics;
}

// 🔴 カフェは「平日は飲み物のみ」とだけ書かない（2026-08-06 に GBP へ事実と逆の一文が出た）。
//    店内飲食・ドッグランの可否を曜日ごとにセットで書く。
const INFO_TEXT: Record<InfoTopic, string> = {
  cafe:
    "カフェ（OMUSUBI & SOUP CAFE）のご案内です☕\n" +
    "・土日祝 11:00〜17:00：おむすび＆スープをご提供しています。わんちゃんとご一緒に店内でお食事いただけ、カフェをご利用のお客様は併設のドッグランもお使いいただけます\n" +
    "・平日（金・月・火）9:00〜17:00：お飲み物のテイクアウト販売のみです（店内でのご飲食・ドッグランのご利用はできません）\n" +
    "・水・木は定休日です。ご予約は不要です",
  room_supplies:
    "お部屋の備品のご案内です🐾\n" +
    "・トイレトレー・トイレシート、食器・給水器はご用意しております（お水はいつでも飲めるようにしています）\n" +
    "・マナーパッドは、わんちゃんによってサイズが異なるため、お持ちください",
  vaccine_photo:
    "ワクチン証明書は、撮影したお写真でも大丈夫です📄",
};

// 案内を添えたときの受付文（営業時間内）。④と同じ約束を、案内の後ろに置ける言い方にしたもの。
const INFO_FOLLOW_TEXT =
  "そのほかの内容は、スタッフが確認してご返信いたします。お返事までお時間をいただくことがありますので、" +
  `お急ぎの場合はお電話（${TEL}）へお願いいたします。`;

/** 案内文（複数あれば空行区切り）。該当なしなら空文字。 */
export function buildInfoText(topics: InfoTopic[]): string {
  return topics.map((k) => INFO_TEXT[k]).join("\n\n");
}

/** 本文から「これからお預かりがある」と読めるか。③お礼の文面選びにだけ使う。 */
const BOOKING_IMPLIED_WORDS = ["当日", "本日", "明日", "明後日", "お預か", "預かって", "お預け", "お世話になります"];
export function impliesBooking(text: string): boolean {
  return BOOKING_IMPLIED_WORDS.some((w) => (text ?? "").includes(w));
}

/** 姓が取れていれば「◯◯様、」を頭に付ける。空・異常に長い値は名前なしに倒す。 */
export function nameGreeting(lastName?: string | null): string {
  const n = (lastName ?? "").trim();
  if (!n || n.length > 20) return "";
  return `${n}様、`;
}

export interface AckOptions {
  /** LINE連携済みのお客様の姓（customers.last_name）。取れなければ null。 */
  lastName?: string | null;
  /** いま営業時間外か。true なら①以外は営業時間外の文面に差し替える。 */
  outsideBusinessHours?: boolean;
  /**
   * 今後のご予約（confirmed・今日以降）があるか。③お礼の文面を分けるのに使う（2026-10-17）。
   * 取れなかった（未連携・DB遅延）ときは undefined ＝「ご予約なし」の文面に倒す
   * （予約の無い方に「当日お待ちしております」と言うほうが不自然なため）。
   */
  hasUpcomingBooking?: boolean;
  /**
   * 本文が「これからお預かりがある」ことを示しているか（「当日はよろしく」「本日お世話になります」等）。
   * LINE未連携の方は予約を照合できないため、本文から補う（2026-10-17）。impliesBooking() で作る。
   */
  textImpliesBooking?: boolean;
  /** 本文から見つかった「答えが決まっている話題」。④（既定）のときだけ受付文の前に添える。 */
  infoTopics?: InfoTopic[];
}

/**
 * 受付返信を組み立てる。
 *
 * 🔴 営業時間外の文面（B）に差し替えないのは ①到着・遅刻 と ③お礼 の2つ。理由はどちらも
 *    「その場で完結していて、スタッフの返信を待つ必要がない」ため:
 *    ① 1日プランは早朝7時からのお預かりがあり、開店前（9時前）でも到着連絡が現に届く。
 *       内容も「30分程度なら大丈夫／それ以上ならお電話」で閉じており、「次の営業日に
 *       ご返信します」は当日これから到着する方には誤案内になる。
 *    ③ 「ありがとうございます🐾 当日お待ちしております。」は返信を約束していない。
 *       お礼に「ただいま営業時間外です。次の営業日にご返信いたします」と返すのは、
 *       今回直そうとしている“機械的な受け答え”そのものになる（実データでも17:00ちょうど・
 *       朝8:49のお礼が該当した）。
 *    ②④ は人の返信を待つ用件なので、営業時間外は必ずBに差し替える。
 */
// ⑤⑥（2026-10-17 追加）も返信を約束しない文面なので、営業時間外でも差し替えない。
const AFTER_HOURS_EXEMPT: AckKind[] = ["arrival", "thanks", "booked", "mistake"];

export function buildAckMessages(kind: AckKind, opts: AckOptions = {}): LineMessage[] {
  const useAfterHours = opts.outsideBusinessHours === true && !AFTER_HOURS_EXEMPT.includes(kind);
  let body = useAfterHours ? AFTER_HOURS_TEXT : TEXT_BY_KIND[kind];
  if (kind === "thanks" && opts.hasUpcomingBooking !== true && !opts.textImpliesBooking) {
    body = THANKS_NO_BOOKING_TEXT;
  }
  const info = kind === "general" ? buildInfoText(opts.infoTopics ?? []) : "";
  if (info) {
    // 挨拶 → 案内 → 受付文（スタッフも見ている旨）の順。受付文は外さない。
    const follow = useAfterHours ? AFTER_HOURS_TEXT : INFO_FOLLOW_TEXT;
    const text =
      nameGreeting(opts.lastName) + "メッセージありがとうございます🐾\n\n" + info + "\n\n" + follow;
    return [{ type: "text", text }];
  }
  return [{ type: "text", text: nameGreeting(opts.lastName) + body }];
}

/**
 * 非テキスト（画像・スタンプ・位置情報など）への受領メッセージ。「無音」を避けるために送る。
 * ⚠️ 扱いは従来どおり（常に同じ1文・スタンプの二重通知抑制は webhook 側で不変）。
 *    文面だけ、④と同じ新しい既定文に揃えた（「必要に応じて」を削るため）。
 */
export function nonTextReply(opts: { outsideBusinessHours?: boolean } = {}): LineMessage[] {
  // 2026-10-17: 営業時間外は時間外の文面に（夜20時の画像に「お急ぎはお電話へ」と返していた）。
  return [{ type: "text", text: opts.outsideBusinessHours === true ? AFTER_HOURS_TEXT : GENERAL_TEXT }];
}
