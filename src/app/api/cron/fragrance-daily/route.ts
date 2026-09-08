import { NextRequest, NextResponse } from "next/server";
import { fdb } from "@/lib/fragrance/db";
import { getStripe } from "@/lib/stripe";
import { confirmFromSession, sendConfirmIfNeeded } from "@/lib/fragrance/orders";
import { sendFragranceMail, SELLER } from "@/lib/fragrance-email";
import {
  ADDRESS_MASK_AFTER_DAYS,
  PICKUP_HOLD_DAYS,
} from "@/lib/fragrance/config";

// 毎朝の見回り（10:30 JST）。
//
// 既存の予約リマインド・お礼メールは 10:00 に動くので、30分ずらして
// Gmail に同時に押し寄せないようにしてある。
//
// やること
//   1. 期限切れの取り置きを片付ける（表示上は自動で戻っているが、帳簿を整える）
//   2. 送れていない注文確認メールを送り直す
//   3. Stripe と突き合わせる ── これが最後の安全弁
//   4. 店頭のお渡し待ちが長い方にご連絡
//   5. 発送から90日たった住所を伏せる
//   6. 店頭の本数入力が抜けている日をスタッフに知らせる
//
// 🔴 3 がなぜ要るか：Stripe は「お客様が完了ページに戻る保証はない」と明記している。
//    通知（Webhook）も完了ページも届かなかった注文は、これが無いと永久に存在しないままになる。

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report: Record<string, unknown> = {};
  const now = Date.now();

  // ── 1. 期限切れの取り置き ──
  try {
    const { data } = await fdb
      .from("fragrance_checkout_holds")
      .update({ status: "released" })
      .eq("status", "active")
      .lt("expires_at", new Date().toISOString())
      .select("id");
    report.released_holds = data?.length ?? 0;
  } catch (e) {
    report.released_holds_error = String(e).slice(0, 200);
  }

  // ── 2. 送れていない注文確認メール ──
  try {
    const { data } = await fdb
      .from("fragrance_orders")
      .select("id")
      .is("confirm_email_sent_at", null)
      .in("status", ["paid", "oversold", "picked_up", "shipped"])
      .limit(20);
    let resent = 0;
    for (const o of (data || []) as { id: string }[]) {
      try {
        await sendConfirmIfNeeded(o.id);
        resent++;
      } catch (e) {
        console.error("fragrance-daily: resend failed", o.id, e);
      }
    }
    report.confirm_resent = resent;
  } catch (e) {
    report.confirm_resent_error = String(e).slice(0, 200);
  }

  // ── 3. Stripe との突合（最後の安全弁） ──
  try {
    const stripe = getStripe();
    if (stripe) {
      const since = Math.floor((now - 48 * 3600_000) / 1000);
      const sessions = await stripe.checkout.sessions.list({
        status: "complete",
        created: { gte: since },
        limit: 100,
      });
      let recovered = 0;
      for (const s of sessions.data) {
        if (s.payment_status !== "paid") continue;
        const { data: exists } = await fdb
          .from("fragrance_orders")
          .select("id")
          .eq("stripe_session_id", s.id)
          .maybeSingle();
        if (exists) continue;

        const full = await stripe.checkout.sessions.retrieve(s.id);
        const result = await confirmFromSession(full, "cron");
        if (result.created) {
          recovered++;
          await sendConfirmIfNeeded(result.orderId);
          await notifyStaff(
            "【要確認】Fragrance：通知が届かなかった注文を拾いました",
            `決済 ${s.id} が Stripe にあるのに注文として記録されていませんでした。\n` +
              `毎朝の突合で注文を作成し、お客様には確認メールを送りました。\n` +
              `Stripe の通知設定（Webhook）が止まっていないかご確認ください。\n`,
          );
        }
      }
      report.recovered_orders = recovered;
    } else {
      report.stripe = "未設定（キーが入るまでこの確認は動きません）";
    }
  } catch (e) {
    report.reconcile_error = String(e).slice(0, 300);
  }

  // ── 4. 店頭のお渡し待ちが長い方 ──
  try {
    const cutoff = new Date(now - 60 * 86400_000).toISOString();
    const { data } = await fdb
      .from("fragrance_orders")
      .select("id, order_no, email, customer_name, created_at")
      .eq("fulfillment", "pickup")
      .eq("status", "paid")
      .is("pickup_reminder_sent_at", null)
      .lt("created_at", cutoff)
      .limit(20);

    let reminded = 0;
    for (const o of (data || []) as {
      id: string;
      order_no: string;
      email: string;
      customer_name: string | null;
    }[]) {
      try {
        await sendFragranceMail({
          to: o.email,
          subject: "お預かりしているクリームのこと",
          text:
            `${o.customer_name ? `${o.customer_name} 様` : "お客様"}\n\n` +
            `店頭でのお受け取りをお選びいただいたハンドクリームを、受付でお預かりしています。\n` +
            `（ご注文番号 ${o.order_no}）\n\n` +
            `お受け取りの期限は、ご決済日から${PICKUP_HOLD_DAYS}日以内とさせていただいております。\n` +
            `ご来店が難しいようでしたら、配送に切り替えることもできますので、\n` +
            `このメールにご返信ください。\n\n` +
            `${SELLER.displayName}\n${SELLER.address}\n電話 ${SELLER.tel}\n`,
        });
        await fdb
          .from("fragrance_orders")
          .update({ pickup_reminder_sent_at: new Date().toISOString() })
          .eq("id", o.id);
        reminded++;
      } catch (e) {
        console.error("fragrance-daily: pickup reminder failed", o.id, e);
      }
    }
    report.pickup_reminders = reminded;
  } catch (e) {
    report.pickup_reminders_error = String(e).slice(0, 200);
  }

  // ── 5. 住所を伏せる ──
  try {
    const cutoff = new Date(now - ADDRESS_MASK_AFTER_DAYS * 86400_000).toISOString();
    const { data } = await fdb
      .from("fragrance_orders")
      .update({ shipping_address: null, address_masked_at: new Date().toISOString() })
      .eq("status", "shipped")
      .lt("shipped_at", cutoff)
      .is("address_masked_at", null)
      .select("id");
    report.addresses_masked = data?.length ?? 0;
  } catch (e) {
    report.addresses_masked_error = String(e).slice(0, 200);
  }

  // ── 6. 店頭の入力が抜けている日 ──
  // 販売中のロットがあるのに、昨日の入力が無ければ知らせる。
  // 入力忘れは在庫の数がずれる最大の原因で、放っておくと EC の残数表示が嘘になる。
  try {
    const { data: onSale } = await fdb
      .from("fragrance_lots")
      .select("id")
      .eq("status", "on_sale")
      .limit(1);

    if (onSale?.length) {
      const yesterday = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(
        new Date(now - 86400_000),
      );
      const { data: entry } = await fdb
        .from("fragrance_tester_counts")
        .select("date")
        .eq("date", yesterday)
        .maybeSingle();

      if (!entry) {
        await notifyStaff(
          "Fragrance：昨日の店頭の記録が入っていません",
          `${yesterday} の「店頭で売れた本数」と「試香された人数」が未入力です。\n` +
            `管理画面の商品タブから入力してください。\n` +
            `この記録は在庫の数と、増産の判断に使う「試香→購入率」の分母になります。\n\n` +
            `https://dog-hub.shop/admin/fragrance\n`,
        );
        report.store_entry_missing = yesterday;
      }
    }
  } catch (e) {
    report.store_entry_error = String(e).slice(0, 200);
  }

  return NextResponse.json({ ok: true, ...report });
}

async function notifyStaff(subject: string, text: string) {
  try {
    await sendFragranceMail({ to: SELLER.from, subject, text });
  } catch (e) {
    console.error("fragrance-daily: staff notice failed", e);
  }
}
