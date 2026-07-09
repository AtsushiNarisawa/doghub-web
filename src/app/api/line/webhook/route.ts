import { NextRequest, NextResponse } from "next/server";
import {
  verifyLineSignature,
  sendLineReplyMessage,
  buildWelcomeMessage,
} from "@/lib/line";
import { matchFaqReply, nonTextReply, fallbackReply, FAQ_RULES } from "@/lib/line-faq";
import { sendLineStaffAlert } from "@/lib/email";
import { recordInboundWithBotReply, ensureLineConversation } from "@/lib/line-store";
import { createClient } from "@supabase/supabase-js";

// 顧客マスタ参照用クライアント。既存admin APIと同様 service_role 優先・無い環境は anon へフォールバック。
// （ビルド時/ローカルで SERVICE_ROLE_KEY 未設定でも import 時に落ちず、Webhookを堅牢に保つ）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  const replyToken = event.replyToken;
  if (!replyToken) return;
  const userId = event.source?.userId;

  switch (event.type) {
    // 友だち追加 → ウェルカムメッセージ（reply・無料）
    // リッチメニューは scripts/setup-line-richmenu.mjs で全ユーザー共通の
    // デフォルトを一度だけ設定するため、ここでの個別割り当ては不要。
    case "follow":
      await sendLineReplyMessage(replyToken, buildWelcomeMessage());
      // 受信トレイ用に会話だけ作成（メッセージ行は作らない）。お客様から見える挙動は不変。
      await ensureLineConversation(userId);
      break;

    // リッチメニューのボタン(postback) → お客様が「選んだ」ものだけ自動回答（アラートなし）。
    // 自由文と違い、data=category名で一意に決まるためキーワード判定は使わない。
    case "postback": {
      const category = event.postback?.data ?? "";
      const rule = FAQ_RULES.find((r) => r.category === category);
      if (rule) {
        await sendLineReplyMessage(replyToken, rule.reply);
        await recordInboundWithBotReply({
          lineUserId: userId,
          inboundType: "text",
          inboundText: category,
          inboundMessageId: undefined,
          botReply: rule.reply,
        });
      }
      break;
    }

    // メッセージ受信（お客様が自由文で入力） → ボタンと違い、内容にかかわらず
    // 受付メッセージのみ返し、必ずスタッフへエスカレーションする（自動のカテゴリ別
    // 定型文は送らない＝キーワード誤爆でお客様の実際の質問に的外れな回答をしないため）。
    case "message": {
      const messageType = event.message?.type ?? "不明";
      if (messageType === "text") {
        const text = event.message?.text ?? "";
        const { category } = matchFaqReply(text);
        const reply = fallbackReply();
        // reply token は受信から約1分・1回限り。先に返信して確実に消費する。
        await sendLineReplyMessage(replyToken, reply);
        // 自由文は内容を問わず必ずスタッフへメールでエスカレーション
        await alertStaff(userId, text, category);
        // 受信トレイへ記録（reply送信後・独立処理。失敗してもreply/200を壊さない）
        await recordInboundWithBotReply({
          lineUserId: userId,
          inboundType: "text",
          inboundText: text,
          inboundMessageId: event.message?.id,
          botReply: reply,
        });
      } else {
        // 非テキスト（画像・スタンプ・位置情報・音声など）→ 受領を返しつつ必ずエスカレーション
        // 例: ワクチン証明書の写真を送るお客様への「無音」を解消する
        const reply = nonTextReply();
        await sendLineReplyMessage(replyToken, reply);
        await alertStaff(userId, `（${messageType}メッセージ）`, "非テキスト");
        // 受信トレイへ記録（本文は持たず message_type だけ保存。実体DLはしない）
        await recordInboundWithBotReply({
          lineUserId: userId,
          inboundType: messageType,
          inboundText: null,
          inboundMessageId: event.message?.id,
          botReply: reply,
        });
      }
      break;
    }

    default:
      break;
  }
}

// 顧客マスタから LINE userId → 氏名を逆引き（紐付け済みのみ。失敗しても握りつぶす）
async function lookupCustomerName(lineUserId?: string): Promise<string | null> {
  if (!lineUserId) return null;
  try {
    const { data } = await supabase
      .from("customers")
      .select("last_name, first_name")
      .eq("line_id", lineUserId)
      .limit(1)
      .returns<{ last_name: string | null; first_name: string | null }[]>();
    const c = data?.[0];
    if (!c) return null;
    const name = `${c.last_name ?? ""} ${c.first_name ?? ""}`.trim();
    return name || null;
  } catch {
    return null;
  }
}

// スタッフへ「要対応」アラートメールを送る（失敗してもWebhookの200は守る）
async function alertStaff(lineUserId: string | undefined, messageText: string, category: string) {
  try {
    const customerName = await lookupCustomerName(lineUserId);
    await sendLineStaffAlert({
      customerName,
      lineUserId: lineUserId ?? null,
      messageText,
      category,
    });
  } catch (e) {
    console.error("LINE alertStaff failed:", e);
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
  message?: { type: string; text?: string; id?: string };
  postback?: { data: string };
  replyToken?: string;
}
