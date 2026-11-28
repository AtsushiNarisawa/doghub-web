import { ImageResponse } from "next/og";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { promises as fs, existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MEMORIES_BUCKET } from "@/lib/memories";
import {
  DEFAULT_SCENES,
  buildTimeline,
  monthOf,
  pickScenes,
  VIDEO_H,
  VIDEO_W,
  type Clip,
  type DogShot,
  type SceneShot,
  type TextBlock,
} from "@/lib/memorial-timeline";

// 記念ショート動画をサーバーで作る（2段目-B・2026-11-28 S88）。
// 計画＝docs/specs/memorial_video_stage2b_plan_2026-11-28.md（§8 技術の下調べ＝1 vCPU で約20秒）
// 作り方は見本 v2.2（docs/media/2026-11/memorial_samples_v2/build_v22.py）と同じ：
//   写真＝ぼかした背景の上に全体を置き、ゆっくり寄る／動画＝最初の2.5秒／景色＝2秒
//   文字＝角の丸い半透明の帯（next/og で透明な PNG に描いて重ねる）
// ffmpeg＝@ffmpeg-installer/linux-x64（Vercel の Linux 用・optionalDependencies）。手元の Mac では PATH の ffmpeg。
// 🔴 この関数を呼ぶルートは next.config.ts の outputFileTracingIncludes に ffmpeg と書体を足すこと。

