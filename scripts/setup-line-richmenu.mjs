#!/usr/bin/env node
/**
 * DogHub LINE リッチメニューを一度だけ登録するセットアップスクリプト。
 *
 *   node scripts/setup-line-richmenu.mjs
 *
 * 手順（LINE Messaging API）:
 *   1) リッチメニューオブジェクト作成   POST  https://api.line.me/v2/bot/richmenu
 *   2) 画像アップロード                 POST  https://api-data.line.me/v2/bot/richmenu/{id}/content
 *   3) 全ユーザーのデフォルトに設定     POST  https://api.line.me/v2/bot/user/all/richmenu/{id}
 *
 * トークンは web/.env.local の LINE_CHANNEL_ACCESS_TOKEN を使う（本番Vercelと同じ値）。
 * 既存のデフォルトメニューがあれば置き換える（古いメニューは任意で後述コマンドで削除可）。
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local から LINE_CHANNEL_ACCESS_TOKEN を読む
function readEnv(key) {
  for (const f of [".env.production.local", ".env.local", ".env"]) {
    try {
      const txt = readFileSync(join(__dirname, "..", f), "utf8");
      const m = txt.match(new RegExp("^\\s*" + key + "\\s*=\\s*(.+)\\s*$", "m"));
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    } catch {}
  }
  return process.env[key] ?? null;
}

// 固定トークンは失効済みのことがあるため、Channel ID + Secret から都度発行する
async function mintToken() {
  const clientId = (readEnv("LINE_CHANNEL_ID") ?? "").replace(/[^0-9]/g, "");
  const clientSecret = (readEnv("LINE_CHANNEL_SECRET") ?? "").replace(/[^a-fA-F0-9]/g, "");
  if (!clientId || !clientSecret) {
    console.error("LINE_CHANNEL_ID / LINE_CHANNEL_SECRET が見つかりません");
    return null;
  }
  const res = await fetch("https://api.line.me/v2/oauth/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) {
    console.error("トークン発行失敗:", res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return data.access_token;
}

const BOOKING_URL = "https://liff.line.me/2009688745-qZi2jM4g";
const TEL_URI = "tel:0460800290";

// 2500×1686 を 3列×2行に分割（タップ領域）。テキスト送信→Webhookが定番FAQを返す。
const W = 2500, H = 1686;
const colW = [833, 833, 834];
const colX = [0, 833, 1666];
const rowH = 843;
const richmenu = {
  size: { width: W, height: H },
  selected: true,
  name: "DogHub メインメニュー v1",
  chatBarText: "メニュー",
  areas: [
    // 上段：FAQ（タップで該当キーワードを送信→Webhookが自動回答）
    { bounds: { x: colX[0], y: 0, width: colW[0], height: rowH }, action: { type: "message", text: "料金" } },
    { bounds: { x: colX[1], y: 0, width: colW[1], height: rowH }, action: { type: "message", text: "アクセス" } },
    { bounds: { x: colX[2], y: 0, width: colW[2], height: rowH }, action: { type: "message", text: "営業時間" } },
    // 下段：持ち物（FAQ）／予約（LIFF）／電話
    { bounds: { x: colX[0], y: rowH, width: colW[0], height: rowH }, action: { type: "message", text: "持ち物" } },
    { bounds: { x: colX[1], y: rowH, width: colW[1], height: rowH }, action: { type: "uri", uri: BOOKING_URL } },
    { bounds: { x: colX[2], y: rowH, width: colW[2], height: rowH }, action: { type: "uri", uri: TEL_URI } },
  ],
};

async function main() {
  const TOKEN = await mintToken();
  if (!TOKEN) {
    console.error("アクセストークンを取得できませんでした");
    process.exit(1);
  }

  // 1) 作成
  const createRes = await fetch("https://api.line.me/v2/bot/richmenu", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify(richmenu),
  });
  if (!createRes.ok) {
    console.error("作成失敗:", createRes.status, await createRes.text());
    process.exit(1);
  }
  const { richMenuId } = await createRes.json();
  console.log("✅ リッチメニュー作成:", richMenuId);

  // 2) 画像アップロード
  const img = readFileSync(join(__dirname, "line-richmenu.png"));
  const uploadRes = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: "POST",
    headers: { "Content-Type": "image/png", Authorization: `Bearer ${TOKEN}` },
    body: img,
  });
  if (!uploadRes.ok) {
    console.error("画像アップロード失敗:", uploadRes.status, await uploadRes.text());
    process.exit(1);
  }
  console.log("✅ 画像アップロード完了");

  // 3) 全ユーザーのデフォルトに設定
  const defRes = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!defRes.ok) {
    console.error("デフォルト設定失敗:", defRes.status, await defRes.text());
    process.exit(1);
  }
  console.log("✅ デフォルトメニューに設定完了");
  console.log("\n完了。LINEアプリでトーク画面下にメニューが表示されます（再入室で反映）。");
  console.log("古いメニューを掃除したい場合: GET /v2/bot/richmenu/list で一覧 → DELETE /v2/bot/richmenu/{id}");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
