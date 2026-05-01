import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { sendCancellationEmails } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
  } else if (delta > 0) {
    await supabase.from("daily_capacity").insert({ date, [column]: delta });
  }
}

async function adjustCapacity(reservationId: string, direction: 1 | -1) {
  const { data: r } = await supabase
    .from("reservations")
    .select("plan, date, checkout_date, dog_count")
    .eq("id", reservationId)
    .single();

  if (!r) return;

  const dogCount = (r.dog_count || 1) * direction;
  const capacityColumn = r.plan === "stay" ? "stay_booked" : "day_booked";

  if (r.plan === "stay" && r.checkout_date) {
    // 宿泊：CI日〜CO前日のstay_bookedのみ（CO日のday_booked加算は廃止）
    const d = new Date(r.date);
    const end = new Date(r.checkout_date);
    while (d < end) {
      const dateStr = d.toISOString().split("T")[0];
      await updateCapacity(dateStr, capacityColumn, dogCount);
      d.setDate(d.getDate() + 1);
    }
  } else {
    await updateCapacity(r.date, capacityColumn, dogCount);
  }
}

export async function POST(req: NextRequest) {
  const session = req.cookies.get("doghub-admin-session");
  if (!session || session.value !== "authorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reservation_id, status } = await req.json();

    if (!reservation_id || !status) {
      return NextResponse.json({ error: "必須パラメータが不足" }, { status: 400 });
    }

    const validStatuses = ["confirmed", "pending", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "無効なステータス" }, { status: 400 });
    }

    // 現在のステータスを取得
    const { data: current } = await supabase
      .from("reservations")
      .select("status")
      .eq("id", reservation_id)
      .single();

    if (!current) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    const oldStatus = current.status;

    // ステータス更新
    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", reservation_id);

    if (error) {
      console.error("Status update error:", error);
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    // 容量調整
    const wasActive = oldStatus === "confirmed" || oldStatus === "pending";
    const isActive = status === "confirmed" || status === "pending";

    if (wasActive && !isActive) {
      // 確定/確認待ち → キャンセル/完了：容量を戻す
      await adjustCapacity(reservation_id, -1);
    } else if (!wasActive && isActive) {
      // キャンセル/完了 → 確定/確認待ち：容量を加算
      await adjustCapacity(reservation_id, 1);
    }

    // active → cancelled: お客様＋スタッフにキャンセル通知メールを送信
    if (wasActive && status === "cancelled") {
      try {
        const { data: res } = await supabase
          .from("reservations")
          .select("plan, date, checkin_time, checkout_date, dog_count, customers!inner(last_name, first_name, email, phone)")
          .eq("id", reservation_id)
          .single();
        if (res) {
          const customer = res.customers as unknown as { last_name: string; first_name: string; email: string; phone: string } | null;
          await sendCancellationEmails({
            reservationId: reservation_id,
            reservation: {
              plan: res.plan,
              date: res.date,
              checkin_time: res.checkin_time,
              checkout_date: res.checkout_date,
            },
            customer,
            dogCount: res.dog_count || 1,
            cancelReason: null,
            cancelledBy: "staff",
          });
        }
      } catch (emailErr) {
        console.error("Staff cancellation email error:", emailErr);
      }
    }

    // pending → confirmed: お客様に予約確定メールを送信
    if (oldStatus === "pending" && status === "confirmed") {
      try {
        const { data: res } = await supabase
          .from("reservations")
          .select("*, customers!inner(last_name, first_name, email, phone), reservation_dogs(dogs(name))")
          .eq("id", reservation_id)
          .single();

        if (res?.customers?.email) {
          const PLAN_NAMES: Record<string, string> = { spot: "スポット", "4h": "半日（4時間）", "8h": "1日（8時間）", stay: "宿泊" };
          const dogNames = res.reservation_dogs?.map((rd: { dogs: { name: string } | null }) => rd.dogs?.name).filter(Boolean).join("、") || "";
          const d = new Date(res.date + "T00:00:00");
          const days = ["日","月","火","水","木","金","土"];
          const dateStr = `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${days[d.getDay()]}）`;

          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", port: 587, secure: false,
            auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
          });

          await transporter.sendMail({
            from: `"DogHub箱根仙石原" <${process.env.GMAIL_USER}>`,
            to: res.customers.email,
            subject: `【予約確定】${dateStr} ${PLAN_NAMES[res.plan] || res.plan}のご予約が確定しました`,
            html: `
              <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
                <h2 style="color:#3C200F;font-size:18px;">ご予約が確定しました</h2>
                <p style="color:#3C200F;font-size:14px;">${res.customers.last_name} ${res.customers.first_name || ""} 様</p>
                <p style="color:#8F7B65;font-size:13px;">以下の内容で予約が確定しました。</p>
                <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                  <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;width:80px;">プラン</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${PLAN_NAMES[res.plan] || res.plan}</td></tr>
                  <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;">日付</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${dateStr}</td></tr>
                  <tr><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;color:#888;font-size:13px;">ワンちゃん</td><td style="padding:8px 0;border-bottom:1px solid #f0ebe5;font-size:14px;">${dogNames}</td></tr>
                </table>
                <div style="margin-top:16px;display:flex;gap:16px;">
                  <a href="https://dog-hub.shop/booking/modify/${reservation_id}" style="color:#B87942;font-size:13px;">予約内容を変更する</a>
                  <a href="https://dog-hub.shop/booking/cancel/${reservation_id}" style="color:#888;font-size:13px;">予約をキャンセルする</a>
                </div>
                <p style="margin-top:24px;font-size:12px;color:#888;">DogHub箱根仙石原 | 0460-80-0290 | 金〜火 9:00〜17:00</p>
              </div>
            `,
          });
        }
      } catch (emailErr) {
        console.error("Confirmation email error:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Update status API error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
