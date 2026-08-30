import crypto from "crypto";
import { GOOGLE_REVIEW_URL } from "./email";

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
// Channel ID は過去に "\n" 混入の事故があるため数字のみに正規化する
const CHANNEL_ID = (process.env.LINE_CHANNEL_ID ?? "").replace(/[^0-9]/g, "");
// 固定トークン（フォールバック）。基本は client_credentials で都度発行する
const STATIC_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

// LINE API 呼び出しの上限時間。
// 2026-08-30 に取引通知を「LINE連携済みならLINEのみ」に変えた（総点検 #10）ことで、
// 予約確定・キャンセルの処理は「LINEに送る → 結果を見てメールを送るか決める」順番になった。
// ここが応答なしで固まると、その後ろにあるスタッフ宛の通知メールまで道連れになるため、
// 必ず有限時間で失敗させてメールへのフォールバックに落とす。
const LINE_API_TIMEOUT_MS = 8000;

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
        signal: AbortSignal.timeout(LINE_API_TIMEOUT_MS),
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
      signal: AbortSignal.timeout(LINE_API_TIMEOUT_MS),
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
// 友だちのプロフィール取得（表示名）
// 受信トレイで「誰からのメッセージか」を表示するために使う。
// 取得できないケース（ブロック済み・プロフィール取得に同意していない等）は null を返す。
// ───────────────────────────────────────────
export async function fetchLineProfile(
  lineUserId: string
): Promise<{ displayName: string | null } | null> {
  let token = await getAccessToken();
  if (!token) return null;

  const get = (t: string) =>
    fetch(`https://api.line.me/v2/bot/profile/${encodeURIComponent(lineUserId)}`, {
      headers: { Authorization: `Bearer ${t}` },
    });

  try {
    let res = await get(token);
    if (res.status === 401) {
      cachedToken = null;
      token = await getAccessToken();
      if (!token) return null;
      res = await get(token);
    }
    if (!res.ok) return null;
    const data = (await res.json()) as { displayName?: string };
    return { displayName: data.displayName ?? null };
  } catch (e) {
    console.error("fetchLineProfile failed:", e);
    return null;
  }
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

// 呼び出し元によって "09:00"（予約フォームの入力値）と "09:00:00"（DBのtime型）の
// 両方が渡るため、通知文に出す前にここで揃える。
const toHHMM = (t: string | null | undefined) => (t || "").slice(0, 5);

export function buildBookingConfirmMessage(params: {
  customerName: string;
  plan: string;
  date: string;
  checkinTime: string;
  reservationId: string;
  status: "confirmed" | "pending";
  // 宿泊のチェックアウト日とワンちゃんのお名前。
  // 確認メールには元々入っていたが、LINE側に無かった。
  // 2026-08-30 に取引通知を「LINE連携済みならLINEのみ」にした（総点検 #10）ことで、
  // 宿泊のお客様がチェックアウト日をどこでも受け取れなくなるためここへ移した。
  // ※ メールに既にある事実だけを移す（料金などをここで新しく増やさない）。
  checkoutDate?: string | null;
  dogs?: string[];
}): LineMessage[] {
  const { customerName, plan, date, checkinTime, reservationId, status } = params;
  // 日付の書式は従来の確定メッセージと同じまま（チェックイン行の見た目を変えない）。
  // チェックアウト日も同じ書式で揃えるため関数にしている。
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("ja-JP", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });

  const statusText =
    status === "confirmed"
      ? "✅ ご予約が確定しました"
      : "⏳ ご予約を受け付けました（スタッフ確認後に確定）";

  const lines = [
    `${customerName}様`,
    "",
    statusText,
    "",
    `📅 ${fmt(date)}`,
    `🕐 チェックイン ${toHHMM(checkinTime)}`,
  ];
  // チェックアウトは宿泊のときだけ。時間帯も含めてリマインドLINEと同じ行に揃える。
  if (plan === "stay" && params.checkoutDate) {
    lines.push(`🏠 チェックアウト ${fmt(params.checkoutDate)} 9:00〜11:00`);
  }
  lines.push(`📋 ${PLAN_LABELS[plan] ?? plan}`);
  // 多頭は「ポロちゃん、ぱんちちゃん」（リマインドLINEと同じ作法）。
  if (params.dogs && params.dogs.length > 0) {
    lines.push(`🐕 ${params.dogs.map((d) => `${d}ちゃん`).join("、")}`);
  }
  lines.push(
    "",
    `予約番号: ${reservationId.slice(0, 8).toUpperCase()}`,
    "",
    "ご不明な点はこちらのLINEにご返信ください。",
    "当日お待ちしております🐾"
  );

  return [
    {
      type: "text",
      text: lines.join("\n"),
    },
    {
      type: "text",
      text: `📝 変更・キャンセルはこちら\nhttps://dog-hub.shop/booking/modify/${reservationId}`,
    },
  ];
}

