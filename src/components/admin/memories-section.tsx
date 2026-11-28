"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { supabase } from "@/lib/supabase";

// 管理画面の予約詳細「思い出の動画・写真」（記念ショート動画 1段目・2026-11-28 S84）。
// スタッフがスマホで撮った動画・写真を選ぶ → この端末の中で小さく縮める → 置き場へ直接送る → 記録。
// 載せた回だけ、翌朝10時のお礼（メール・LINE）に受け取りページのリンクが付く。
// 計画＝docs/specs/memorial_video_stage1_plan_2026-11-28.md

type Media = {
  id: string;
  kind: "video" | "photo" | "memorial";
  url: string | null;
  size_bytes: number | null;
  duration_sec: number | null;
  created_at: string;
};

const BUCKET = "memories";
const VIDEO_SHORT_SIDE = 720; // 縦長720p
const VIDEO_BITRATE = 2_500_000; // 約2.5Mbps＝1分で約19MB
const PHOTO_LONG_SIDE = 2048;
const MAX_VIDEO_SEC = 180; // 長すぎる動画は止める（ショート動画の素材は数十秒）

type Compressed = { blob: Blob; width: number; height: number; duration: number | null };

export async function compressVideo(file: File, onProgress: (p: number) => void): Promise<Compressed> {
  const mb = await import("mediabunny");
  if (!(await mb.canEncodeVideo("avc"))) {
    throw new Error("この端末では動画を縮められません。別の端末（iPhone の Safari など）でお試しください");
  }
  const input = new mb.Input({ source: new mb.BlobSource(file), formats: mb.ALL_FORMATS });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error("動画として読めませんでした");
  const duration = await input.computeDuration();
  if (duration > MAX_VIDEO_SEC) {
    throw new Error(`動画が長すぎます（${Math.round(duration)}秒）。${MAX_VIDEO_SEC / 60}分以内に切ってから載せてください`);
  }
  const w = track.displayWidth;
  const h = track.displayHeight;
  const portrait = h >= w;
  const shortSide = Math.min(w, h);
  // 短い辺だけ指定すれば、もう一方は縦横比のまま決まる（回転情報も考慮される）
  const size =
    shortSide > VIDEO_SHORT_SIDE
      ? portrait
        ? { width: VIDEO_SHORT_SIDE }
        : { height: VIDEO_SHORT_SIDE }
      : {};

  const output = new mb.Output({
    format: new mb.Mp4OutputFormat({ fastStart: "in-memory" }),
    target: new mb.BufferTarget(),
  });
  const conversion = await mb.Conversion.init({
    input,
    output,
    video: { ...size, codec: "avc", bitrate: VIDEO_BITRATE, frameRate: 30, forceTranscode: true },
    // 音声は指定しない＝iPhone の AAC はそのまま写す（必要なときだけ変換される）
  });
  if (!conversion.isValid) {
    throw new Error("この動画は変換できませんでした（形式の問題）");
  }
  conversion.onProgress = (p) => onProgress(p);
  await conversion.execute();
  const buffer = output.target.buffer;
  if (!buffer) throw new Error("変換に失敗しました");
  const outW = size.width ?? (size.height ? Math.round((w / h) * size.height) : w);
  const outH = size.height ?? (size.width ? Math.round((h / w) * size.width) : h);
  return { blob: new Blob([buffer], { type: "video/mp4" }), width: outW, height: outH, duration };
}

export async function compressPhoto(file: File): Promise<Compressed> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, PHOTO_LONG_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("写真を縮められませんでした");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("写真を縮められませんでした");
  return { blob, width, height, duration: null };
}

