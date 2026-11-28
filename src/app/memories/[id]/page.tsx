"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// 記念ショート動画の受け取りページ（1段目・2026-11-28 S84）。
// お礼のメール・LINE のリンクから開く → 電話番号の下4桁 → その方の全部の回の動画・写真。
// 2段目-B（11-28 S88）：記念動画（上）と元の写真・動画（下）の2段。見出し・案内の文は CEO 承認待ち。
// 🔴 このページの文はお客様向け（L3）＝文面を変えるときは CEO 承認。計画＝docs/specs/memorial_video_stage1_plan_2026-11-28.md

type MediaItem = {
  id: string;
  kind: "video" | "photo" | "memorial";
  width: number | null;
  height: number | null;
  url: string | null;
  download_url: string | null;
};

type Group = {
  reservation_id: string;
  date: string;
  checkout_date: string | null;
  plan_kind: "stay" | "day";
  dogs: string[];
  memorial: MediaItem | null; // 記念動画（2段目-B・サーバーで自動で作ったもの）
  media: MediaItem[]; // 元の写真・動画
};

type Data = { last_name: string; memorial_opt_out: boolean; groups: Group[] };

const INSTAGRAM_HANDLE = "@doghub.hakone__";

function formatDate(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  return `${y}年${m}月${day}日`;
}

function formatVisit(g: Group) {
  if (g.plan_kind === "stay" && g.checkout_date && g.checkout_date !== g.date) {
    return `${formatDate(g.date)}〜${formatDate(g.checkout_date).replace(/^\d+年/, "")}`;
  }
  return formatDate(g.date);
}

/** 投稿用の基本の文（施策案 §14）。ワンちゃんの名前とプランは自動で入る */
function buildPostText(g: Group) {
  const names = g.dogs.length > 0 ? g.dogs.join("・") : "愛犬";
  const what = g.plan_kind === "stay" ? "お泊まり" : "お預かり";
  return `${names}と箱根へ🐾 DogHub箱根仙石原で${what}しました\n${INSTAGRAM_HANDLE}\n#PR #DogHub箱根仙石原 #箱根 #犬連れ旅行`;
}

// ---- 保存（11-28 S88 ユーザーテスト：6人全員が「ファイルアプリ経由」で困った）----
// iPhone・iPad＝共有の画面を開く →「ビデオを保存／画像を保存」で写真アプリに直接入る（LINE で家族に送るのも同じ画面）。
// それ以外（Android・パソコン）＝これまでどおりダウンロード（Android は「ダウンロード」に入り、フォト／ギャラリーからも見られる）。
// 共有の画面は「押した直後」にしか開けないため、ファイルの読み込みに時間がかかったときは「もう一度押してください」に切り替える。

type SaveItem = { url: string; downloadUrl: string | null; fileName: string; type: string };

