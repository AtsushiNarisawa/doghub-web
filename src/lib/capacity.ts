// 部屋数（物理キャパ・固定）
// 全プラン（4h/8h/stay）共通の部屋プールとして判定する。
// 解釈A: 1件の連泊予約は CI日〜CO前日まで stay_booked にカウントされ、その間 11:00-14:00 含めて全日占有とみなす（既存ロジックで対応済み）。
export const ROOM_LIMIT = 19;

export type CapacitySnapshot = {
  day_booked: number;
  stay_booked: number;
};

/** その日の合計使用部屋数（4h+8h+stay 合算） */
export function totalUsed(cap: CapacitySnapshot): number {
  return (cap.day_booked || 0) + (cap.stay_booked || 0);
}

/** 残り部屋数 */
export function remainingRooms(cap: CapacitySnapshot): number {
  return Math.max(0, ROOM_LIMIT - totalUsed(cap));
}

/** N頭追加するとオーバーフローするか（true=満員で受け入れ不可） */
export function exceedsRoomLimit(cap: CapacitySnapshot, additionalDogs: number): boolean {
  return totalUsed(cap) + additionalDogs > ROOM_LIMIT;
}
