// ───── 当店から送る LINE 通知の「種類」定義（サーバー・管理画面 共用） ─────
//
// 目的: 会話の記録（line_messages）に、当店が送った通知を「何の通知か」まで含めて残す。
//
// なぜ message_type に載せるのか:
//   line_messages には direction / sender / message_type の3列しかなく、
//   「通知の種類」を入れる専用の列は無い（列の追加＝本番DBの変更は行わない方針）。
//   message_type はもともと「この行がどんな種類のメッセージか」を表す列で、
//   すでに text / image / sticker などを入れているため、その延長として
//   "notification:booking_confirm" のような値を入れる。
//   既存の Bot 自動応答は message_type = "text" のままなので、
//   過去データの書き換えをせずに「自動応答」と「当店の通知」を見分けられる。
//
// sender は 'bot'（システムが自動で送ったもの）のまま。
// 'staff' はスタッフが手で送った返信を指す値なので、ここでは使わない
// （そもそもスタッフがLINEアプリから送った返信はLINEの仕様上取得できない）。

export type LineNotificationKind =
  | "booking_confirm" // ご予約を受け付けた/確定した直後のお知らせ
  | "booking_confirmed" // 仮予約をスタッフが確定に変えたときのお知らせ
  | "cancel" // キャンセルを承ったお知らせ
  | "reschedule" // ご予約内容（日程・時間など）の変更のお知らせ
  | "reminder" // ご利用の前々日に送るリマインド
  | "thankyou"; // ご利用後のお礼

const PREFIX = "notification:";

// 記録に入れる message_type の値を作る
export function notificationMessageType(kind: LineNotificationKind): string {
  return PREFIX + kind;
}

// message_type が当店からの通知かどうか
export function isNotificationType(messageType: string): boolean {
  return messageType.startsWith(PREFIX);
}

// message_type から通知の種類を取り出す（当店の通知でなければ null）
export function parseNotificationKind(
  messageType: string
): LineNotificationKind | null {
  if (!isNotificationType(messageType)) return null;
  const kind = messageType.slice(PREFIX.length);
  return kind in LINE_NOTIFICATION_LABELS
    ? (kind as LineNotificationKind)
    : null;
}

// 管理画面に出す日本語のラベル
export const LINE_NOTIFICATION_LABELS: Record<LineNotificationKind, string> = {
  booking_confirm: "ご予約の確認",
  booking_confirmed: "ご予約の確定",
  cancel: "キャンセルの確認",
  reschedule: "ご予約内容の変更",
  reminder: "前々日のリマインド",
  thankyou: "ご利用後のお礼",
};

// ───── スタッフが LINE アプリから返信したことの「控え」（2026-11-27） ─────
//
// スタッフが LINE アプリから送った返信は LINE の仕様上こちらに届かない。そのため
// 「返信済みかどうか」の手がかりが無く、毎朝の要返信チェックが返信済みのメッセージを
// 拾い直して下書きを作り直していた（11-27 金曜朝・水曜分の LINE 2件）。
//
// 管理画面で「LINEで送りました」（下書きあり）／「LINEアプリで返信済みにする」（下書きなし）を
// 押したときに、line_messages へ1行だけ控えを残す:
//   direction = 'outbound'・sender = 'staff'・message_type = 'staff_reply_marked'
//   text = 送った下書きの本文（直した後の文面）。下書きなしで押したときは null。
// 要返信チェックは「その会話で最後の sender='staff' の行より後のお客様のメッセージ」だけを拾う。
//
// 🔴 これは「LINE で実際に届いた」ことの記録ではない（押した人の申告）。LINE への送信は今もしない。
// 'staff' はもともと「スタッフが手で送った返信」を指す値で、この控えはまさにそれにあたる。
// 列・制約・RLS・記録用の DB 関数は変えていない（sender の制約は customer/bot/staff を元から許す）。
export const STAFF_REPLY_MARKED_TYPE = "staff_reply_marked";

export function isStaffReplyMark(messageType: string): boolean {
  return messageType === STAFF_REPLY_MARKED_TYPE;
}

/**
 * 最後の「返信済みの印」（sender='staff'）より後に、お客様からのメッセージがあるか。
 * 要返信チェック（inbox-check §3 の SQL）・save_reply_draft.py と同じ考え方。
 * messages は古い順（created_at 昇順）で渡す。
 */
export function lineAwaitingReply(
  messages: { direction: string; sender: string }[]
): boolean {
  let lastStaff = -1;
  messages.forEach((m, i) => {
    if (m.sender === "staff") lastStaff = i;
  });
  return messages
    .slice(lastStaff + 1)
    .some((m) => m.direction === "inbound" && m.sender === "customer");
}
