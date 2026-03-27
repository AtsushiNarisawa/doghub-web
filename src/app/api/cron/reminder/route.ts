import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

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

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00");
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${days[date.getDay()]}）`;
}

function buildReminderHtml(reservation: {
  id: string;
  plan: string;
  date: string;
  checkin_time: string;
  checkout_date: string | null;
  notes: string | null;
  customer_name: string;
  dogs: string[];
}) {
  const stayInfo = reservation.plan === "stay" && reservation.checkout_date
    ? `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;">チェックアウト</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${formatDate(reservation.checkout_date)} / 9:00〜11:00</td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:-apple-system,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:24px 16px;">

  <!-- ヘッダー -->
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;background:#3C200F;border-radius:10px;padding:10px 24px;">
      <span style="color:white;font-size:20px;font-weight:700;letter-spacing:2px;">DogHub</span>
    </div>
    <p style="color:#8F7B65;font-size:13px;margin:8px 0 0;">箱根仙石原</p>
  </div>

  <!-- メインカード -->
  <div style="background:white;border-radius:16px;padding:28px 24px;margin-bottom:16px;">
    <h1 style="font-size:18px;font-weight:600;color:#3C200F;margin:0 0 8px;">
      ${reservation.customer_name} 様
    </h1>
    <p style="font-size:14px;color:#888;margin:0 0 20px;">
      ご予約日が近づいてまいりましたのでお知らせいたします。
    </p>

    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;width:100px;">プラン</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${PLAN_NAMES[reservation.plan] || reservation.plan}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;">チェックイン</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${formatDate(reservation.date)} ${reservation.checkin_time.slice(0, 5)}</td>
      </tr>
      ${stayInfo}
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;">ワンちゃん</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${reservation.dogs.join("、")}</td>
      </tr>
    </table>

    <!-- ご来店時のお願い -->
    <div style="margin-top:20px;background:#f7f5f0;border-radius:10px;padding:14px 16px;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#3C200F;">ご来店時のお願い</p>
      <ul style="margin:0;padding:0 0 0 18px;color:#888;font-size:13px;line-height:1.8;">
        <li>ワクチン証明書（狂犬病・混合）をご持参ください</li>
        <li>本人確認できるもの（免許証等）をご持参ください</li>
        <li>お支払いは現地にて（現金・カード・各種電子マネー・QR決済対応）</li>
        <li>引き取り最終時間は17:00です（超過¥1,100/時間）</li>
      </ul>
    </div>

    <!-- はじめてガイドへのリンク -->
    <div style="margin-top:16px;text-align:center;">
      <a href="https://dog-hub.shop/guide" style="display:inline-block;padding:12px 24px;background:#B87942;color:white;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
        はじめてガイドを見る
      </a>
      <p style="margin:8px 0 0;font-size:12px;color:#888;">初めてのご利用の方はぜひご確認ください</p>
    </div>

    <!-- 変更・キャンセルリンク -->
    <div style="margin-top:16px;text-align:center;">
      <a href="https://dog-hub.shop/booking/modify/${reservation.id}" style="color:#B87942;font-size:13px;">予約内容を変更する</a>
      <span style="color:#E5DDD8;margin:0 8px;">|</span>
      <a href="https://dog-hub.shop/booking/cancel/${reservation.id}" style="color:#888;font-size:13px;">キャンセルする</a>
    </div>
  </div>

  <!-- フッター -->
  <div style="text-align:center;padding:16px 0;">
    <p style="margin:0 0 4px;font-size:13px;color:#3C200F;font-weight:600;">DogHub箱根仙石原</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">神奈川県足柄下郡箱根町仙石原928-15</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">TEL: <a href="tel:0460800290" style="color:#B87942;">0460-80-0290</a></p>
    <p style="margin:0;font-size:12px;color:#888;">営業時間: 金〜火 9:00〜17:00（水・木定休）</p>
  </div>
</div>
</body>
</html>`;
}

export async function GET(req: NextRequest) {
  // Vercel Cron認証
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  // 前々日 = 今日 + 2日後の予約を取得（JST基準）
  const jstNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const targetDate = new Date(jstNow);
  targetDate.setDate(targetDate.getDate() + 2);
  const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth()+1).padStart(2,"0")}-${String(targetDate.getDate()).padStart(2,"0")}`;

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select(`
      id, plan, date, checkin_time, checkout_date, notes,
      customers!inner(last_name, first_name, email),
      reservation_dogs(dogs(name))
    `)
    .eq("date", targetDateStr)
    .in("status", ["confirmed", "pending"]);

  if (error) {
    console.error("Reminder query error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!reservations || reservations.length === 0) {
    return NextResponse.json({ message: `No reservations for ${targetDateStr}`, sent: 0 });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  let sent = 0;
  let failed = 0;

  for (const r of reservations) {
    const customer = r.customers as unknown as { last_name: string; first_name: string; email: string };
    if (!customer?.email) continue;

    const dogs = (r.reservation_dogs as unknown as { dogs: { name: string } | null }[])
      .map((rd) => rd.dogs?.name)
      .filter(Boolean) as string[];

    const html = buildReminderHtml({
      id: r.id,
      plan: r.plan,
      date: r.date,
      checkin_time: r.checkin_time,
      checkout_date: r.checkout_date,
      notes: r.notes,
      customer_name: `${customer.last_name} ${customer.first_name}`,
      dogs,
    });

    try {
      await transporter.sendMail({
        from: `"DogHub箱根仙石原" <narisawa@dog-hub.shop>`,
        replyTo: "info@dog-hub.shop",
        to: customer.email,
        subject: `【DogHub箱根】ご予約のリマインド（${formatDate(r.date)}）`,
        html,
      });
      sent++;
    } catch (err) {
      console.error(`Reminder email failed for ${r.id}:`, err);
      failed++;
    }
  }

  return NextResponse.json({
    message: `Reminders for ${targetDateStr}`,
    total: reservations.length,
    sent,
    failed,
  });
}
