// ───── キャンセル通知に「残っているご予約」を添える（2026-11-26 CEO 承認）─────────────
//
// きっかけ（11/25 夜・半日のお客様）: 9時の予約の時間を変えたくて、10時で取り直してから9時をキャンセル
// → キャンセル通知が「ご予約がキャンセルされました／またのご利用をお待ちしております」だけで、
// 10時の予約が残っているのかが分からず、LINE で「変更できましたか？」と尋ねることになった。
//
// 同じお客様に今後の確定済み（confirmed）予約があれば、キャンセル通知（LINE・お客様控えメール）に
// 「◯月◯日（曜）10:00 の半日お預かりのご予約は、引き続き承っております」を添える。無ければ今の文面のまま。
//
// 🔴 追加の DB 読み取りは「通知を壊さない」: 失敗・遅延（REMAINING_TIMEOUT_MS 超）なら空＝今の文面で送る。
// 🔴 出すのは日程・時刻・プラン名だけ（予約確定・リマインドで同じお客様に送っている内容）。
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatDateJaWithWeekday } from "./booking-rules";

export interface RemainingBooking {
  id: string;
  plan: string;
  date: string;
  checkout_date: string | null;
  checkin_time: string | null;
  /** 早預かりが付いていると実際のお預けは checkin_time より早い＝時刻は書かない（日付とプランだけ） */
  checkin_extension_from?: string | null;
}

/** 添えるのはこの件数まで（多いときは「ほか◯件」） */
const MAX_LINES = 3;
/** 読み取りの待ち上限。キャンセル通知はお客様が画面を見ている間に送る＝長く待たせない */
export const REMAINING_TIMEOUT_MS = 2500;

const PLAN_LABEL: Record<string, string> = {
  stay: "宿泊お預かり",
  "8h": "1日お預かり",
  "4h": "半日お預かり",
  spot: "スポットお預かり",
};

function hhmm(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":");
  if (!h || !m) return "";
  return `${Number(h)}:${m}`;
}

/** 1件分の「…のご予約」 */
function describe(r: RemainingBooking): string {
  const plan = PLAN_LABEL[r.plan] ?? "お預かり";
  if (r.plan === "stay" && r.checkout_date) {
    return `${formatDateJaWithWeekday(r.date)}〜${formatDateJaWithWeekday(r.checkout_date)}の${plan}`;
  }
  const t = r.checkin_extension_from ? "" : hhmm(r.checkin_time);
  return `${formatDateJaWithWeekday(r.date)}${t}の${plan}`;
}

/**
 * 「引き続き承っております」の行（無ければ空配列）。
 * 例: ["11月28日（土）10:00の半日お預かりのご予約は、引き続き承っております。"]
 */
export function remainingBookingLines(list: RemainingBooking[]): string[] {
  if (!list.length) return [];
  const sorted = [...list].sort(
    (a, b) => a.date.localeCompare(b.date) || (a.checkin_time || "").localeCompare(b.checkin_time || "")
  );
  const shown = sorted.slice(0, MAX_LINES);
  const lines = shown.map((r) => `${describe(r)}のご予約は、引き続き承っております。`);
  if (sorted.length > shown.length) {
    lines.push(`（ほか${sorted.length - shown.length}件のご予約も、引き続き承っております）`);
  }
  return lines;
}

/**
 * 同じお客様の今後の確定済み予約（キャンセルした予約自身を除く）。失敗・遅延なら空配列。
 * 「同じお客様」＝同じ customer_id。LINE 連携済みなら同じ line_id の顧客も含める
 * （同じ方の顧客レコードが重複している実例があるため。LINE の自動回答と同じ引き方）。
 */
export async function loadRemainingBookings(
  supabase: SupabaseClient,
  params: { customerId: string | null | undefined; lineId?: string | null; excludeId: string; today: string },
  timeoutMs: number = REMAINING_TIMEOUT_MS
): Promise<RemainingBooking[]> {
  if (!params.customerId) return [];
  const load = async (): Promise<RemainingBooking[]> => {
    const ids = new Set<string>([params.customerId as string]);
    if (params.lineId) {
      const { data: custs } = await supabase.from("customers").select("id").eq("line_id", params.lineId).limit(5);
      (custs ?? []).forEach((c: { id: string }) => ids.add(c.id));
    }
    const { data, error } = await supabase
      .from("reservations")
      .select("id, plan, date, checkout_date, checkin_time, checkin_extension_from")
      .in("customer_id", [...ids])
      .eq("status", "confirmed")
      .gte("date", params.today)
      .neq("id", params.excludeId)
      .limit(10);
    if (error || !data) return [];
    return data as RemainingBooking[];
  };
  try {
    const pending = load();
    pending.catch(() => {});
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<RemainingBooking[]>((resolve) => {
      timer = setTimeout(() => resolve([]), timeoutMs);
    });
    const result = await Promise.race([pending.catch(() => [] as RemainingBooking[]), timeout]);
    if (timer) clearTimeout(timer);
    return result;
  } catch (e) {
    console.error("[remaining-bookings] load failed:", e);
    return [];
  }
}
