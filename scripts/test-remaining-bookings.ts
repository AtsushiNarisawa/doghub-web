// キャンセル通知に「残っているご予約」を添える（2026-11-26）の決定論的テスト。DB には触れない（偽のクライアント）。
// 実行: node --import ./scripts/ts-resolve-hook.mjs scripts/test-remaining-bookings.ts
import { remainingBookingLines, loadRemainingBookings, type RemainingBooking } from "../src/lib/remaining-bookings.ts";
import { buildCancellationMessage } from "../src/lib/line.ts";

let pass = 0;
const fails: string[] = [];
const check = (ok: boolean, label: string) => (ok ? pass++ : fails.push(`✗ ${label}`));

// 実例の型: 半日 11/28(土) 9:00 をキャンセル・同じ日の 10:00 が残っている
const ten: RemainingBooking = { id: "b", plan: "4h", date: "2026-11-28", checkout_date: null, checkin_time: "10:00:00" };
const lines = remainingBookingLines([ten]);
check(lines.length === 1 && lines[0] === "11月28日（土）10:00の半日お預かりのご予約は、引き続き承っております。", `1件の行（実際 ${lines[0]}）`);
const stay: RemainingBooking = { id: "c", plan: "stay", date: "2026-12-04", checkout_date: "2026-12-06", checkin_time: "15:00:00" };
check(remainingBookingLines([stay])[0] === "12月4日（金）〜12月6日（日）の宿泊お預かりのご予約は、引き続き承っております。", "宿泊は期間で書く（時刻は出さない）");
check(remainingBookingLines([]).length === 0, "残りが無ければ空");
const many = remainingBookingLines([stay, ten, { ...ten, id: "d", date: "2026-12-11" }, { ...ten, id: "e", date: "2026-12-12" }]);
check(many.length === 4 && many[0].startsWith("11月28日") && many[3].includes("ほか1件"), "日付順・3件まで＋「ほか◯件」");

// LINE の文面
const text = (m: ReturnType<typeof buildCancellationMessage>) => (m[0] as { text: string }).text;
const withRest = text(buildCancellationMessage({ customerName: "山田花子", plan: "4h", date: "2026-11-28", cancelledBy: "customer", remaining: lines }));
check(withRest.includes("❌ ご予約がキャンセルされました") && withRest.includes("引き続き承っております"), "残りがあれば添える");
check(!withRest.includes("またのご利用をお待ちしております") && withRest.endsWith("引き続きよろしくお願いいたします🐾"), "残りがあるときは「またのご利用を」で結ばない");
const none = text(buildCancellationMessage({ customerName: "山田花子", plan: "4h", date: "2026-11-28", cancelledBy: "customer" }));
const noneEmpty = text(buildCancellationMessage({ customerName: "山田花子", plan: "4h", date: "2026-11-28", cancelledBy: "customer", remaining: [] }));
check(none === noneEmpty && none.endsWith("またのご利用をお待ちしております🐾") && !none.includes("引き続き"), "残りが無ければ今の文面のまま");
const staff = text(buildCancellationMessage({ customerName: "山田花子", plan: "4h", date: "2026-11-28", cancelledBy: "staff", remaining: lines }));
check(staff.includes("お心当たりがない場合") && staff.includes("引き続き承っております"), "スタッフ操作のキャンセルでも添える");

// 読み取り: 失敗・遅延でも通知を壊さない（空を返す）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fakeClient(behavior: "ok" | "error" | "throw" | "slow"): any {
  const rows = [ten];
  const chain = {
    select: () => chain, in: () => chain, eq: () => chain, gte: () => chain, neq: () => chain,
    limit: () => {
      if (behavior === "throw") return Promise.reject(new Error("boom"));
      if (behavior === "error") return Promise.resolve({ data: null, error: { message: "x" } });
      if (behavior === "slow") return new Promise((r) => setTimeout(() => r({ data: rows, error: null }), 300));
      return Promise.resolve({ data: rows, error: null });
    },
  };
  return { from: () => chain };
}
const params = { customerId: "cust", lineId: "U1", excludeId: "a", today: "2026-11-25" };
check((await loadRemainingBookings(fakeClient("ok"), params)).length === 1, "読めれば残りを返す");
check((await loadRemainingBookings(fakeClient("error"), params)).length === 0, "エラーなら空");
check((await loadRemainingBookings(fakeClient("throw"), params)).length === 0, "例外でも空（投げない）");
const t0 = Date.now();
check((await loadRemainingBookings(fakeClient("slow"), params, 50)).length === 0 && Date.now() - t0 < 250, "遅ければ打ち切って空");
check((await loadRemainingBookings(fakeClient("ok"), { ...params, customerId: null })).length === 0, "顧客IDが無ければ読まない");

console.log(`キャンセル通知の残り予約テスト: ${pass}/${pass + fails.length} PASS`);
if (fails.length) {
  console.log(fails.join("\n"));
  process.exit(1);
}
console.log("✅ 全ケース PASS");
