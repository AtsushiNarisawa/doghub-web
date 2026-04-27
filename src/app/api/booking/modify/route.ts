import { NextResponse } from "next/server";
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

async function updateCapacity(date: string, column: string, delta: number) {
  const { data: existing } = await supabase
    .from("daily_capacity")
    .select("*")
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("daily_capacity")
      .update({ [column]: Math.max(0, (existing[column] || 0) + delta) })
      .eq("date", date);
  } else if (delta > 0) {
    await supabase.from("daily_capacity").insert({ date, [column]: delta });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reservationId, checkin_time, checkout_date, notes } = body;

    if (!reservationId) {
      return NextResponse.json({ error: "reservationId is required" }, { status: 400 });
    }

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

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const changes: string[] = [];
    const dogCount = reservation.dog_count || 1;

    if (checkin_time && checkin_time !== reservation.checkin_time?.slice(0, 5)) {
      const oldTime = reservation.checkin_time?.slice(0, 5);
      updates.checkin_time = checkin_time;
      changes.push(`到着予定時間: ${oldTime} → ${checkin_time}`);
    }

    // CO日変更時は容量を再計算
    const coChanged = checkout_date && checkout_date !== reservation.checkout_date;
    if (coChanged) {
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

    // DB更新
    const { error: updateErr } = await supabase
      .from("reservations")
      .update(updates)
      .eq("id", reservationId);

    if (updateErr) {
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    // CO日変更時の容量再計算（宿泊のみ・stay_bookedのみ）
    if (coChanged && reservation.plan === "stay") {
      const oldCO = reservation.checkout_date;
      const newCO = checkout_date;

      // 旧泊日のstay_bookedを戻す
      if (oldCO) {
        const d = new Date(reservation.date);
        const end = new Date(oldCO);
        while (d < end) {
          await updateCapacity(d.toISOString().split("T")[0], "stay_booked", -dogCount);
          d.setDate(d.getDate() + 1);
        }
      }
      // 新泊日のstay_bookedを加算
      {
        const d = new Date(reservation.date);
        const end = new Date(newCO);
        while (d < end) {
          await updateCapacity(d.toISOString().split("T")[0], "stay_booked", dogCount);
          d.setDate(d.getDate() + 1);
        }
      }
      // CO日のday_booked加減算は廃止
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

    const emailResults = await Promise.allSettled(
      STAFF_EMAILS.map((email) =>
        transporter.sendMail({
          from: `"DogHub箱根仙石原" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: staffSubject,
          text: staffText,
        })
      )
    );

    emailResults.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`[modify] email failed [${STAFF_EMAILS[i]}]:`, (r.reason as Error).message?.slice(0, 200));
      }
    });

    return NextResponse.json({ ok: true, changes });
  } catch (e) {
    console.error("[modify] error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
