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
