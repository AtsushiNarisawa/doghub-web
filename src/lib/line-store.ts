// ───── LINE 受信トレイ用ストア（Phase 2A） ─────
// Webhook が受信/送信したメッセージを Supabase に記録する薄いラッパ。
// 会話の get_or_create・unread++・再送防止（line_message_id 衝突の吸収）は
// DB 関数 record_line_message に集約し 1 トランザクションで二重カウントを防ぐ。
// 本ファイルは preview 文字列の生成と RPC 呼び出しのみを担う。
//
// 重要: すべての export 関数は内部で try/catch し、失敗しても例外を投げない。
// DB 障害で Webhook の 200 応答・LINE への返信を壊さないため（呼び出し側の握りつぶしと二重防御）。
import { createClient } from "@supabase/supabase-js";
import { fetchLineProfile, type LineMessage } from "./line";

// 本番は service_role（RLS バイパス＋RPC 実行権限あり）。RPC は service_role 限定に
// revoke 済みのため anon では 403。ローカルは anon フォールバックだが Webhook は
// ローカルで叩かれないため実害なし（既存 webhook/route.ts のクライアントと同じ流儀）。
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 非テキストメッセージの一覧プレビュー用ラベル（実体はDLせず種別だけ示す）
const NON_TEXT_LABELS: Record<string, string> = {
  image: "[画像]",
  video: "[動画]",
  audio: "[音声]",
  file: "[ファイル]",
  sticker: "[スタンプ]",
  location: "[位置情報]",
};

// 一覧プレビュー文字列（テキストは先頭100字、非テキストはラベル）
function buildPreview(messageType: string, text: string | null): string {
  if (messageType === "text") return (text ?? "").slice(0, 100);
  return NON_TEXT_LABELS[messageType] ?? "[その他]";
}

interface RecordParams {
  lineUserId: string;
  direction: "inbound" | "outbound";
  sender: "customer" | "bot" | "staff";
  messageType: string;
  text: string | null;
  lineMessageId: string | null;
}

// 1メッセージを記録。会話の get_or_create・unread++・再送防止は DB 関数側に集約。
async function recordLineMessage(p: RecordParams): Promise<void> {
  try {
    const { error } = await supabase.rpc("record_line_message", {
      p_line_user_id: p.lineUserId,
      p_direction: p.direction,
      p_sender: p.sender,
      p_message_type: p.messageType,
      p_text: p.text,
      p_line_message_id: p.lineMessageId,
      p_preview: buildPreview(p.messageType, p.text),
    });
    if (error) console.error("recordLineMessage rpc error:", error);
  } catch (e) {
    console.error("recordLineMessage failed:", e);
  }
}

// 友だち追加: 会話だけ作成（メッセージ行は作らない）。
export async function ensureLineConversation(
  lineUserId: string | undefined,
  displayName?: string | null
): Promise<void> {
  if (!lineUserId) return;
  try {
    const { error } = await supabase.rpc("ensure_line_conversation", {
      p_line_user_id: lineUserId,
      p_display_name: displayName ?? null,
    });
    if (error) console.error("ensureLineConversation rpc error:", error);
  } catch (e) {
    console.error("ensureLineConversation failed:", e);
  }
}

// 会話に「誰なのか」を埋める（表示名＋顧客レコードへの紐付け）。
//
// これが無かったため、会話41件すべてで display_name / customer_id が NULL のままだった
// （＝受信トレイを見ても誰からのメッセージか分からない）。
// 表示名は LINE から取得、customer_id は customers.line_id との照合で解決する。
// customers.line_id は「LIFF経由の予約」と「あいさつメッセージからの登録」で入る。
//
// 呼び出し側を待たせないよう await せず投げっぱなしで使う想定（失敗しても本処理を妨げない）。
export async function enrichConversation(lineUserId: string | undefined): Promise<void> {
  if (!lineUserId) return;
  try {
    const { data: conv } = await supabase
      .from("line_conversations")
      .select("id, display_name, customer_id")
      .eq("line_user_id", lineUserId)
      .maybeSingle();
    if (!conv) return;

    const patch: { display_name?: string; customer_id?: string } = {};

    // 表示名は未取得のときだけ取りに行く（毎メッセージで叩かない）
    if (!conv.display_name) {
      const profile = await fetchLineProfile(lineUserId);
      if (profile?.displayName) patch.display_name = profile.displayName;
    }

    // 顧客との紐付けは、未解決の間は毎回試す（あとから登録された時点で自動的に埋まる）
    if (!conv.customer_id) {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("line_id", lineUserId)
        .maybeSingle();
      if (customer) patch.customer_id = customer.id;
    }

    if (Object.keys(patch).length === 0) return;

    const { error } = await supabase
      .from("line_conversations")
      .update(patch)
      .eq("id", conv.id);
    if (error) console.error("enrichConversation update error:", error);
  } catch (e) {
    console.error("enrichConversation failed:", e);
  }
}

// お客様メッセージ(inbound)と、それに対する Bot 自動返信(outbound)をまとめて記録。
// inbound → outbound の順で記録するため、会話の last_message は最終的に Bot 返信を指す。
// unread のインクリメントは DB 関数側で direction='inbound' のときだけ行う。
export async function recordInboundWithBotReply(params: {
  lineUserId: string | undefined;
  inboundType: string;
  inboundText: string | null;
  inboundMessageId?: string | null;
  botReply: LineMessage[];
}): Promise<void> {
  if (!params.lineUserId) return;

  // 1) お客様の発言
  await recordLineMessage({
    lineUserId: params.lineUserId,
    direction: "inbound",
    sender: "customer",
    messageType: params.inboundType,
    text: params.inboundText,
    lineMessageId: params.inboundMessageId ?? null,
  });

  // 2) Bot の自動返信（複数テキストは結合して1行に。テンプレ・FAQ・フォールバック共通）
  const botText = params.botReply
    .map((m) => (m.type === "text" ? m.text : ""))
    .filter(Boolean)
    .join("\n");
  if (botText) {
    await recordLineMessage({
      lineUserId: params.lineUserId,
      direction: "outbound",
      sender: "bot",
      messageType: "text",
      text: botText,
      lineMessageId: null,
    });
  }
}
