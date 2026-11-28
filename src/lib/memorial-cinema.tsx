import { ImageResponse } from "next/og";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { promises as fs } from "node:fs";
import path from "node:path";
import { VIDEO_H, VIDEO_W, type Clip } from "@/lib/memorial-timeline";

// 記念動画「シネマ型」（11-28 S88・CEO「他のインフルエンサーの動画を参考に」）。
// 旅行 vlog でよく見る作り：画面いっぱいの写真・動画／色味を少し温かく・フィルムの粒子・周辺を少し暗く
// ／左上に場所の刻印・右下にオレンジの日付（フィルムカメラ風）／明朝の白い字幕／黒をはさんで切り替え。
// Vercel の ffmpeg 4.1 で使える機能だけ（eq・colorbalance・vignette・noise・fade）。

const run = promisify(execFile);
const ENC = ["-r", "30", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", "-an"];
const DIP = 0.25; // 黒をはさむ秒数
const ASSETS = () => path.join(process.cwd(), "assets");

let fontCache: { medium: Buffer; regular: Buffer; sans: Buffer } | null = null;
async function loadFonts() {
  if (!fontCache) {
    const dir = path.join(ASSETS(), "fonts");
    const [medium, regular, sans] = await Promise.all([
      fs.readFile(path.join(dir, "NotoSerifJP-Medium.ttf")),
      fs.readFile(path.join(dir, "NotoSerifJP-Regular.ttf")),
      fs.readFile(path.join(dir, "NotoSansJP-Bold.ttf")),
    ]);
    fontCache = { medium, regular, sans };
  }
  return fontCache;
}

let logoCache: string | null = null;
async function whiteLogo() {
  if (!logoCache) {
    const buf = await fs.readFile(path.join(ASSETS(), "album", "doghub_logo_white.png"));
    logoCache = `data:image/png;base64,${buf.toString("base64")}`;
  }
  return logoCache;
}

const SHADOW = "0 2px 10px rgba(0,0,0,0.55)";

async function cinemaTextPng(clip: Clip, dateStamp: string, out: string) {
  const fonts = await loadFonts();
  const [main, sub] = clip.texts;
  const big = clip.role === "title" || clip.role === "end";
  const logo = big ? await whiteLogo() : null;
  const img = new ImageResponse(
    (
      <div style={{ width: VIDEO_W, height: VIDEO_H, display: "flex", position: "relative" }}>
        {/* 字幕の後ろだけ、うっすら暗く（明るい背景でも白い字が読めるように） */}
        <div
          style={{
            position: "absolute",
            top: big ? Math.round(VIDEO_H * 0.26) : Math.round(VIDEO_H * 0.52),
            left: 0,
            width: VIDEO_W,
            height: big ? Math.round(VIDEO_H * 0.42) : Math.round(VIDEO_H * 0.28),
            display: "flex",
            backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.42) 45%, rgba(0,0,0,0) 100%)",
          }}
        />
        {/* 左上：場所の刻印 */}
        <div style={{ position: "absolute", top: 70, left: 44, display: "flex", fontFamily: "Serif", fontWeight: 400, fontSize: 20, letterSpacing: "0.35em", color: "rgba(255,255,255,0.92)", textShadow: SHADOW }}>
          HAKONE · SENGOKUHARA
        </div>
        {/* 右下：オレンジの日付（フィルムカメラ風） */}
        <div style={{ position: "absolute", bottom: 300, right: 44, display: "flex", fontFamily: "Sans", fontWeight: 700, fontSize: 30, letterSpacing: "0.08em", color: "#FF9A3C", textShadow: "0 0 8px rgba(255,120,30,0.7)" }}>
          {dateStamp}
        </div>
        {/* 字幕：題名と締めは中央に大きく、途中は下のほうに */}
        <div
          style={{
            position: "absolute",
            top: big ? Math.round(VIDEO_H * 0.36) : Math.round(VIDEO_H * 0.6),
            left: 0,
            width: VIDEO_W,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} width={170} height={50} style={{ marginBottom: 26 }} alt="" />
          )}
          {main?.lines.map((t, i) => (
            <div key={i} style={{ fontFamily: "Serif", fontWeight: 500, fontSize: big ? 52 : 36, letterSpacing: "0.1em", lineHeight: 1.55, color: "white", textShadow: SHADOW }}>
              {t}
            </div>
          ))}
          {sub && (
            <div style={{ fontFamily: "Serif", fontWeight: 400, fontSize: 22, letterSpacing: "0.3em", marginTop: 14, color: "rgba(255,255,255,0.95)", textShadow: SHADOW }}>
              {sub.lines.join(" ")}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: VIDEO_W,
      height: VIDEO_H,
      fonts: [
        { name: "Serif", data: fonts.medium, weight: 500, style: "normal" },
        { name: "Serif", data: fonts.regular, weight: 400, style: "normal" },
        { name: "Sans", data: fonts.sans, weight: 700, style: "normal" },
      ],
    }
  );
  await fs.writeFile(out, Buffer.from(await img.arrayBuffer()));
}