// ───────────────────────────────────────────
// ご予約内容の変更のお知らせ
// スタッフ操作の日程変更（api/admin/reschedule）と、お客様ご自身の変更（api/booking/modify）で
// 共用する。通数課金のため1メッセージにまとめる（無料枠200通/月）。
// ───────────────────────────────────────────
export function buildReservationChangeMessage(params: {
  customerName: string;
  plan: string;
  date: string;
  checkinTime: string | null;
  checkoutDate?: string | null;
  changes: string[];
  reservationId: string;
  changedBy: "customer" | "staff";
}): LineMessage[] {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const fmt = (d: string) => {
    const dt = new Date(d + "T00:00:00");
    return `${dt.getMonth() + 1}/${dt.getDate()}（${days[dt.getDay()]}）`;
  };

  const lines = [
    `${params.customerName}様`,
    "",
    params.changedBy === "staff"
      ? "📝 ご予約の日程を変更いたしました"
      : "📝 ご予約内容の変更を承りました",
    "",
    "【変更後のご予約】",
    `📅 ${fmt(params.date)}`,
  ];
  const hhmm = (params.checkinTime || "").slice(0, 5);
  if (hhmm) lines.push(`🕐 チェックイン ${hhmm}`);
  if (params.plan === "stay" && params.checkoutDate) {
    lines.push(`🏠 チェックアウト ${fmt(params.checkoutDate)}`);
  }
  lines.push(`📋 ${PLAN_LABELS[params.plan] ?? params.plan}`);
  lines.push("", "【変更内容】", ...params.changes.map((c) => `・${c}`));
  if (params.changedBy === "staff") {
    lines.push("", "お心当たりがない場合は、お手数ですがご連絡ください。");
  }
  lines.push(
    "",
    "📝 ご予約内容の確認はこちら",
    `https://dog-hub.shop/booking/modify/${params.reservationId}`
  );

  return [{ type: "text", text: lines.join("\n") }];
}

// ───────────────────────────────────────────
// キャンセルのお知らせ
// お客様のセルフキャンセル（api/booking/cancel）と管理画面からのキャンセル
// （api/admin/update-status）で共用する。文面を2箇所に複製しないための共通化。
// ───────────────────────────────────────────
export function buildCancellationMessage(params: {
  customerName: string;
  plan: string;
  date: string;
  cancelledBy: "customer" | "staff";
}): LineMessage[] {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const d = new Date(params.date + "T00:00:00");
  const dateStr = `${d.getMonth() + 1}/${d.getDate()}（${days[d.getDay()]}）`;
  const lines = [
    `${params.customerName}様`,
    "",
    "❌ ご予約がキャンセルされました",
    "",
    `📅 ${dateStr}`,
    `📋 ${PLAN_LABELS[params.plan] ?? params.plan}`,
  ];
  // スタッフ操作のキャンセルはお客様が操作していないため、心当たりがない場合の導線を添える
  // （メール版 sendCancellationEmails の staffNote と同じ趣旨）。
  if (params.cancelledBy === "staff") {
    lines.push("", "お心当たりがない場合は、お手数ですがご連絡ください。");
  }
  lines.push("", "またのご利用をお待ちしております🐾");
  return [{ type: "text", text: lines.join("\n") }];
}

