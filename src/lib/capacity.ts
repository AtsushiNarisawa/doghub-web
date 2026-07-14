// 部屋数（物理キャパ）— 二段階の上限で運用する（2026-07-13 リピートエンジン CEO決定）
//
//  - WEB_ROOM_LIMIT (15): Web予約の「運用上限（実態）」。ここに達したら空き表示を×にして
//    「満席です。お問い合わせください」へ誘導する。15超になるのは年に1〜2回程度（CEO談）。
//  - PHYSICAL_ROOM_LIMIT (19): 実際の部屋数＝「物理上限」。満席のお問い合わせを受けたスタッフが
//    管理画面（source=phone）から15〜19の枠で手動受付する際の上限。真の過剰予約（19室超）は防ぐ。
//    容量確保RPC reserve_capacity の最終アトミックガードもこの物理19で判定している（DB側は据え置き）。
//
// 整合ルール：Web運用上限(15)はこの WEB_ROOM_LIMIT を単一ソースとして
// Web表示・Web予約ゲート・お客様の日程変更が参照する（値の二重管理をしない）。
// 物理上限(19)は PHYSICAL_ROOM_LIMIT ＋ DB関数 reserve_capacity の両方に存在する
// （物理部屋数が変わる場合はこの2箇所を必ず一緒に直す）。
//
// 容量は頭数（犬＝部屋）単位。1件の連泊予約は CI日〜CO前日まで stay_booked に計上され、
// その間 11:00-14:00 含めて全日占有とみなす（既存ロジックで対応済み）。
export const WEB_ROOM_LIMIT = 15;
export const PHYSICAL_ROOM_LIMIT = 19;

// 後方互換エイリアス。管理画面など「物理上限」を指したい既存コードが参照する。
export const ROOM_LIMIT = PHYSICAL_ROOM_LIMIT;

// カレンダーで「△ 混み合っています」を出す残数の上限（残数がこれ以下＝△）。
// 2026-07-14 CEO決定: 残り7以下（＝占有8頭以上）で△にする（お盆周辺の人気日を可視化）。
// 変更する場合はここ1箇所でよい（step1-plan が参照）。
export const LOW_STOCK_REMAINING = 7;

export type CapacitySnapshot = {
  day_booked: number;
  stay_booked: number;
};

/** その日の合計使用部屋数（4h+8h+stay 合算） */
export function totalUsed(cap: CapacitySnapshot): number {
  return (cap.day_booked || 0) + (cap.stay_booked || 0);
}

/** 残り部屋数（既定はWeb運用上限。物理残数が欲しい場合は limit を渡す） */
export function remainingRooms(cap: CapacitySnapshot, limit: number = WEB_ROOM_LIMIT): number {
  return Math.max(0, limit - totalUsed(cap));
}

/**
 * N頭追加すると上限をオーバーフローするか（true=受け入れ不可）。
 * limit の既定はWeb運用上限(15)。スタッフ受付など物理上限で判定したい場合は
 * PHYSICAL_ROOM_LIMIT を明示的に渡す。
 */
export function exceedsRoomLimit(
  cap: CapacitySnapshot,
  additionalDogs: number,
  limit: number = WEB_ROOM_LIMIT,
): boolean {
  return totalUsed(cap) + additionalDogs > limit;
}