function formatMb(bytes: number | null) {
  if (!bytes) return "";
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

export function MemoriesSection({ reservationId, isCancelled }: { reservationId: string; isCancelled: boolean }) {
  const [media, setMedia] = useState<Media[]>([]);
  const [optOut, setOptOut] = useState(false);
  const [thankyouSent, setThankyouSent] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [making, setMaking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  type Loaded = { media: Media[]; memorial_opt_out: boolean; thankyou_sent: boolean } | { error: string };

  const fetchMedia = useCallback(async (): Promise<Loaded> => {
    try {
      const resp = await adminFetch(`/api/admin/memories?reservation_id=${reservationId}`);
      const data = await resp.json();
      return resp.ok ? data : { error: data.error || "読み込みに失敗しました" };
    } catch {
      return { error: "通信エラーが発生しました" };
    }
  }, [reservationId]);

  const apply = (d: Loaded) => {
    if ("error" in d) {
      setError(d.error);
    } else {
      setMedia(d.media || []);
      setOptOut(!!d.memorial_opt_out);
      setThankyouSent(!!d.thankyou_sent);
    }
    setLoaded(true);
  };

  const load = async () => apply(await fetchMedia());

  useEffect(() => {
    let alive = true;
    fetchMedia().then((d) => {
      if (alive) apply(d);
    });
    return () => {
      alive = false;
    };
  }, [fetchMedia]);

  async function uploadOne(file: File, index: number, total: number) {
    const label = total > 1 ? `（${index + 1}/${total}）` : "";
    const kind: "video" | "photo" = file.type.startsWith("video/") ? "video" : "photo";
    setProgress(`${kind === "video" ? "動画" : "写真"}を縮めています${label}…`);
    const c =
      kind === "video"
        ? await compressVideo(file, (p) => setProgress(`動画を縮めています${label}… ${Math.round(p * 100)}%`))
        : await compressPhoto(file);

    setProgress(`送っています${label}…`);
    const signResp = await adminFetch("/api/admin/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sign", reservation_id: reservationId, kind }),
    });
    const sign = await signResp.json();
    if (!signResp.ok) throw new Error(sign.error || "送り先の準備に失敗しました");

    const { error: upError } = await supabase.storage
      .from(BUCKET)
      .uploadToSignedUrl(sign.path, sign.token, c.blob, { contentType: kind === "video" ? "video/mp4" : "image/jpeg" });
    if (upError) throw new Error("送信に失敗しました。電波の良い場所でもう一度お試しください");

    const regResp = await adminFetch("/api/admin/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register",
        reservation_id: reservationId,
        kind,
        path: sign.path,
        size_bytes: c.blob.size,
        width: c.width,
        height: c.height,
        duration_sec: c.duration,
      }),
    });
    const reg = await regResp.json();
    if (!regResp.ok) throw new Error(reg.error || "記録に失敗しました");
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError("");
    const list = Array.from(files);
    let done = 0;
    for (let i = 0; i < list.length; i++) {
      try {
        await uploadOne(list[i], i, list.length);
        done++;
      } catch (e) {
        setError(`${list[i].name}：${e instanceof Error ? e.message : "失敗しました"}`);
      }
    }
    setProgress(done > 0 ? `${done}件を載せました` : "");
    if (fileRef.current) fileRef.current.value = "";
    await load();
    setBusy(false);
  }

  // 記念動画（2段目-B）：翌朝9:30に自動で作られる。ここから手動でも、今ある素材ですぐ作れる・作り直せる（数十秒）
  // （11-28 CEO「手動で動画を生成するボタンもつけておいてほしい」）
  async function makeMemorial() {
    setMaking(true);
    setError("");
    setProgress("記念動画を作っています…（1分ほどかかります）");
    try {
      const resp = await adminFetch("/api/admin/memorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: reservationId }),
      });
      const data = await resp.json();
      if (!resp.ok) setError(data.error || "記念動画を作れませんでした");
      else setProgress(`記念動画を作りました（${data.seconds}秒）`);
    } catch {
      setError("通信エラーが発生しました");
      setProgress("");
    }
    await load();
    setMaking(false);
  }

  async function remove(m: Media) {
    const what = m.kind === "memorial" ? "記念動画" : m.kind === "video" ? "動画" : "写真";
    if (!confirm(`この${what}を消しますか？（お客様の受け取りページからも消えます）`)) return;
    setBusy(true);
    try {
      const resp = await adminFetch("/api/admin/memories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id }),
      });
      const data = await resp.json();
      if (!resp.ok) alert(data.error || "削除に失敗しました");
    } catch {
      alert("通信エラーが発生しました");
    }
    await load();
    setBusy(false);
  }

  if (!loaded) return null;
  if (isCancelled && media.length === 0) return null;
  const sources = media.filter((m) => m.kind !== "memorial");
  const memorial = media.find((m) => m.kind === "memorial");

  return (
    <div className="bg-white rounded-xl p-4">
      <p className="text-xs font-medium text-gray-500 mb-2">思い出の動画・写真</p>

      {optOut && (
        <p className="mb-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">
          このお客様は「今後は動画は不要」を選ばれています
        </p>
      )}
      {thankyouSent && (
        <p className="mb-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 leading-relaxed">
          お礼は送信済みです。今から載せても、お客様へのお知らせは自動では届きません。
        </p>
      )}

      {sources.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {sources.map((m) => (
            <div key={m.id} className="relative">
              {m.url ? (
                m.kind === "video" ? (
                  <video src={m.url} className="w-full aspect-[9/16] object-cover rounded-lg bg-gray-100" preload="metadata" controls playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" className="w-full aspect-[9/16] object-cover rounded-lg bg-gray-100" />
                )
              ) : (
                <div className="w-full aspect-[9/16] rounded-lg bg-gray-100" />
              )}
              <p className="mt-0.5 text-[10px] text-gray-400">
                {m.kind === "video" ? `動画 ${m.duration_sec ? `${Math.round(m.duration_sec)}秒 ` : ""}` : "写真 "}
                {formatMb(m.size_bytes)}
              </p>
              <button
                onClick={() => remove(m)}
                disabled={busy}
                className="absolute top-1 right-1 px-2 py-0.5 rounded bg-black/60 text-white text-[11px] disabled:opacity-50"
              >
                消す
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-3 text-xs text-gray-400 leading-relaxed">
          まだありません。載せると、翌朝10時のお礼に受け取りページのリンクが付きます。
        </p>
      )}

      {!isCancelled && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="video/*,image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-[#F8F5F0] text-[#B87942] text-sm font-medium active:bg-[#F0EAE0] disabled:opacity-50"
          >
            {busy ? "処理中…（画面を閉じないでください）" : "動画・写真を載せる"}
          </button>
        </>
      )}
      {sources.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <p className="text-xs font-medium text-gray-500 mb-1">記念動画（自動）</p>
          {memorial?.url ? (
            <div className="relative w-1/2">
              <video src={memorial.url} className="w-full aspect-[9/16] rounded-lg bg-gray-100" preload="metadata" controls playsInline />
              <button
                onClick={() => remove(memorial)}
                disabled={busy || making}
                className="absolute top-1 right-1 px-2 py-0.5 rounded bg-black/60 text-white text-[11px] disabled:opacity-50"
              >
                消す
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 leading-relaxed">
              {thankyouSent
                ? "まだありません。"
                : "翌朝9:30に、それまでに載った動画・写真から自動で作られます（お礼の前）。待たずに作るときは下のボタンで。"}
            </p>
          )}
          <button
            onClick={makeMemorial}
            disabled={busy || making}
            className="mt-2 w-full py-2 rounded-lg border border-[#B87942] text-[#B87942] text-xs font-medium disabled:opacity-50"
          >
            {making ? "作っています…（画面を閉じないでください）" : memorial ? "記念動画を作り直す" : "記念動画を今すぐ作る"}
          </button>
        </div>
      )}
      {progress && <p className="mt-2 text-xs text-gray-600">{progress}</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
