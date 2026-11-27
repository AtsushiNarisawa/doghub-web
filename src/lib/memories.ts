import type { SupabaseClient } from "@supabase/supabase-js";

// 記念ショート動画・写真（1段目＝受け取りの仕組み・2026-11-28 S84）。
// 計画＝docs/specs/memorial_video_stage1_plan_2026-11-28.md
// ファイル本体は Storage の非公開バケット `memories`、記録は表 `reservation_media`（service_role のみ）。
// お客様には本人確認（電話番号の下4桁）の後に、短時間だけ有効な署名つきリンクを出す。

export const MEMORIES_BUCKET = "memories";

/** お客様に出す署名つきリンクの有効時間（秒）。ページを開いている間だけ使えればよい */
export const MEMORIES_SIGNED_URL_TTL = 60 * 60;

/** 受け取りページの URL（お礼のメール・LINE に載せる） */
export function memoriesPageUrl(reservationId: string): string {
  return `https://dog-hub.shop/memories/${reservationId}`;
}

/** 置き場の住所。予約ごとのフォルダに分ける（2段目・3段目で消すときもこの単位） */
export function buildMediaPath(reservationId: string, kind: "video" | "photo"): string {
  const ext = kind === "video" ? "mp4" : "jpg";
  const rand = crypto.randomUUID();
  return `${reservationId}/${kind}-${Date.now()}-${rand}.${ext}`;
}

/** 渡された住所がその予約のフォルダの中で、形も正しいか（管理画面からの登録時の検査） */
export function isValidMediaPath(path: string, reservationId: string, kind: "video" | "photo"): boolean {
  const ext = kind === "video" ? "mp4" : "jpg";
  const re = new RegExp(`^${reservationId}/${kind}-\\d+-[0-9a-f-]{36}\\.${ext}$`);
  return re.test(path);
}

/** その予約に動画・写真が1つでもあるか（お礼にリンクを付けるかの判定・唯一の判定箇所） */
export async function reservationHasMedia(
  supabase: SupabaseClient,
  reservationId: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from("reservation_media")
    .select("id", { count: "exact", head: true })
    .eq("reservation_id", reservationId);
  if (error) {
    // 表が無い・一時的な失敗でもお礼そのものは止めない（リンクを付けないだけ）
    console.error("reservationHasMedia error:", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}
