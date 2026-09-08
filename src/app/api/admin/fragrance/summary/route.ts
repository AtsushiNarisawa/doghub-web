import { NextRequest, NextResponse } from "next/server";
import { fdb } from "@/lib/fragrance/db";
import { verifyAdmin } from "@/lib/admin-auth";

// 増産の判断材料と、月次のまとめ。どちらも「読むだけ」。
//
// 🔴 増産の基準は発売前に決めてある（売れなかったあとに基準を作ると必ず甘くなるため）。
//      主   : 試香→購入率 15%以上
//      従1  : 完売までの日数（EC枠30本 3日以内・全体90本 45日以内）
//      従2  : 再入荷待ち 30人以上
//    → 主を満たし、かつ従のどちらかを満たしたら 約300個へ。
//      主が 8〜15% なら同じ110個でもう一度。8%未満なら商品の前提を疑う。
//
// 🔴 発注数の上限は「原価」ではなく「使用期限」で決まる。
//    年間の販売ペース × 2.5年 を超える数は作らない（安く作った在庫が期限切れになる）。
// 🔴 OEM には出来高1割の買取り義務があるので、資金は「発注数 × 1.1」で見る。

export const dynamic = "force-dynamic";

const BUYBACK_RATE = 1.1;   // 出来高1割の買取り
const SHELF_LIFE_YEARS = 2.5;
const STRIPE_FEE_RATE = 0.036;

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [{ data: orders }, { data: counts }, { data: lots }, { data: restock }] = await Promise.all([
      fdb
        .from("fragrance_orders")
        .select("id, created_at, qty, total_jpy, shipping_jpy, fulfillment, status, stripe_livemode, lot_id")
        .eq("stripe_livemode", true),
      fdb.from("fragrance_tester_counts").select("date, tried_count, asked_count"),
      fdb
        .from("fragrance_lots")
        .select("id, product_id, lot_no, qty_received, qty_ec_alloc, qty_internal, status, on_sale_at, sold_out_at, expires_on, lead_time_days"),
      fdb.from("fragrance_restock_requests").select("id, notified_at, opted_out_at"),
    ]);

    const live = (orders || []).filter((o) => o.status !== "refunded");

    // ── 主KPI：試香→購入率 ──
    const tried = (counts || []).reduce((s, r) => s + (r.tried_count || 0), 0);
    const asked = (counts || []).reduce((s, r) => s + (r.asked_count || 0), 0);
    // 分子は「売れた本数」ではなく「買った人の数」＝注文件数（店頭分は台帳側）
    const ecOrders = live.length;
    const storeSold = await countStoreSales();
    const purchases = ecOrders + storeSold;
    const conversion = tried > 0 ? purchases / tried : null;

    // ── 従1：完売までの日数 ──
    const soldOut = (lots || []).filter((l) => l.sold_out_at && l.on_sale_at);
    const daysToSellOut = soldOut.length
      ? Math.round(
          (new Date(soldOut[0].sold_out_at as string).getTime() -
            new Date(soldOut[0].on_sale_at as string).getTime()) /
            86400_000,
        )
      : null;

    // ── 従2：再入荷待ち ──
    const waiting = (restock || []).filter((r) => !r.notified_at && !r.opted_out_at).length;

    // ── 判定 ──
    const mainMet = conversion !== null && conversion >= 0.15;
    const subMet = (daysToSellOut !== null && daysToSellOut <= 45) || waiting >= 30;
    const verdict =
      conversion === null
        ? "測定前（試香の記録がまだありません）"
        : mainMet && subMet
          ? "約300個へ増産（主KPI 15%以上＋従の条件を達成）"
          : conversion >= 0.08
            ? "同じ110個でもう一度（8〜15%＝判断を保留する帯）"
            : "商品の前提を疑う（8%未満）";

    // ── 作ってよい上限（使用期限から） ──
    const firstSale = (lots || []).map((l) => l.on_sale_at).filter(Boolean).sort()[0];
    const daysSelling = firstSale
      ? Math.max(1, Math.round((Date.now() - new Date(firstSale as string).getTime()) / 86400_000))
      : null;
    const annualPace = daysSelling ? Math.round((purchases / daysSelling) * 365) : null;
    const maxToMake = annualPace ? Math.round(annualPace * SHELF_LIFE_YEARS) : null;

    // ── 月次（freee への転記用・読むだけ） ──
    const byMonth: Record<string, { count: number; qty: number; sales: number; shipping: number; pickup: number; ship: number; fee: number }> = {};
    for (const o of live) {
      const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit" })
        .format(new Date(o.created_at))
        .slice(0, 7);
      const m = (byMonth[key] ||= { count: 0, qty: 0, sales: 0, shipping: 0, pickup: 0, ship: 0, fee: 0 });
      m.count++;
      m.qty += o.qty;
      m.sales += o.total_jpy;
      m.shipping += o.shipping_jpy;
      m.fee += Math.round(o.total_jpy * STRIPE_FEE_RATE);
      if (o.fulfillment === "pickup") m.pickup++;
      else m.ship++;
    }

    return NextResponse.json({
      ok: true,
      decision: {
        verdict,
        conversion,
        tried,
        asked,
        purchases,
        ec_orders: ecOrders,
        store_sold: storeSold,
        days_to_sell_out: daysToSellOut,
        restock_waiting: waiting,
        main_met: mainMet,
        sub_met: subMet,
      },
      capacity: {
        annual_pace: annualPace,
        max_to_make: maxToMake,
        note: `年間ペース × ${SHELF_LIFE_YEARS}年。これを超える数は使用期限に間に合いません`,
      },
      funding: {
        buyback_rate: BUYBACK_RATE,
        note: "出来高1割の買取り義務があるため、発注数 × 1.1 で資金を見ること",
      },
      monthly: byMonth,
      lots: lots || [],
    });
  } catch (e) {
    console.error("admin fragrance summary error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

/** 店頭で売れた本数（台帳から）。 */
async function countStoreSales(): Promise<number> {
  const { data } = await fdb
    .from("fragrance_stock_events")
    .select("delta")
    .eq("channel", "store")
    .eq("reason", "store_sale");
  return (data || []).reduce((s, r) => s + Math.abs(r.delta || 0), 0);
}
