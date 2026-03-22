import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 容量を更新する共通関数
async function updateCapacity(date: string, column: string, delta: number) {
  const { data: existing } = await supabase
    .from("daily_capacity")
    .select("*")
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("daily_capacity")
      .update({ [column]: Math.max(0, existing[column] + delta) })
      .eq("date", date);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reservation_id } = await req.json();

    if (!reservation_id) {
      return NextResponse.json({ error: "予約IDが必要です" }, { status: 400 });
    }

    // 予約を取得（容量戻し・通知に必要な情報をすべて取得）
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("id, status, date, plan, checkout_date, checkin_time, dog_count, checkout_extension_until, customers(last_name, first_name, phone, email)")
      .eq("id", reservation_id)
      .single();

    if (fetchError || !reservation) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    if (reservation.status === "cancelled") {
      return NextResponse.json({ error: "この予約は既にキャンセルされています" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    if (reservation.date < today) {
      return NextResponse.json({ error: "過去の予約はキャンセルできません" }, { status: 400 });
    }

    // ステータスをcancelledに更新
    const { error: updateError } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", reservation_id);

    if (updateError) {
      console.error("Cancel error:", updateError);
      return NextResponse.json({ error: "キャンセル処理に失敗しました" }, { status: 500 });
    }

    // daily_capacity を戻す（頭数分 × 全日程）
    const dogCount = reservation.dog_count || 1;
    const capacityColumn = reservation.plan === "stay" ? "stay_booked" : "day_booked";
    const datesToRelease: string[] = [];

    if (reservation.plan === "stay" && reservation.checkout_date) {
      const d = new Date(reservation.date);
      const end = new Date(reservation.checkout_date);
      while (d < end) {
        datesToRelease.push(d.toISOString().split("T")[0]);
        d.setDate(d.getDate() + 1);
      }
    } else {
      datesToRelease.push(reservation.date);
    }

    for (const date of datesToRelease) {
      await updateCapacity(date, capacityColumn, -dogCount);
    }

    // 宿泊CO日のday_bookedも戻す（CO日は常にday_bookedに加算されているため）
    if (reservation.plan === "stay" && reservation.checkout_date) {
      await updateCapacity(reservation.checkout_date, "day_booked", -dogCount);
    }

    // キャンセル通知メール（お客様 + スタッフ）
    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
        });

        const customer = reservation.customers as unknown as { last_name: string; first_name: string; phone: string; email: string } | null;
        const PLAN_NAMES: Record<string, string> = {
          spot: "スポット利用", "4h": "半日お預かり", "8h": "1日お預かり", stay: "宿泊お預かり",
        };
        const days = ["日", "月", "火", "水", "木", "金", "土"];
        const d = new Date(reservation.date);
        const dateStr = `${d.getMonth() + 1}/${d.getDate()}（${days[d.getDay()]}）`;

        const emails = [];

        // お客様へのキャンセル完了メール
        if (customer?.email) {
          emails.push(
            transporter.sendMail({
              from: `"DogHub箱根仙石原" <narisawa@dog-hub.shop>`,
              replyTo: "info@dog-hub.shop",
              to: customer.email,
              subject: `【DogHub箱根】ご予約キャンセルのご確認（${dateStr}）`,
              html: `<!DOCTYPE html>
<html lang="ja">
<body style="margin:0;padding:0;background:#F7F7F7;font-family:'Helvetica Neue',Arial,'Hiragino Sans',sans-serif;">
<div style="max-width:480px;margin:0 auto;padding:24px 16px;">
  <div style="text-align:center;padding:24px 0 16px;">
    <p style="margin:0;font-size:20px;color:#3C200F;font-weight:600;">DogHub箱根仙石原</p>
  </div>
  <div style="background:white;border-radius:16px;padding:28px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
    <p style="margin:0 0 20px;font-size:15px;color:#3C200F;line-height:1.8;">
      ${customer.last_name}${customer.first_name || ""} 様<br><br>
      以下のご予約のキャンセルを承りました。
    </p>
    <div style="padding:16px;background:#F8F5F0;border-radius:10px;margin:0 0 20px;">
      <table style="font-size:14px;color:#3C200F;border-collapse:collapse;width:100%;">
        <tr><td style="padding:4px 12px 4px 0;color:#888;">プラン</td><td>${PLAN_NAMES[reservation.plan] || reservation.plan}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#888;">日程</td><td>${dateStr} ${reservation.checkin_time}</td></tr>
        ${reservation.checkout_date ? `<tr><td style="padding:4px 12px 4px 0;color:#888;">チェックアウト</td><td>${new Date(reservation.checkout_date).getMonth() + 1}/${new Date(reservation.checkout_date).getDate()}</td></tr>` : ""}
      </table>
    </div>
    <p style="margin:0 0 20px;font-size:14px;color:#888;line-height:1.7;">
      またのご利用をお待ちしております。<br>
      ご不明な点がございましたらお気軽にご連絡ください。
    </p>
    <div style="text-align:center;">
      <a href="https://dog-hub.shop/booking" style="display:inline-block;padding:12px 32px;border:1px solid #B87942;color:#B87942;border-radius:8px;text-decoration:none;font-size:14px;">再度ご予約はこちら</a>
    </div>
  </div>
  <div style="text-align:center;padding:20px 0;">
    <p style="margin:0 0 4px;font-size:13px;color:#3C200F;font-weight:600;">DogHub箱根仙石原</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">神奈川県足柄下郡箱根町仙石原928-15</p>
    <p style="margin:0 0 4px;font-size:12px;color:#888;">TEL: <a href="tel:0460800290" style="color:#B87942;">0460-80-0290</a></p>
    <p style="margin:0;font-size:12px;color:#888;">営業時間: 金〜火 9:00〜17:00（水・木定休）</p>
  </div>
</div>
</body>
</html>`,
            })
          );
        }

        // スタッフへのキャンセル通知メール
        emails.push(
          transporter.sendMail({
            from: `"DogHub予約システム" <narisawa@dog-hub.shop>`,
            to: "narisawa@dog-hub.shop",
            subject: `【キャンセル】${customer?.last_name || ""}様 ${dateStr} ${reservation.checkin_time} ${dogCount}頭`,
            html: `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
            <h2 style="color:#c2410c;">予約がキャンセルされました</h2>
            <table style="font-size:14px;border-collapse:collapse;">
              <tr><td style="padding:6px 12px 6px 0;color:#888;">お客様</td><td>${customer?.last_name || ""} ${customer?.first_name || ""}</td></tr>
              <tr><td style="padding:6px 12px 6px 0;color:#888;">電話</td><td>${customer?.phone || ""}</td></tr>
              <tr><td style="padding:6px 12px 6px 0;color:#888;">プラン</td><td>${PLAN_NAMES[reservation.plan] || reservation.plan}</td></tr>
              <tr><td style="padding:6px 12px 6px 0;color:#888;">日程</td><td>${dateStr} ${reservation.checkin_time}</td></tr>
              <tr><td style="padding:6px 12px 6px 0;color:#888;">頭数</td><td>${dogCount}頭</td></tr>
            </table>
            <p style="margin-top:16px;"><a href="https://dog-hub.shop/admin/reservations/${reservation_id}" style="color:#B87942;">管理画面で確認する</a></p>
          </div>`,
          })
        );

        await Promise.allSettled(emails);
      }
    } catch (emailErr) {
      console.error("Cancel notification email error:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Cancel API error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
