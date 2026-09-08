import { NextRequest, NextResponse } from "next/server";
import { fdb } from "@/lib/fragrance/db";
import { requireStripe } from "@/lib/stripe";
import {
  SESSION_EXPIRES_MINUTES,
  HOLD_PROVISIONAL_MINUTES,
  RATE_LIMIT_WINDOW_MINUTES,
  RATE_LIMIT_MAX_HOLDS,
  SHIP_ESTIMATE_MIN_DAYS,
  SHIP_ESTIMATE_MAX_DAYS,
  SALES_OPEN_KEY,
  PICKUP_NOTICE,
  consentText,
  type Fulfillment,
} from "@/lib/fragrance/config";

// Fragrance EC の決済開始。
//
// 手順（この順番を変えないこと）
//   1. 販売スイッチと商品を確認
//   2. 在庫を取り置く（DB の行ロックで直列化＝残り1本に2人が同時に来ても片方しか取れない）
//   3. Stripe の決済ページを作る
//   4. 取り置きの期限を「決済ページの期限＋15分」へ揃える
//
// 🔴 3 で失敗したら必ず 2 を取り消す（取り置きが残ると在庫が幽霊になる）。
// 🔴 4 を省くと、取り置きのほうが先に切れて「最後の1本を2人が買える」窓ができる。
//
// 正本＝fragrance/EC構築計画_2026-09-05.md §5

export const dynamic = "force-dynamic";

type Body = {
  product_id?: string;
  qty?: number;
  fulfillment?: string;
  website?: string; // honeypot
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
};

const clip = (v: unknown, n = 200) =>
  typeof v === "string" && v ? v.slice(0, n) : null;

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim().slice(0, 64);
  return req.headers.get("x-real-ip")?.slice(0, 64) || null;
}

