import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import type { BookingFormData } from "@/types/booking";
import { sendBookingEmails } from "@/lib/email";
import { sendLinePushMessage, buildBookingConfirmMessage } from "@/lib/line";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 直近の送信を追跡（二重送信防止）
const recentSubmissions = new Map<string, number>();

function isDuplicate(body: BookingFormData): boolean {
  const key = `${body.customer.phone}-${body.date}-${body.plan}`;
  const now = Date.now();
  const last = recentSubmissions.get(key);
  if (last && now - last < 30000) return true; // 30秒以内の同一予約をブロック
  recentSubmissions.set(key, now);
  // 古いエントリを掃除（5分以上前）
  for (const [k, t] of recentSubmissions) {
    if (now - t > 300000) recentSubmissions.delete(k);
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body: BookingFormData = await req.json();

    // バリデーション（重複チェックの前に実行）
    if (!body.plan || !body.date || !body.checkin_time) {
      return NextResponse.json({ error: "プラン・日程情報が不足しています" }, { status: 400 });
    }

    // サーバー側：前日17時まで受付（当日予約不可）— スタッフ入力（source: phone）は制限なし
    const isStaffBooking = body.source === "phone";
    const now = new Date();
    const jstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    const bookingDate = new Date(body.date + "T00:00:00+09:00");
    const todayMidnight = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate());
    const diffDays = Math.floor((bookingDate.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));

    // 当日予約: お客様はブロック、スタッフはOK
    if (!isStaffBooking && diffDays <= 0) {
      return NextResponse.json({ error: "当日のご予約はお電話（0460-80-0290）にてお願いいたします" }, { status: 400 });
    }
    // 前日17時以降の翌日予約: 仮予約として受付（フラグを立てる）
    const isLateBooking = !isStaffBooking && diffDays === 1 && jstNow.getHours() >= 17;

    // サーバー側：定休日チェック（水=3, 木=4）
    const closedWeekdays = [3, 4];
    // CI日の営業日チェック（定休日 + 臨時休業/臨時営業をdaily_capacityで判定）
    const checkinDay = new Date(body.date + "T00:00:00+09:00").getDay();
    const isRegularClosed = closedWeekdays.includes(checkinDay);
    const { data: ciCap } = await supabase
      .from("daily_capacity")
      .select("closed")
      .eq("date", body.date)
      .maybeSingle();

    const isClosed = ciCap ? ciCap.closed : isRegularClosed;
    if (isClosed) {
      return NextResponse.json({ error: isRegularClosed ? "チェックイン日が定休日です" : `${body.date}は臨時休業です` }, { status: 400 });
    }

    // サーバー側：宿泊期間中の休業日チェック（CI日〜CO前日。CO日は除外）
    // 定休日 + 臨時休業の両方を考慮
    if (body.plan === "stay" && body.checkout_date) {
      const start = new Date(body.date);
      const end = new Date(body.checkout_date);
      const d = new Date(start);
      const datesToCheck: string[] = [];
      while (d < end) { // CO日を除外
        datesToCheck.push(d.toISOString().split("T")[0]);
        d.setDate(d.getDate() + 1);
      }

      if (datesToCheck.length > 0) {
        const { data: capData } = await supabase
          .from("daily_capacity")
          .select("date, closed")
          .in("date", datesToCheck);

        const closedDates = datesToCheck.filter((date) => {
          const cap = capData?.find((r) => r.date === date);
          const dayOfWeek = new Date(date + "T00:00:00+09:00").getDay();
          const regularClosed = closedWeekdays.includes(dayOfWeek);
          // daily_capacityにレコードがあればそのclosed値を使う、なければ曜日で判定
          return cap ? cap.closed : regularClosed;
        });

        if (closedDates.length > 0) {
          return NextResponse.json({ error: "お預かり期間中に休業日が含まれています" }, { status: 400 });
        }
      }
    }
    if (!body.dogs.length || body.dogs.some((d) => !d.name || !d.breed || !d.weight || !d.sex)) {
      return NextResponse.json({ error: "ワンちゃん情報が不足しています" }, { status: 400 });
    }
    const c = body.customer;
    if (!c.last_name || !c.phone) {
      return NextResponse.json({ error: "お客様情報が不足しています" }, { status: 400 });
    }

    // サーバー側：容量チェック
    const dogCount = body.dogs.length;
    {
      const capacityColumn = body.plan === "stay" ? "stay_booked" : "day_booked";
      const limitColumn = body.plan === "stay" ? "stay_limit" : "day_limit";
      const datesToCheck: string[] = [];

      if (body.plan === "stay" && body.checkout_date) {
        // 宿泊：CI日〜CO前日のstay枠 + CO日のday枠
        const d = new Date(body.date);
        const end = new Date(body.checkout_date);
        while (d < end) {
          datesToCheck.push(d.toISOString().split("T")[0]);
          d.setDate(d.getDate() + 1);
        }
      } else {
        datesToCheck.push(body.date);
      }

      // 宿泊枠 or 日帰り枠のチェック
      for (const date of datesToCheck) {
        const { data: cap } = await supabase
          .from("daily_capacity")
          .select("*")
          .eq("date", date)
          .maybeSingle();

        if (cap) {
          if (cap.closed) {
            return NextResponse.json({ error: `${date}は臨時休業です` }, { status: 400 });
          }
          if (cap[capacityColumn] + dogCount > cap[limitColumn]) {
            return NextResponse.json({ error: `${date}の${body.plan === "stay" ? "宿泊" : "日帰り"}枠が満室です` }, { status: 400 });
          }
        }
      }

      // 宿泊CO日のday枠チェック（犬が午前中在館するため）
      if (body.plan === "stay" && body.checkout_date) {
        const { data: coCap } = await supabase
          .from("daily_capacity")
          .select("*")
          .eq("date", body.checkout_date)
          .maybeSingle();

        if (coCap && coCap.day_booked + dogCount > coCap.day_limit) {
          return NextResponse.json({ error: `チェックアウト日（${body.checkout_date}）の日帰り枠が満室です` }, { status: 400 });
        }
      }
    }

    // 電話番号正規化
    const normalizedPhone = c.phone.replace(/[-\s]/g, "");

    // 1. 顧客の upsert（電話番号で既存チェック）
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    let customerId: string;

    if (existingCustomer) {
      // 既存顧客：情報更新
      customerId = existingCustomer.id;
      await supabase
        .from("customers")
        .update({
          email: c.email,
          last_name: c.last_name,
          first_name: c.first_name,
          last_name_kana: c.last_name_kana,
          first_name_kana: c.first_name_kana,
          postal_code: c.postal_code || null,
          address: c.address || null,
          ...(body.line_id ? { line_id: body.line_id } : {}),
        })
        .eq("id", customerId);
    } else {
      // 新規顧客（UUIDを事前生成してSELECT不要にする）
      const newCustomerId = randomUUID();
      const { error: customerError } = await supabase
        .from("customers")
        .insert({
          id: newCustomerId,
          phone: normalizedPhone,
          email: c.email,
          last_name: c.last_name,
          first_name: c.first_name,
          last_name_kana: c.last_name_kana,
          first_name_kana: c.first_name_kana,
          postal_code: c.postal_code || null,
          address: c.address || null,
          source: body.line_id ? "line" : "web",
          ...(body.line_id ? { line_id: body.line_id } : {}),
        });

      if (customerError) {
        return NextResponse.json({ error: "顧客登録に失敗しました" }, { status: 500 });
      }
      customerId = newCustomerId;
    }

    // 2. 犬の upsert
    const dogIds: string[] = [];
    for (const dog of body.dogs) {
      if (dog.id) {
        // 既存の犬：体重・ワクチンなどを更新
        await supabase
          .from("dogs")
          .update({
            weight: parseFloat(dog.weight),
            age: dog.age ? parseInt(dog.age) : null,
            age_months: dog.age === "0" && dog.age_months ? parseInt(dog.age_months) : null,
            has_rabies_vaccine: dog.has_rabies_vaccine,
            has_mixed_vaccine: dog.has_mixed_vaccine,
            allergies: dog.allergies || null,
            meal_notes: dog.meal_notes || null,
            medication_notes: dog.medication_notes || null,
          })
          .eq("id", dog.id);
        dogIds.push(dog.id);
      } else {
        // 新規の犬（UUIDを事前生成してSELECT不要にする）
        const dogId = randomUUID();
        const { error: dogError } = await supabase
          .from("dogs")
          .insert({
            id: dogId,
            customer_id: customerId,
            name: dog.name,
            breed: dog.breed,
            weight: parseFloat(dog.weight),
            age: dog.age ? parseInt(dog.age) : null,
            age_months: dog.age === "0" && dog.age_months ? parseInt(dog.age_months) : null,
            sex: dog.sex as "male" | "female",
            has_rabies_vaccine: dog.has_rabies_vaccine,
            has_mixed_vaccine: dog.has_mixed_vaccine,
            allergies: dog.allergies || null,
            meal_notes: dog.meal_notes || null,
            medication_notes: dog.medication_notes || null,
          });

        if (dogError) {
          return NextResponse.json({ error: "犬情報の登録に失敗しました" }, { status: 500 });
        }
        dogIds.push(dogId);
      }
    }

    // 3. ステータス決定（15kg以上 or 前日17時以降の翌日予約 → 仮予約）
    const hasHeavyDog = body.dogs.some((d) => parseFloat(d.weight) >= 15);
    const status = (hasHeavyDog || isLateBooking) ? "pending" : "confirmed";

    // 二重送信チェック（全バリデーション通過後に実行）
    if (isDuplicate(body)) {
      return NextResponse.json({ error: "同じ内容の予約が直前に送信されています。しばらくお待ちください。" }, { status: 429 });
    }

    // 4. 予約作成（UUIDを事前生成してSELECT不要にする）
    const reservationId = randomUUID();
    const { error: reservationError } = await supabase
      .from("reservations")
      .insert({
        id: reservationId,
        customer_id: customerId,
        plan: body.plan as "spot" | "4h" | "8h" | "stay",
        date: body.date,
        checkin_time: body.checkin_time,
        checkout_date: body.plan === "stay" ? body.checkout_date || null : null,
        status,
        dog_count: dogCount,
        walk_option: body.walk_option,
        destination: body.destination || null,
        early_morning: body.early_morning || false,
        referral_source: body.referral_source || null,
        checkin_extension_from: body.checkin_extension && body.checkin_extension_from
          ? body.checkin_extension_from
          : null,
        checkout_extension_until: body.checkout_extension && body.checkout_extension_until
          ? body.checkout_extension_until
          : null,
        notes: [
          body.notes || "",
          body.checkin_extension && body.checkin_extension_from
            ? `【早預かり】${body.checkin_extension_from}〜チェックイン`
            : "",
          body.checkout_extension && body.checkout_extension_until
            ? `【延長預かり】チェックアウト後〜${body.checkout_extension_until}`
            : "",
        ]
          .filter(Boolean)
          .join("\n") || null,
        source: (["web", "line", "phone", "walk_in"].includes(body.source as string) ? body.source : "web") as "web" | "line" | "phone" | "walk_in",
      });

    if (reservationError) {
      return NextResponse.json({ error: "予約登録に失敗しました" }, { status: 500 });
    }
    const reservation = { id: reservationId };

    // 5. reservation_dogs 中間テーブル
    const rdInserts = dogIds.map((dogId) => ({
      reservation_id: reservation.id,
      dog_id: dogId,
    }));
    await supabase.from("reservation_dogs").insert(rdInserts);

    // 6. daily_capacity 更新（宿泊は全泊日分、日帰りはチェックイン日のみ）
    const capacityColumn = body.plan === "stay" ? "stay_booked" : "day_booked";
    const datesToUpdate: string[] = [];

    if (body.plan === "stay" && body.checkout_date) {
      // 宿泊：チェックイン日〜チェックアウト前日まで全日分
      const d = new Date(body.date);
      const end = new Date(body.checkout_date);
      while (d < end) {
        datesToUpdate.push(d.toISOString().split("T")[0]);
        d.setDate(d.getDate() + 1);
      }
    } else {
      datesToUpdate.push(body.date);
    }

    // 容量を頭数分で更新する共通関数
    const updateCapacity = async (date: string, column: string, delta: number) => {
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
        // 定休日のclosedフラグを保持（falseがデフォルトだと臨時営業と誤判定されるため）
        const dayOfWeek = new Date(date).getDay();
        const isClosed = closedWeekdays.includes(dayOfWeek);
        await supabase.from("daily_capacity").insert({
          date,
          [column]: delta,
          closed: isClosed,
        });
      }
    };

    for (const date of datesToUpdate) {
      await updateCapacity(date, capacityColumn, dogCount);
    }

    // 宿泊のCO日：犬は午前中まで在館するためday_bookedに加算
    if (body.plan === "stay" && body.checkout_date) {
      await updateCapacity(body.checkout_date, "day_booked", dogCount);
    }

    // 7. 顧客の利用回数を更新
    try { await supabase.rpc("increment_total_visits", { customer_uuid: customerId }); } catch { /* ignore */ }

    // 8. メール送信（失敗しても予約自体は成功扱い、ただしフロントに通知）
    let emailFailed = false;
    try {
      await sendBookingEmails(body, reservation.id, status);
    } catch (err) {
      console.error("Email send error:", err);
      emailFailed = true;
    }

    // 8. LINE通知（line_idがある場合のみ）
    if (body.line_id) {
      try {
        await sendLinePushMessage(
          body.line_id,
          buildBookingConfirmMessage({
            customerName: `${c.last_name} ${c.first_name}`,
            plan: body.plan,
            date: body.date,
            checkinTime: body.checkin_time,
            reservationId: reservationId,
            status,
          })
        );
      } catch (err) {
        console.error("LINE push error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      reservation_id: reservation.id,
      status,
      email_failed: emailFailed,
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "予約処理中にエラーが発生しました" }, { status: 500 });
  }
}
