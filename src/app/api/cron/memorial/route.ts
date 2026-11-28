import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runReportedJob } from "@/lib/job-report";

// 記念ショート動画を翌朝 9:30 に自動で作る（2段目-B・2026-11-28 S88・✅CEO 承認＝案A）。
// 対象＝10:00 のお礼（/api/cron/thankyou）と同じ予約（日帰り＝前日／宿泊＝前日チェックアウト・お礼未送信）のうち、
//       スタッフが動画・写真を載せた回。前日までに載った素材がそろった時点で作る。
// 予約ごとに /api/memorial/render を別々に呼ぶ（同時に3件まで）。
// 失敗しても止めない＝お礼は元の写真・動画だけで届く（受け取りページは記念動画が無ければ元素材だけを出す）。
// 結果は ops_job_runs に1行（job=doghub-memorial）。
export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CONCURRENCY = 3;

function selfOrigin(req: NextRequest): string {
  // 本番は独自ドメインへ（vercel.app 側は保護がかかっていて呼べないため）
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return req.nextUrl.origin;
}

async function handle(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 前日（JST）— cron/thankyou と同じ求め方
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  jst.setDate(jst.getDate() - 1);
  const yesterday = jst.toISOString().split("T")[0];

  const [dayUse, stay] = await Promise.all([
    supabase
      .from("reservations")
      .select("id")
      .eq("date", yesterday)
      .in("plan", ["spot", "4h", "8h"])
      .in("status", ["confirmed", "completed"])
      .eq("thankyou_sent", false),
    supabase
      .from("reservations")
      .select("id")
      .eq("checkout_date", yesterday)
      .eq("plan", "stay")
      .in("status", ["confirmed", "completed"])
      .eq("thankyou_sent", false),
  ]);
  if (dayUse.error || stay.error) {
    console.error("memorial cron query error:", dayUse.error || stay.error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  const ids = [...(dayUse.data || []), ...(stay.data || [])].map((r) => r.id);
  if (ids.length === 0) return NextResponse.json({ message: `no reservations for ${yesterday}`, made: 0 });

  const { data: media, error: mediaError } = await supabase
    .from("reservation_media")
    .select("reservation_id")
    .in("reservation_id", ids)
    .in("kind", ["video", "photo"]);
  if (mediaError) {
    console.error("memorial cron media query error:", mediaError);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
  const targets = [...new Set((media || []).map((m) => m.reservation_id))];

  let made = 0;
  let skipped = 0;
  let failed = 0;
  const origin = selfOrigin(req);
  const queue = [...targets];
  async function worker() {
    for (let id = queue.shift(); id; id = queue.shift()) {
      try {
        const res = await fetch(`${origin}/api/memorial/render`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.CRON_SECRET}` },
          body: JSON.stringify({ reservation_id: id }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok && body.status === "made") made++;
        else if (res.ok && body.status === "skipped") skipped++;
        else {
          failed++;
          console.error(`memorial render failed for ${id}: http=${res.status}`, body?.error);
        }
      } catch (e) {
        failed++;
        console.error(`memorial render request threw for ${id}:`, e);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targets.length) }, worker));

  return NextResponse.json({ message: `memorial ${yesterday}`, targets: targets.length, made, skipped, failed });
}

export async function GET(req: NextRequest) {
  return runReportedJob("doghub-memorial", () => handle(req));
}