// ───────────────────────────────────────────
// ご予約日前のリマインド（前々日・cron/reminder から送る）
// ───────────────────────────────────────────
// メール版（api/cron/reminder の buildReminderHtml）と同じ情報を1通にまとめる。
// 通数課金のため複数バブルに割らない（無料枠200通/月）。
export function buildReminderLineMessage(params: {
  customerName: string;
  plan: string;
  date: string;
  checkinTime: string;
  checkoutDate: string | null;
  dogs: string[];
  reservationId: string;
}): LineMessage[] {
  const { customerName, plan, date, checkinTime, checkoutDate, dogs, reservationId } = params;
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const fmt = (d: string) => {
    const dt = new Date(d + "T00:00:00");
    return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日（${days[dt.getDay()]}）`;
  };

  const lines = [
    `${customerName}様`,
    "",
    "ご予約日が近づいてまいりました🐾",
    "",
    `📅 ${fmt(date)}`,
    `🕐 チェックイン ${toHHMM(checkinTime)}`,
  ];
  if (plan === "stay" && checkoutDate) {
    lines.push(`🏠 チェックアウト ${fmt(checkoutDate)} 9:00〜11:00`);
  }
  lines.push(`📋 ${PLAN_LABELS[plan] ?? plan}`);
  // 多頭は「ポロちゃん、ぱんちちゃん」。まとめて「ポロ、ぱんち ちゃん」にすると読みが不自然になる。
  if (dogs.length > 0) lines.push(`🐕 ${dogs.map((d) => `${d}ちゃん`).join("、")}`);
  lines.push(
    "",
    "当日のお持ち物・ご注意点はこちらをご覧ください",
    "https://dog-hub.shop/guide",
    "",
    "📝 ご変更・キャンセルはこちら",
    `https://dog-hub.shop/booking/modify/${reservationId}`,
    "",
    "お気をつけてお越しくださいませ。"
  );

  return [{ type: "text", text: lines.join("\n") }];
}

// ───────────────────────────────────────────
// 友だち追加時のウェルカムメッセージ
// ───────────────────────────────────────────
// 「お客様情報のご登録」の入口。LIFF のエンドポイントURLが /booking のため、
// 専用 LIFF を増やさず ?mode=link で出し分けている（BookingPage 側で分岐）。
const LINE_LINK_LIFF_URL = `https://liff.line.me/${
  process.env.NEXT_PUBLIC_LIFF_ID || "2009688745-qZi2jM4g"
}?mode=link`;

export function buildWelcomeMessage(): LineMessage[] {
  return [
    {
      type: "text",
      text:
        "DogHub箱根仙石原の公式LINEへようこそ🐾\n\n" +
        "画面下の【メニュー】から、料金・アクセス・営業時間・持ち物などをワンタップで24時間いつでもご確認いただけます。\n" +
        "ご予約は【予約する】から24時間受付中です。\n\n" +
        "ご不明な点は、このトークにそのままメッセージを送ってください。個別のお返事はスタッフから順次お送りします。",
    },
    // 既にご利用のあるお客様を、この場で顧客情報と結びつけるための導線。
    // 友だち追加直後は最も見ていただけるタイミングのため、ここに置くのが最も効率が良い
    // （設計＝marketing/reports/line_linking_implementation_plan_2026-07-21.md）。
    // reply で送るため通数は無料。
    {
      type: "template",
      altText: "これまでにご利用いただいたことがある方は、お客様情報のご登録をお願いします",
      template: {
        type: "buttons",
        title: "ご利用いただいたことのある方へ",
        text:
          "お客様情報をご登録いただくと、ご予約の確認やお知らせをLINEでもお受け取りいただけます。",
        actions: [
          {
            type: "uri",
            label: "お客様情報の登録",
            uri: LINE_LINK_LIFF_URL,
          },
        ],
      },
    },
  ];
}

// ───────────────────────────────────────────
// お礼メッセージ（利用完了後に送信・LINE友だち登録済みのお客様向け）
// メール版（email.ts の buildThankYouEmailHtml）と同内容をLINE向けに構成。
// URLは1メッセージ1つまで（本文にURLを2つ以上入れるとOGPカードが並んでしまうため、
// buttonsテンプレートで分割）。
// ───────────────────────────────────────────
export function buildThankYouLineMessage(
  customerName: string,
  isFirstVisit: boolean
): LineMessage[] {
  const messages: LineMessage[] = [
    {
      type: "text",
      text: [
        `${customerName}様`,
        "",
        "先日はDogHub箱根仙石原にお越しいただき、ありがとうございました。わんちゃんとの箱根旅行はいかがでしたか？",
        "",
        "看板犬のポロ・ぱんち・ムックともども、またお会いできるのを楽しみにしています。",
      ].join("\n"),
    },
  ];

  if (isFirstVisit) {
    messages.push({
      type: "template",
      altText: "よろしければご感想をお聞かせください",
      template: {
        type: "buttons",
        text: "よろしければ、ご感想をお聞かせください。皆さまの声が私たちの励みになります。",
        actions: [{ type: "uri", label: "Googleで口コミを書く", uri: GOOGLE_REVIEW_URL }],
      },
    });
  }

  messages.push({
    type: "template",
    altText: "次回のご予約はこちら",
    template: {
      type: "buttons",
      text: "またのご利用をお待ちしております🐾",
      actions: [{ type: "uri", label: "次回のご予約はこちら", uri: "https://dog-hub.shop/booking" }],
    },
  });

  return messages;
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
