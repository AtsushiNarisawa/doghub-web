import { NextRequest, NextResponse } from "next/server";
import {
  verifyLineSignature,
  sendLineReplyMessage,
  buildWelcomeMessage,
} from "@/lib/line";
import { matchFaqReply, matchExactButtonReply } from "@/lib/line-faq";
import {
  buildAckMessages,
  classifyAckKind,
  getJstMoment,
  isWithinBusinessHours,
  nonTextReply,
} from "@/lib/line-ack";
import { sendLineStaffAlert } from "@/lib/email";
import {
  recordInboundWithBotReply,
  ensureLineConversation,
  enrichConversation,
} from "@/lib/line-store";
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

    // メッセージ受信（リッチメニューのボタンも message として届く。message方式は
    // LINE公式アカウント管理アプリのチャット履歴に残るため採用＝postback方式は不採用）。
    // 入力全体がボタンの見出し・キーワードと完全一致する場合だけ「ボタンを押したのと同じ」
    // とみなして自動回答・アラートなし。それ以外の自由文は、キーワードを含んでいても
    // 内容にかかわらず受付メッセージのみ返し、必ずスタッフへエスカレーションする
    // （部分一致の自動回答はキーワード誤爆で的外れな回答をするリスクがあるため使わない）。
    case "message": {
      const messageType = event.message?.type ?? "不明";
      if (messageType === "text") {
        const text = event.message?.text ?? "";
        const exactRule = matchExactButtonReply(text);
        if (exactRule) {
          await sendLineReplyMessage(replyToken, exactRule.reply);
          await recordInboundWithBotReply({
            lineUserId: userId,
            inboundType: "text",
            inboundText: text,
            inboundMessageId: event.message?.id,
            botReply: exactRule.reply,
          });
          break;
        }
        const { category } = matchFaqReply(text);
        // 受付返信の作り分け（2026-08-31）。到着・遅刻／予約変更・空き確認／お礼／その他 に
        // 振り分け、営業時間外は別文面、LINE連携済みならお名前でお呼びする。
        // 判定材料（お客様の姓・今日の臨時休業/臨時営業）は DB から取るが、reply token は
        // 受信から約1分・1回限り＝ここで待たされて返信を落とすのが最悪なので、必ず有限時間で
        // 打ち切り、取れなければ「名前なし・曜日ベースの営業時間判定」で必ず送る。
        const ackContext = await loadAckContext(userId);
        const reply = buildAckMessages(classifyAckKind(text, category), ackContext);
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
        // 非テキスト（画像・スタンプ・位置情報・音声など）→ 受領を返す。
        // スタンプだけは特別扱い: 直前（5分以内）に本人のテキストがあれば、その内容への
        // 相槌とみなしアラートを省略する（そのテキスト自体は既にアラート済みのため二重通知
        // になっていた・2026-07実例で確認）。画像・動画・音声・位置情報などは、内容そのものが
        // 情報を持ちうる（例: ワクチン証明書の写真）ため、常にアラートし「無音」を避ける。
        const reply = nonTextReply();
        await sendLineReplyMessage(replyToken, reply);

        let shouldAlert = true;
        if (messageType === "sticker" && userId && (await hasRecentCustomerText(userId))) {
          shouldAlert = false;
        }
        if (shouldAlert) {
          await alertStaff(userId, `（${messageType}メッセージ）`, "非テキスト");
        }
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

  // 会話に「誰なのか」を埋める（表示名＋顧客レコードへの紐付け）。
  // 返信は既に送信済みのため、ここで時間がかかっても・失敗してもお客様の体験は変わらない。
  // 顧客紐付けは未解決の間だけ試すので、あとからLINE登録された時点で自動的に埋まる。
  if (userId && (event.type === "follow" || event.type === "message")) {
    await enrichConversation(userId);
  }
}

// ───── 受付返信の判定材料をそろえる ─────
// お客様の姓（LINE連携済みのみ）と、今日が営業日かを1往復で取る。
// 🔴 返信を遅らせない・失敗させないことが最優先。この読み取りが遅い/落ちたときは
//    fallback（名前なし・曜日ベース判定）で必ず返信する。
const ACK_CONTEXT_TIMEOUT_MS = 1500;

interface AckContext {
  lastName: string | null;
  outsideBusinessHours: boolean;
}

async function loadAckContext(lineUserId?: string): Promise<AckContext> {
  const moment = getJstMoment();
  // DBが読めないときの既定値：曜日だけで営業日を判定（臨時営業/臨時休業は反映されない）。
  const fallback: AckContext = {
    lastName: null,
    outsideBusinessHours: !isWithinBusinessHours(moment),
  };

  const load = async (): Promise<AckContext> => {
    const [nameRes, capRes] = await Promise.all([
      lineUserId
        ? supabase
            .from("customers")
            .select("last_name")
            .eq("line_id", lineUserId)
            .limit(1)
            .returns<{ last_name: string | null }[]>()
        : Promise.resolve({ data: null }),
      // 予約APIと同じ作法：daily_capacity に行があればその closed を使い、無ければ曜日で判定。
      // 🔴 web_closed（Web受付停止）は休業ではないので見ない。
      supabase
        .from("daily_capacity")
        .select("closed")
        .eq("date", moment.date)
        .limit(1)
        .returns<{ closed: boolean | null }[]>(),
    ]);
    const closedOverride = capRes.data?.[0]?.closed ?? null;
    return {
      lastName: nameRes.data?.[0]?.last_name ?? null,
      outsideBusinessHours: !isWithinBusinessHours(moment, { closedOverride }),
    };
  };

  try {
    const pending = load();
    // タイムアウト後に遅れて失敗しても未処理の例外にしない（Webhookのプロセスを守る）
    pending.catch(() => {});
    return await withTimeout(pending, ACK_CONTEXT_TIMEOUT_MS, fallback);
  } catch (e) {
    console.error("loadAckContext failed:", e);
    return fallback;
  }
}

// 指定時間内に終わらなければ fallback を返す（元の Promise は放置＝返信を待たせない）
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

const STICKER_ECHO_WINDOW_MS = 5 * 60 * 1000;

// 直近5分以内に、この会話で本人からのテキストメッセージがあったかを調べる
// （スタンプ単独のアラート要否判定用）。判定に失敗した場合は安全側（アラートする）に倒す。
async function hasRecentCustomerText(lineUserId: string): Promise<boolean> {
  try {
    const { data: conv } = await supabase
      .from("line_conversations")
      .select("id")
      .eq("line_user_id", lineUserId)
      .limit(1)
      .maybeSingle();
    if (!conv) return false;

    const { data: msg } = await supabase
      .from("line_messages")
      .select("created_at")
      .eq("conversation_id", conv.id)
      .eq("direction", "inbound")
      .eq("sender", "customer")
      .eq("message_type", "text")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!msg) return false;

    return Date.now() - new Date(msg.created_at).getTime() < STICKER_ECHO_WINDOW_MS;
  } catch (e) {
    console.error("hasRecentCustomerText failed:", e);
    return false;
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
  replyToken?: string;
}
