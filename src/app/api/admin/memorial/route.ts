import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminBearer } from "@/lib/admin-auth";
import { renderMemorialVideo } from "@/lib/memorial-render";
import { isMemorialStyle } from "@/lib/memorial-timeline";

// 管理画面の予約詳細「記念動画を今すぐ作る／作り直す」＝手動で作るボタン（2段目-B・2026-11-28 S88・CEO 依頼）。
// 翌朝 9:30 の自動作成と同じ作り方で、今ある素材からすぐ作り直す（数十秒）。古い記念動画は入れ替え。
// ffmpeg と書体は next.config.ts の outputFileTracingIncludes で同梱。
export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const REASONS: Record<string, string> = {
  no_media: "動画・写真がまだありません",
  cancelled: "キャンセル済みの予約です",
  not_found: "予約が見つかりません",
};

export async function POST(req: NextRequest) {
  if (!(await verifyAdminBearer(req))) {
    return NextResponse.json({ error: "ログインの有効期限が切れました。ログインし直してください。" }, { status: 401 });
  }
  const { reservation_id, style } = await req.json().catch(() => ({}));
  if (typeof reservation_id !== "string") return NextResponse.json({ error: "予約IDが必要です" }, { status: 400 });
  try {
    const result = await renderMemorialVideo(supabase, reservation_id, { force: true, style: isMemorialStyle(style) ? style : undefined });
    if (result.status === "skipped") {
      return NextResponse.json({ error: REASONS[result.reason] || "作れませんでした" }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (e) {
    console.error(`admin memorial render failed for ${reservation_id}:`, e);
    return NextResponse.json({ error: "記念動画を作れませんでした。時間をおいてもう一度お試しください" }, { status: 500 });
  }
}
