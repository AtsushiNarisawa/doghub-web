import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { renderMemorialVideo } from "@/lib/memorial-render";

// 記念動画を1予約ぶん作る（2段目-B・2026-11-28 S88）。
// 9:30 の cron（/api/cron/memorial）が予約ごとにここを呼ぶ＝1件ずつ別の関数で動き、1件の失敗が他に響かない。
// 認証＝cron と同じ CRON_SECRET（外からは呼べない）。ffmpeg と書体は next.config.ts の outputFileTracingIncludes で同梱。
export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { reservation_id } = await req.json().catch(() => ({}));
  if (typeof reservation_id !== "string") {
    return NextResponse.json({ error: "reservation_id required" }, { status: 400 });
  }
  try {
    const result = await renderMemorialVideo(supabase, reservation_id);
    return NextResponse.json(result);
  } catch (e) {
    console.error(`memorial render failed for ${reservation_id}:`, e);
    return NextResponse.json({ status: "failed", error: e instanceof Error ? e.message.slice(0, 200) : "failed" }, { status: 500 });
  }
}
