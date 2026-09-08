import { NextRequest, NextResponse } from "next/server";
import { fdb } from "@/lib/fragrance/db";
import { verifyAdmin, actorLabel } from "@/lib/admin-auth";

// 在庫の動きを台帳に1行足す。
//
// 使う場面
//   ・閉店時に「店頭で◯本売れた」を入れる（毎日・これが無いと店頭とECの数が合わなくなる）
//   ・贈答・取材・レビュー用に出した
//   ・破損・棚卸のズレを直した
//
// 🔴 在庫の数そのものは書き換えない。動きだけを積んで、現在数はいつも計算で出す。
//    こうしておくと「なぜこの数になったか」を後から必ず追える。

export const dynamic = "force-dynamic";

const REASONS = new Set([
  "store_sale",   // 店頭で売れた
  "store_void",   // 店頭の取り消し
  "gift",         // 贈答
  "sample",       // 取材・レビュー用
  "damaged",      // 破損
  "adjust",       // 棚卸の調整
]);

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const lotId = String(body.lot_id || "");
    const reason = String(body.reason || "");
    const qty = Number(body.qty || 0);

    if (!lotId || !REASONS.has(reason) || !Number.isInteger(qty) || qty === 0) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    // 出ていくもの（売れた・贈った・壊れた）はマイナス、戻るものはプラス
    const outgoing = ["store_sale", "gift", "sample", "damaged"].includes(reason);
    const delta = reason === "adjust" ? qty : outgoing ? -Math.abs(qty) : Math.abs(qty);

    // 店頭で売れた分は店頭枠から、贈答・破損は予備枠（internal）から引く
    const channel =
      reason === "store_sale" || reason === "store_void"
        ? "store"
        : reason === "adjust"
          ? String(body.channel || "store")
          : "internal";

    const { error } = await fdb.from("fragrance_stock_events").insert({
      lot_id: lotId,
      channel,
      delta,
      reason,
      actor: actorLabel(admin),
      note: String(body.note || "").slice(0, 200) || null,
    });

    if (error) {
      console.error("admin fragrance stock-move error:", error);
      return NextResponse.json({ error: "insert_failed", detail: error.message }, { status: 400 });
    }

    const { data: avail } = await fdb
      .from("fragrance_lot_availability")
      .select("ec_available, store_remaining")
      .eq("lot_id", lotId)
      .maybeSingle();

    return NextResponse.json({ ok: true, delta, availability: avail });
  } catch (e) {
    console.error("admin fragrance stock-move error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
