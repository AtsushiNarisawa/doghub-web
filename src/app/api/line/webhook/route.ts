import { NextRequest, NextResponse } from "next/server";
import {
  verifyLineSignature,
  sendLineReplyMessage,
  buildWelcomeMessage,
  type LineMessage,
} from "@/lib/line";
import { sendLineStaffAlert } from "@/lib/email";
import { createClient } from "@supabase/supabase-js";

// 顧客マスタ参照用クライアント。既存admin APIと同様 service_role 優先・無い環境は anon へフォールバック。
// （ビルド時/ローカルで SERVICE_ROLE_KEY 未設定でも import 時に落ちず、Webhookを堅牢に保つ）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BOOKING_URL = "https://liff.line.me/2009688745-qZi2jM4g";
const FAQ_URL = "https://dog-hub.shop/faq";
const TEL = "0460-80-0290";

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
      break;

    // メッセージ受信 → 定番FAQを自動回答、該当なしはフォールバック（すべてreply・無料）
    case "message":
      if (event.message?.type === "text") {
        const { reply, category, needsHuman } = matchFaqReply(event.message.text ?? "");
        // reply token は受信から約1分・1回限り。先に返信して確実に消費する。
        await sendLineReplyMessage(replyToken, reply);
        // 人間対応が必要なメッセージはスタッフへメールでエスカレーション
        if (needsHuman) {
          await alertStaff(userId, event.message.text ?? "", category);
        }
      } else {
        // 非テキスト（画像・スタンプ・位置情報・音声など）→ 受領を返しつつ必ずエスカレーション
        // 例: ワクチン証明書の写真を送るお客様への「無音」を解消する
        await sendLineReplyMessage(replyToken, nonTextReply());
        const kind = event.message?.type ?? "不明";
        await alertStaff(userId, `（${kind}メッセージ）`, "非テキスト");
      }
      break;

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

// ───── 定番FAQの自動回答 ─────
// キーワードを「含む」判定。表記揺れに弱い完全一致を避けるため部分一致で拾う。
// 並び順＝優先順位（先にマッチしたものを返す）。「予約を変更」は変更を優先するため
// キャンセル・変更を予約より前に置く。受入確認系（猫・発情・多頭等）は誤って
// 「予約どうぞ」と返さないよう最優先に置き、必ず人間へエスカレーションする。
// needsHuman=true のルールは、定型回答を返したうえでスタッフへアラートメールを送る。
interface FaqRule {
  category: string;
  keywords: string[];
  reply: LineMessage[];
  needsHuman?: boolean;
}

