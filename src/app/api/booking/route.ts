import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { BookingFormData } from "@/types/booking";

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
    if (!c.last_name || !c.first_name || !c.phone || !c.email) {
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
        })
        .eq("id", customerId);
    } else {
      // 新規顧客
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          phone: normalizedPhone,
          email: c.email,
          last_name: c.last_name,
          first_name: c.first_name,
          last_name_kana: c.last_name_kana,
          first_name_kana: c.first_name_kana,
          postal_code: c.postal_code || null,
          address: c.address || null,
          source: "web",
        })
        .select("id")
        .single();

      if (customerError || !newCustomer) {
        return NextResponse.json({ error: "顧客登録に失敗しました" }, { status: 500 });
      }
      customerId = newCustomer.id;
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
            neutered: dog.neutered,
            rabies_vaccine_expires_at: dog.rabies_vaccine_expires_at || null,
            mixed_vaccine_expires_at: dog.mixed_vaccine_expires_at || null,
            allergies: dog.allergies || null,
            meal_notes: dog.meal_notes || null,
            medication_notes: dog.medication_notes || null,
          })
          .eq("id", dog.id);
        dogIds.push(dog.id);
      } else {
        // 新規の犬
        const { data: newDog, error: dogError } = await supabase
          .from("dogs")
          .insert({
            customer_id: customerId,
            name: dog.name,
            breed: dog.breed,
            weight: parseFloat(dog.weight),
            age: dog.age ? parseInt(dog.age) : null,
            sex: dog.sex as "male" | "female",
            neutered: dog.neutered,
            rabies_vaccine_expires_at: dog.rabies_vaccine_expires_at || null,
            mixed_vaccine_expires_at: dog.mixed_vaccine_expires_at || null,
            allergies: dog.allergies || null,
            meal_notes: dog.meal_notes || null,
            medication_notes: dog.medication_notes || null,
          })
          .select("id")
          .single();

        if (dogError || !newDog) {
          return NextResponse.json({ error: "犬情報の登録に失敗しました" }, { status: 500 });
        }
        dogIds.push(newDog.id);
      }
    }

    // 3. 15kg以上の犬がいるかチェック → ステータス決定
    const hasHeavyDog = body.dogs.some((d) => parseFloat(d.weight) >= 15);
    const status = hasHeavyDog ? "pending" : "confirmed";

    // 4. 予約作成
    const { data: reservation, error: reservationError } = await supabase
      .from("reservations")
      .insert({
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
        notes: body.notes || null,
        source: "web",
      })
      .select("id")
      .single();

    if (reservationError || !reservation) {
      return NextResponse.json({ error: "予約登録に失敗しました" }, { status: 500 });
    }

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