async function renderCinemaClip(ff: string, clip: Clip, index: number, total: number, png: string, out: string) {
  const W = VIDEO_W;
  const H = VIDEO_H;
  const dur = clip.seconds;
  const frames = Math.round(dur * 30);
  const first = index === 0;
  const last = index === total - 1;
  const big = clip.role === "title" || clip.role === "end";
  // 画面いっぱいに（横長はぼかした背景の上に全体）
  const fit =
    `[0]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=30:3,eq=brightness=-0.08[bg];` +
    `[0]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2`;
  const motion = clip.zoom
    ? `,scale=${W * 2}:${H * 2},zoompan=z='1+0.07*on/${frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=30`
    : `,fps=30`;
  // 色味（少し温かく・落ち着いた彩度）＋周辺を暗く＋粒子。題名と締めは文字が読めるよう少し暗く
  const grade = `,eq=saturation=0.92:contrast=1.05${big ? ":brightness=-0.06" : ""},colorbalance=rs=0.04:gs=0.01:bs=-0.05:rh=0.03:bh=-0.03,vignette=PI/4.5,noise=alls=3:allf=t`;
  const dip = `${first ? "" : `,fade=t=in:st=0:d=${DIP}`}${last ? `,fade=t=out:st=${(dur - 0.6).toFixed(2)}:d=0.6` : `,fade=t=out:st=${(dur - DIP).toFixed(2)}:d=${DIP}`}`;
  const textIn = first ? "" : `,fade=t=in:st=0.2:d=0.45:alpha=1`;
  const textOut = last ? `,fade=t=out:st=${(dur - 0.6).toFixed(2)}:d=0.6:alpha=1` : `,fade=t=out:st=${(dur - DIP).toFixed(2)}:d=${DIP}:alpha=1`;
  const filter = `${fit}${motion},setsar=1${grade}${dip}[v];[1]format=rgba${textIn}${textOut}[t];[v][t]overlay=0:0:shortest=1,format=yuv420p[o]`;
  const media = clip.kind === "photo" ? ["-loop", "1", "-i", clip.file] : ["-ss", String(clip.startSec), "-i", clip.file];
  await run(
    ff,
    ["-nostdin", "-loglevel", "error", "-y", ...media, "-loop", "1", "-i", png, "-filter_complex", filter, "-map", "[o]", "-t", String(dur), ...ENC, out],
    { timeout: 120_000, maxBuffer: 8 * 1024 * 1024 }
  );
}

/** シネマ型で1本の mp4 を作り、その場所を返す。date＝ご利用日（YYYY-MM-DD） */
export async function composeCinema(ff: string, clips: Clip[], dir: string, date: string): Promise<string> {
  const [y, m, d] = date.split("-");
  const stamp = `'${y.slice(2)} ${Number(m)} ${Number(d)}`;
  const parts: string[] = [];
  for (let i = 0; i < clips.length; i++) {
    const png = path.join(dir, `k${i}.png`);
    const out = path.join(dir, `kc${i}.mp4`);
    await cinemaTextPng(clips[i], stamp, png);
    await renderCinemaClip(ff, clips[i], i, clips.length, png, out);
    parts.push(out);
  }
  const list = path.join(dir, "klist.txt");
  await fs.writeFile(list, parts.map((p) => `file '${p}'\n`).join(""));
  const final = path.join(dir, "memorial_cinema.mp4");
  await run(ff, ["-nostdin", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", final], {
    timeout: 60_000,
  });
  return final;
}
