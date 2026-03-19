/**
 * AirReserve CSVからSupabaseに予約データをインポート
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = "https://ixvyacyhrfpwhesgpptn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dnlhY3locmZwd2hlc2dwcHRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzI5MTIsImV4cCI6MjA4ODUwODkxMn0.9cN4mUNVL8q6_94utRI6lxCFxW1E9T-0ysoFZc-O9ko";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Parse CSV (handles multiline fields)
function parseCSV(text) {
  const rows = [];
  let headers = null;
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        currentField += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentField += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        currentRow.push(currentField);
        currentField = "";
      } else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        if (ch === '\r') i++;
        currentRow.push(currentField);
        currentField = "";
        if (!headers) {
          headers = currentRow;
        } else if (currentRow.length === headers.length) {
          const obj = {};
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentRow[j];
          }
          rows.push(obj);
        }
        currentRow = [];
      } else {
        currentField += ch;
      }
    }
  }
  // Last row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (headers && currentRow.length === headers.length) {
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentRow[j];
      }
      rows.push(obj);
    }
  }
  return rows;
}

function cleanPhone(raw) {
  return raw.replace(/[=""\s]/g, "").replace(/^0/, "0");
}

function parseDatetime(dt) {
  // "2026/03/20 14:00:00" → { date: "2026-03-20", time: "14:00" }
  if (!dt) return { date: null, time: null };
  const m = dt.match(/(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})/);
  if (!m) return { date: null, time: null };
  return {
    date: `${m[1]}-${m[2]}-${m[3]}`,
    time: `${m[4]}:${m[5]}`,
  };
}

function mapPlan(menu) {
  if (menu.includes("宿泊")) return "stay";
  if (menu.includes("1日") || menu.includes("5時間")) return "8h";
  if (menu.includes("半日") || menu.includes("4時間")) return "4h";
  return "4h";
}

function mapStatus(status) {
  if (status.includes("キャンセル")) return "cancelled";
  return "confirmed";
}

async function main() {
  const csvText = readFileSync(
    "/Users/atsushinarisawa/Downloads/airreserve_202603181645_AKR7737047129_0026.csv",
    "utf-8"
  );
  const rows = parseCSV(csvText);
  console.log(`CSV: ${rows.length}件`);

  let imported = 0;
  let errors = 0;

  for (const row of rows) {
    const phone = cleanPhone(row["電話番号"]);
    const lastName = row["名前（姓）"];
    const firstName = row["名前（名）"];
    const lastNameKana = row["フリガナ（セイ）"];
    const firstNameKana = row["フリガナ（メイ）"];
    const email = row["メールアドレス"] || "";
    const postalCode = (row["郵便番号"] || "").replace(/[=""\s]/g, "");
    const address = (row["都道府県"] || "") + (row["住所"] || "");
    const notes = row["備考欄"] || "";
    const plan = mapPlan(row["メニュー"]);
    const status = mapStatus(row["予約ステータス"]);
    const dogCount = parseInt(row["リソース_1"]) || 1;
    const walkOption = (row["リソース_4"] || "").includes("有り");
    const checkin = parseDatetime(row["利用開始日時"]);
    const checkout = parseDatetime(row["利用終了日時"]);
    const earlyMorning = checkin.time && (checkin.time === "07:00" || checkin.time === "08:00");
    const referralSource = row["（その他項目_6）"] || "";
    const destination = row["リソース_7"] || "";

    // 1. 顧客 upsert
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    let customerId;
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({
          phone,
          last_name: lastName,
          first_name: firstName,
          last_name_kana: lastNameKana,
          first_name_kana: firstNameKana,
          email: email.includes("*") ? "" : email,
          postal_code: postalCode,
          address,
          source: "imported",
        })
        .select("id")
        .single();
      if (custErr) {
        console.error(`顧客エラー (${lastName}): ${custErr.message}`);
        errors++;
        continue;
      }
      customerId = newCustomer.id;
    }

    // 2. 予約 insert
    const reservationData = {
      customer_id: customerId,
      plan,
      date: checkin.date,
      checkin_time: checkin.time,
      checkout_date: plan === "stay" ? checkout.date : null,
      status,
      dog_count: dogCount,
      walk_option: walkOption,
      early_morning: earlyMorning,
      source: "imported",
      notes: notes || null,
      referral_source: referralSource || null,
    };

    const { data: newRes, error: resErr } = await supabase
      .from("reservations")
      .insert(reservationData)
      .select("id")
      .single();

    if (resErr) {
      console.error(`予約エラー (${lastName} ${checkin.date}): ${resErr.message}`);
      errors++;
      continue;
    }

    // 3. reservation_dogs: 顧客の犬を紐付け
    const { data: dogs } = await supabase
      .from("dogs")
      .select("id")
      .eq("customer_id", customerId);

    if (dogs && dogs.length > 0) {
      const dogsToLink = dogs.slice(0, dogCount);
      for (const dog of dogsToLink) {
        await supabase.from("reservation_dogs").insert({
          reservation_id: newRes.id,
          dog_id: dog.id,
        });
      }
    }

    imported++;
    console.log(`✅ ${lastName}${firstName} | ${plan} | ${checkin.date} ${checkin.time} | ${dogCount}頭 | ${status}`);
  }

  console.log(`\n完了: ${imported}件インポート, ${errors}件エラー`);

  // daily_capacity再計算
  console.log("\ndaily_capacity再計算中...");

  // リセット
  await supabase.from("daily_capacity").delete().neq("date", "1900-01-01");

  // 全予約から再計算
  const { data: allRes } = await supabase
    .from("reservations")
    .select("plan, date, checkout_date, dog_count, status")
    .in("status", ["confirmed", "pending"]);

  const capacityMap = {};

  for (const r of allRes || []) {
    const dc = r.dog_count || 1;
    if (r.plan === "stay" && r.checkout_date) {
      // CI日〜CO前日: stay_booked
      let d = new Date(r.date + "T00:00:00");
      const end = new Date(r.checkout_date + "T00:00:00");
      while (d < end) {
        const key = d.toISOString().split("T")[0];
        if (!capacityMap[key]) capacityMap[key] = { day: 0, stay: 0 };
        capacityMap[key].stay += dc;
        d.setDate(d.getDate() + 1);
      }
      // CO日: day_booked
      const coKey = r.checkout_date;
      if (!capacityMap[coKey]) capacityMap[coKey] = { day: 0, stay: 0 };
      capacityMap[coKey].day += dc;
    } else {
      // 日帰り: day_booked
      const key = r.date;
      if (!capacityMap[key]) capacityMap[key] = { day: 0, stay: 0 };
      capacityMap[key].day += dc;
    }
  }

  for (const [date, cap] of Object.entries(capacityMap)) {
    await supabase.from("daily_capacity").upsert({
      date,
      day_booked: cap.day,
      stay_booked: cap.stay,
    });
  }

  console.log(`daily_capacity: ${Object.keys(capacityMap).length}日分更新`);
}

main().catch(console.error);