function isAppleMobile() {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

const fileCache = new Map<string, File>();
async function loadFile(item: SaveItem): Promise<File> {
  const hit = fileCache.get(item.url);
  if (hit) return hit;
  const res = await fetch(item.url);
  if (!res.ok) throw new Error("load failed");
  const file = new File([await res.blob()], item.fileName, { type: item.type });
  fileCache.set(item.url, file);
  return file;
}

function fallbackDownload(items: SaveItem[]) {
  items.forEach((it, i) => {
    setTimeout(() => {
      const a = document.createElement("a");
      a.href = it.downloadUrl || it.url;
      a.download = it.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, i * 400);
  });
}

function SaveButton({ items, label, primary }: { items: SaveItem[]; label: string; primary?: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "again" | "done">("idle");
  const onClick = async () => {
    if (!isAppleMobile() || typeof navigator.share !== "function") {
      fallbackDownload(items);
      setState("done");
      return;
    }
    const allCached = items.every((it) => fileCache.has(it.url));
    if (!allCached) setState("loading");
    let files: File[];
    try {
      files = await Promise.all(items.map(loadFile));
    } catch {
      setState("idle");
      fallbackDownload(items);
      return;
    }
    if (navigator.canShare && !navigator.canShare({ files })) {
      setState("idle");
      fallbackDownload(items);
      return;
    }
    try {
      await navigator.share({ files });
      setState("done");
    } catch (e) {
      // 読み込みに時間がかかって「押した直後」でなくなった＝もう一度押してもらう（準備はできている）
      if (e instanceof DOMException && e.name === "NotAllowedError") setState("again");
      else setState("idle"); // 共有の画面を閉じただけ
    }
  };
  const text =
    state === "loading"
      ? "準備しています…"
      : state === "again"
        ? "準備ができました。もう一度押してください"
        : state === "done"
          ? isAppleMobile()
            ? "保存の画面を開きました（もう一度押せます）"
            : "保存しました（「ダウンロード」に入っています）"
          : label;
  return (
    <button
      onClick={onClick}
      disabled={state === "loading"}
      className={`mt-2 block w-full py-3 rounded-lg text-center text-base font-medium disabled:opacity-60 ${
        primary || state === "again" ? "bg-[#B87942] text-white" : "border border-[#B87942] text-[#B87942]"
      }`}
    >
      {text}
    </button>
  );
}

function saveHelpText() {
  return isAppleMobile()
    ? "保存するを押すと出てくる画面で「ビデオを保存」（写真は「画像を保存」）を選ぶと、写真アプリに入ります。同じ画面から LINE でご家族に送ることもできます。"
    : "保存すると、スマホの「ダウンロード」に入ります（Android はフォト・ギャラリーのアプリからも見られます）。LINE でご家族に送るときも、そこから選べます。";
}

function toSaveItem(m: MediaItem, date: string, index: number): SaveItem {
  const ext = m.kind === "photo" ? "jpg" : "mp4";
  const name = m.kind === "memorial" ? `DogHub_${date}_記念動画.mp4` : `DogHub_${date}_${index + 1}.${ext}`;
  return { url: m.url!, downloadUrl: m.download_url, fileName: name, type: m.kind === "photo" ? "image/jpeg" : "video/mp4" };
}

function MediaGrid({ media, date }: { media: MediaItem[]; date: string }) {
  return (
    <div className="space-y-4">
      {media.length > 1 && (
        <SaveButton items={media.map((m, i) => toSaveItem(m, date, i))} label={`写真・動画${media.length}つをまとめて保存する`} />
      )}
      {media.map((m, i) => (
        <div key={m.id}>
          {m.kind === "video" ? (
            <video src={m.url!} controls playsInline preload="metadata" className="w-full rounded-xl bg-black" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.url!} alt="" className="w-full rounded-xl" />
          )}
          <SaveButton items={[toSaveItem(m, date, i)]} label={m.kind === "video" ? "この動画を保存する" : "この写真を保存する"} />
        </div>
      ))}
    </div>
  );
}

/** 記念動画（上の段）と撮ったままの写真・動画（下の段）。記念動画が無い回は撮ったままの素材だけ */
function VisitMedia({ g }: { g: Group }) {
  const memorial = g.memorial;
  // 記念動画は小さい（数MB）ので先に読み込んでおく＝押した瞬間に保存の画面が開く
  useEffect(() => {
    if (memorial?.url && isAppleMobile()) loadFile(toSaveItem(memorial, g.date, 0)).catch(() => {});
  }, [memorial, g.date]);
  const names = g.dogs.length > 0 ? g.dogs.join("・") : "";
  return (
    <div className="space-y-6">
      {memorial && (
        <div>
          <p className="text-base font-medium text-[#3C200F] mb-1">記念動画</p>
          <p className="text-sm text-[#666] mb-3 leading-relaxed">
            {names ? `${names}の` : ""}写真と箱根の景色を、短い動画にまとめました。そのまま保存して、ご家族に送ったり SNS に投稿したりできます。
          </p>
          <video src={memorial.url!} controls playsInline preload="metadata" className="w-full rounded-xl bg-black" />
          <SaveButton items={[toSaveItem(memorial, g.date, 0)]} label="記念動画を保存する" primary />
          <p className="mt-2 text-sm text-[#3C200F] leading-relaxed bg-[#F8F5F0] rounded-lg p-3">{saveHelpText()}</p>
        </div>
      )}
      {g.media.length > 0 && (
        <div>
          <p className="text-base font-medium text-[#3C200F] mb-1">{memorial ? "撮ったままの写真・動画" : "お預かり中の写真・動画"}</p>
          <p className="text-sm text-[#666] mb-3 leading-relaxed">
            スタッフが撮ったそのままの写真・動画です。1つずつ、またはまとめて保存できます。
          </p>
          {!memorial && <p className="mb-3 text-sm text-[#3C200F] leading-relaxed bg-[#F8F5F0] rounded-lg p-3">{saveHelpText()}</p>}
          <MediaGrid media={g.media} date={g.date} />
        </div>
      )}
    </div>
  );
}

function CopyPostText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-6 rounded-xl bg-[#F8F5F0] p-4">
      <p className="text-sm font-medium text-[#3C200F] mb-1">SNS に投稿していただけると嬉しいです</p>
      <p className="text-sm text-[#666] mb-3 leading-relaxed">
        よろしければ下の文をコピーして、お好きな一言を添えてお使いください。SNS をなさらない方は、ここは読み飛ばしてください。
      </p>
      <pre className="whitespace-pre-wrap text-sm text-[#3C200F] bg-white rounded-lg p-3 font-sans leading-relaxed">{text}</pre>
      <p className="mt-2 text-xs text-[#888] leading-relaxed">
        「#PR」は、お店からお願いしてご投稿いただく形のため入れている表示です。
      </p>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          } catch {
            alert("コピーできませんでした。文を長押ししてコピーしてください");
          }
        }}
        className="mt-3 w-full py-2.5 rounded-lg bg-[#B87942] text-white text-sm font-medium"
      >
        {copied ? "コピーしました" : "文をコピー"}
      </button>
    </div>
  );
}

