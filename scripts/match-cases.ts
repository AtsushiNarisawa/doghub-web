// 外部生成（敵対的ワークフロー）のテストケースを実マッチャに通し、誤爆/取りこぼしを洗い出す。
// 実行: node scripts/match-cases.ts /tmp/line-faq-cases.json
import { readFileSync } from "node:fs";
import { matchFaqReply } from "../src/lib/line-faq.ts";

const path = process.argv[2] || "/tmp/line-faq-cases.json";
const cases: { text: string; expectedCategory: string; why?: string }[] = JSON.parse(
  readFileSync(path, "utf8")
).cases;

const NO_ALERT = new Set([
  "対応外サービス", "支払い方法", "お散歩オプション", "様子確認",
  "料金", "ワクチン", "持ち物", "大型犬", "営業時間", "アクセス", "予約",
]);

let match = 0;
const mismatches: { text: string; expected: string; actual: string; needsHuman: boolean; why?: string }[] = [];

for (const c of cases) {
  const r = matchFaqReply(c.text);
  if (r.category === c.expectedCategory) {
    match++;
  } else {
    mismatches.push({ text: c.text, expected: c.expectedCategory, actual: r.category, needsHuman: r.needsHuman, why: c.why });
  }
}

console.log(`\n=== 実マッチャ照合: ${match}/${cases.length} 一致 / ${mismatches.length} 不一致 ===\n`);

// 不一致を「期待カテゴリ」ごとにまとめて表示（取りこぼしパターンが見やすい）
const byExpected: Record<string, typeof mismatches> = {};
for (const m of mismatches) (byExpected[m.expected] ||= []).push(m);

for (const [exp, list] of Object.entries(byExpected)) {
  console.log(`▼ 期待「${exp}」だが別カテゴリへ（${list.length}件）`);
  for (const m of list) {
    console.log(`   "${m.text}"\n      → 実際: ${m.actual}${m.actual === "フォールバック" ? "(取りこぼし)" : "(誤爆)"}${m.why ? `  〈${m.why}〉` : ""}`);
  }
  console.log("");
}

if (mismatches.length === 0) console.log("✅ 不一致ゼロ");
