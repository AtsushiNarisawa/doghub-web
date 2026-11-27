"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

// 記念ショート動画の受け取りページ（1段目・2026-11-28 S84）。
// お礼のメール・LINE のリンクから開く → 電話番号の下4桁 → その方の全部の回の動画・写真。
// 🔴 このページの文はお客様向け（L3）＝文面を変えるときは CEO 承認。計画＝docs/specs/memorial_video_stage1_plan_2026-11-28.md

type MediaItem = {
  id: string;
  kind: "video" | "photo";
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
  media: MediaItem[];
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

function MediaGrid({ media }: { media: MediaItem[] }) {
  return (
    <div className="space-y-4">
      {media.map((m) => (
        <div key={m.id}>
          {m.kind === "video" ? (
            <video src={m.url!} controls playsInline preload="metadata" className="w-full rounded-xl bg-black" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.url!} alt="" className="w-full rounded-xl" />
          )}
          {m.download_url && (
            <a
              href={m.download_url}
              className="mt-2 block w-full py-2.5 rounded-lg border border-[#B87942] text-center text-sm font-medium text-[#B87942]"
            >
              {m.kind === "video" ? "この動画を保存する" : "この写真を保存する"}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function CopyPostText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-6 rounded-xl bg-[#F8F5F0] p-4">
      <p className="text-sm font-medium text-[#3C200F] mb-1">SNS に投稿していただけると嬉しいです</p>
      <p className="text-xs text-[#888] mb-3 leading-relaxed">
        よろしければ下の文をコピーして、お好きな一言を添えてお使いください。
      </p>
      <pre className="whitespace-pre-wrap text-sm text-[#3C200F] bg-white rounded-lg p-3 font-sans leading-relaxed">{text}</pre>
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
        setError("電話番号が一致しません。ご予約時の電話番号の下4桁をご確認ください。");
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
    if (optOut && !confirm("今後のご利用では、動画・写真をお作りしません。よろしいですか？")) return;
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
          <p className="text-sm text-[#888] mb-4">ご本人確認のため、ご予約時の電話番号の下4桁をご入力ください。</p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="tel"
              inputMode="numeric"
              maxLength={4}
              value={phone4}
              onChange={(e) => setPhone4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="例: 0290"
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
    <div className="min-h-dvh bg-[#F8F5F0] px-4 py-8">
      <div className="max-w-md mx-auto">
        <p className="text-xs text-[#B87942] text-center">DogHub箱根仙石原</p>
        <h1 className="text-xl font-medium text-[#3C200F] text-center mt-1 mb-1">思い出の動画・写真</h1>
        <p className="text-sm text-[#888] text-center mb-6">{data.last_name}様</p>

        <div className="bg-white rounded-2xl p-5">
          {current && (
            <>
              <p className="text-sm text-[#3C200F] mb-1">{formatVisit(current)}のご利用</p>
              <p className="text-xs text-[#888] mb-4 leading-relaxed">
                お預かり中にスタッフが撮影しました。お手元に保存してお楽しみください。
              </p>
              {current.media.length > 0 ? (
                <MediaGrid media={current.media} />
              ) : (
                <p className="text-sm text-[#888]">この回の動画・写真はありません。</p>
              )}
              {current.media.length > 0 && <CopyPostText text={buildPostText(current)} />}
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
                  {formatVisit(g)}（{g.media.length}件）
                </summary>
                <div className="mt-4">
                  <MediaGrid media={g.media} />
                </div>
              </details>
            ))}
          </div>
        )}

        <div className="mt-8 text-xs text-[#888] leading-relaxed space-y-2">
          <p>このページは、最後のご利用から2年で閉じます。お早めにお手元へ保存してください。</p>
          <p>iPhone で保存した動画は「ファイル」アプリの「ダウンロード」に入ります。写真アプリへは、そこから共有 →「ビデオを保存」でお移しいただけます。</p>
          {data.memorial_opt_out ? (
            <p>
              今後は動画・写真をお作りしない設定になっています。
              <button
                onClick={() => toggleOptOut(false)}
                disabled={savingOptOut}
                className="ml-1 underline text-[#B87942] disabled:opacity-50"
              >
                元に戻す
              </button>
            </p>
          ) : (
            <button
              onClick={() => toggleOptOut(true)}
              disabled={savingOptOut}
              className="underline text-[#888] disabled:opacity-50"
            >
              今後は動画は不要です
            </button>
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
