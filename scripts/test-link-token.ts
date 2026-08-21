// メール経由の1タップLINE連携トークンの回帰テスト。
// `npx tsx scripts/test-link-token.ts` で実行（scripts/test-line-faq.ts と同じ運用）。
//
// このトークンは「メールを受け取れる本人」の証明として顧客を特定する。
// 偽造できると他人の顧客情報に自分のLINEを紐付けられてしまうため、
// 署名・期限・改ざん耐性はここで担保する。

// 鍵は呼び出し時に process.env から読まれる（モジュール読み込み時ではない）ため、
// 静的 import のままここで設定してよい。
process.env.CRON_SECRET = "test-secret-for-link-token";

import crypto from "crypto";
import { createLinkToken, verifyLinkToken, buildLineLinkUrl } from "../src/lib/link-token.ts";

const CUSTOMER = "3b3ccd77-cf8f-4330-b360-f6c028cb7484";
let pass = 0;
let fail = 0;

function check(name: string, ok: boolean) {
  if (ok) {
    pass++;
  } else {
    fail++;
    console.error(`  ✗ ${name}`);
  }
}

// ── 正常系 ──────────────────────────────────
const token = createLinkToken(CUSTOMER)!;
check("トークンが発行される", typeof token === "string" && token.length > 0);
check("検証すると同じ顧客IDが返る", verifyLinkToken(token)?.customerId === CUSTOMER);
check("顧客IDが平文で露出しない", !token.includes(CUSTOMER));

// ── 改ざん耐性 ──────────────────────────────
const [body, sig] = token.split(".");
check("署名を差し替えたトークンは通らない", verifyLinkToken(`${body}.YWJjZA`) === null);
check("本体を差し替えたトークンは通らない", verifyLinkToken(`YWJjZA.${sig}`) === null);
check("末尾を1文字削ったトークンは通らない", verifyLinkToken(token.slice(0, -1)) === null);
check("別顧客IDに書き換えたトークンは通らない", (() => {
  const forged = Buffer.from(`00000000-0000-0000-0000-000000000000.${Date.now() + 1000}`).toString("base64url");
  return verifyLinkToken(`${forged}.${sig}`) === null;
})());

// ── 壊れた入力（例外を投げずに null を返すこと）──
for (const bad of ["", ".", "..", "abc", "abc.def", "a".repeat(5000)]) {
  check(`壊れた入力を安全に拒否: ${JSON.stringify(bad.slice(0, 12))}`, verifyLinkToken(bad) === null);
}

// ── 期限切れ ────────────────────────────────
check("期限切れトークンは通らない", (() => {
  // 期限を過去にした本体を、正しい鍵で署名し直しても弾かれること
  const key = crypto.createHmac("sha256", process.env.CRON_SECRET!).update("line-link-token/v1").digest();
  const payload = `${CUSTOMER}.${Date.now() - 1000}`;
  const s = crypto.createHmac("sha256", key).update(payload).digest();
  const expired = `${Buffer.from(payload).toString("base64url")}.${s.toString("base64url")}`;
  return verifyLinkToken(expired) === null;
})());

// ── 鍵が変わると失効する ────────────────────
check("鍵が変わると過去のトークンは失効する", (() => {
  process.env.CRON_SECRET = "rotated-secret";
  const result = verifyLinkToken(token);
  process.env.CRON_SECRET = "test-secret-for-link-token";
  return result === null;
})());

// ── URL 形式 ────────────────────────────────
const url = buildLineLinkUrl(CUSTOMER)!;
check("LIFFのURLになっている", url.startsWith("https://liff.line.me/"));
check("mode=link が付いている", url.includes("mode=link"));
check("トークンがURLエンコードされている", /[?&]t=[A-Za-z0-9._~%-]+$/.test(url));

console.log(`\nlink-token テスト: ${pass}/${pass + fail} PASS`);
if (fail > 0) {
  console.error(`\n🔴 ${fail}件 失敗`);
  process.exit(1);
}
console.log("\n✅ 全ケース PASS（署名・期限・改ざん耐性は意図どおり）");
