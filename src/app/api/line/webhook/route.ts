import { NextRequest, NextResponse } from "next/server";
import {
  verifyLineSignature,
  sendLinePushMessage,
  buildWelcomeMessage,
} from "@/lib/line";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";

  // 署名検証
  if (!verifyLineSignature(rawBody, signature)) {
    console.error("LINE Webhook: invalid signature");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: LineWebhookBody;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // イベントを並行処理
  await Promise.all(body.events.map(handleEvent));

  return NextResponse.json({ ok: true });
}

async function handleEvent(event: LineEvent) {
  const userId = event.source?.userId;
  if (!userId) return;

  switch (event.type) {
    // 友だち追加 → ウェルカムメッセージ
    case "follow":
      await sendLinePushMessage(userId, buildWelcomeMessage());
      break;

    // メッセージ受信 → 予約フォームURLを案内
    case "message":
      if (event.message?.type === "text") {
        const text = event.message.text.trim();
        if (
          text.includes("予約") ||
          text.includes("よやく") ||
          text.includes("申し込み")
        ) {
          await sendLinePushMessage(userId, [
            {
              type: "text",
              text: "ご予約はこちらからどうぞ👇\nhttps://dog-hub.shop/booking",
            },
          ]);
        } else {
          // その他のメッセージ → スタッフへの問い合わせを促す
          await sendLinePushMessage(userId, [
            {
              type: "text",
              text: "メッセージありがとうございます🐾\nご予約はこちら → https://dog-hub.shop/booking\n\nその他のお問い合わせはスタッフが確認次第ご返信します。",
            },
          ]);
        }
      }
      break;

    default:
      break;
  }
}

// ───── 型定義 ─────
interface LineWebhookBody {
  destination: string;
  events: LineEvent[];
}

interface LineEvent {
  type: string;
  source?: { userId?: string; type?: string };
  message?: { type: string; text: string };
  replyToken?: string;
}
