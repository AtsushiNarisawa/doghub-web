import { NextRequest, NextResponse } from "next/server";
import { fdb } from "@/lib/fragrance/db";
import { verifyAdmin, actorLabel } from "@/lib/admin-auth";

// ロット（1回の製造）の登録と、販売の開始・停止。
//
// 🔴 販売を開始できるロットは、同じ商品につき常に1つだけ。
//    在庫を取り置く関数が「販売中のロットのうち先頭のもの」しか見ないため、
//    2つ同時に開けると片方の在庫が売られないまま残る。
//    データベース側にも同じ制約（部分一意インデックス）を入れてあるが、
//    ここでも先に他のロットを閉じてから開くようにして、エラーで弾かれる前に整える。

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: lots }, { data: availability }, { data: products }] = await Promise.all([
    fdb
      .from("fragrance_lots")
      .select(
        "id, product_id, lot_no, oem_lot_code, qty_received, qty_internal, qty_ec_alloc, status, " +
          "is_paused, ordered_on, arrived_on, expires_on, lead_time_days, on_sale_at, sold_out_at",
      )
      .order("lot_no", { ascending: false }),
    fdb.from("fragrance_lot_availability").select("lot_id, ec_available, store_remaining"),
    fdb.from("fragrance_products").select("id, display_name, size_label, price_jpy, active").order("sort_order"),
  ]);

  return NextResponse.json({
    ok: true,
    lots: lots || [],
    availability: availability || [],
    products: products || [],
  });
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const action = String(body.action || "");

    switch (action) {
      // ── 着荷したロットを登録する ──
      case "create": {
        const productId = String(body.product_id || "");
        const lotNo = Number(body.lot_no || 0);
        const received = Number(body.qty_received || 0);
        const internal = Number(body.qty_internal || 0);
        const ecAlloc = Number(body.qty_ec_alloc || 0);

        if (!productId || !lotNo || received <= 0) {
          return NextResponse.json({ error: "bad_request" }, { status: 400 });
        }
        if (internal + ecAlloc > received) {
          return NextResponse.json(
            { error: "alloc_exceeds_received", detail: "予備＋EC枠が着荷数を超えています" },
            { status: 400 },
          );
        }

        const { data, error } = await fdb
          .from("fragrance_lots")
          .insert({
            product_id: productId,
            lot_no: lotNo,
            oem_lot_code: String(body.oem_lot_code || "").slice(0, 60) || null,
            qty_received: received,
            qty_internal: internal,
            qty_ec_alloc: ecAlloc,
            status: "received",
            arrived_on: body.arrived_on || null,
            expires_on: body.expires_on || null,
            lead_time_days: body.lead_time_days ? Number(body.lead_time_days) : null,
          })
          .select("id")
          .single();

        if (error) {
          console.error("admin fragrance lots create error:", error);
          return NextResponse.json({ error: "create_failed", detail: error.message }, { status: 400 });
        }
        return NextResponse.json({ ok: true, lot_id: data.id });
      }

      // ── 販売開始 ──
      case "open": {
        const lotId = String(body.lot_id || "");
        if (!lotId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

        const { data: lot } = await fdb
          .from("fragrance_lots")
          .select("id, product_id, status, qty_ec_alloc")
          .eq("id", lotId)
          .maybeSingle<{ id: string; product_id: string; status: string; qty_ec_alloc: number }>();
        if (!lot) return NextResponse.json({ error: "not_found" }, { status: 404 });

        // 着荷していないロットは開けない（着荷前に代金を受け取らないため）
        if (lot.status === "planned") {
          return NextResponse.json(
            { error: "not_received", detail: "着荷の登録が先です（着荷前に代金は受け取りません）" },
            { status: 400 },
          );
        }

        // 同じ商品の他の販売中ロットを閉じてから開く
        await fdb
          .from("fragrance_lots")
          .update({ status: "closed" })
          .eq("product_id", lot.product_id)
          .eq("status", "on_sale")
          .neq("id", lotId);

        const { error } = await fdb
          .from("fragrance_lots")
          .update({ status: "on_sale", is_paused: false, on_sale_at: new Date().toISOString() })
          .eq("id", lotId);
        if (error) {
          return NextResponse.json({ error: "open_failed", detail: error.message }, { status: 400 });
        }
        return NextResponse.json({ ok: true });
      }

      // ── 一時停止／再開（数が合わないときに止める） ──
      case "pause": {
        const lotId = String(body.lot_id || "");
        const paused = body.paused !== false;
        await fdb.from("fragrance_lots").update({ is_paused: paused }).eq("id", lotId);
        return NextResponse.json({ ok: true, paused });
      }

      // ── 手動で完売にする／閉じる ──
      case "close": {
        const lotId = String(body.lot_id || "");
        const status = body.status === "sold_out" ? "sold_out" : "closed";
        await fdb
          .from("fragrance_lots")
          .update({
            status,
            ...(status === "sold_out" ? { sold_out_at: new Date().toISOString() } : {}),
          })
          .eq("id", lotId);
        return NextResponse.json({ ok: true, status });
      }

      // ── 店頭枠 → EC枠 の振替（店頭が余っているときに EC へ回す） ──
      case "move_alloc": {
        const lotId = String(body.lot_id || "");
        const n = Number(body.qty || 0);
        if (!lotId || !Number.isInteger(n) || n === 0) {
          return NextResponse.json({ error: "bad_request" }, { status: 400 });
        }
        const { data: lot } = await fdb
          .from("fragrance_lots")
          .select("qty_received, qty_internal, qty_ec_alloc")
          .eq("id", lotId)
          .maybeSingle<{ qty_received: number; qty_internal: number; qty_ec_alloc: number }>();
        if (!lot) return NextResponse.json({ error: "not_found" }, { status: 404 });

        const next = lot.qty_ec_alloc + n;
        if (next < 0 || lot.qty_internal + next > lot.qty_received) {
          return NextResponse.json(
            { error: "out_of_range", detail: "着荷数を超える、またはマイナスになります" },
            { status: 400 },
          );
        }
        await fdb.from("fragrance_lots").update({ qty_ec_alloc: next }).eq("id", lotId);
        // 振替も台帳に残す（あとで「なぜ数が動いたか」を追えるように）
        await fdb.from("fragrance_stock_events").insert({
          lot_id: lotId,
          channel: "internal",
          delta: n,
          reason: "alloc_move",
          actor: actorLabel(admin),
          note: `店頭枠→EC枠 の振替（${n > 0 ? "+" : ""}${n}）`,
        });
        return NextResponse.json({ ok: true, qty_ec_alloc: next });
      }

      default:
        return NextResponse.json({ error: "unknown_action" }, { status: 400 });
    }
  } catch (e) {
    console.error("admin fragrance lots error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
