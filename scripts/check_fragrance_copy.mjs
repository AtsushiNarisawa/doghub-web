#!/usr/bin/env node
/**
 * Fragrance の外向き文面を機械で点検する。
 *
 * 見るもの
 *   1. 禁止語が混じっていないか（薬機法・景表法・ブランド方針）
 *   2. 注文確認メールに特定商取引法13条の6項目が全部入っているか
 *
 * 🔴 2 は法令上の義務。1つでも欠けると違反になるため、人の目視ではなく機械で確かめる。
 *
 * 使い方: node scripts/check_fragrance_copy.mjs
 * 対象は src/lib/fragrance-email.ts と src/lib/fragrance/config.ts、および
 * src/app/fragrance 配下の .tsx（存在するものだけ）。
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

// ── 1. 禁止語 ────────────────────────────────────────────────
// 理由を必ず添える（後任が「なぜ駄目か」を調べ直さずに済むように）
const FORBIDDEN = [
  ["犬にも安全", "安全性の保証表現は薬機法で不可。情緒的・非保証の言い方に置き換える"],
  ["舐めても", "同上（安全性の保証）"],
  ["ペットにも安全", "同上"],
  ["肉球クリーム", "人用が主役。犬用と名乗らない（ポジショニングの根幹）"],
  ["犬用クリーム", "同上"],
  ["ペット用クリーム", "同上"],
  ["世界初", "Supmile が先行しており事実誤認＋景表法"],
  ["唯一の", "同上"],
  ["空白の市場", "同上"],
  ["肌荒れを治", "化粧品の効能効果の範囲外（薬機法）"],
  ["アトピー", "同上"],
  ["残りわずか", "在庫の実数以外で希少性を演出しない（景表法）"],
  ["今だけ", "同上"],
  ["入荷次第", "引渡時期の表示として不十分（消費者庁 通信販売広告Q&A）。期限の形で書く"],
  ["準備でき次第", "同上"],
];

// ── 2. 注文確認メールに必ず要る6項目（特商法13条・施行規則37条）──
// 各項目は「テキスト版の書き方」と「HTML版（表組み）の書き方」のどちらかがあればよい。
// 例: テキストは「商品：◯◯」、HTML は <td>商品</td><td>◯◯</td>
const REQUIRED_IN_CONFIRMATION = [
  [["ご注文を承りました"], "① 承諾した旨"],
  [["sellerBlock"], "② 事業者の名称・住所・電話（sellerBlock() を差し込んでいるか）"],
  [["お支払金額"], "③ 受領した金額"],
  [["代金をお受け取りした日"], "④ 受領した年月日"],
  [["商品：", ">商品<"], "⑤ 商品名"],
  [["数量：", ">数量<"], "⑤ 数量"],
  [["お渡しの時期"], "⑥ 引渡しの時期"],
];

// sellerBlock() 自体が名称・住所・電話を持っているか（②の中身）
const REQUIRED_IN_SELLER_BLOCK = [
  ["SELLER.address", "事業者の住所"],
  ["SELLER.tel", "事業者の電話番号"],
];

/** コメント行かどうか（禁止語の説明そのものを検出しないため）。 */
function isComment(line) {
  const t = line.trimStart();
  return t.startsWith("//") || t.startsWith("/*") || t.startsWith("*");
}

function collectTargets() {
  const files = [
    "src/lib/fragrance-email.ts",
    "src/lib/fragrance/config.ts",
  ].filter((f) => existsSync(join(ROOT, f)));

  const pageDir = join(ROOT, "src/app/fragrance");
  if (existsSync(pageDir)) {
    const walk = (dir) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (entry.endsWith(".tsx")) files.push(full.slice(ROOT.length));
      }
    };
    walk(pageDir);
  }
  return files;
}

let failures = 0;

// 禁止語
for (const rel of collectTargets()) {
  const text = readFileSync(join(ROOT, rel), "utf8");
  text.split("\n").forEach((line, i) => {
    // 禁止語一覧そのものを書いた行と、注意書きのコメントは対象外
    if (line.includes("FORBIDDEN") || isComment(line)) return;
    for (const [word, why] of FORBIDDEN) {
      if (line.includes(word)) {
        console.error(`✗ ${rel}:${i + 1} 禁止語「${word}」── ${why}`);
        failures++;
      }
    }
  });
}

// 法定6項目
const emailPath = join(ROOT, "src/lib/fragrance-email.ts");
if (existsSync(emailPath)) {
  const src = readFileSync(emailPath, "utf8");
  const start = src.indexOf("export function buildOrderConfirmation");
  const end = src.indexOf("export function buildShippedNotice");
  const body = start >= 0 ? src.slice(start, end > start ? end : undefined) : "";
  // 🔴 テキスト版と HTML 版を別々に見る。
  //    片方にしか無いと、メールソフトの設定によっては法定項目が見えない人が出る。
  const htmlAt = body.indexOf("const html =");
  const halves = htmlAt > 0
    ? [["テキスト版", body.slice(0, htmlAt)], ["HTML版", body.slice(htmlAt)]]
    : [["本文", body]];

  for (const [half, chunk] of halves) {
    for (const [needles, label] of REQUIRED_IN_CONFIRMATION) {
      if (!needles.some((n) => chunk.includes(n))) {
        console.error(
          `✗ 注文確認メールの${half}に ${label} が見つかりません（${needles.map((n) => `"${n}"`).join(" か ")}）── 特定商取引法13条`,
        );
        failures++;
      }
    }
  }

  const sbStart = src.indexOf("function sellerBlock");
  const sbEnd = src.indexOf("function fromHeader");
  const sellerBody = sbStart >= 0 ? src.slice(sbStart, sbEnd > sbStart ? sbEnd : undefined) : "";
  for (const [needle, label] of REQUIRED_IN_SELLER_BLOCK) {
    if (!sellerBody.includes(needle)) {
      console.error(`✗ sellerBlock() に ${label} が入っていません（"${needle}"）── 特定商取引法13条`);
      failures++;
    }
  }
} else {
  console.error("✗ src/lib/fragrance-email.ts が見つかりません");
  failures++;
}

if (failures) {
  console.error(`\n${failures}件の問題があります。文面を直してから公開してください。`);
  process.exit(1);
}
console.log("✓ Fragrance の文面チェックを通過しました（禁止語なし／法定6項目あり）");
