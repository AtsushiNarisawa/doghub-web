import { ImageResponse } from "next/og";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { promises as fs } from "node:fs";
import path from "node:path";
import { VIDEO_H, VIDEO_W, type Clip } from "@/lib/memorial-timeline";

// 記念動画「アルバム型」（11-28 S88・CEO「センスの良い動画のフォーマットを」）。
// 型の元＝店の「2024年 年末のご挨拶」リール：生成りの紙の上に白いふちの写真を少し傾けて置き、明朝体の文字と DogHub のロゴ。
// 場面のつなぎ＝写真と文字が紙の上でふわっと現れて消える（紙は全場面共通＝つなぎ目が自然）。
//   ※ Vercel の ffmpeg は 4.1（2018）で xfade（重ねて切り替え）が無いため、この方式にしている。
// 部品＝web/assets/album/paper.jpg（紙）・doghub_logo.png（年末リールから切り出したロゴ）・assets/fonts/NotoSerifJP-*.ttf

const run = promisify(execFile);
const ENC = ["-r", "30", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-an"];
const INK = "#3C200F";
const PRINT_CY = Math.round(VIDEO_H * 0.58); // 写真の中心の高さ
const FADE = 0.4; // 現れる・消える秒数
const ANGLES = [-3, 2.5, -2, 3, -2.5, 2]; // 場面ごとの傾き（度）

const ASSETS = () => path.join(process.cwd(), "assets");

let fontCache: { medium: Buffer; regular: Buffer } | null = null;
async function loadSerif() {
  if (!fontCache) {
    const dir = path.join(ASSETS(), "fonts");
    const [medium, regular] = await Promise.all([
      fs.readFile(path.join(dir, "NotoSerifJP-Medium.ttf")),
      fs.readFile(path.join(dir, "NotoSerifJP-Regular.ttf")),
    ]);
    fontCache = { medium, regular };
  }
  return fontCache;
}

let logoCache: string | null = null;
async function logoDataUrl() {
  if (!logoCache) {
    const buf = await fs.readFile(path.join(ASSETS(), "album", "doghub_logo.png"));
    logoCache = `data:image/png;base64,${buf.toString("base64")}`;
  }
  return logoCache;
}

/** 紙の上の文字（明朝・こげ茶・字間を広く）。題名と締めにはロゴを添える */
async function albumTextPng(clip: Clip, out: string) {
  const fonts = await loadSerif();
  const logo = clip.role === "title" || clip.role === "end" ? await logoDataUrl() : null;
  const [main, sub] = clip.texts;
  const mainSize = clip.role === "title" ? 46 : clip.role === "end" ? 40 : 34;
  const img = new ImageResponse(
    (
      <div style={{ width: VIDEO_W, height: VIDEO_H, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: clip.role === "title" || clip.role === "end" ? 96 : 130 }}>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} width={150} height={44} style={{ marginBottom: 22 }} alt="" />
        )}
        {main?.lines.map((t, i) => (
          <div
            key={i}
            style={{ fontFamily: "Serif", fontWeight: 500, fontSize: mainSize, letterSpacing: "0.12em", lineHeight: 1.6, color: INK }}
          >
            {t}
          </div>
        ))}
        {sub && clip.role === "title" && (
          <div style={{ fontFamily: "Serif", fontWeight: 400, fontSize: 24, letterSpacing: "0.3em", marginTop: 6, color: INK }}>
            {sub.lines.join(" ")}
          </div>
        )}
        {sub && clip.role === "end" && (
          <div
            style={{
              position: "absolute",
              top: Math.round(VIDEO_H * 0.9),
              left: 0,
              width: VIDEO_W,
              display: "flex",
              justifyContent: "center",
              fontFamily: "Serif",
              fontWeight: 400,
              fontSize: 22,
              letterSpacing: "0.2em",
              color: INK,
            }}
          >
            {sub.lines.join(" ")}
          </div>
        )}
      </div>
    ),
    {
      width: VIDEO_W,
      height: VIDEO_H,
      fonts: [
        { name: "Serif", data: fonts.medium, weight: 500, style: "normal" },
        { name: "Serif", data: fonts.regular, weight: 400, style: "normal" },
      ],
    }
  );
  await fs.writeFile(out, Buffer.from(await img.arrayBuffer()));
}

