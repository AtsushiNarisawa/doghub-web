import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import type Stripe from "stripe";
import { fdb } from "@/lib/fragrance/db";
import { requireStripe, isLiveKey } from "@/lib/stripe";
import { confirmFromSession, sendConfirmIfNeeded } from "@/lib/fragrance/orders";

// Stripe からの通知を受ける口。
//
// 🔴 ここが Fragrance EC の心臓部。設計上の要点は4つ。
//
// 1. 生のリクエスト本文で署名を検証する（req.text()）。JSON に変換すると署名が合わなくなる。
//    署名が合わないときだけ 400 を返す。それ以外は必ず 200 か 500。
//    ※ 正当な通知に 4xx を返すと Stripe は3日間再送し続け、その後エンドポイントを止めてしまう。
//
// 2. 二重処理の判定は「受信したか」ではなく『処理し終えたか（processed_at）』で行う。
//    受信した時点で弾いてしまうと、1回目の処理が途中で失敗したとき再送されても素通りし、
//    「代金は受け取ったのに注文が存在しない」状態が永久に残る。
//
// 3. 注文を作ったらすぐ 200 を返し、メールは応答のあとで送る（after）。
//    Stripe はお客様を完了ページへ飛ばす前に、この応答を最大10秒待つ。
//    メール送信を待たせると、お客様が決済画面で止まって見える。
//
// 4. 受取方法・住所の取り出し方は Stripe の API バージョンに依存する（lib/stripe.ts に集約）。
//
// 🔴 export const runtime は書かない（既定の Node.js のままにする）。
//    Edge にすると署名検証の同期版が使えなくなる。
//
// 登録 URL は https://dog-hub.shop/api/fragrance/stripe-webhook（www は 301 されて失敗扱いになる）
// 正本＝fragrance/EC構築計画_2026-09-05.md §5

export const dynamic = "force-dynamic";

const HANDLED = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "charge.refunded",
  "charge.dispute.created",
]);

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) {
    return NextResponse.json({ error: "not_configured" }, { status: 400 });
  }

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = requireStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    console.error("fragrance webhook: signature verification failed", e);
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  // ── 受信記録と冪等 ──
  const { error: insertErr } = await fdb
    .from("fragrance_stripe_events")
    .insert({ event_id: event.id, type: event.type, livemode: event.livemode });

  if (insertErr) {
    if (insertErr.code !== "23505") {
      console.error("fragrance webhook: event record failed", insertErr);
      return NextResponse.json({ error: "record_failed" }, { status: 500 });
    }
    // 既に受け取っている。処理し終えているかどうかで扱いを変える
    const { data: prior } = await fdb
      .from("fragrance_stripe_events")
      .select("processed_at, received_at")
      .eq("event_id", event.id)
      .maybeSingle();

    if (prior?.processed_at) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    // 未処理。ただし受信直後（60秒以内）なら別便が処理中とみなして退避する
    const age = prior?.received_at ? Date.now() - new Date(prior.received_at).getTime() : Infinity;
    if (age < 60_000) {
      return NextResponse.json({ received: true, in_progress: true });
    }
    // 60秒以上たっても未処理＝前回失敗している。もう一度処理する
  }

  // ── テストと本番の取り違え防止 ──
  // 正当な通知なので 400 にはせず、記録だけして 200 を返す
  if (event.livemode !== isLiveKey()) {
    await markProcessed(event.id, "livemode mismatch（記録のみ）");
    return NextResponse.json({ received: true, ignored: "livemode_mismatch" });
  }

  if (!HANDLED.has(event.type)) {
    await markProcessed(event.id, null);
    return NextResponse.json({ received: true, ignored: "unhandled_type" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const lean = event.data.object as Stripe.Checkout.Session;
        // イベントの中身をそのまま信じず、ID で取り直す（Stripe 公式の推奨）
        const session = await requireStripe().checkout.sessions.retrieve(lean.id);

        if (session.payment_status !== "paid") {
          await markProcessed(event.id, `payment_status=${session.payment_status}（記録のみ）`);
          return NextResponse.json({ received: true, ignored: "not_paid" });
        }

        const result = await confirmFromSession(session, "webhook");
        await markProcessed(event.id, result.created ? null : `skipped: ${result.reason}`);

        if (result.created) {
          // 応答を返したあとにメールを送る（お客様を完了画面で待たせない）
          after(async () => {
            try {
              await sendConfirmIfNeeded(result.orderId);
            } catch (e) {
              console.error("fragrance webhook: after() mail failed", e);
            }
          });
        }
        return NextResponse.json({ received: true, created: result.created });
      }

      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const holdId = session.metadata?.hold_id;
        if (holdId) {
          await fdb.rpc("fragrance_release_hold", { p_hold: holdId });
        }
        await markProcessed(event.id, null);
        return NextResponse.json({ received: true, released: !!holdId });
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (pi) {
          // 在庫は自動では戻さない。現物が返ってきてから管理画面で戻す
          await fdb
            .from("fragrance_orders")
            .update({ status: "refunded", refunded_at: new Date().toISOString() })
            .eq("stripe_payment_intent_id", pi);
        }
        await markProcessed(event.id, null);
        return NextResponse.json({ received: true });
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const pi =
          typeof dispute.payment_intent === "string"
            ? dispute.payment_intent
            : dispute.payment_intent?.id;
        if (pi) {
          await fdb
            .from("fragrance_orders")
            .update({ status: "disputed" })
            .eq("stripe_payment_intent_id", pi);
        }
        await markProcessed(event.id, null);
        // 証拠提出の期限があるため、スタッフへは応答後すぐ知らせる
        after(async () => {
          try {
            const { sendFragranceMail, SELLER } = await import("@/lib/fragrance-email");
            await sendFragranceMail({
              to: SELLER.from,
              subject: "【要対応】Fragrance：カード会社への申立て（チャージバック）が発生しました",
              text:
                `決済 ${pi} について、カード会社経由の申立てがありました。\n` +
                `証拠の提出には期限があります。Stripe の管理画面をご確認ください。\n` +
                `https://dashboard.stripe.com/disputes\n`,
              isTest: !event.livemode,
            });
          } catch (e) {
            console.error("fragrance webhook: dispute notice failed", e);
          }
        });
        return NextResponse.json({ received: true });
      }
    }
  } catch (e) {
    // 失敗を記録して 500 を返す＝Stripe が再送し、processed_at が空なので再処理される
    console.error("fragrance webhook: handler failed", event.type, e);
    await fdb
      .from("fragrance_stripe_events")
      .update({ error: String(e).slice(0, 800) })
      .eq("event_id", event.id);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function markProcessed(eventId: string, note: string | null) {
  await fdb
    .from("fragrance_stripe_events")
    .update({ processed_at: new Date().toISOString(), error: note })
    .eq("event_id", eventId);
}
