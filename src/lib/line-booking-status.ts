// ───── LINE「予約内容の確認」への自動回答（2026-10-23 新設）─────────────────
//
// きっかけ（CEO 2026-10-23）: 「予約内容確認」と届いたのに、営業時間外の受付文
// （次の営業日にご返信します）しか返せていなかった。予約の中身は DB にあるので、
// 時間帯に関係なく答えられる。
//
// 🔴 CEO 方針＝「問い間違いはしたくない。答えられるものだけ答える」。
//    だから「答えない（＝今までどおりスタッフが返信）」に倒す条件を多めに持つ:
//      - LINE と紐づいたお客様の予約でない（webhook 側で line_id 一致の顧客だけを引く）
//      - 仮予約（pending）が1件でも混ざる
//      - お迎えの延長・早預かりが入っている（管理画面で備考だけ直され、
//        checkout_extension_until 等の列が古いまま残る実例あり＝10-22 石川様）
//      - スタッフメモ（admin_notes）がある（電話で決めた変更がメモにだけ残ることがある）
//      - 備考に時刻・変更まわりの記載がある
//      - 今後の予約が無い／4件以上ある
//    答えない場合も、受付文とスタッフ宛アラートは従来どおり（webhook 側）。
//
// 🔴 返す中身は「予約確定」「前日リマインド」で同じ LINE に既に送っている内容
//    （日程・プラン・ワンちゃんの名前・変更リンク）だけ。電話・メール・住所は出さない。
//    紐づけが万一誤っていても、新しく漏れる情報はない（CEO 確認 2026-10-23）。
//
// ⚠️ このファイルは判定と文面だけ（DB は読まない）＝テストでそのまま実走できる。
import type { LineMessage } from "./line";
import { formatDateJaWithWeekday } from "./booking-rules";

// ───── 1. 「予約の確認をしたい」文の判定 ─────────────────────────────

/** 予約の状態を尋ねる言い回し（「予約」とセットで現れたときだけ有効） */
const STATUS_WORDS = [
  "確認", "内容", "できて", "出来て", "取れて", "とれて", "入って", "はいって", "届い", "されて", "なって",
];

/**
 * 「確認」ではなく「何かを動かしたい／個別の判断が要る」ことを示す語。
 * ひとつでも含めば自動回答しない（予約一覧を返しても答えにならない）。
 */
const BLOCK_WORDS = [
  "変更", "キャンセル", "取り消", "取消", "空き", "空いて", "空室", "延長", "延泊", "追加", "リスケ",
  "行けなく", "行けません", "伺えなく", "遅れ", "遅刻", "到着", "早め", "早く", "お迎え",
  "料金", "金額", "いくら", "支払", "ワクチン", "持病", "薬", "体調",
  // 時間の相談・希望（実例「予約時間について…9時半からでも大丈夫か」「2時間のお預かりを希望」）
  "時間", "時から", "希望", "可能", "相談", "でも大丈夫", "お願いしたい",
];

/** 「確認できました」はお礼であって問い合わせではない（実例「予約内容確認できました。よろしく」） */
const ALREADY_CONFIRMED = /確認(でき|でし|し|いたし|させていただき)ました/;

/** 「予約内容を確認したい」という問い合わせか */
export function isBookingStatusQuery(text: string): boolean {
  const t = (text ?? "").replace(/\s+/g, "");
  if (!t.includes("予約")) return false;
  if (!STATUS_WORDS.some((w) => t.includes(w))) return false;
  if (BLOCK_WORDS.some((w) => t.includes(w))) return false;
  if (ALREADY_CONFIRMED.test(t)) return false;
  return true;
}

// ───── 2. 答えてよいかの判定と文面 ──────────────────────────────────

export interface StatusReservation {
  id: string;
  plan: string; // "stay" | "8h" | "4h" | "spot"
  date: string; // YYYY-MM-DD
  checkout_date: string | null;
  checkin_time: string | null; // "15:00:00"
  status: string;
  walk_option: boolean | null;
  checkin_extension_from: string | null;
  checkout_extension_until: string | null;
  notes: string | null;
  admin_notes: string | null;
  dogs: { name: string | null; sex: string | null }[];
}

export type StatusDecision =
  | { ok: true; reservations: StatusReservation[] }
  | { ok: false; reason: string };

/** 自動回答するのは今後の予約が 1〜この件数のときだけ（多いと読み違えやすい） */
const MAX_RESERVATIONS = 3;

/** 備考にこれが含まれていたら、列の値と食い違っている可能性がある＝答えない */
const NOTES_RISK = /延長|早預|時間|変更|お迎え|到着|\d{1,2}[:：時]/;

