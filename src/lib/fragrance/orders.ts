import type Stripe from "stripe";
import { fdb } from "@/lib/fragrance/db";
import { extractShipping } from "@/lib/stripe";
import {
  buildOrderConfirmation,
  buildStaffNotice,
  sendFragranceMail,
  SELLER,
  type FragranceOrderForEmail,
} from "@/lib/fragrance-email";

// 注文の確定と、確認メールの送信。
//
// 🔴 この関数は3つの経路から呼ばれる。すべて同じ道を通すことで、どこから来ても結果が同じになる。
//    ① Stripe の Webhook（通常はこれ）
//    ② お客様が完了ページを開いたとき（Webhook が遅れた場合の保険）
//    ③ 毎朝の cron が Stripe と突き合わせたとき（①②のどちらも届かなかった場合の最終安全弁）
//
// 🔴 2回目以降の呼び出しは DB 側の関数が null を返す。そのときはメールも在庫も完売判定も一切しない。
//    Stripe は同じ出来事に別 ID のイベントを2つ送ることがあるので、
//    「イベント ID が初めてか」ではなく「注文を実際に作れたか」で判定する。

/** 確認メールの組み立てに要る注文の列（埋め込み結合は使わず、商品名は別に引く）。 */
type OrderRow = {
  id: string;
  order_no: string;
  email: string;
  customer_name: string | null;
  qty: number;
  unit_price_jpy: number;
  shipping_jpy: number;
  total_jpy: number;
  fulfillment: string;
  created_at: string;
  dog_name: string | null;
  status: string;
  stripe_livemode: boolean;
  confirm_email_sent_at: string | null;
  product_id: string;
};

/** 表示用の商品名（「◯◯ 55g」）。商品名が未決の間は仮名がそのまま出る。 */
export async function fetchProductName(productId: string): Promise<string> {
  const { data } = await fdb
    .from("fragrance_products")
    .select("display_name, size_label")
    .eq("id", productId)
    .maybeSingle<{ display_name: string; size_label: string }>();
  return data ? `${data.display_name} ${data.size_label}` : "ハンドクリーム";
}

export type ConfirmResult =
  | { created: true; orderId: string }
  | { created: false; reason: "already" | "not_paid" | "amount_mismatch" | "bad_metadata" };

/**
 * Checkout Session から注文を確定する。
 * @param session Stripe から取り直した Session（イベントの中身をそのまま信じない）
 * @param actor 台帳に残す操作者（'webhook' / 'thanks' / 'cron'）
 */
export async function confirmFromSession(
  session: Stripe.Checkout.Session,
  actor: string,
): Promise<ConfirmResult> {
  if (session.payment_status !== "paid") {
    return { created: false, reason: "not_paid" };
  }

  const m = session.metadata || {};
  const holdId = m.hold_id || null;
  const productId = m.product_id;
  const lotId = m.lot_id;
  const qty = Number(m.qty || 0);
  // 受取方法は自前の metadata を正とする。
  // Stripe の shipping_rate の ID は決済ページごとに新しく作られるので、固定値で照合できない。
  const fulfillment = m.fulfillment === "ship" ? "ship" : "pickup";

  if (!productId || !lotId || !qty) {
    return { created: false, reason: "bad_metadata" };
  }

  // 金額の突合（改ざん検知）
  const expectedTotal = Number(m.expected_total || 0);
  if (!expectedTotal || session.amount_total !== expectedTotal) {
    console.error("fragrance: amount mismatch", {
      session: session.id,
      expected: expectedTotal,
      actual: session.amount_total,
    });
    return { created: false, reason: "amount_mismatch" };
  }

  const { data: product } = await fdb
    .from("fragrance_products")
    .select("price_jpy, shipping_jpy")
    .eq("id", productId)
    .maybeSingle();

  // 配送のときは送料も突き合わせる
  const shippingPaid =
    (session as unknown as { shipping_cost?: { amount_total?: number } | null }).shipping_cost
      ?.amount_total ?? 0;
  if (fulfillment === "ship" && product && shippingPaid !== product.shipping_jpy) {
    console.error("fragrance: shipping mismatch", {
      session: session.id,
      expected: product.shipping_jpy,
      actual: shippingPaid,
    });
    return { created: false, reason: "amount_mismatch" };
  }

  const email = (session.customer_details?.email || "").toLowerCase();
  const { address, name, phone } = extractShipping(session);

  // 既存のお客様と結びつける（メールが一致すれば）
  let customerId: string | null = null;
  if (email) {
    const { data: cust } = await fdb
      .from("customers")
      .select("id")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();
    customerId = cust?.id ?? null;
  }

  const custom = session.custom_fields || [];
  const dogName = custom.find((f) => f.key === "dog_name")?.text?.value || null;
  const isGift = custom.find((f) => f.key === "is_gift")?.dropdown?.value === "yes";

  const { data: orderId, error } = await fdb.rpc("fragrance_confirm_order", {
    p_hold: holdId,
    p_session: session.id,
    p_order: {
      product_id: productId,
      lot_id: lotId,
      qty,
      payment_intent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      livemode: session.livemode,
      customer_id: customerId,
      email,
      name: name || session.customer_details?.name || null,
      phone,
      unit_price: product?.price_jpy ?? Math.round((session.amount_subtotal ?? 0) / qty),
      shipping: fulfillment === "ship" ? shippingPaid : 0,
      total: session.amount_total,
      fulfillment,
      shipping_address: fulfillment === "ship" ? address : null,
      dog_name: dogName,
      is_gift: isGift,
      utm_source: m.utm_source || null,
      utm_medium: m.utm_medium || null,
      utm_campaign: m.utm_campaign || null,
      referrer: m.referrer || null,
      consent_at: session.consent?.terms_of_service === "accepted" ? new Date().toISOString() : null,
      actor,
    },
  });

  if (error) throw error;
  if (!orderId) return { created: false, reason: "already" }; // 既に確定済み＝何もしない

  return { created: true, orderId: orderId as string };
}

