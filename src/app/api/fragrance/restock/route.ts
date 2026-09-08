import { NextRequest, NextResponse } from "next/server";
import { fdb } from "@/lib/fragrance/db";

// 完売しているときの「入荷したら教えてください」の登録。
//
// 🔴 ここに集まる人数が、次にいくつ作るかを決める材料そのものになる。
// 🔴 フォームには必ず同意の一文を添える
//    （「再入荷や使い方のご案内をお送りします。いつでも停止できます」）＝特定電子メール法の根拠。

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v: unknown, n = 200) => (typeof v === "string" && v ? v.slice(0, n) : null);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 人には見えない入力欄が埋まっていたら bot。成功したように見せて捨てる
    if (body.website) return NextResponse.json({ ok: true });

    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    const productId = String(body.product_id || "").slice(0, 40);
    if (!productId) {
      return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
    }

    // いま販売中／完売しているロットを控えておく（どの回を待っていた人かが分かる）
    const { data: lot } = await fdb
      .from("fragrance_lot_availability")
      .select("lot_id")
      .eq("product_id", productId)
      .in("status", ["on_sale", "sold_out"])
      .limit(1)
      .maybeSingle<{ lot_id: string }>();

    const { error } = await fdb.from("fragrance_restock_requests").insert({
      product_id: productId,
      email,
      lot_id_at_request: lot?.lot_id ?? null,
      utm_source: clip(body.utm_source),
      utm_medium: clip(body.utm_medium),
      utm_campaign: clip(body.utm_campaign),
      referrer: clip(body.referrer, 300),
    });

    if (error) {
      // 23505＝まだ通知していない登録が既にある。二重登録も「受付済み」と同じ顔を返す
      if (error.code === "23505") return NextResponse.json({ ok: true, already: true });
      console.error("fragrance restock insert error:", error);
      return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("fragrance restock error:", e);
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
}
