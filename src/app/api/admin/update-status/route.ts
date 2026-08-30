import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { sendCancellationEmails, buildLineLinkSection } from "@/lib/email";
import { buildLineLinkUrl } from "@/lib/link-token";
import { sendLinePushMessage, buildBookingConfirmMessage, buildCancellationMessage } from "@/lib/line";

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

    // no_show =「無断キャンセル」。ご連絡なくお越しにならなかった予約を数えるための状態で、
    // 2026-08-30 の総点検 #15 で追加した（CEO承認済み）。
    const validStatuses = ["confirmed", "pending", "cancelled", "completed", "no_show"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "無効なステータス" }, { status: 400 });
    }

    // 🔴 お客様へ通知してよい状態変更かどうかの唯一の判定。
    // 「無断キャンセル」は記録のためだけの状態で、メールもLINEも一切送らない。
    // 下のキャンセル通知・確定通知は必ずこのフラグの中に入れること
    // （新しい通知を足すときも同じ。ここを外すとお客様に「無断キャンセル」の連絡が飛ぶ）。
    const SILENT_STATUSES = new Set(["no_show"]);
    const notifyCustomer = !SILENT_STATUSES.has(status);

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
      // 23514 = DB側のCHECK制約違反。status に許していない値を入れようとしたときに出る。
      // 「無断キャンセル」を後から足した経緯があるため、原因が分かる文言にしておく。
      if (error.code === "23514") {
        return NextResponse.json(
          { error: "この状態はデータベース側でまだ使えません（システム設定が必要です）。予約は変更されていません。" },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    // 容量調整。no_show は「お越しにならなかった」＝在庫を占有しないので、
    // キャンセル・完了と同じく非アクティブ扱い（過去日にしか付かないため実運用の空き表示には影響しない）。
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
    if (notifyCustomer && wasActive && status === "cancelled") {
      try {
        const { data: res } = await supabase
          .from("reservations")
          .select("plan, date, checkin_time, checkout_date, dog_count, customers!inner(last_name, first_name, email, phone, line_id)")
          .eq("id", reservation_id)
          .single();
        if (res) {
          const customer = res.customers as unknown as { last_name: string; first_name: string; email: string; phone: string; line_id: string | null } | null;

          // LINE通知。従来この経路はメールのみで、LINE予約のお客様は
          // メール未登録がありうる（step3-customer でメールは任意）ため、
          // 「キャンセルされたのに何も届かない」状態になり得た（2026-08-30 総点検 #4）。
          // お客様セルフキャンセル（api/booking/cancel）と同じ文面を共用する。
          //
          // LINE友だち登録済みのお客様はLINEを優先し、同じ内容のメールは送らない
          // （2026-08-30 総点検 #10）。送れたかを確かめてからメールの要否を決めるため、
          // メールより先に push する。
          let lineDelivered = false;
          if (customer?.line_id) {
            lineDelivered = await sendLinePushMessage(
              customer.line_id,
              buildCancellationMessage({
                customerName: `${customer.last_name}${customer.first_name || ""}`,
                plan: res.plan,
                date: res.date,
                cancelledBy: "staff",
              })
            ).catch((lineErr) => {
              console.error("Staff cancellation LINE push error:", lineErr);
              return false;
            });
          }

          // 友だち解除・ブロック後は push が失敗する。そのときはメールに戻す
          // （LINE優先のまま黙ると、キャンセルの控えが丸ごと消えるため）。
          // スタッフ宛2通は skipCustomerEmail に関係なく必ず送られる。
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
            skipCustomerEmail: lineDelivered,
          });
        }
      } catch (emailErr) {
        console.error("Staff cancellation email error:", emailErr);
      }
    }

    // pending → confirmed: お客様に予約確定メールを送信
    if (notifyCustomer && oldStatus === "pending" && status === "confirmed") {
      try {
        const { data: res } = await supabase
          .from("reservations")
          .select("*, customers!inner(last_name, first_name, email, phone, line_id), reservation_dogs(dogs(name))")
          .eq("id", reservation_id)
          .single();

        // 既にLINEと紐付いているお客様かどうか。確定メールのLINE案内の出し分けと、
        // 下の確定LINE push の両方でこの1つの値を使う（判定を二重に持たない）。
        const lineId = (res?.customers as unknown as { line_id?: string | null } | null)?.line_id;

        // ワンちゃんのお名前。確定メールとLINEの両方で使うため、どちらより先に取り出す。
        const dogNameList: string[] = (res?.reservation_dogs || [])
          .map((rd: { dogs: { name: string } | null }) => rd.dogs?.name)
          .filter(Boolean) as string[];

        // LINE通知（line_idがある場合）。メール未入力のLINE予約客は確定メールが送られず、
        // 従来はLINE pushも無く「確定が一切通知されない」状態だった（仮予約時には
        // 「確認後に確定」とLINE案内済み）。ここで確定をLINEにも push する。
        //
        // LINE友だち登録済みのお客様はLINEを優先し、同じ内容のメールは送らない
        // （2026-08-30 総点検 #10）。送れたかを確かめてからメールの要否を決めるため、
        // メールより先に push する。
        let lineDelivered = false;
        if (res && lineId) {
          lineDelivered = await sendLinePushMessage(
            lineId,
            buildBookingConfirmMessage({
              customerName: `${res.customers.last_name} ${res.customers.first_name || ""}`.trim(),
              plan: res.plan,
              date: res.date,
              checkinTime: res.checkin_time,
              reservationId: reservation_id,
              status: "confirmed",
              // 確定メールに載っている事実をLINEにも載せる（メールを送らなくなったため）
              checkoutDate: res.checkout_date,
              dogs: dogNameList,
            })
          ).catch((lineErr) => {
            console.error("Confirmation LINE push error:", lineErr);
            return false;
          });
        }

        // 友だち解除・ブロック後は push が失敗する。そのときはメールに戻す
        // （LINE優先のまま黙ると、確定のお知らせが丸ごと消えるため）。
        if (!lineDelivered && res?.customers?.email) {
          const PLAN_NAMES: Record<string, string> = { spot: "スポット", "4h": "半日（4時間）", "8h": "1日（8時間）", stay: "宿泊" };
          const dogNames = dogNameList.join("、");
          const d = new Date(res.date + "T00:00:00");
          const days = ["日","月","火","水","木","金","土"];
          const dateStr = `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${days[d.getDay()]}）`;

          // 1タップLINE連携のご案内（2026-08-30 総点検 #6 の続き）。
          // 予約確認メールと同じ作法で、まだ紐付いていないお客様にだけ載せる。
          // ・紐付け済み → null を渡す＝buildLineLinkSection が空文字を返し案内は出ない
          // ・署名鍵（CRON_SECRET）が読めずリンクを作れない → 同じく null＝案内が消えるだけで
          //   メール本体は従来どおり届く（メールを止めない安全側の設計）
          const lineLinkUrl = lineId ? null : buildLineLinkUrl(res.customer_id);

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
                ${buildLineLinkSection(lineLinkUrl, true)}
                <p style="margin-top:24px;font-size:12px;color:#888;">DogHub箱根仙石原 | 0460-80-0290 | 金〜火 9:00〜17:00</p>
              </div>
            `,
          });
        }

      } catch (emailErr) {
        console.error("Confirmation notify error:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Update status API error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
