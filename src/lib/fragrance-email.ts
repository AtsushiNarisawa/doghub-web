import { getSharedTransport } from "@/lib/email";
import {
  PICKUP_HOLD_DAYS,
  SHIP_ESTIMATE_MIN_DAYS,
  SHIP_ESTIMATE_MAX_DAYS,
  nonProductionEnv,
} from "@/lib/fragrance/config";

// Fragrance EC のメール文面。
//
// 🔴 注文確認メールは「特定商取引法13条の承諾通知」を兼ねる。
//    代金を受け取ってから商品をお渡しするまでに間があく取引（店頭お渡しも含む）では、
//    施行規則37条の6項目を必ず書かなければならない。1つでも欠けると法令違反になる。
//      ① ご注文を承諾した旨   ② 事業者の名称・住所・電話
//      ③ 受領した金額         ④ 受領した年月日
//      ⑤ 商品名と数量         ⑥ 引渡しの時期（「入荷次第」は不可＝期限の形で書く）
//    Stripe の自動レシートは③しか満たさないので、こちらで必ず送る。
//    テスト（src/lib/__tests__/fragrance-email.test.ts）で6項目の存在を機械的に確認している。
//
// 🔴 薬機法・景表法：効能をうたわない／安全性を保証しない／「犬用」と名乗らない。
//    禁止語も同じテストで機械的に弾く。
//
// 正本＝fragrance/EC構築計画_2026-09-05.md §7

/** 事業者表記。🔴 会社設立後に法人名へ差し替える（特商法の事業者名・Stripe 名義と一致させること）。 */
export const SELLER = {
  /** 表示名。設立後は「DogHub Fragrance（Motonari株式会社）」にする。 */
  displayName: "DogHub Fragrance",
  /** 法人名（登記後に設定）。未設定の間は屋号のみで出す。 */
  legalName: process.env.FRAGRANCE_SELLER_LEGAL_NAME || "",
  address: "神奈川県足柄下郡箱根町仙石原1246-2",
  tel: "0460-83-8730",
  email: "info@dog-hub.shop",
  from: "narisawa@dog-hub.shop",
} as const;

function sellerBlock(): string {
  const name = SELLER.legalName
    ? `${SELLER.displayName}（${SELLER.legalName}）`
    : SELLER.displayName;
  return `${name}\n${SELLER.address}\n電話 ${SELLER.tel}\n${SELLER.email}`;
}

function fromHeader(): string {
  const name = SELLER.legalName
    ? `${SELLER.displayName}（${SELLER.legalName}）`
    : SELLER.displayName;
  return `"${name}" <${SELLER.from}>`;
}