const FAQ_RULES: FaqRule[] = [
  {
    // 受入確認系（最優先）。猫・発情中・多頭・持病など、可否を必ず人が確認すべき相談。
    // これを最上位に置かないと "預か/預け" で予約ルールに誤爆し、確認なく予約導線を返してしまう。
    category: "受入確認",
    keywords: ["猫", "ねこ", "ネコ", "発情", "ヒート", "多頭", "持病", "投薬", "てんかん", "噛みつ", "咬"],
    needsHuman: true,
    reply: [
      {
        type: "text",
        text:
          "お問い合わせありがとうございます🐾\n" +
          "お預かりの可否は、その子の状況を確認のうえ個別にご案内しています。\n" +
          `担当より順次ご連絡しますので少々お待ちください。お急ぎはお電話（${TEL}）へ。`,
      },
    ],
  },
  {
    // キャンセル・変更（「予約」より前。"予約を変更" を変更案内に寄せる）
    category: "キャンセル/変更",
    keywords: ["キャンセル", "取り消し", "取消", "変更", "日程変更", "リスケ"],
    needsHuman: true,
    reply: [
      {
        type: "text",
        text:
          "ご予約のキャンセル・変更についてです📝\n" +
          "・キャンセル料：前日50%／当日100%（ペットや飼い主様の体調不良・台風や大雪などの場合は無料のことがあります）\n" +
          "・到着予定時間や備考の変更は、予約確認メール内のリンクから行えます\n" +
          `お早めにお電話（${TEL}）またはこのLINEにご連絡ください。`,
      },
    ],
  },
  {
    // 料金
    category: "料金",
    keywords: ["料金", "いくら", "値段", "価格", "費用", "金額", "おいくら"],
    reply: [
      {
        type: "text",
        text:
          "料金のご案内です🐾\n" +
          "・半日（4時間）¥3,300\n" +
          "・1日（8時間）¥5,500\n" +
          "・宿泊（1泊）¥7,700〜\n" +
          "・スポット（1時間）¥1,100\n" +
          "※表示はすべて税込。営業時間外は追加1時間あたり¥1,100。\n" +
          "詳しくは → https://dog-hub.shop/service",
      },
    ],
  },
  {
    // ワクチン（持ち物より前。"ワクチンの持ち物" をワクチン案内に寄せる）
    category: "ワクチン",
    keywords: ["ワクチン", "予防接種", "証明書", "狂犬病", "注射", "ワクチ"],
    reply: [
      {
        type: "text",
        text:
          "ワクチンについてのご案内です💉\n" +
          "他のわんちゃんの安全のため、1年以内の【混合ワクチン】と【狂犬病予防接種】の証明書が必要です。\n" +
          "証明書をお持ちでない場合はお預かりできませんので、当日かならずご持参ください。",
      },
    ],
  },
  {
    // 持ち物
    category: "持ち物",
    keywords: ["持ち物", "持参", "必要なもの", "用意", "持っていくもの", "もちもの"],
    reply: [
      {
        type: "text",
        text:
          "当日の持ち物のご案内です🎒\n" +
          "【必須】1年以内の混合ワクチン証明書／狂犬病予防接種証明書\n" +
          "【普段のもの】いつものご飯、リード・首輪\n" +
          "【あると安心】お気に入りのおもちゃ・ブランケット\n" +
          "忘れてしまっても、館内でご飯・おやつ・マナーウェアの販売（¥220〜）がございます。",
      },
    ],
  },
  {
    // 大型犬・体重・サイズ
    // ⚠️ "15" は「15時」「15日」に誤爆するため削除（"kg"/"ｋｇ"/"何キロ"/"体重" で十分カバー）。
    // "キロ" は「20キロ(体重)」を拾うため残すが、まれに「5キロ先(距離)」へ誤爆する点は許容。
    category: "大型犬",
    keywords: ["大型", "大きい", "体重", "kg", "ｋｇ", "キロ", "何キロ", "サイズ", "小型", "中型"],
    reply: [
      {
        type: "text",
        text:
          "わんちゃんの大きさについてのご案内です🐕\n" +
          "基本は体重15kgまでのわんちゃんをお預かりしています。落ち着いた子であれば若干のオーバーも受け入れ可能な場合がございます。\n" +
          "15kg以上の場合は仮予約となり、24時間以内にスタッフよりご連絡いたします。まずはお気軽にご相談ください。",
      },
    ],
  },
  {
    // 営業時間・定休日
    category: "営業時間",
    keywords: ["営業", "何時", "時間", "定休", "休み", "開い", "閉ま", "何曜", "営業日"],
    reply: [
      {
        type: "text",
        text:
          "営業時間のご案内です🕐\n" +
          "・ドッグホテル 9:00〜17:00（お預かり最終受付15時／お引き取り最終17時）\n" +
          "・カフェ 11:00〜17:00\n" +
          "・定休日 水曜・木曜\n" +
          "1日プラン（8時間）のみ、早朝7時からのお預かりに対応しています。",
      },
    ],
  },
  {
    // アクセス・場所・駐車場
    category: "アクセス",
    keywords: ["場所", "住所", "アクセス", "行き方", "どこ", "駐車", "パーキング", "車", "道順", "地図", "最寄"],
    reply: [
      {
        type: "text",
        text:
          "アクセスのご案内です📍\n" +
          "神奈川県足柄下郡箱根町仙石原928-15\n" +
          "・箱根ガラスの森美術館から車3分／ポーラ美術館から車4分\n" +
          "・箱根登山バス「仙石原」バス停から徒歩約5分\n" +
          "🅿️ 無料駐車場3台分（店舗横2台＋手前1台。当店の案内看板が目印です。店舗前は当店の駐車場ではありませんのでご注意ください）\n" +
          "地図・詳細 → https://dog-hub.shop/access",
      },
    ],
  },
  {
    // 予約
    category: "予約",
    keywords: ["予約", "よやく", "申し込み", "申込", "宿泊", "泊ま", "預け", "預か", "ブッキング"],
    reply: [
      {
        type: "text",
        text:
          "ご予約はこちらからどうぞ👇\n" +
          `${BOOKING_URL}\n` +
          `当日のご予約・お急ぎはお電話（${TEL}）へ。`,
      },
    ],
  },
];

// 返信本文・カテゴリ・人間対応要否を返す。フォールバック（FAQ非該当）は人間対応が必要扱い。
function matchFaqReply(text: string): { reply: LineMessage[]; category: string; needsHuman: boolean } {
  const t = text.trim();
  for (const rule of FAQ_RULES) {
    if (rule.keywords.some((k) => t.includes(k))) {
      return { reply: rule.reply, category: rule.category, needsHuman: !!rule.needsHuman };
    }
  }
  return { reply: fallbackReply(), category: "フォールバック", needsHuman: true };
}

// フォールバック：期待値（次の返信タイミング・電話・予約導線）を明示する
function fallbackReply(): LineMessage[] {
  return [
    {
      type: "text",
      text:
        "お問い合わせありがとうございます🐾\n" +
        "営業日（金〜火 9:00〜17:00）に順次ご返信します。水・木は定休のため、翌営業日のご返信となります。\n" +
        `お急ぎ・当日のご予約はお電話（${TEL}）へ。\n` +
        `ご予約は24時間こちらから → ${BOOKING_URL}\n` +
        `よくあるご質問 → ${FAQ_URL}`,
    },
  ];
}

// 非テキスト（画像・スタンプ・位置情報など）への受領メッセージ。
// 「無音」を避けて受け取った旨を伝え、別途スタッフへエスカレーションする。
function nonTextReply(): LineMessage[] {
  return [
    {
      type: "text",
      text:
        "メッセージありがとうございます🐾\n" +
        "内容を確認し、営業日（金〜火 9:00〜17:00、水・木定休）に順次ご返信します。\n" +
        `お急ぎ・当日のご予約はお電話（${TEL}）へ。`,
    },
  ];
}

// ───── 型定義 ─────
interface LineWebhookBody {
  destination: string;
  events: LineEvent[];
}

interface LineEvent {
  type: string;
  source?: { userId?: string; type?: string };
  message?: { type: string; text?: string };
  replyToken?: string;
}
