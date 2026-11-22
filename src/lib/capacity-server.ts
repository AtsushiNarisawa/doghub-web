// 部屋数（daily_capacity）を DB に反映する唯一の入口（サーバー専用）。
//
// 何を足し引きするかは lib/booking-rules.ts の capacityFootprint / diffFootprint が決め、
// ここはその差分を DB 関数 apply_capacity_delta（計画書 §2 SQL-B）に1回で渡すだけ。
// DB 関数は対象日を日付順にロックし、増える日について
//   ・休業でないこと（行が無い水木に行を作らない＝臨時営業に見えるのを防ぐ）
//   ・合計（day_booked + stay_booked）+ 増分 ≤ 上限
// を確かめてから1トランザクションで反映する。片方の日だけ確保される状態は起きない。
//
// 🔴 各 API に updateCapacity の写しを書かないこと（2026-11-22 に4つの写しを削除した）。

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CapacityItem } from "./booking-rules";
import { isDefaultClosedWeekday } from "./business-days";
import { PHYSICAL_ROOM_LIMIT } from "./capacity";

export type CapacityApplyResult =
  | { ok: true }
  | { ok: false; kind: "closed" | "capacity"; date: string };

/**
 * 差分を DB に反映する。
 * @param limit お客様の操作は WEB_ROOM_LIMIT(15)、スタッフは PHYSICAL_ROOM_LIMIT(19)
 */
export async function applyCapacityDelta(
  supabase: SupabaseClient,
  items: CapacityItem[],
  limit: number = PHYSICAL_ROOM_LIMIT,
): Promise<CapacityApplyResult> {
  if (items.length === 0) return { ok: true };
  const { error } = await supabase.rpc("apply_capacity_delta", {
    p_items: items,
    p_limit: Math.min(limit, PHYSICAL_ROOM_LIMIT),
  });
  if (!error) return { ok: true };

  const msg = error.message || "";
  const closed = msg.match(/CLOSED_DAY:(\d{4}-\d{2}-\d{2})/);
  if (closed) return { ok: false, kind: "closed", date: closed[1] };
  const full = msg.match(/CAPACITY_EXCEEDED:(\d{4}-\d{2}-\d{2})/);
  if (full) return { ok: false, kind: "capacity", date: full[1] };

  // 想定外（関数が無い・通信断など）: 予約・キャンセルの操作そのものは済ませ、枠がずれたまま
  // 黙らないよう、従来と同じ非原子的な方法で反映しておく（各 API は休業・上限を事前にも見ている）。
  console.error("[capacity] apply_capacity_delta unexpected error, fallback to non-atomic update:", msg);
  await applyCapacityDeltaFallback(supabase, items);
  return { ok: true };
}

/**
 * apply_capacity_delta が想定外のエラー（関数が無い・通信断など）で動かなかったときの予備。
 * 予約・キャンセルを失わせないために、従来と同じ「読んで→足して→書く」で反映する（原子的ではない）。
 * 行が無い日に足す場合でも、既定の定休曜日には行を作らない（臨時営業に見えてしまうため）。
 */
export async function applyCapacityDeltaFallback(
  supabase: SupabaseClient,
  items: CapacityItem[],
): Promise<void> {
  for (const it of items) {
    const { data: existing } = await supabase
      .from("daily_capacity")
      .select("day_booked, stay_booked")
      .eq("date", it.date)
      .maybeSingle();
    if (existing) {
      const cur = (existing as Record<string, number>)[it.column] || 0;
      await supabase
        .from("daily_capacity")
        .update({ [it.column]: Math.max(0, cur + it.delta) })
        .eq("date", it.date);
    } else if (it.delta > 0 && !isDefaultClosedWeekday(it.date)) {
      await supabase.from("daily_capacity").insert({ date: it.date, [it.column]: it.delta });
    }
  }
}