function escapeHtml(s: string | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 2026-09-06 のような表記。受領年月日（法定項目④）に使う。 */
function jstDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

export type FragranceOrderForEmail = {
  order_no: string;
  email: string;
  customer_name: string | null;
  product_name: string; // display_name + size_label
  qty: number;
  unit_price_jpy: number;
  shipping_jpy: number;
  total_jpy: number;
  fulfillment: "pickup" | "ship";
  created_at: string;
  dog_name?: string | null;
  tracking_no?: string | null;
  stripe_livemode?: boolean;
};

/** 引渡時期（法定項目⑥）。🔴「入荷次第」等の曖昧表現は使わない。 */
function deliveryTerm(o: FragranceOrderForEmail): string {
  return o.fulfillment === "pickup"
    ? `ご決済日から${PICKUP_HOLD_DAYS}日以内に、DogHub箱根仙石原のホテル受付にてお渡しします`
    : `ご注文から${SHIP_ESTIMATE_MIN_DAYS}〜${SHIP_ESTIMATE_MAX_DAYS}営業日以内に発送します`;
}

/**
 * 注文確認メール（＝特商法13条の承諾通知）。
 * 店頭お渡しと配送で案内は変わるが、法定6項目はどちらにも入る。
 */
export function buildOrderConfirmation(o: FragranceOrderForEmail): {
  subject: string;
  text: string;
  html: string;
} {
  const name = o.customer_name ? `${o.customer_name} 様` : "お客様";
  const subject =
    o.fulfillment === "pickup"
      ? `ご注文ありがとうございます［${o.order_no}］お渡しは、店頭で。`
      : `ご注文ありがとうございます［${o.order_no}］発送のご案内`;

  const pickupGuide =
    `お渡し場所：DogHub箱根仙石原 ホテル受付\n` +
    `受付時間：金・土・日・月・火の 9:00〜17:00（水・木は定休）\n` +
    `次にご来店いただいたときに、受付でお名前をお伝えください。\n` +
    `ご来店のためだけにお越しいただく必要はありません。`;

  const shipGuide =
    `ご登録の住所へお送りします。発送しましたら、追跡番号をあらためてご連絡します。`;

  const text =
    `${name}\n\n` +
    `ご注文を承りました。ありがとうございます。\n\n` +
    `── ご注文の内容 ──\n` +
    `注文番号：${o.order_no}\n` +
    `商品：${o.product_name}\n` +
    `数量：${o.qty}点\n` +
    `商品代金：${yen(o.unit_price_jpy)} × ${o.qty}点\n` +
    (o.shipping_jpy > 0 ? `送料：${yen(o.shipping_jpy)}\n` : `送料：無料（店頭でのお渡し）\n`) +
    `お支払金額：${yen(o.total_jpy)}（税込）\n` +
    `代金をお受け取りした日：${jstDate(o.created_at)}\n` +
    (o.dog_name ? `お入れするお名前：${o.dog_name}\n` : "") +
    `\n` +
    `お渡しの時期：${deliveryTerm(o)}。\n\n` +
    `── ${o.fulfillment === "pickup" ? "お渡しについて" : "お届けについて"} ──\n` +
    `${o.fulfillment === "pickup" ? pickupGuide : shipGuide}\n\n` +
    `── 使い方 ──\n` +
    `散歩のあと、手を洗ったら。\n\n` +
    `── 返品について ──\n` +
    `未開封のものに限り、商品到着後8日以内にご連絡いただいた場合にお受けします\n` +
    `（返送料はお客様のご負担となります）。開封後、およびお名前をお入れした商品の\n` +
    `返品はお受けできません。\n\n` +
    `ご不明な点がありましたら、このメールにご返信ください。\n\n` +
    `${sellerBlock()}\n`;

  const html =
    `<div style="font-family:sans-serif;line-height:1.9;color:#3C200F;max-width:560px">` +
    `<p>${escapeHtml(name)}</p>` +
    `<p>ご注文を承りました。ありがとうございます。</p>` +
    `<h3 style="font-size:15px;border-bottom:1px solid #ddd;padding-bottom:6px">ご注文の内容</h3>` +
    `<table style="font-size:14px;border-collapse:collapse">` +
    `<tr><td style="padding:3px 12px 3px 0;color:#888">注文番号</td><td>${escapeHtml(o.order_no)}</td></tr>` +
    `<tr><td style="padding:3px 12px 3px 0;color:#888">商品</td><td>${escapeHtml(o.product_name)}</td></tr>` +
    `<tr><td style="padding:3px 12px 3px 0;color:#888">数量</td><td>${o.qty}点</td></tr>` +
    `<tr><td style="padding:3px 12px 3px 0;color:#888">商品代金</td><td>${yen(o.unit_price_jpy)} × ${o.qty}点</td></tr>` +
    `<tr><td style="padding:3px 12px 3px 0;color:#888">送料</td><td>${o.shipping_jpy > 0 ? yen(o.shipping_jpy) : "無料（店頭でのお渡し）"}</td></tr>` +
    `<tr><td style="padding:3px 12px 3px 0;color:#888">お支払金額</td><td><strong>${yen(o.total_jpy)}</strong>（税込）</td></tr>` +
    `<tr><td style="padding:3px 12px 3px 0;color:#888">代金をお受け取りした日</td><td>${escapeHtml(jstDate(o.created_at))}</td></tr>` +
    (o.dog_name
      ? `<tr><td style="padding:3px 12px 3px 0;color:#888">お入れするお名前</td><td>${escapeHtml(o.dog_name)}</td></tr>`
      : "") +
    `</table>` +
    `<p style="margin-top:14px">お渡しの時期：${escapeHtml(deliveryTerm(o))}。</p>` +
    `<h3 style="font-size:15px;border-bottom:1px solid #ddd;padding-bottom:6px">` +
    `${o.fulfillment === "pickup" ? "お渡しについて" : "お届けについて"}</h3>` +
    `<p style="font-size:14px">${(o.fulfillment === "pickup" ? pickupGuide : shipGuide).replace(/\n/g, "<br>")}</p>` +
    `<h3 style="font-size:15px;border-bottom:1px solid #ddd;padding-bottom:6px">使い方</h3>` +
    `<p style="font-size:14px">散歩のあと、手を洗ったら。</p>` +
    `<h3 style="font-size:15px;border-bottom:1px solid #ddd;padding-bottom:6px">返品について</h3>` +
    `<p style="font-size:13px;color:#666">未開封のものに限り、商品到着後8日以内にご連絡いただいた場合にお受けします（返送料はお客様のご負担となります）。開封後、およびお名前をお入れした商品の返品はお受けできません。</p>` +
    `<p style="font-size:13px;color:#666;white-space:pre-line;border-top:1px solid #ddd;padding-top:10px;margin-top:18px">${escapeHtml(sellerBlock())}</p>` +
    `</div>`;

  return { subject, text, html };
}

/** 発送のご案内（管理画面で「発送済み」にしたときに自動送信）。 */
export function buildShippedNotice(o: FragranceOrderForEmail): {
  subject: string;
  text: string;
  html: string;
} {
  const name = o.customer_name ? `${o.customer_name} 様` : "お客様";
  const subject = o.tracking_no
    ? `発送しました（追跡番号 ${o.tracking_no}）［${o.order_no}］`
    : `発送しました［${o.order_no}］`;
  const text =
    `${name}\n\n` +
    `ご注文の品を本日発送しました。\n\n` +
    `注文番号：${o.order_no}\n` +
    `商品：${o.product_name}（${o.qty}点）\n` +
    (o.tracking_no ? `追跡番号：${o.tracking_no}\n` : "") +
    `\n届きましたら、散歩のあと、手を洗ったあとにお使いください。\n\n` +
    `${sellerBlock()}\n`;
  const html =
    `<div style="font-family:sans-serif;line-height:1.9;color:#3C200F;max-width:560px">` +
    `<p>${escapeHtml(name)}</p><p>ご注文の品を本日発送しました。</p>` +
    `<p style="font-size:14px">注文番号：${escapeHtml(o.order_no)}<br>` +
    `商品：${escapeHtml(o.product_name)}（${o.qty}点）` +
    (o.tracking_no ? `<br>追跡番号：${escapeHtml(o.tracking_no)}` : "") +
    `</p><p>届きましたら、散歩のあと、手を洗ったあとにお使いください。</p>` +
    `<p style="font-size:13px;color:#666;white-space:pre-line;border-top:1px solid #ddd;padding-top:10px">${escapeHtml(sellerBlock())}</p></div>`;
  return { subject, text, html };
}

/** スタッフ通知。要対応（在庫超過・返金の申立て）は件名で分かるようにする。 */
export function buildStaffNotice(
  o: FragranceOrderForEmail,
  level: "normal" | "action_required" | "check_required" = "normal",
  reason?: string,
): { subject: string; text: string } {
  const prefix =
    level === "action_required" ? "【要対応】" : level === "check_required" ? "【要確認】" : "";
  const method = o.fulfillment === "pickup" ? "店頭お渡し" : "配送";
  const testTag = o.stripe_livemode === false ? "［テスト］" : "";
  return {
    subject: `${prefix}${testTag}【Fragrance注文】${o.customer_name || "お客様"} ${method} ${o.qty}本（${o.order_no}）`,
    text:
      `注文番号：${o.order_no}\n` +
      `お客様：${o.customer_name || "(名前なし)"}（${o.email}）\n` +
      `商品：${o.product_name} × ${o.qty}\n` +
      `受取方法：${method}\n` +
      `金額：${yen(o.total_jpy)}\n` +
      (reason ? `\n${reason}\n` : "") +
      `\n管理画面：https://dog-hub.shop/admin/fragrance\n`,
  };
}

/**
 * 1通送る（取引メール専用）。
 *
 * 🔴 テスト決済（stripe_livemode=false）のメールを本物のお客様やスタッフに飛ばさないため、
 *    本番以外の環境では宛先を自分たちのアドレスに差し替える。
 */
export async function sendFragranceMail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  isTest?: boolean;
}): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Gmail の設定がされていません");
  }
  const nonProd = nonProductionEnv();
  const forceTest = params.isTest || !!nonProd;
  const to = forceTest ? SELLER.from : params.to;
  const subject = forceTest ? `［テスト送信］${params.subject}` : params.subject;

  await getSharedTransport().sendMail({
    from: fromHeader(),
    replyTo: SELLER.email,
    to,
    subject,
    text: params.text,
    ...(params.html ? { html: params.html } : {}),
  });
}
