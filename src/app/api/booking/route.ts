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

export async function POST(req: NextRequest) {
  try {
    const body: BookingFormData = await req.json();

    // バリデーション
    if (!body.plan || !body.date || !body.checkin_time) {
      return NextResponse.json({ error: "プラン・日程情報が不足しています" }, { status: 400 });
    }
    if (!body.dogs.length || body.dogs.some((d) => !d.name || !d.breed || !d.weight || !d.sex)) {
      return NextResponse.json({ error: "ワンちゃん情報が不足しています" }, { status: 400 });
    }
    const c = body.customer;
    if (!c.last_name || !c.first_name || !c.phone) {
      return NextResponse.json({ error: "お客様情報が不足しています" }, { status: 400 });
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

    // 3. 15kg以上の犬がいるかチェック → ステータス決定
    const hasHeavyDog = body.dogs.some((d) => parseFloat(d.weight) >= 15);
    const status = hasHeavyDog ? "pending" : "confirmed";

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
        walk_option: body.walk_option,
        destination: body.destination || null,
        early_morning: body.early_morning || false,
        referral_source: body.referral_source || null,
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

    // 6. daily_capacity 更新
    const capacityColumn = body.plan === "stay" ? "stay_booked" : "day_booked";
    const { data: existing } = await supabase
      .from("daily_capacity")
      .select("*")
      .eq("date", body.date)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("daily_capacity")
        .update({
          [capacityColumn]: existing[capacityColumn] + 1,
        })
        .eq("date", body.date);
    } else {
      await supabase.from("daily_capacity").insert({
        date: body.date,
        [capacityColumn]: 1,
      });
    }

    // 7. メール送信（失敗しても予約自体は成功扱い）
    try {
      await sendBookingEmails(body, reservation.id, status);
    } catch (err) {
      console.error("Email send error:", err);
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
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "予約処理中にエラーが発生しました" }, { status: 500 });
  }
}
