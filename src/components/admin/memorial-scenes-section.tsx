"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { supabase } from "@/lib/supabase";
import { compressPhoto, compressVideo } from "@/components/admin/memories-section";
import { DEFAULT_SCENES } from "@/lib/memorial-timeline";

// 管理画面の設定「記念動画の景色」（2段目-B・2026-11-28 S88）。
// 記念動画のワンちゃんの合間に入る箱根の景色を、文字・使う月と組にして登録する。
// 動画を作るとき、ご利用の月にチェックが入った「使う」景色から最大3つを自動で選ぶ（予約ごとに入れ替え）。
// 🔴 文字は「いまの箱根」の一般的な話に（例「いまの仙石原は／すすきが金色に」）。お客様がそこへ行ったとは書かない。

type Scene = {
  id: string;
  kind: "video" | "photo";
  url: string | null;
  caption: string;
  months: number[];
  active: boolean;
};

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const BUCKET = "memories";

function MonthPicker({ value, onChange, disabled }: { value: number[]; onChange: (v: number[]) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {MONTHS.map((m) => {
        const on = value.includes(m);
        return (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() => onChange(on ? value.filter((x) => x !== m) : [...value, m].sort((a, b) => a - b))}
            className={`w-11 py-1 rounded-full text-xs ${on ? "bg-[#B87942] text-white" : "bg-gray-100 text-gray-500"} disabled:opacity-50`}
          >
            {m}月
          </button>
        );
      })}
    </div>
  );
}

