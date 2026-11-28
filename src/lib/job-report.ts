import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 自動作業（Vercel cron）の完了報告（2026-11-27 S82・general の依頼）
// 作業が終わるたびに Supabase の ops_job_runs に1行書く。general の見張り役
// （general/scripts/job_watch.py）が読み、失敗や「予定の時刻を過ぎても報告が無い」を CEO に知らせる。
// 正本＝~/projects/general/docs/ops/JOBS.md（job の名前は §3 の一覧と同じにする）。
//
// 🔴 note にお客様の名前・連絡先・鍵を書かない＝返り値 JSON のうち「数」と「真偽」だけを拾い、
//    文字列は error 系の固定文言と message（日付だけ）に限る。メールアドレスらしき文字列は伏せる。

export type JobName =
  | "doghub-reminder"
  | "doghub-thankyou"
  | "doghub-fragrance-daily"
  | "doghub-index-articles"
  | "doghub-memorial";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

function scrub(s: string, max = 160): string {
  return s
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[mail]")
    .replace(/\s+/g, " ")
    .slice(0, max);
}

/** 返り値 JSON から成功かどうかと短い要約を作る */
export function summarize(status: number, body: unknown): { ok: boolean; note: string } {
  const parts: string[] = [`http=${status}`];
  let ok = status < 400;
  if (body && typeof body === "object" && !Array.isArray(body)) {
    for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
      if (typeof v === "number") {
        parts.push(`${k}=${v}`);
        if (k === "failed" && v > 0) ok = false;
      } else if (typeof v === "boolean") {
        if (k === "ok" && v === false) ok = false;
        if (k !== "ok") parts.push(`${k}=${v}`);
      } else if (k.endsWith("_error") || k === "error") {
        // fragrance-daily は工程ごとに *_error を返す＝1つでもあれば失敗
        ok = false;
        parts.push(k === "error" && typeof v === "string" ? `error=${scrub(v, 60)}` : k);
      }
    }
  }
  return { ok, note: scrub(parts.join(" "), 300) };
}

export async function recordJobRun(job: JobName, ok: boolean, note: string): Promise<void> {
  try {
    const { error } = await db.from("ops_job_runs").insert({ job, ok, note });
    if (error) console.error(`[job-report] ${job} insert failed:`, error.message);
  } catch (e) {
    console.error(`[job-report] ${job} insert threw:`, e);
  }
}

/**
 * cron の本体を包み、終わったら（成功でも失敗でも・例外で落ちても）1行書く。
 * 認証で弾いた呼び出し（401）は cron の実行ではないので書かない。
 */
export async function runReportedJob(
  job: JobName,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  let res: NextResponse | null = null;
  try {
    res = await handler();
    return res;
  } catch (e) {
    console.error(`[job-report] ${job} threw:`, e);
    await recordJobRun(job, false, scrub(`exception: ${e instanceof Error ? e.message : String(e)}`, 300));
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  } finally {
    if (res && res.status !== 401) {
      let body: unknown = null;
      try {
        body = await res.clone().json();
      } catch {
        /* JSON でない返り値は http の数字だけで判定 */
      }
      const { ok, note } = summarize(res.status, body);
      await recordJobRun(job, ok, note);
    }
  }
}
