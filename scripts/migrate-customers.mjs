/**
 * Google Sheets → Supabase 顧客データ移行スクリプト
 *
 * 実行方法:
 *   node scripts/migrate-customers.mjs
 *
 * 事前準備:
 *   - .env.local に NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY が設定済みであること
 *   - ~/credentials/doghub-workspace-token.json が存在すること
 */

import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import { homedir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

// ── 設定 ──────────────────────────────────────────────
const SPREADSHEET_ID = "1X2QWNB99HM52vzg0VUG1k5H0gh9CaBXzU-MQVlJAC1o";
const TOKEN_PATH = join(homedir(), "credentials/doghub-workspace-token.json");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// サービスロールキーがある場合はそちらを優先
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_KEY;

// ── Google Sheets クライアント ────────────────────────
function getAuthClient() {
  const token = JSON.parse(readFileSync(TOKEN_PATH, "utf-8"));
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials(token);
  return auth;
}

async function readSheet(sheets, range) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range,
  });
  return res.data.values || [];
}

// ── データ変換ヘルパー ────────────────────────────────
function normalizePhone(phone) {
  return (phone || "").replace(/[-\s]/g, "");
}

function firstEmail(email) {
  if (!email) return "";
  return email.split(/;\s*/)[0].trim();
}