export async function POST(req: NextRequest) {
  let holdId: string | null = null;

  try {
    const body: Body = await req.json();

    // 人には見えない入力欄が埋まっていたら bot。成功したように見せて捨てる
    if (body.website) {
      return NextResponse.json({ ok: false, error: "sold_out" }, { status: 409 });
    }

    const productId = String(body.product_id || "").slice(0, 40);
    const qty = Number(body.qty || 0);
    const fulfillment = String(body.fulfillment || "") as Fulfillment;

    if (!productId || !Number.isInteger(qty) || qty < 1) {
      return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
    }
    if (fulfillment !== "pickup" && fulfillment !== "ship") {
      return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
    }

    // ── 1. 販売スイッチ（ロットの状態と二重の安全弁。デプロイなしで閉じられる） ──
    const { data: setting } = await fdb
      .from("site_settings")
      .select("value")
      .eq("key", SALES_OPEN_KEY)
      .maybeSingle();
    if (setting?.value !== "true") {
      return NextResponse.json({ ok: false, error: "closed" }, { status: 409 });
    }

    // ── 商品 ──
    const { data: product } = await fdb
      .from("fragrance_products")
      .select("id, display_name, size_label, price_jpy, shipping_jpy, shipping_label, max_qty_per_order, active")
      .eq("id", productId)
      .maybeSingle();

    if (!product || !product.active) {
      return NextResponse.json({ ok: false, error: "not_available" }, { status: 409 });
    }
    if (qty > product.max_qty_per_order) {
      return NextResponse.json(
        { ok: false, error: "too_many", max: product.max_qty_per_order },
        { status: 400 },
      );
    }

    // ── 連打制限 ──
    // Vercel の関数はリクエストごとに別プロセスになりうるため、メモリ上のカウンタでは数えられない。
    // 取り置き表の client_ip を数えるのが唯一確実な方法。
    const ip = clientIp(req);
    if (ip) {
      const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();
      const { count } = await fdb
        .from("fragrance_checkout_holds")
        .select("id", { count: "exact", head: true })
        .eq("client_ip", ip)
        .gt("created_at", since);
      if ((count ?? 0) >= RATE_LIMIT_MAX_HOLDS) {
        return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
      }
    }

    // ── 2. 在庫の取り置き ──
    const { data: held, error: holdErr } = await fdb.rpc("fragrance_try_hold", {
      p_product: productId,
      p_qty: qty,
      p_ip: ip,
      p_minutes: HOLD_PROVISIONAL_MINUTES,
    });

    if (holdErr) {
      console.error("fragrance checkout: try_hold failed", holdErr);
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }

    const hold = Array.isArray(held) ? held[0] : held;
    if (!hold?.hold_id) {
      // 販売中のロットが無い／在庫が足りない／他の方が手続き中
      return NextResponse.json({ ok: false, error: "sold_out" }, { status: 409 });
    }
    holdId = hold.hold_id as string;
    const lotId = hold.lot_id as string;
    const unitPrice = Number(hold.unit_price ?? product.price_jpy);

    // ── 3. Stripe の決済ページ ──
    const stripe = requireStripe();
    const shipping = fulfillment === "ship" ? product.shipping_jpy : 0;
    const expectedTotal = unitPrice * qty + shipping;
    const origin = new URL(req.url).origin;
    const expiresAt = Math.floor(Date.now() / 1000) + SESSION_EXPIRES_MINUTES * 60;

    const metadata: Record<string, string> = {
      hold_id: holdId,
      product_id: productId,
      lot_id: lotId,
      qty: String(qty),
      fulfillment,
      expected_total: String(expectedTotal),
      utm_source: clip(body.utm_source) || "",
      utm_medium: clip(body.utm_medium) || "",
      utm_campaign: clip(body.utm_campaign) || "",
      referrer: clip(body.referrer, 300) || "",
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "ja",
      // ダッシュボードで後日コンビニ払いが有効化されても決済画面に出さない。
      // コンビニ払いは「入金待ちのまま完了イベントが来る」経路があり、注文が立たない事故になる。
      // Apple Pay / Google Pay は card に含まれるので、これで失われない。
      payment_method_types: ["card"],
      customer_creation: "if_required",
      phone_number_collection: { enabled: true },
      expires_at: expiresAt,
      client_reference_id: holdId,
      metadata,
      payment_intent_data: { metadata },
      line_items: [
        {
          quantity: qty,
          price_data: {
            currency: "jpy",
            unit_amount: unitPrice, // ¥4,500 は内税＝automatic_tax は使わない
            product_data: {
              name: `${product.display_name} ${product.size_label}`,
            },
          },
        },
      ],
      // 受取方法ごとに決済ページを分ける。
      // 🔴 店頭お渡しを「¥0 の配送料」で表現してはいけない：ホスト型の決済画面は
      //    配送料を出すと住所の入力欄が必ず一緒に出て、消すことができない
      //    （＝店頭で受け取る方にも住所を書かせることになる）。
      ...(fulfillment === "ship"
        ? {
            shipping_address_collection: { allowed_countries: ["JP" as const] },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount" as const,
                  display_name: product.shipping_label,
                  fixed_amount: { amount: product.shipping_jpy, currency: "jpy" },
                  delivery_estimate: {
                    minimum: { unit: "business_day" as const, value: SHIP_ESTIMATE_MIN_DAYS },
                    maximum: { unit: "business_day" as const, value: SHIP_ESTIMATE_MAX_DAYS },
                  },
                },
              },
            ],
          }
        : {}),
      consent_collection: { terms_of_service: "required" },
      custom_text: {
        terms_of_service_acceptance: { message: consentText(fulfillment) },
        ...(fulfillment === "pickup" ? { submit: { message: PICKUP_NOTICE } } : {}),
      },
      success_url: `${origin}/fragrance/thanks?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/fragrance`,
    });

    // ── 4. 取り置きの期限を決済ページに揃える ──
    if (session.expires_at) {
      const { error: bindErr } = await fdb.rpc("fragrance_bind_hold", {
        p_hold: holdId,
        p_session: session.id,
        p_session_expires: new Date(session.expires_at * 1000).toISOString(),
      });
      if (bindErr) console.error("fragrance checkout: bind_hold failed", bindErr);
    }

    return NextResponse.json({
      ok: true,
      url: session.url,
      session_id: session.id,
      total: expectedTotal,
    });
  } catch (e) {
    // Session 作成に失敗したら取り置きを必ず戻す（幽霊在庫を作らない）
    if (holdId) {
      await fdb
        .rpc("fragrance_release_hold", { p_hold: holdId })
        .then(undefined, () => undefined);
    }
    console.error("fragrance checkout error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
