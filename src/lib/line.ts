import crypto from "crypto";

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

// ───────────────────────────────────────────
// 署名検証（Webhookの正当性確認）
// ───────────────────────────────────────────
export function verifyLineSignature(body: string, signature: string): boolean {
  if (!CHANNEL_SECRET) return false;
  const hash = crypto
    .createHmac("sha256", CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  return hash === signature;
}

// ───────────────────────────────────────────
// LINE push メッセージ送信
// ───────────────────────────────────────────
export async function sendLinePushMessage(
  userId: string,
  messages: LineMessage[]
): Promise<boolean> {
  if (!CHANNEL_ACCESS_TOKEN || CHANNEL_ACCESS_TOKEN === "PENDING") return false;

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to: userId, messages }),
  });

  if (!res.ok) {
    console.error("LINE push error:", await res.text());
    return false;
  }
  return true;
}

// ───────────────────────────────────────────
// 予約確認メッセージを生成
// ───────────────────────────────────────────
const PLAN_LABELS: Record<string, string> = {
  "4h": "半日（4時間）",
  "8h": "1日（8時間）",
  stay: "宿泊",
  spot: "スポット",
};

export function buildBookingConfirmMessage(params: {
  customerName: string;
  plan: string;
  date: string;
  checkinTime: string;
  reservationId: string;
  status: "confirmed" | "pending";
}): LineMessage[] {
  const { customerName, plan, date, checkinTime, reservationId, status } = params;
  const dateLabel = new Date(date).toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const statusText =
    status === "confirmed"
      ? "✅ ご予約が確定しました"
      : "⏳ ご予約を受け付けました（スタッフ確認後に確定）";

  return [
    {
      type: "text",
      text: [
        `${customerName}様`,
        "",
        statusText,
        "",
        `📅 ${dateLabel}`,
        `🕐 チェックイン ${checkinTime}`,
        `📋 ${PLAN_LABELS[plan] ?? plan}`,
        "",
        `予約番号: ${reservationId.slice(0, 8).toUpperCase()}`,
        "",
        "ご不明な点はこちらのLINEにご返信ください。",
        "当日お待ちしております🐾",
      ].join("\n"),
    },
  ];
}

// ───────────────────────────────────────────
// 友だち追加時のウェルカムメッセージ
// ───────────────────────────────────────────
export function buildWelcomeMessage(): LineMessage[] {
  return [
    {
      type: "text",
      text: "DogHub箱根仙石原の公式LINEへようこそ🐾\n\nご予約・お問い合わせはこちらからどうぞ。",
    },
    {
      type: "template",
      altText: "予約する",
      template: {
        type: "buttons",
        thumbnailImageUrl:
          "https://dog-hub.shop/images/img-001.jpg",
        imageAspectRatio: "rectangle",
        imageSize: "cover",
        title: "DogHub箱根仙石原",
        text: "箱根仙石原のドッグホテル",
        actions: [
          {
            type: "uri",
            label: "予約する",
            uri: "https://dog-hub.shop/booking",
          },
          {
            type: "uri",
            label: "料金・サービスを見る",
            uri: "https://dog-hub.shop/service",
          },
        ],
      },
    },
  ];
}

// ───────────────────────────────────────────
// 型定義
// ───────────────────────────────────────────
export type LineMessage =
  | { type: "text"; text: string }
  | { type: "template"; altText: string; template: LineButtonsTemplate };

interface LineButtonsTemplate {
  type: "buttons";
  thumbnailImageUrl?: string;
  imageAspectRatio?: string;
  imageSize?: string;
  title?: string;
  text: string;
  actions: LineAction[];
}

interface LineAction {
  type: "uri";
  label: string;
  uri: string;
}