/** "5歳" → 5, "0歳" → 0, "１歳" → 1, 数字のみ → そのまま */
function parseAge(ageStr) {
  if (!ageStr) return null;
  // 全角数字 → 半角
  const normalized = ageStr.replace(/[０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0)
  );
  const match = normalized.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/** "３" → 3, "４" → 4 （全角数字対応） */
function parseWeight(w) {
  if (!w) return 5.0;
  const normalized = w.replace(/[０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0)
  );
  const v = parseFloat(normalized);
  return isNaN(v) ? 5.0 : v;
}

/** 性別文字列 → 'male' | 'female' */
function parseSex(genderStr) {
  if (!genderStr) return "male";
  const s = genderStr.toLowerCase();
  if (s.includes("メス") || s.includes("女") || s.includes("female") || s.includes("f")) return "female";
  return "male";
}

// ── メイン ────────────────────────────────────────────
async function main() {
  console.log("🐶 DogHub 顧客データ移行スクリプト");
  console.log("────────────────────────────────");

  // Supabase クライアント
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Google Sheets 認証
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  // ── 顧客マスタ読み込み ──
  console.log("📖 Google Sheets から顧客マスタを読み込み中...");
  const customerRows = await readSheet(sheets, "顧客マスタ!A1:V1000");
  const customerHeader = customerRows[0];
  const customerData = customerRows.slice(1).filter((r) => r[0]); // customer_id が空の行を除外

  console.log(`   → ${customerData.length} 件の顧客データを取得`);

  // customer_id (DH-XXXX) → UUID のマッピング
  const customerIdMap = {};

  // ── 顧客を Supabase へ挿入（すでに存在する場合はスキップ） ──
  console.log("📤 顧客データを Supabase へ挿入中...");
  let customerInserted = 0;
  let customerSkipped = 0;

  // DH-XXXX → 電話番号 のマップも作成（後でID取得に使用）
  const dhIdToPhone = {};

  const BATCH_SIZE = 50;
  for (let i = 0; i < customerData.length; i += BATCH_SIZE) {
    const batch = customerData.slice(i, i + BATCH_SIZE);
    const records = [];

    for (const row of batch) {
      const dhId = row[0];
      const fullName = row[1] || "";
      const fullNameKana = row[2] || "";
      const email = firstEmail(row[3]);
      const phone = normalizePhone(row[4]);
      const lineId = row[5] || null;
      const postalCode = row[6] || null;
      const prefecture = row[7] || "";
      const address = row[8] || "";
      const firstVisitDate = row[9] || null;
      const notes = row[21] || null;

      const effectivePhone = phone || `NO_PHONE_${dhId}`;
      dhIdToPhone[dhId] = effectivePhone;

      // 電話番号も名前もない行はスキップ
      if (!phone && !fullName) {
        customerSkipped++;
        continue;
      }

      records.push({
        id: randomUUID(),
        last_name: fullName || "不明",
        first_name: "",
        last_name_kana: fullNameKana || "",
        first_name_kana: "",
        email: email || "",
        phone: effectivePhone,
        line_id: lineId || null,
        postal_code: postalCode,
        address: [prefecture, address].filter(Boolean).join("") || null,
        source: "imported",
        notes: notes || null,
        created_at: firstVisitDate
          ? new Date(firstVisitDate).toISOString()
          : new Date().toISOString(),
      });
    }

    if (records.length === 0) continue;

    const { error } = await supabase
      .from("customers")
      .upsert(records, { onConflict: "phone", ignoreDuplicates: true });

    if (error) {
      console.error(`   ❌ バッチ ${Math.floor(i / BATCH_SIZE) + 1} でエラー:`, error.message);
    } else {
      customerInserted += records.length;
      process.stdout.write(`   進捗: ${Math.min(i + BATCH_SIZE, customerData.length)} / ${customerData.length}\r`);
    }
  }

  // ── 全顧客のIDを Supabase から取得して customerIdMap を構築 ──
  console.log("\n📖 Supabase から顧客IDを一括取得中...");
  const allPhones = Object.values(dhIdToPhone).filter(Boolean);
  const phoneToUUID = {};

  // 50件ずつ取得
  for (let i = 0; i < allPhones.length; i += 200) {
    const phoneBatch = allPhones.slice(i, i + 200);
    const { data } = await supabase
      .from("customers")
      .select("id, phone")
      .in("phone", phoneBatch);
    if (data) {
      for (const c of data) phoneToUUID[c.phone] = c.id;
    }
  }

  for (const [dhId, phone] of Object.entries(dhIdToPhone)) {
    if (phoneToUUID[phone]) customerIdMap[dhId] = phoneToUUID[phone];
  }

  console.log(`✅ 顧客: ${customerInserted} 件挿入 / ${customerSkipped} 件スキップ`);
  console.log(`   IDマッピング取得: ${Object.keys(customerIdMap).length} 件`);

  // ── ペットマスタ読み込み ──
  console.log("\n📖 Google Sheets からペットマスタを読み込み中...");
  const petRows = await readSheet(sheets, "ペットマスタ!A1:N1000");
  const petData = petRows.slice(1).filter((r) => r[0]); // pet_id が空の行を除外

  console.log(`   → ${petData.length} 件のペットデータを取得`);

  // ── ペットを Supabase へ挿入 ──
  console.log("📤 ペットデータを Supabase へ挿入中...");
  let petInserted = 0;
  let petSkipped = 0;

  for (let i = 0; i < petData.length; i += BATCH_SIZE) {
    const batch = petData.slice(i, i + BATCH_SIZE);
    const records = [];

    for (const row of batch) {
      const petId = row[0]; // PET-XXXX
      const dhId = row[1]; // DH-XXXX
      const customerId = customerIdMap[dhId];

      if (!customerId) {
        petSkipped++;
        continue;
      }

      const petName = row[2] || "不明";
      const breed = row[3] || "不明";
      const weight = parseWeight(row[4]);
      const age = parseAge(row[5]);
      const sex = parseSex(row[6]);
      const allergies = row[8] || null;

      // 名前が明らかにメモ的なもの（到着時間など）はスキップ
      if (petName.includes("到着時間") || petName.includes("暫定")) {
        petSkipped++;
        continue;
      }

      records.push({
        id: randomUUID(),
        customer_id: customerId,
        name: petName.replace(/お名前[:：\s]*/g, "").replace(/[:：\s]+$/, "").trim() || "不明",
        breed: breed.replace(/犬種[\s　]*/g, "").trim() || "不明",
        weight,
        age,
        sex,
        allergies,
      });
    }

    if (records.length === 0) continue;

    const { error } = await supabase.from("dogs").insert(records);

    if (error) {
      console.error(`   ❌ ペットバッチ ${Math.floor(i / BATCH_SIZE) + 1} でエラー:`, error.message);
    } else {
      petInserted += records.length;
      process.stdout.write(`   進捗: ${Math.min(i + BATCH_SIZE, petData.length)} / ${petData.length}\r`);
    }
  }

  console.log(`\n✅ ペット: ${petInserted} 件挿入 / ${petSkipped} 件スキップ`);
  console.log("\n🎉 移行完了！");
  console.log("────────────────────────────────");
  console.log(`顧客: ${customerInserted} 件 → Supabase customers テーブル`);
  console.log(`ペット: ${petInserted} 件 → Supabase dogs テーブル`);
  console.log("\n管理画面で確認: https://dog-hub.shop/admin/customers");
}

main().catch((err) => {
  console.error("❌ 移行エラー:", err);
  process.exit(1);
});
