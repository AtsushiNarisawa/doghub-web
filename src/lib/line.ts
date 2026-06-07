import crypto from "crypto";

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
// Channel ID は過去に "\n" 混入の事故があるため数字のみに正規化する
const CHANNEL_ID = (process.env.LINE_CHANNEL_ID ?? "").replace(/[^0-9]/g, "");
// 固定トークン（フォールバック）。基本は client_credentials で都度発行する
const STATIC_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// ───────────────────────────────────────────
// Channel Access Token の自動発行＋メモリキャッシュ
// LINEの長期トークンは失効・再発行で無効化されることがある（2026-06に本番が401で
// 送信不能になっていた）。Channel ID + Channel Secret から client_credentials で
// 30日有効の短期トークンを都度発行し、期限前に自動更新することで恒久的に回避する。
// ───────────────────────────────────────────
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.token;

  if (CHANNEL_ID && CHANNEL_SECRET) {
    try {
      const res = await fetch("https://api.line.me/v2/oauth/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: CHANNEL_ID,
          client_secret: CHANNEL_SECRET,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { access_token: string; expires_in: number };
        // 期限の1日前に再発行する
        cachedToken = {
          token: data.access_token,
          expiresAt: Date.now() + (data.expires_in - 86400) * 1000,
        };
        return data.access_token;
      }
      console.error("LINE token mint failed:", res.status, await res.text());
    } catch (e) {
      console.error("LINE token mint error:", e);
    }
  }

  // フォールバック：環境変数の固定トークン（"PENDING" は無効）
  if (STATIC_ACCESS_TOKEN && STATIC_ACCESS_TOKEN !== "PENDING") return STATIC_ACCESS_TOKEN;
  return null;
}

// LINE メッセージ送信API共通処理（401時はトークンを再発行して1回リトライ）
async function postToLine(url: string, payload: object): Promise<boolean> {
  let token = await getAccessToken();
  if (!token) {
    console.error("LINE: no valid access token");
    return false;
  }
  const send = (t: string) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
      body: JSON.stringify(payload),
    });

  let res = await send(token);
  if (res.status === 401) {
    // トークンが失効していた場合は再発行して1回だけリトライ
    cachedToken = null;
    token = await getAccessToken();
    if (token) res = await send(token);
  }
  if (!res.ok) {
    console.error("LINE API error:", url, res.status, await res.text());
    return false;
  }
  return true;
}

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
  return postToLine("https://api.line.me/v2/bot/message/push", { to: userId, messages });
}

// ───────────────────────────────────────────
// LINE reply メッセージ送信（Webhook応答用・無料・通数カウント対象外）
// replyToken は受信から約1分・1回限り有効。ハンドラ内で同期的に返すこと。
// 友だち追加ウェルカム・FAQ自動回答など「来た発話にその場で返す」用途は
// すべて push ではなくこちらを使う（push は無料枠を消費するため）。
// ※予約確認・キャンセル確認のように Webhook 外から送る能動配信は push のまま。
// ───────────────────────────────────────────
export async function sendLineReplyMessage(
  replyToken: string,
  messages: LineMessage[]
): Promise<boolean> {
  if (!replyToken) return false;
  return postToLine("https://api.line.me/v2/bot/message/reply", { replyToken, messages });
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
    {
      type: "text",
      text: `📝 変更・キャンセルはこちら\nhttps://dog-hub.shop/booking/modify/${reservationId}`,
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
      text:
        "DogHub箱根仙石原の公式LINEへようこそ🐾\n\n" +
        "画面下の【メニュー】から、料金・アクセス・営業時間・持ち物などをワンタップでご確認いただけます。\n" +
        "ご予約は【予約する】から24時間受付中です。\n\n" +
        "ご不明な点は、このトークにそのままメッセージを送ってください。営業日（金〜火 9:00-17:00、水・木定休）に順次ご返信します。",
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