export default function MemoriesPage() {
  const params = useParams();
  const id = params.id as string;

  const [phone4, setPhone4] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [savingOptOut, setSavingOptOut] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone4.replace(/\D/g, "").length < 4) {
      setError("電話番号の下4桁を入力してください");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch(`/api/memories/${id}?phone_last4=${encodeURIComponent(phone4)}`);
      if (res.status === 403) {
        setError("電話番号が一致しません。ご予約のときの電話番号（ご家族の番号でご予約の場合はその番号）の下4桁をお試しください。");
      } else if (!res.ok) {
        setError("ページが見つかりません");
      } else {
        setData(await res.json());
      }
    } catch {
      setError("通信エラーが発生しました");
    }
    setVerifying(false);
  };

  const toggleOptOut = async (optOut: boolean) => {
    if (optOut && !confirm("次回のご利用からは、動画・写真をお作りしません（このページの動画・写真はそのまま見られます）。よろしいですか？")) return;
    setSavingOptOut(true);
    try {
      const res = await fetch(`/api/memories/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_last4: phone4, action: optOut ? "opt_out" : "opt_in" }),
      });
      if (res.ok && data) setData({ ...data, memorial_opt_out: optOut });
      else alert("保存できませんでした。お手数ですがお電話でお知らせください");
    } catch {
      alert("通信エラーが発生しました");
    }
    setSavingOptOut(false);
  };

  if (!data) {
    return (
      <div className="min-h-dvh bg-[#F8F5F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <p className="text-xs text-[#B87942] mb-1">DogHub箱根仙石原</p>
          <h1 className="text-lg font-medium text-[#3C200F] mb-2">思い出の動画・写真</h1>
          <p className="text-sm text-[#666] mb-4 leading-relaxed">
            ご本人確認のため、ご予約のときにお伝えいただいた電話番号の下4桁をご入力ください。
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="tel"
              inputMode="numeric"
              maxLength={4}
              value={phone4}
              onChange={(e) => setPhone4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="下4桁"
              className="w-full p-4 rounded-xl border border-[#E5DDD8] text-center text-2xl tracking-[0.5em] focus:border-[#B87942] focus:outline-none"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 rounded-xl bg-[#B87942] text-white font-medium disabled:opacity-50"
            >
              {verifying ? "確認中…" : "見る"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const [current, ...past] = data.groups;

  return (
    <div className="min-h-dvh bg-[#F8F5F0] px-4 pt-8 pb-28">
      <div className="max-w-md mx-auto">
        <p className="text-xs text-[#B87942] text-center">DogHub箱根仙石原</p>
        <h1 className="text-xl font-medium text-[#3C200F] text-center mt-1 mb-1">思い出の動画・写真</h1>
        <p className="text-sm text-[#888] text-center mb-6">{data.last_name}様</p>

        <div className="bg-white rounded-2xl p-5">
          {current && (
            <>
              <p className="text-sm text-[#3C200F] mb-1">{formatVisit(current)}のご利用</p>
              <p className="text-sm text-[#666] mb-4 leading-relaxed">
                お預かり中にスタッフが撮影しました。お手元に保存してお楽しみください。
              </p>
              {current.media.length > 0 || current.memorial ? (
                <VisitMedia g={current} />
              ) : (
                <p className="text-sm text-[#888]">この回の動画・写真はありません。</p>
              )}
              {(current.media.length > 0 || current.memorial) && <CopyPostText text={buildPostText(current)} />}
            </>
          )}

          <a
            href="https://dog-hub.shop/booking"
            className="mt-6 block w-full py-3 rounded-xl border border-[#B87942] text-center text-sm font-medium text-[#B87942]"
          >
            次回のご予約はこちら
          </a>
        </div>

        {past.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-[#3C200F]">これまでの思い出</p>
            {past.map((g) => (
              <details key={g.reservation_id} className="bg-white rounded-2xl p-4">
                <summary className="text-sm text-[#3C200F] cursor-pointer">
                  {formatVisit(g)}（{g.media.length + (g.memorial ? 1 : 0)}件）
                </summary>
                <div className="mt-4">
                  <VisitMedia g={g} />
                </div>
              </details>
            ))}
          </div>
        )}

        <div className="mt-8 text-sm text-[#666] leading-relaxed space-y-3">
          <p>このページは、最後のご利用から2年間ご覧いただけます。お手元への保存もおすすめします。</p>
          {data.memorial_opt_out ? (
            <p>
              次回からは動画・写真をお作りしない設定になっています（このページの動画・写真はそのまま見られます）。
              <button
                onClick={() => toggleOptOut(false)}
                disabled={savingOptOut}
                className="ml-1 underline text-[#B87942] disabled:opacity-50"
              >
                元に戻す
              </button>
            </p>
          ) : (
            <p>
              <button
                onClick={() => toggleOptOut(true)}
                disabled={savingOptOut}
                className="underline text-[#666] disabled:opacity-50"
              >
                次回からは動画・写真は不要です
              </button>
              <span className="block text-xs text-[#888] mt-1">押しても、このページの動画・写真はそのまま見られます。次回のご利用から撮影しなくなります。</span>
            </p>
          )}
          <p>
            ご不明な点はお電話（<a href="tel:0460800290" className="text-[#B87942]">0460-80-0290</a>
            ・9:00〜17:00）でお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
}