/** 1場面：紙＋影＋白いふちの写真（少し傾ける）＋文字。写真と文字は紙の上で現れて消える */
async function renderAlbumClip(ff: string, clip: Clip, index: number, total: number, png: string, out: string) {
  const dur = clip.seconds;
  const angle = ANGLES[index % ANGLES.length];
  const rad = `${angle}*PI/180`;
  // 写真の大きさ（縦長・横長で枠を変える）。景色は少し大きく
  const box = clip.role === "scene" ? "600:760" : "540:700";
  const first = index === 0;
  const last = index === total - 1;
  // 最初の場面は0秒から見せる＝再生前の表紙に題名と写真が出る
  const fadeIn = first ? "" : `,fade=t=in:st=0:d=${FADE}:alpha=1`;
  const fadeOut = last ? "" : `,fade=t=out:st=${(dur - FADE).toFixed(2)}:d=${FADE}:alpha=1`;
  // 現れるときに少し上がり、その後ゆっくり上へ流れる
  const lift = first ? `-6*t/${dur}` : `22*max(0\\,1-t/0.5)-6*t/${dur}`;
  const textFade = first ? "" : `,fade=t=in:st=0.25:d=0.5:alpha=1`;
  const filter = [
    `[1]scale=${box}:force_original_aspect_ratio=decrease,pad=iw+28:ih+28:14:14:color=0xFBFAF7,format=rgba,split[p1][p2]`,
    `[p2]colorchannelmixer=rr=0:gg=0:bb=0:aa=0.32,boxblur=lr=12:lp=2:cr=12:cp=2:ar=12:ap=2,rotate=${rad}:c=none:ow=rotw(${rad}):oh=roth(${rad})${fadeIn}${fadeOut}[sh]`,
    `[p1]rotate=${rad}:c=none:ow=rotw(${rad}):oh=roth(${rad})${fadeIn}${fadeOut}[pr]`,
    `[0]scale=${VIDEO_W}:${VIDEO_H},setsar=1,fps=30[bg]`,
    `[bg][sh]overlay=x=(W-w)/2+8:y=${PRINT_CY}-h/2+14+${lift}:shortest=1[b1]`,
    `[b1][pr]overlay=x=(W-w)/2:y=${PRINT_CY}-h/2+${lift}:shortest=1[b2]`,
    `[2]format=rgba${textFade}${fadeOut}[t]`,
    `[b2][t]overlay=0:0:shortest=1,format=yuv420p[o]`,
  ].join(";");
  const media = clip.kind === "photo" ? ["-loop", "1", "-i", clip.file] : ["-ss", String(clip.startSec), "-i", clip.file];
  await run(
    ff,
    [
      "-nostdin", "-loglevel", "error", "-y",
      "-loop", "1", "-i", path.join(ASSETS(), "album", "paper.jpg"),
      ...media,
      "-loop", "1", "-i", png,
      "-filter_complex", filter, "-map", "[o]", "-t", String(dur), ...ENC, out,
    ],
    { timeout: 120_000, maxBuffer: 8 * 1024 * 1024 }
  );
}

/** アルバム型で1本の mp4 を作り、その場所を返す */
export async function composeAlbum(ff: string, clips: Clip[], dir: string): Promise<string> {
  const parts: string[] = [];
  for (let i = 0; i < clips.length; i++) {
    const png = path.join(dir, `a${i}.png`);
    const out = path.join(dir, `ac${i}.mp4`);
    await albumTextPng(clips[i], png);
    await renderAlbumClip(ff, clips[i], i, clips.length, png, out);
    parts.push(out);
  }
  const list = path.join(dir, "alist.txt");
  await fs.writeFile(list, parts.map((p) => `file '${p}'\n`).join(""));
  const final = path.join(dir, "memorial_album.mp4");
  await run(ff, ["-nostdin", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", final], {
    timeout: 60_000,
  });
  return final;
}
