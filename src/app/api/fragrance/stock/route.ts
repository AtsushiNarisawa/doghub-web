import { NextResponse } from "next/server";
import { fdb } from "@/lib/fragrance/db";
import { SALES_OPEN_KEY } from "@/lib/fragrance/config";

// 商品と残数。ページが「発売前／販売中／完売」のどれを出すかを決める唯一の情報源。
//
// 🔴 返すのは数字と状態だけ。注文の情報は一切返さない。
// 🔴 残数は「オンライン分」であることを画面側で必ず明記する
//    （店頭に在庫があるのに「残り◯本」とだけ書くと、実態より少なく見せる表示になる）。

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [{ data: setting }, { data: products }, { data: availability }] = await Promise.all([
      fdb.from("site_settings").select("value").eq("key", SALES_OPEN_KEY).maybeSingle(),
      fdb
        .from("fragrance_products")
        .select("id, display_name, series_name, size_label, price_jpy, shipping_jpy, shipping_label, max_qty_per_order, sort_order")
        .eq("active", true)
        .order("sort_order"),
      fdb
        .from("fragrance_lot_availability")
        .select("product_id, lot_no, status, is_paused, ec_available")
        .in("status", ["on_sale", "sold_out"]),
    ]);

    const salesOpen = setting?.value === "true";

    const items = (products || []).map((p) => {
      const lots = (availability || []).filter((a) => a.product_id === p.id);
      const onSale = lots.find((l) => l.status === "on_sale" && !l.is_paused);
      const available = onSale ? Math.max(0, Number(onSale.ec_available ?? 0)) : 0;

      // 販売中のロットがあり、スイッチが開いていて、残数があるときだけ買える
      const state: "before_sale" | "on_sale" | "sold_out" = !salesOpen
        ? "before_sale"
        : onSale && available > 0
          ? "on_sale"
          : lots.some((l) => l.status === "sold_out" || (l.status === "on_sale" && available <= 0))
            ? "sold_out"
            : "before_sale";

      return {
        id: p.id,
        name: p.display_name,
        series: p.series_name,
        size: p.size_label,
        price: p.price_jpy,
        shipping: p.shipping_jpy,
        shipping_label: p.shipping_label,
        max_qty: p.max_qty_per_order,
        state,
        available: state === "on_sale" ? available : 0,
      };
    });

    return NextResponse.json(
      { ok: true, sales_open: salesOpen, items },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
    );
  } catch (e) {
    console.error("fragrance stock error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