const run = promisify(execFile);
const ENC = ["-r", "30", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-an"];

export type RenderResult =
  | { status: "made"; storage_path: string; seconds: number; clips: number; scenes: number; render_ms: number }
  | { status: "skipped"; reason: "no_media" | "up_to_date" | "opt_out" | "cancelled" | "not_found" };

async function ffmpegPath(): Promise<string> {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  const bundled = path.join(process.cwd(), "node_modules/@ffmpeg-installer/linux-x64/ffmpeg");
  if (process.platform === "linux" && existsSync(bundled)) {
    // 置き場によっては実行の権限が落ちることがある＝/tmp に写して権限を付け直す
    const target = path.join(os.tmpdir(), "doghub-ffmpeg");
    if (!existsSync(target)) {
      await fs.copyFile(bundled, target);
      await fs.chmod(target, 0o755);
    }
    return target;
  }
  return "ffmpeg";
}

let fontCache: { bold: Buffer; regular: Buffer } | null = null;
async function loadFonts() {
  if (!fontCache) {
    const dir = path.join(process.cwd(), "assets/fonts");
    const [bold, regular] = await Promise.all([
      fs.readFile(path.join(dir, "NotoSansJP-Bold.ttf")),
      fs.readFile(path.join(dir, "NotoSansJP-Regular.ttf")),
    ]);
    fontCache = { bold, regular };
  }
  return fontCache;
}

/** 文字の帯を、動画と同じ大きさの透明な PNG に描く */
async function textPng(blocks: TextBlock[], out: string) {
  const fonts = await loadFonts();
  const img = new ImageResponse(
    (
      <div style={{ width: VIDEO_W, height: VIDEO_H, display: "flex", position: "relative" }}>
        {blocks.map((b, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: b.top,
              left: 0,
              width: VIDEO_W,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxWidth: VIDEO_W - 64,
                padding: `${Math.round(b.size * 0.3)}px ${Math.round(b.size * 0.6)}px`,
                borderRadius: Math.round(b.size * 0.6),
                background: "rgba(0,0,0,0.45)",
              }}
            >
              {b.lines.map((t, j) => (
                <div
                  key={j}
                  style={{
                    fontFamily: "NotoSansJP",
                    fontWeight: b.bold ? 700 : 400,
                    fontSize: b.size,
                    lineHeight: 1.45,
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
    {
      width: VIDEO_W,
      height: VIDEO_H,
      fonts: [
        { name: "NotoSansJP", data: fonts.bold, weight: 700, style: "normal" },
        { name: "NotoSansJP", data: fonts.regular, weight: 400, style: "normal" },
      ],
    }
  );
  await fs.writeFile(out, Buffer.from(await img.arrayBuffer()));
}

/** 1コマを作る（素材＋文字 → 720×1280・30fps の mp4） */
async function renderClip(ff: string, clip: Clip, png: string, out: string, textFrom: number) {
  const W = VIDEO_W;
  const H = VIDEO_H;
  const frames = Math.round(clip.seconds * 30);
  // ぼかした背景の上に全体を置く（横長・縦長どちらでも切れない）
  const fit =
    `[0]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=30:3,eq=brightness=-0.08[bg];` +
    `[0]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2`;
  const motion = clip.zoom
    ? `,scale=${W * 2}:${H * 2},zoompan=z='1+0.06*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=30`
    : `,fps=30`;
  const filter = `${fit}${motion},setsar=1[v];[1]format=rgba[t];[v][t]overlay=enable='gte(t,${textFrom})':shortest=1,format=yuv420p[o]`;

  const input =
    clip.kind === "photo"
      ? ["-loop", "1", "-i", clip.file]
      : ["-ss", String(clip.startSec), "-i", clip.file];
  await run(
    ff,
    ["-nostdin", "-loglevel", "error", "-y", ...input, "-loop", "1", "-i", png, "-filter_complex", filter, "-map", "[o]", "-t", String(clip.seconds), ...ENC, out],
    { timeout: 120_000, maxBuffer: 8 * 1024 * 1024 }
  );
}

/** 並び（clips）から1本の mp4 を作り、その場所を返す（dir は作業用の一時フォルダ） */
export async function composeMemorial(ff: string | null, clips: Clip[], dir: string): Promise<string> {
  const bin = ff ?? (await ffmpegPath());
  const parts: string[] = [];
  for (let i = 0; i < clips.length; i++) {
    const png = path.join(dir, `t${i}.png`);
    const out = path.join(dir, `c${i}.mp4`);
    await textPng(clips[i].texts, png);
    // 最初の場面は0秒から文字を出す＝再生前の表紙（サムネイル）に題名が出る。2場面目からは少し遅らせる（見本どおり）
    await renderClip(bin, clips[i], png, out, i === 0 ? 0 : 0.15);
    parts.push(out);
  }
  const list = path.join(dir, "list.txt");
  await fs.writeFile(list, parts.map((p) => `file '${p}'\n`).join(""));
  const final = path.join(dir, "memorial.mp4");
  await run(bin, ["-nostdin", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", final], {
    timeout: 60_000,
  });
  return final;
}

type MediaRow ={ id: string; kind: string; storage_path: string; duration_sec: number | null; created_at: string };

async function download(supabase: SupabaseClient, storagePath: string, dest: string) {
  const { data, error } = await supabase.storage.from(MEMORIES_BUCKET).download(storagePath);
  if (error || !data) throw new Error(`download failed: ${error?.message || "no data"}`);
  await fs.writeFile(dest, Buffer.from(await data.arrayBuffer()));
}

/**
 * 1予約ぶんの記念動画を作って置き場に入れ、reservation_media に kind='memorial' で1行足す（古いものは入れ替え）。
 * force＝管理画面の手動ボタン（今すぐ作る／作り直す）。新しい素材が無くても作り直す。動画不要のお客様は画面に赤い注意が出る。
 */
export async function renderMemorialVideo(
  supabase: SupabaseClient,
  reservationId: string,
  opts: { force?: boolean } = {}
): Promise<RenderResult> {
  const started = Date.now();
  const { data: r } = await supabase
    .from("reservations")
    .select("id, plan, date, status, customer_id, customers(memorial_opt_out), reservation_dogs(dogs(name))")
    .eq("id", reservationId)
    .single();
  if (!r) return { status: "skipped", reason: "not_found" };
  if (r.status === "cancelled") return { status: "skipped", reason: "cancelled" };
  const customer = r.customers as unknown as { memorial_opt_out: boolean } | null;
  if (customer?.memorial_opt_out === true && !opts.force) return { status: "skipped", reason: "opt_out" };

  const { data: rows, error: mediaError } = await supabase
    .from("reservation_media")
    .select("id, kind, storage_path, duration_sec, created_at")
    .eq("reservation_id", reservationId)
    .order("created_at", { ascending: true });
  if (mediaError) throw new Error(`media query failed: ${mediaError.message}`);
  const all = (rows || []) as MediaRow[];
  const sources = all.filter((m) => m.kind === "video" || m.kind === "photo");
  const olds = all.filter((m) => m.kind === "memorial");
  if (sources.length === 0) return { status: "skipped", reason: "no_media" };
  if (!opts.force && olds.length > 0) {
    const newestSource = sources[sources.length - 1].created_at;
    if (olds.every((o) => o.created_at > newestSource)) return { status: "skipped", reason: "up_to_date" };
  }

  const { data: sceneRows, error: sceneError } = await supabase
    .from("memorial_scenes")
    .select("id, kind, storage_path, caption, months, active");
  if (sceneError) console.error("memorial_scenes query error:", sceneError.message); // 景色なしで続ける
  const scenes = pickScenes(
    (sceneRows || []) as { id: string; kind: "video" | "photo"; storage_path: string; caption: string; months: number[]; active: boolean }[],
    monthOf(r.date),
    reservationId
  );

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "memorial-"));
  try {
    const ff = await ffmpegPath();
    // ファイル本体が置き場に無いもの（消された・送信途中で止まった）は飛ばす＝残りの素材で作る
    const dogSlots: (DogShot | null)[] = [];
    const sceneSlots: (SceneShot | null)[] = [];
    await Promise.all([
      ...sources.map(async (m, i) => {
        const file = path.join(dir, `src${i}.${m.kind === "video" ? "mp4" : "jpg"}`);
        try {
          await download(supabase, m.storage_path, file);
          dogSlots[i] = { kind: m.kind as "video" | "photo", file, durationSec: m.duration_sec == null ? null : Number(m.duration_sec) };
        } catch (e) {
          console.error(`memorial: source missing ${m.storage_path}:`, e instanceof Error ? e.message : e);
          dogSlots[i] = null;
        }
      }),
      ...scenes.map(async (s, i) => {
        const file = path.join(dir, `scene${i}.${s.kind === "video" ? "mp4" : "jpg"}`);
        try {
          await download(supabase, s.storage_path, file);
          sceneSlots[i] = { id: s.id, kind: s.kind, file, caption: s.caption };
        } catch (e) {
          console.error(`memorial: scene missing ${s.storage_path}:`, e instanceof Error ? e.message : e);
          sceneSlots[i] = null;
        }
      }),
    ]);
    const dogShots = dogSlots.filter((s): s is DogShot => !!s);
    const sceneShots = sceneSlots.filter((s): s is SceneShot => !!s);
    if (dogShots.length === 0) return { status: "skipped", reason: "no_media" };
    // 登録した景色が3つに足りない月は、最初から入っている見本で足す
    const month = monthOf(r.date);
    for (const d of pickScenes(DEFAULT_SCENES.map((x) => ({ ...x, active: true })), month, reservationId)) {
      if (sceneShots.length >= 3) break;
      const file = path.join(process.cwd(), "assets/scenes", d.file);
      if (existsSync(file)) sceneShots.push({ id: d.id, kind: "video", file, caption: d.caption });
    }

    const dogNames = ((r.reservation_dogs as unknown as { dogs: { name: string } | null }[]) || [])
      .map((rd) => rd.dogs?.name)
      .filter(Boolean) as string[];
    const clips = buildTimeline({ reservationId, plan: r.plan, date: r.date, dogNames, dogShots, scenes: sceneShots });
    const buf = await fs.readFile(await composeMemorial(ff, clips, dir));
    const seconds = Math.round(clips.reduce((s, c) => s + c.seconds, 0) * 10) / 10;

    const storagePath = `${reservationId}/memorial-${Date.now()}-${crypto.randomUUID()}.mp4`;
    const { error: upError } = await supabase.storage
      .from(MEMORIES_BUCKET)
      .upload(storagePath, buf, { contentType: "video/mp4", upsert: false });
    if (upError) throw new Error(`upload failed: ${upError.message}`);
    const { error: insError } = await supabase.from("reservation_media").insert({
      reservation_id: reservationId,
      customer_id: r.customer_id,
      kind: "memorial",
      storage_path: storagePath,
      size_bytes: buf.length,
      width: VIDEO_W,
      height: VIDEO_H,
      duration_sec: seconds,
      uploaded_by: "auto",
    });
    if (insError) {
      await supabase.storage.from(MEMORIES_BUCKET).remove([storagePath]);
      throw new Error(`insert failed: ${insError.message}`);
    }
    // 古い記念動画は入れ替え（新しいものが入ってから消す）
    if (olds.length > 0) {
      await supabase.storage.from(MEMORIES_BUCKET).remove(olds.map((o) => o.storage_path));
      await supabase.from("reservation_media").delete().in("id", olds.map((o) => o.id));
    }
    return {
      status: "made",
      storage_path: storagePath,
      seconds,
      clips: clips.length,
      scenes: sceneShots.length,
      render_ms: Date.now() - started,
    };
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
