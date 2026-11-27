// チェックアウト後の時間の延長を、定休日・臨時休業のチェックアウト日では付けられなくする判定のテスト
// （2026-11-27 CEO「定休日のお引き取りは11時まで」）。
// 実コード（src/lib/booking-rules.ts の checkoutExtensionBlockReason など）をそのまま実走する。DB には触れない。
// 実行: node --import ./scripts/ts-resolve-hook.mjs scripts/test-checkout-extension.ts
import {
  checkoutExtensionBlockReason,
  checkoutExtensionCustomerMessage,
  checkoutAddonBlockReason,
} from "../src/lib/booking-rules.ts";

let pass = 0;
const fails: string[] = [];
const check = (ok: boolean, label: string) => (ok ? pass++ : fails.push(`✗ ${label}`));

// 2026-12-23(水)・12-24(木)＝定休／12-22(火)・12-25(金)＝営業
const WED = "2026-12-23";
const THU = "2026-12-24";
const TUE = "2026-12-22";
const FRI = "2026-12-25";

// ── 行が無い日は曜日で判定 ──
check(checkoutExtensionBlockReason(WED, null) === "regular_closed", "行なしの水曜＝定休日で不可（11-26 の実例と同じ形）");
check(checkoutExtensionBlockReason(THU, null) === "regular_closed", "行なしの木曜＝定休日で不可");
check(checkoutExtensionBlockReason(TUE, null) === null, "行なしの火曜＝付けられる");
check(checkoutExtensionBlockReason(FRI, undefined) === null, "行なしの金曜＝付けられる");

// ── 行がある日はその closed ──
check(checkoutExtensionBlockReason(FRI, { closed: true }) === "closed", "営業曜日の臨時休業＝不可");
check(checkoutExtensionBlockReason(WED, { closed: false }) === null, "水曜でも臨時営業（closed=false の行）＝付けられる（年末など）");
check(checkoutExtensionBlockReason(WED, { closed: true }) === "closed", "水曜で closed=true の行＝臨時休業として不可");
check(checkoutExtensionBlockReason(FRI, { closed: null }) === null, "closed が null の行＝営業扱い");

// ── Web受付停止・満席は休業ではない＝延長は止めない ──
const webClosed = { closed: false, web_closed: true, day_booked: 10, stay_booked: 9 } as { closed: boolean };
check(checkoutExtensionBlockReason(FRI, webClosed) === null, "Web受付停止の日＝延長は付けられる");
check(checkoutExtensionBlockReason(FRI, { closed: false, day_booked: 10, stay_booked: 9 } as { closed: boolean }) === null, "満席の日＝延長は付けられる");
// 同じ日でも半日・1日は止まる（枠を押さえるため）＝二つの判定が別物であること
check(
  checkoutAddonBlockReason(FRI, { closed: false, web_closed: true }, { isStaff: false }) === "web_closed",
  "同じ Web受付停止の日でも、半日・1日はお客様は不可のまま"
);

// ── 定休曜日の設定を渡したとき ──
check(checkoutExtensionBlockReason(TUE, null, [2]) === "regular_closed", "定休曜日を火曜にした設定なら火曜が不可");
check(checkoutExtensionBlockReason(WED, null, [2]) === null, "定休曜日を火曜にした設定なら水曜は付けられる");

// ── 空のチェックアウト日 ──
check(checkoutExtensionBlockReason("", null) === null, "チェックアウト日が未選択＝判定しない");

// ── 文言 ──
const m1 = checkoutExtensionCustomerMessage("regular_closed", WED);
const m2 = checkoutExtensionCustomerMessage("closed", FRI);
check(
  m1 === "チェックアウト日の12月23日（水）は定休日のため、時間の延長はお付けできません。お引き取りは9:00〜11:00の間でお願いいたします",
  `定休日の文言（実際: ${m1}）`
);
check(
  m2 === "チェックアウト日の12月25日（金）は臨時休業のため、時間の延長はお付けできません。お引き取りは9:00〜11:00の間でお願いいたします",
  `臨時休業の文言（実際: ${m2}）`
);
check(!m1.includes("電話") && !m2.includes("電話"), "電話へ誘導しない（半日・1日と同じ決まり）");

console.log(`延長の休業判定テスト: ${pass}/${pass + fails.length} PASS`);
if (fails.length) {
  console.log(fails.join("\n"));
  process.exit(1);
}
console.log("\n✅ 全ケース PASS");
