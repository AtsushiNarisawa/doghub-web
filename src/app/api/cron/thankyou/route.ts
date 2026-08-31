import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendThankYouEmail } from "@/lib/email";
import { buildThankYouLineMessage } from "@/lib/line";
import { sendLinePushAndRecord } from "@/lib/line-store";
import { buildLineLinkUrl } from "@/lib/link-token";
import { isReviewRequestOptedOut } from "@/lib/review-opt-out";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PLAN_NAMES: Record<string, string> = {
  spot: "スポットお預かり",
  "4h": "半日お預かり（4時間）",
  "8h": "1日お預かり（8時間）",
  stay: "宿泊お預かり",
};

export async function GET(req: NextRequest) {
  // Vercel Cron認証チェック
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 前日の日付を計算（JST = UTC+9）
  const now = new Date();
  const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  jstNow.setDate(jstNow.getDate() - 1);
  const yesterdayStr = jstNow.toISOString().split("T")[0];

  // 日帰りプラン（spot, 4h, 8h）: date = 前日
  const { data: dayUseReservations, error: dayUseError } = await supabase
    .from("reservations")
    .select(`
      id, plan, date, checkout_date, customer_id,
      customers!inner(id, last_name, first_name, email, line_id, email_opt_out, email_bounced),
      reservation_dogs(dogs(name))
    `)
    .eq("date", yesterdayStr)
    .in("plan", ["spot", "4h", "8h"])
    .in("status", ["confirmed", "completed"])
    .eq("thankyou_sent", false);

  // 宿泊プラン（stay）: checkout_date = 前日
  const { data: stayReservations, error: stayError } = await supabase
    .from("reservations")
    .select(`
      id, plan, date, checkout_date, customer_id,
      customers!inner(id, last_name, first_name, email, line_id, email_opt_out, email_bounced),
      reservation_dogs(dogs(name))
    `)
    .eq("checkout_date", yesterdayStr)
    .eq("plan", "stay")
    .in("status", ["confirmed", "completed"])
    .eq("thankyou_sent", false);

  if (dayUseError || stayError) {
    console.error("Thankyou query error:", dayUseError || stayError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const reservations = [...(dayUseReservations || []), ...(stayReservations || [])];

  if (reservations.length === 0) {
    return NextResponse.json({
      message: `No reservations to thank for ${yesterdayStr}`,
      sent: 0,
    });
  }

  let sentEmail = 0;
  let sentLine = 0;
  let failed = 0;
  let skipped = 0;
  let skippedOptOut = 0;

  for (const r of reservations) {
    const customer = r.customers as unknown as {
      id: string;
      last_name: string;
      first_name: string;
      email: string;
      line_id: string | null;
      email_opt_out: boolean | null;
      email_bounced: boolean | null;
    };
    if (!customer?.email && !customer?.line_id) {
      skipped++;
      continue;
    }

    // LINE友だち登録済みのお客様はLINEを優先（開封率が高く、二重連絡を避けるためメールは送らない）
    const useLine = !!customer.line_id;

    // メールで送る場合だけ、配信停止（email_opt_out）と不達（email_bounced）を尊重する。
    // 一斉送信は RPC get_winback_recipients が両方を除外しており、この自動お礼だけが素通りしていた。
    // ⚠️ thankyou_sent は false のまま残す＝管理画面から警告つきで手動送信する余地を残すため。
    // ⚠️ フラグは email の話なので LINE 送信には適用しない（LINE側の意思表示はブロックで表れる）。
    if (!useLine && (customer.email_opt_out === true || customer.email_bounced === true)) {
      skippedOptOut++;
      continue;
    }

    const dogNames = (
      r.reservation_dogs as unknown as { dogs: { name: string } | null }[]
    )
      .map((rd) => rd.dogs?.name)
      .filter(Boolean) as string[];

    const customerName = `${customer.last_name} ${customer.first_name}`;
    const planName = PLAN_NAMES[r.plan] || r.plan;

    // isFirstVisit: その顧客の予約が1件のみかどうか
    const { count } = await supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", r.customer_id)
      .in("status", ["confirmed", "completed"]);

    // 口コミ依頼を出すかの最終判定（メール・LINE 共通の唯一の判定箇所）。
    // 初回利用であっても review_request_opt_out のお客様には口コミ依頼を付けない。
    const optedOut = await isReviewRequestOptedOut(supabase, r.customer_id);
    const isFirstVisit = (count ?? 0) <= 1 && !optedOut;

    try {
      // 友だち解除・ブロック後は push が失敗する。LINE優先のままだとお礼が丸ごと消えるため、
      // メールがあれば切り替える（cron/reminder と同じ考え方）。
      let lineFailed = false;
      if (useLine) {
        const ok = await sendLinePushAndRecord(
          customer.line_id!,
          buildThankYouLineMessage(customerName, isFirstVisit),
          "thankyou"
        ).catch(() => false);
        if (ok) {
          sentLine++;
        } else if (customer.email && customer.email_opt_out !== true && customer.email_bounced !== true) {
          console.error(`Thank-you LINE failed for ${r.id}, falling back to email`);
          lineFailed = true;
        } else {
          throw new Error("LINE push failed");
        }
      }
      if (!useLine || lineFailed) {
        // メールで送る＝まだLINEと紐付いていない方。1タップで連携できるリンクを同梱する
        // （初回のお客様は口コミ依頼を優先するため、雛形側で表示されない）。
        await sendThankYouEmail(
          customer.email,
          customerName,
          dogNames,
          planName,
          isFirstVisit,
          buildLineLinkUrl(customer.id)
        );
        sentEmail++;
      }

      // 送信成功後、thankyou_sent = true に更新
      const { error: updateError } = await supabase
        .from("reservations")
        .update({ thankyou_sent: true })
        .eq("id", r.id);

      if (updateError) {
        console.error(`Failed to update thankyou_sent for ${r.id}:`, updateError);
      }
    } catch (err) {
      console.error(`Thank-you ${useLine ? "LINE" : "email"} failed for ${r.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({
    message: `Thank-you messages for ${yesterdayStr}`,
    total: reservations.length,
    sentEmail,
    sentLine,
    failed,
    skipped,
    skippedOptOut,
  });
}
