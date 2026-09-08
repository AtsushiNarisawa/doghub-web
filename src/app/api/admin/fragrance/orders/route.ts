import { NextRequest, NextResponse } from "next/server";
import { fdb } from "@/lib/fragrance/db";
import { verifyAdmin, actorLabel } from "@/lib/admin-auth";
import { fetchProductName, sendConfirmIfNeeded } from "@/lib/fragrance/orders";
import { buildShippedNotice, sendFragranceMail } from "@/lib/fragrance-email";
import { ADDRESS_MASK_AFTER_DAYS } from "@/lib/fragrance/config";

// 注文の一覧と、状態の更新（お渡し済み／発送済み／メール再送）。
//
// 🔴 認可は verifyAdmin（＝本当にログインしているか）。既存の管理 API のように
//    Cookie の値が固定文字列かどうかで通してはいけない（誰でも付けられるため）。
// 🔴 注文には住所と電話が入るので、ブラウザから直接データベースを読ませない。必ずこの API を通す。

export const dynamic = "force-dynamic";

const LIST_COLUMNS =
  "id, order_no, created_at, email, customer_name, phone, qty, unit_price_jpy, shipping_jpy, " +
  "total_jpy, fulfillment, status, product_id, lot_id, dog_name, is_gift, tracking_no, " +
  "shipped_at, picked_up_at, picked_up_by, refunded_at, shipping_address, address_masked_at, " +
  "confirm_email_sent_at, confirm_email_error, stripe_livemode, admin_notes, " +
  "utm_source, utm_medium, utm_campaign";

type OrderRow = {
  id: string;
  order_no: string;
  status: string;
  fulfillment: string;
  email: string;
  customer_name: string | null;
  qty: number;
  unit_price_jpy: number;
  shipping_jpy: number;
  total_jpy: number;
  product_id: string;
  tracking_no: string | null;
  created_at: string;
  dog_name: string | null;
  stripe_livemode: boolean;
};

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");            // paid / oversold / picked_up / shipped / refunded / disputed
  const includeTest = sp.get("include_test") === "1";
  const limit = Math.min(Number(sp.get("limit") || 200), 500);

  let q = fdb.from("fragrance_orders").select(LIST_COLUMNS).order("created_at", { ascending: false }).limit(limit);
  if (status) q = q.eq("status", status);
  // 既定ではテスト決済を隠す（本番の数字と混ぜない）
  if (!includeTest) q = q.eq("stripe_livemode", true);

  const { data, error } = await q;
  if (error) {
    console.error("admin fragrance orders list error:", error);
    return NextResponse.json({ error: "list_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, orders: data || [] });
}

export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const orderId = String(body.order_id || "");
    const action = String(body.action || "");
    if (!orderId || !action) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    const { data: order } = await fdb
      .from("fragrance_orders")
      .select(LIST_COLUMNS)
      .eq("id", orderId)
      .maybeSingle<OrderRow>();
    if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const now = new Date().toISOString();

    switch (action) {
      // ── お渡し済み ──
      // 受取人の名前を必ず記録する。「受け取っていない」と言われたときの唯一の手がかりになる
      case "picked_up": {
        const by = String(body.picked_up_by || "").slice(0, 60);
        if (!by) {
          return NextResponse.json({ error: "picked_up_by_required" }, { status: 400 });
        }
        await fdb
          .from("fragrance_orders")
          .update({ status: "picked_up", picked_up_at: now, picked_up_by: by })
          .eq("id", orderId);
        return NextResponse.json({ ok: true });
      }

      // ── 発送済み（追跡番号を入れると自動でお客様にメール） ──
      case "shipped": {
        const tracking = String(body.tracking_no || "").slice(0, 60) || null;
        await fdb
          .from("fragrance_orders")
          .update({ status: "shipped", shipped_at: now, tracking_no: tracking })
          .eq("id", orderId);

        try {
          const productName = await fetchProductName(order.product_id);
          const mail = buildShippedNotice({
            order_no: order.order_no,
            email: order.email,
            customer_name: order.customer_name,
            product_name: productName,
            qty: order.qty,
            unit_price_jpy: order.unit_price_jpy,
            shipping_jpy: order.shipping_jpy,
            total_jpy: order.total_jpy,
            fulfillment: "ship",
            created_at: order.created_at,
            tracking_no: tracking,
            stripe_livemode: order.stripe_livemode,
          });
          await sendFragranceMail({
            to: order.email,
            subject: mail.subject,
            text: mail.text,
            html: mail.html,
            isTest: !order.stripe_livemode,
          });
        } catch (e) {
          console.error("admin fragrance: shipped mail failed", e);
          return NextResponse.json({ ok: true, mail_failed: true });
        }
        return NextResponse.json({ ok: true });
      }

      // ── 注文確認メールの再送（送信に失敗していた分） ──
      case "resend_confirm": {
        await fdb
          .from("fragrance_orders")
          .update({ confirm_email_sent_at: null })
          .eq("id", orderId);
        await sendConfirmIfNeeded(orderId);
        return NextResponse.json({ ok: true });
      }

      // ── 返品されて現物が戻った：在庫を戻す ──
      // 返金そのものは Stripe の画面から手動（自動化しない）。ここは在庫の話だけ
      case "return_stock": {
        await fdb.from("fragrance_stock_events").insert({
          lot_id: (body.lot_id as string) || null,
          channel: "ec",
          delta: order.qty,
          reason: "ec_refund_return",
          order_id: orderId,
          actor: actorLabel(admin),
          note: String(body.note || "").slice(0, 200) || null,
        });
        return NextResponse.json({ ok: true });
      }

      // ── 住所を伏せる（発送から90日） ──
      case "mask_address": {
        await fdb
          .from("fragrance_orders")
          .update({ shipping_address: null, address_masked_at: now })
          .eq("id", orderId);
        return NextResponse.json({ ok: true, after_days: ADDRESS_MASK_AFTER_DAYS });
      }

      // ── スタッフのメモ ──
      case "note": {
        await fdb
          .from("fragrance_orders")
          .update({ admin_notes: String(body.admin_notes || "").slice(0, 1000) })
          .eq("id", orderId);
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "unknown_action" }, { status: 400 });
    }
  } catch (e) {
    console.error("admin fragrance orders error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
