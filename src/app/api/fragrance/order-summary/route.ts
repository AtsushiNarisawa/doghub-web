import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { fdb } from "@/lib/fragrance/db";
import { requireStripe } from "@/lib/stripe";
import { confirmFromSession, sendConfirmIfNeeded, fetchProductName } from "@/lib/fragrance/orders";

/** 完了ページに返す注文の列（個人情報は含めない）。 */
type SummaryRow = {
  id: string;
  order_no: string;
  qty: number;
  total_jpy: number;
  shipping_jpy: number;
  unit_price_jpy: number;
  fulfillment: string;
  status: string;
  product_id: string;
  ga_purchase_sent_at: string | null;
};

const SUMMARY_COLUMNS =
  "id, order_no, qty, total_jpy, shipping_jpy, unit_price_jpy, fulfillment, status, " +
  "product_id, ga_purchase_sent_at";

// 完了ページ（/fragrance/thanks）が呼ぶ。役割は3つ。
//
// 1. 注文番号と受け取り方をお客様に表示する
// 2. Webhook がまだ届いていなければ、ここで注文を確定する（保険）
// 3. 売上計測（GA4）を1回だけ発火させるための合図を返す
//
// 🔴 3 の一回性はブラウザ側ではなくサーバー側で持つ。
//    ブラウザの記憶（sessionStorage）はタブを変えれば空になり、翌日ブックマークから開けば
//    もう一度発火してしまう。注文行に「送信済みの時刻」を書き、最初の1回だけ true を返す。
//
// 🔴 氏名・住所・電話は返さない（完了ページの URL を知っていれば誰でも開けるため）。

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sid = req.nextUrl.searchParams.get("sid");
  if (!sid || !sid.startsWith("cs_")) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  try {
    let { data: order } = await fdb
      .from("fragrance_orders")
      .select(SUMMARY_COLUMNS)
      .eq("stripe_session_id", sid)
      .maybeSingle<SummaryRow>();

    // まだ無い＝Webhook が遅れているか届いていない。ここで確定させる
    if (!order) {
      const session = await requireStripe().checkout.sessions.retrieve(sid);
      if (session.payment_status !== "paid") {
        return NextResponse.json({ ok: true, status: "pending" });
      }
      const result = await confirmFromSession(session, "thanks");
      if (result.created) {
        after(async () => {
          try {
            await sendConfirmIfNeeded(result.orderId);
          } catch (e) {
            console.error("fragrance order-summary: mail failed", e);
          }
        });
      }
      const again = await fdb
        .from("fragrance_orders")
        .select(SUMMARY_COLUMNS)
        .eq("stripe_session_id", sid)
        .maybeSingle<SummaryRow>();
      order = again.data;
    }

    if (!order) return NextResponse.json({ ok: true, status: "pending" });

    // 売上計測を1回だけ積むための合図。
    // 「まだ空のときだけ現在時刻を書き込み、書き込めた便だけ true」＝同時に開かれても1回で済む
    let firstView = false;
    if (!order.ga_purchase_sent_at) {
      const { data: claimed } = await fdb
        .from("fragrance_orders")
        .update({ ga_purchase_sent_at: new Date().toISOString() })
        .eq("id", order.id)
        .is("ga_purchase_sent_at", null)
        .select("id");
      firstView = !!claimed?.length;
    }

    const productName = await fetchProductName(order.product_id);

    return NextResponse.json({
      ok: true,
      status: "paid",
      first_view: firstView,
      order: {
        order_no: order.order_no,
        qty: order.qty,
        total: order.total_jpy,
        shipping: order.shipping_jpy,
        unit_price: order.unit_price_jpy,
        fulfillment: order.fulfillment,
        product_id: order.product_id,
        product_name: productName,
      },
    });
  } catch (e) {
    console.error("fragrance order-summary error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