/**
 * 注文確認メールとスタッフ通知を送る。
 *
 * 🔴 送るかどうかの条件は「confirm_email_sent_at が空かどうか」ただ1つ。
 *    Webhook・完了ページ・cron のどこから呼ばれても、1通しか送られない。
 */
export async function sendConfirmIfNeeded(orderId: string): Promise<void> {
  const { data: order } = await fdb
    .from("fragrance_orders")
    .select(
      "id, order_no, email, customer_name, qty, unit_price_jpy, shipping_jpy, total_jpy, " +
        "fulfillment, created_at, dog_name, status, stripe_livemode, confirm_email_sent_at, product_id",
    )
    .eq("id", orderId)
    .maybeSingle<OrderRow>();

  if (!order || order.confirm_email_sent_at) return;

  const prod = await fetchProductName(order.product_id);

  const forEmail: FragranceOrderForEmail = {
    order_no: order.order_no,
    email: order.email,
    customer_name: order.customer_name,
    product_name: prod,
    qty: order.qty,
    unit_price_jpy: order.unit_price_jpy,
    shipping_jpy: order.shipping_jpy,
    total_jpy: order.total_jpy,
    fulfillment: order.fulfillment as "pickup" | "ship",
    created_at: order.created_at,
    dog_name: order.dog_name,
    stripe_livemode: order.stripe_livemode,
  };

  const isTest = !order.stripe_livemode;

  try {
    const mail = buildOrderConfirmation(forEmail);
    await sendFragranceMail({
      to: order.email,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      isTest,
    });
    await fdb
      .from("fragrance_orders")
      .update({ confirm_email_sent_at: new Date().toISOString(), confirm_email_error: null })
      .eq("id", orderId);
  } catch (e) {
    // メールが送れなくても注文は生きている。エラーを残し、翌朝の cron が再送する
    console.error("fragrance: confirmation mail failed", e);
    await fdb
      .from("fragrance_orders")
      .update({ confirm_email_error: String(e).slice(0, 500) })
      .eq("id", orderId);
  }

  // スタッフ通知（在庫超過は要対応）
  try {
    const level = order.status === "oversold" ? "action_required" : "normal";
    const reason =
      order.status === "oversold"
        ? "在庫超過が起きています。店頭枠から回すか、返金するかを24時間以内にご判断ください。"
        : undefined;
    const staff = buildStaffNotice(forEmail, level, reason);
    await sendFragranceMail({
      to: SELLER.from,
      subject: staff.subject,
      text: staff.text,
      isTest,
    });
  } catch (e) {
    console.error("fragrance: staff notice failed", e);
  }
}