function SceneRow({ scene, onChanged }: { scene: Scene; onChanged: () => void }) {
  const [caption, setCaption] = useState(scene.caption);
  const [months, setMonths] = useState(scene.months);
  const [busy, setBusy] = useState(false);
  const dirty = caption !== scene.caption || months.join() !== scene.months.join();

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const resp = await adminFetch("/api/admin/memorial-scenes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: scene.id, ...body }),
      });
      const data = await resp.json();
      if (!resp.ok) alert(data.error || "保存に失敗しました");
    } catch {
      alert("通信エラーが発生しました");
    }
    setBusy(false);
    onChanged();
  }

  async function remove() {
    if (!confirm("この景色を消しますか？（これから作る記念動画に入らなくなります）")) return;
    setBusy(true);
    try {
      const resp = await adminFetch("/api/admin/memorial-scenes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: scene.id }),
      });
      if (!resp.ok) alert((await resp.json()).error || "削除に失敗しました");
    } catch {
      alert("通信エラーが発生しました");
    }
    setBusy(false);
    onChanged();
  }

  return (
    <div className={`flex gap-3 py-3 border-t border-gray-100 ${scene.active ? "" : "opacity-60"}`}>
      <div className="w-20 shrink-0">
        {scene.url ? (
          scene.kind === "video" ? (
            <video src={scene.url} className="w-20 aspect-[9/16] object-cover rounded-lg bg-gray-100" muted playsInline loop autoPlay />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={scene.url} alt="" className="w-20 aspect-[9/16] object-cover rounded-lg bg-gray-100" />
          )
        ) : (
          <div className="w-20 aspect-[9/16] rounded-lg bg-gray-100" />
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          disabled={busy}
          className="w-full p-2 rounded-lg border border-gray-200 text-sm"
        />
        <MonthPicker value={months} onChange={setMonths} disabled={busy} />
        <div className="flex gap-2">
          {dirty && (
            <button
              onClick={() => patch({ caption, months })}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg bg-[#B87942] text-white text-xs disabled:opacity-50"
            >
              保存
            </button>
          )}
          <button
            onClick={() => patch({ active: !scene.active })}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs disabled:opacity-50"
          >
            {scene.active ? "止める" : "使う"}
          </button>
          <button onClick={remove} disabled={busy} className="px-3 py-1.5 rounded-lg text-red-600 text-xs disabled:opacity-50">
            消す
          </button>
          {!scene.active && <span className="self-center text-xs text-gray-400">止めています</span>}
        </div>
      </div>
    </div>
  );
}

export function MemorialScenesSection() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loadError, setLoadError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [months, setMonths] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const resp = await adminFetch("/api/admin/memorial-scenes");
      const data = await resp.json();
      if (resp.ok) {
        setScenes(data.scenes || []);
        setLoadError("");
      } else setLoadError(data.error || "読み込みに失敗しました");
    } catch {
      setLoadError("通信エラーが発生しました");
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const resp = await adminFetch("/api/admin/memorial-scenes");
        const data = await resp.json();
        if (!alive) return;
        if (resp.ok) setScenes(data.scenes || []);
        else setLoadError(data.error || "読み込みに失敗しました");
      } catch {
        if (alive) setLoadError("通信エラーが発生しました");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function add() {
    setError("");
    if (!file) return setError("景色の写真か動画を選んでください");
    if (!caption.trim()) return setError("文字を入れてください");
    if (months.length === 0) return setError("使う月を選んでください");
    setBusy(true);
    try {
      const kind: "video" | "photo" = file.type.startsWith("video/") ? "video" : "photo";
      setProgress(kind === "video" ? "動画を縮めています…" : "写真を縮めています…");
      const c =
        kind === "video"
          ? await compressVideo(file, (p) => setProgress(`動画を縮めています… ${Math.round(p * 100)}%`))
          : await compressPhoto(file);
      setProgress("送っています…");
      const signResp = await adminFetch("/api/admin/memorial-scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sign", kind }),
      });
      const sign = await signResp.json();
      if (!signResp.ok) throw new Error(sign.error || "送り先の準備に失敗しました");
      const { error: upError } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(sign.path, sign.token, c.blob, { contentType: kind === "video" ? "video/mp4" : "image/jpeg" });
      if (upError) throw new Error("送信に失敗しました。電波の良い場所でもう一度お試しください");
      const regResp = await adminFetch("/api/admin/memorial-scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", kind, path: sign.path, caption, months }),
      });
      const reg = await regResp.json();
      if (!regResp.ok) throw new Error(reg.error || "登録に失敗しました");
      setProgress("登録しました");
      setFile(null);
      setCaption("");
      setMonths([]);
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "失敗しました");
      setProgress("");
    }
    setBusy(false);
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">記念動画の景色</h2>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          記念動画のワンちゃんの合間に入る箱根の景色です。ご利用の月にチェックが入った景色から、自動で最大3つ選ばれます。
          文字は「いまの箱根」の話にしてください（例：いまの仙石原は／すすきが金色に）。人・車のナンバー・近所のお宅が写らない縦の写真か、数秒の縦の動画を選んでください（動画は最初の2秒を使います）。
        </p>
      </div>

      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
        <p className="font-medium text-gray-700">最初から入っている見本の景色</p>
        <ul className="mt-1 list-disc pl-5">
          {DEFAULT_SCENES.map((d) => (
            <li key={d.id}>
              「{d.caption.replace("\n", "／")}」（{d.months.map((m) => `${m}月`).join("・")}）
            </li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-gray-500">
          ここで登録した景色が3つに足りない月は、この見本で足します（登録した景色が先に使われます）。上の月以外の見本はまだありません。
        </p>
      </div>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}
      {scenes.length === 0 && !loadError && <p className="text-sm text-gray-400">まだ景色がありません。</p>}
      <div>
        {scenes.map((s) => (
          <SceneRow key={`${s.id}-${s.caption}-${s.months.join()}-${s.active}`} scene={s} onChanged={load} />
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">景色を足す</p>
        <input
          ref={fileRef}
          type="file"
          accept="video/*,image/*"
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm"
        />
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          disabled={busy}
          placeholder={"文字（2行まで・改行で2行目）\n例：箱根の山は\n紅葉がきれいな季節です"}
          className="w-full p-2 rounded-lg border border-gray-200 text-sm"
        />
        <MonthPicker value={months} onChange={setMonths} disabled={busy} />
        <button
          onClick={add}
          disabled={busy}
          className="w-full py-3 rounded-xl bg-[#B87942] text-white text-base font-medium disabled:opacity-50"
        >
          {busy ? "処理中…（画面を閉じないでください）" : "この景色を登録"}
        </button>
        {progress && <p className="text-xs text-gray-600">{progress}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
