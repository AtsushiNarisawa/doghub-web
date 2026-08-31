// LINE のやり取り画面（/admin/messages）で共有する表示部品。

import type { LineNotificationKind } from "@/lib/line-notification";
import { LINE_NOTIFICATION_LABELS, parseNotificationKind } from "@/lib/line-notification";

// 必ず出す注記。
//
// 🔴 この注記を外さないこと。
// スタッフが LINE 公式アカウントアプリから手で送った返信は、LINE の仕様上
// こちらのシステムには一切届かない（受信とBot返信しか通知されず、あとから取得するAPIも無い）。
// 注記が無いと「当店から誰も返信していない」と誤解される。
// 2026-08-21 に LINE の公式ドキュメントで再確認済みの仕様で、今後も変わらない前提で運用する。
export function LineInboxNotice() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs leading-relaxed text-amber-900">
      <p className="font-medium mb-1">この画面について</p>
      <p>
        スタッフがLINEアプリから送った返信は、LINEの仕様上ここには表示されません。
        表示されるのは「お客様からの受信」「自動応答」「当店からの自動通知（予約確認・リマインドなど）」の3つだけです。
      </p>
      <p className="mt-1">
        読むための画面です。お返事はこれまでどおりLINEアプリからお願いします。
      </p>
    </div>
  );
}

// 日時は必ず日本時間で表示する（端末のタイムゾーンに引きずられないため）
const jstDateTime = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatJst(iso: string | null): string {
  if (!iso) return "";
  return jstDateTime.format(new Date(iso));
}

// 会話の相手の呼び名。顧客と紐付いていれば顧客名、なければLINEの表示名。
export function conversationName(c: {
  display_name: string | null;
  customers: { last_name: string; first_name: string | null } | null;
}): string {
  if (c.customers) {
    return `${c.customers.last_name} ${c.customers.first_name || ""}`.trim();
  }
  return c.display_name || "（お名前不明）";
}

// メッセージ1件の見出しラベル。
// お客様の発言／Botの自動応答／当店からの通知（種類つき）を見分けられるようにする。
export function messageLabel(sender: string, messageType: string): string {
  if (sender === "customer") return "お客様";
  if (sender === "staff") return "スタッフ";
  const kind: LineNotificationKind | null = parseNotificationKind(messageType);
  if (kind) return `当店からの通知・${LINE_NOTIFICATION_LABELS[kind]}`;
  return "自動応答";
}
