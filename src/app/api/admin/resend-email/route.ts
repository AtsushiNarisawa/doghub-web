import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
});

const PLAN_NAMES: Record<string, string> = {
  spot: "スポットお預かり", "4h": "半日お預かり（4時間）", "8h": "1日お預かり（8時間）", stay: "宿泊お預かり",
};

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00");
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${days[date.getDay()]}）`;
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("doghub-admin-session");
  if (!session || session.value !== "authorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reservation_id } = await req.json();
    if (!reservation_id) {
      return NextResponse.json({ error: "reservation_id is required" }, { status: 400 });
    }

    const { data: res } = await supabase
      .from("reservations")
      .select("*, customers!inner(last_name, first_name, email, phone), reservation_dogs(dogs(name, breed))")
      .eq("id", reservation_id)
      .single();

    if (!res) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    const customer = res.customers;
    if (!customer?.email) {
      return NextResponse.json({ error: "メールアドレスが登録されていません" }, { status: 400 });
    }

    const dogNames = res.reservation_dogs
      ?.map((rd: { dogs: { name: string; breed: string } | null }) => rd.dogs ? `${rd.dogs.name}（${rd.dogs.breed}）` : null)
      .filter(Boolean)
      .join("、") || "";

    const dateStr = formatDate(res.date);
    const planName = PLAN_NAMES[res.plan] || res.plan;
    const isConfirmed = res.status === "confirmed" || res.status === "completed";

    const subject = isConfirmed
      ? `【DogHub箱根】ご予約確認（${dateStr}）`
      : `【DogHub箱根】予約リクエストを受け付けました（${dateStr}）`;

    const html = `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
        <div style="background:${isConfirmed ? "#f0fdf4" : "#fff7ed"};border:1px solid ${isConfirmed ? "#bbf7d0" : "#fed7aa"};border-radius:10px;padding:14px 16px;margin-bottom:20px;">
          <p style="margin:0;color:${isConfirmed ? "#15803d" : "#c2410c"};font-size:14px;font-weight:600;">
            ${isConfirmed ? "✓ ご予約を承りました" : "⚠ 仮予約（スタッフ確認中）"}
          </p>
        </div>

        <p style="font-size:15px;color:#3C200F;margin:0 0 16px;">${customer.last_name} ${customer.first_name || ""} 様</p>

        <table style="width:100%;border-collapse:collapse;margin:0 0 16px;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;width:80px;">プラン</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${planName}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;">日付</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${dateStr} ${res.checkin_time?.slice(0, 5)}〜</td></tr>
          ${res.checkout_date ? `<tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;">チェックアウト</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${formatDate(res.checkout_date)} / 9:00〜11:00</td></tr>` : ""}
          <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;">ワンちゃん</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${dogNames}</td></tr>
        </table>

        <div style="background:#F8F5F0;border-radius:8px;padding:14px;margin-bottom:16px;">
          <p style="margin:0 0 8px;font-size:13px;color:#3C200F;font-weight:600;">ご来店時のお願い</p>
          <ul style="margin:0;padding:0 0 0 18px;font-size:13px;color:#8F7B65;line-height:1.8;">
            <li>ワクチン証明書（狂犬病・混合）をご持参ください</li>
            <li>本人確認できるもの（免許証等）をご持参ください</li>
            <li>お支払いは現地にて（現金・カード・各種電子マネー・QR決済対応）</li>
          </ul>
        </div>

        <div style="margin-top:10px;display:flex;gap:16px;">
          <a href="https://dog-hub.shop/booking/modify/${reservation_id}" style="color:#B87942;font-size:13px;">予約内容を変更する</a>
          <a href="https://dog-hub.shop/booking/cancel/${reservation_id}" style="color:#888;font-size:13px;">予約をキャンセルする</a>
        </div>

        <div style="margin-top:16px;text-align:center;">
          <a href="https://dog-hub.shop/guide" style="display:inline-block;padding:12px 24px;background:#B87942;color:white;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">はじめてガイドを見る</a>
        </div>

        <div style="margin-top:24px;border-top:1px solid #E5DDD8;padding-top:16px;text-align:center;">
          <p style="margin:0;font-size:13px;color:#3C200F;">DogHub箱根仙石原</p>
          <p style="margin:4px 0 0;font-size:12px;color:#888;">0460-80-0290 | 金〜火 9:00〜17:00</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"DogHub箱根仙石原" <${process.env.GMAIL_USER}>`,
      replyTo: "info@dog-hub.shop",
      to: customer.email,
      subject,
      html,
    });

    return NextResponse.json({ ok: true, sent_to: customer.email });
  } catch (err) {
    console.error("Resend email error:", err);
    return NextResponse.json({ error: "メール送信に失敗しました" }, { status: 500 });
  }
}
