import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const STAFF_EMAILS = [
  process.env.GMAIL_USER,
  "koi02121957@gmail.com",
].filter(Boolean) as string[];

const PLAN_NAMES: Record<string, string> = {
  spot: "スポットお預かり",
  "4h": "半日お預かり（4時間）",
  "8h": "1日お預かり（8時間）",
  stay: "宿泊お預かり",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reservationId, checkin_time, checkout_date, notes } = body;

    if (!reservationId) {
      return NextResponse.json({ error: "reservationId is required" }, { status: 400 });
    }

    // 予約を取得
    const { data: reservation, error: fetchErr } = await supabase
      .from("reservations")
      .select("*, customers(last_name, first_name, email, phone), reservation_dogs(dogs(name))")
      .eq("id", reservationId)
      .single();

    if (fetchErr || !reservation) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    if (reservation.status === "cancelled") {
      return NextResponse.json({ error: "キャンセル済みの予約は変更できません" }, { status: 400 });
    }

    // 変更内容を構築
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const changes: string[] = [];

    if (checkin_time && checkin_time !== reservation.checkin_time) {
      const oldTime = reservation.checkin_time?.slice(0, 5);
      updates.checkin_time = checkin_time;
      changes.push(`到着予定時間: ${oldTime} → ${checkin_time}`);
    }

    if (checkout_date && checkout_date !== reservation.checkout_date) {
      updates.checkout_date = checkout_date;
      changes.push(`チェックアウト日: ${reservation.checkout_date} → ${checkout_date}`);
    }

    if (notes !== undefined && notes !== reservation.notes) {
      updates.notes = notes;
      changes.push("備考を更新");
    }

    if (changes.length === 0) {
      return NextResponse.json({ ok: true, message: "変更なし" });
    }

    // 更新
    const { error: updateErr } = await supabase
      .from("reservations")
      .update(updates)
      .eq("id", reservationId);

    if (updateErr) {
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    // スタッフ通知メール
    const customer = reservation.customers;
    const dogNames = reservation.reservation_dogs
      ?.map((rd: { dogs: { name: string } | null }) => rd.dogs?.name)
      .filter(Boolean)
      .join("、") || "";

    const staffSubject = `📝 予約変更: ${customer?.last_name}${customer?.first_name || ""} 様（${PLAN_NAMES[reservation.plan] || reservation.plan}）`;
    const staffText = `予約内容が変更されました

お客様: ${customer?.last_name}${customer?.first_name || ""} 様
電話: ${customer?.phone}
ワンちゃん: ${dogNames}
プラン: ${PLAN_NAMES[reservation.plan] || reservation.plan}
日付: ${reservation.date}

変更内容:
${changes.map((c) => `・${c}`).join("\n")}

管理画面: https://dog-hub.shop/admin/reservations/${reservationId}`;

    await Promise.allSettled(
      STAFF_EMAILS.map((email) =>
        transporter.sendMail({
          from: `"DogHub箱根仙石原" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: staffSubject,
          text: staffText,
        })
      )
    );

    return NextResponse.json({ ok: true, changes });
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