/**
 * 今後の予約（キャンセルを除く・呼び出し側で抽出済み）から、自動で答えてよいかを決める。
 * 🔴 1件でも危ういものがあれば全体を「答えない」にする（一部だけ答えると、
 *    出ていない予約が「無い」と読まれてしまうため）。
 */
export function decideBookingStatus(upcoming: StatusReservation[]): StatusDecision {
  const list = upcoming.filter((r) => r.status !== "cancelled");
  if (list.length === 0) return { ok: false, reason: "no_upcoming" };
  if (list.length > MAX_RESERVATIONS) return { ok: false, reason: "too_many" };
  for (const r of list) {
    if (r.status !== "confirmed") return { ok: false, reason: "not_confirmed" };
    if (r.checkin_extension_from || r.checkout_extension_until) return { ok: false, reason: "extension" };
    if ((r.admin_notes ?? "").trim()) return { ok: false, reason: "admin_notes" };
    if (NOTES_RISK.test(r.notes ?? "")) return { ok: false, reason: "notes" };
    if (!["stay", "8h", "4h"].includes(r.plan)) return { ok: false, reason: "plan" };
    if (r.plan === "stay" && !r.checkout_date) return { ok: false, reason: "no_checkout" };
  }
  const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
  return { ok: true, reservations: sorted };
}

const PLAN_LABEL: Record<string, string> = {
  stay: "宿泊お預かり",
  "8h": "1日お預かり（8時間）",
  "4h": "半日お預かり（4時間）",
};

function hhmm(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":");
  return `${Number(h)}:${m}`;
}

function nights(from: string, to: string): number {
  const a = new Date(from + "T12:00:00+09:00").getTime();
  const b = new Date(to + "T12:00:00+09:00").getTime();
  return Math.round((b - a) / 86_400_000);
}

/** わんちゃんの呼び方。性別が分からなければ名前だけ（くん/ちゃんを推測しない） */
function dogLabel(d: { name: string | null; sex: string | null }): string {
  const n = (d.name ?? "").trim();
  if (!n) return "";
  if (d.sex === "male") return `${n}くん`;
  if (d.sex === "female") return `${n}ちゃん`;
  return n;
}

function reservationBlock(r: StatusReservation): string {
  const lines: string[] = [];
  if (r.plan === "stay" && r.checkout_date) {
    const n = nights(r.date, r.checkout_date);
    lines.push(
      `📅 ${formatDateJaWithWeekday(r.date)}〜${formatDateJaWithWeekday(r.checkout_date)}　${PLAN_LABEL.stay}（${n}泊）`
    );
    if (r.checkin_time) lines.push(`🕐 チェックイン ${hhmm(r.checkin_time)}`);
    lines.push(`🏠 チェックアウト ${formatDateJaWithWeekday(r.checkout_date)} 9:00〜11:00`);
  } else {
    lines.push(`📅 ${formatDateJaWithWeekday(r.date)}　${PLAN_LABEL[r.plan]}`);
    if (r.checkin_time) lines.push(`🕐 お預け ${hhmm(r.checkin_time)}`);
  }
  const dogs = r.dogs.map(dogLabel).filter(Boolean);
  if (dogs.length) lines.push(`🐕 ${dogs.join("・")}`);
  if (r.plan === "stay" && r.walk_option) lines.push("🚶 お散歩オプションあり");
  lines.push(`📝 変更・キャンセルはこちら\nhttps://dog-hub.shop/booking/modify/${r.id}`);
  return lines.join("\n");
}

export interface StatusReplyOptions {
  /** 「◯◯様、」の頭（line-ack の nameGreeting の結果をそのまま渡す） */
  greeting?: string;
  outsideBusinessHours?: boolean;
}

/** 予約内容の自動回答文。decideBookingStatus が ok のときだけ呼ぶ。 */
export function buildBookingStatusReply(
  reservations: StatusReservation[],
  opts: StatusReplyOptions = {}
): LineMessage[] {
  const head = `${opts.greeting ?? ""}ご予約内容のご確認です🐾\n下記のとおり承っております。`;
  const body = reservations.map(reservationBlock).join("\n\n");
  // 🔴 営業時間外に「お急ぎはお電話へ」とは書かない（line-ack と同じ方針）
  const foot = opts.outsideBusinessHours
    ? "そのほかのご質問は、次の営業日にスタッフよりご返信いたします。"
    : "そのほかの内容は、スタッフが確認してご返信いたします。";
  return [{ type: "text", text: `${head}\n\n${body}\n\n${foot}` }];
}
