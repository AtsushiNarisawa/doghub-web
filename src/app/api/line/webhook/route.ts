import { NextRequest, NextResponse } from "next/server";
import {
  verifyLineSignature,
  sendLineReplyMessage,
  buildWelcomeMessage,
  type LineMessage,
} from "@/lib/line";

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
        const reply = matchFaqReply(event.message.text);
        await sendLineReplyMessage(replyToken, reply);
      }
      break;

    default:
      break;
  }
}

// ───── 定番FAQの自動回答 ─────
// キーワードを「含む」判定。表記揺れに弱い完全一致を避けるため部分一致で拾う。
// 並び順＝優先順位（先にマッチしたものを返す）。「予約を変更」は変更を優先するため
// キャンセル・変更を予約より前に置く。
interface FaqRule {
  keywords: string[];
  reply: LineMessage[];
}

const FAQ_RULES: FaqRule[] = [
  {
    // キャンセル・変更（「予約」より前。"予約を変更" を変更案内に寄せる）
    keywords: ["キャンセル", "取り消し", "取消", "変更", "日程変更", "リスケ"],
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
          "リロクラブ会員様は10%OFFでご利用いただけます。\n" +
          "詳しくは → https://dog-hub.shop/service",
      },
      bookingBubble(),
    ],
  },
  {
    // ワクチン（持ち物より前。"ワクチンの持ち物" をワクチン案内に寄せる）
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
    keywords: ["大型", "大きい", "体重", "kg", "ｋｇ", "キロ", "何キロ", "サイズ", "小型", "中型", "15"],
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
    keywords: ["場所", "住所", "アクセス", "行き方", "どこ", "駐車", "車", "道順", "地図", "最寄"],
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
    keywords: ["予約", "よやく", "申し込み", "申込", "泊ま", "預け", "預か", "ブッキング"],
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

function matchFaqReply(text: string): LineMessage[] {
  const t = text.trim();
  for (const rule of FAQ_RULES) {
    if (rule.keywords.some((k) => t.includes(k))) {
      return rule.reply;
    }
  }
  return fallbackReply();
}

// 予約導線の吹き出し（ボタンテンプレート）
function bookingBubble(): LineMessage {
  return {
    type: "template",
    altText: "予約する",
    template: {
      type: "buttons",
      text: "ご予約はこちらから（24時間受付）",
      actions: [{ type: "uri", label: "予約する", uri: BOOKING_URL }],
    },
  };
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
