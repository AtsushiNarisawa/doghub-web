"use client";

import { useCallback, useEffect, useState } from "react";

// LINE友だちと既存のお客様情報を結びつけるフォーム。
// LIFF（LINE内ブラウザ）から `?mode=link` で開かれ、BookingPage が予約フォームの代わりに描画する。
//
// 入口は2つ:
//  ①メールの「1タップ連携」リンク（`?t=<署名付きトークン>`）… お客様の入力はゼロ。
//    メールは宛先が既知なので顧客IDを署名して載せられる。開いた瞬間に自動で連携する。
//  ②LIFFのメニュー等から素で開いた場合 … 従来どおりお電話番号を手入力（CEO判断・2026-07-21。
//    店内部での紐付けが目的であり、項目を増やすと登録率が落ちるため電話番号のみ）。
//    トークンが期限切れ・改ざんの場合も②へフォールバックする。
// 身に覚えのない連携は完了通知メールで本人が気づける。
// 設計の詳細は marketing/reports/line_linking_implementation_plan_2026-07-21.md

type Status = "idle" | "sending" | "done" | "not_customer" | "occupied" | "error";

// LIFF の初期化が終わるまで isLiff/lineId は空。トークン経由は必ずLINE内で開かれる前提なので、
// この間に「LINEアプリ内から開いてください」を出すと誤解を招く。少しだけ待ってから出す。
const LIFF_GRACE_MS = 3000;

const LINE_ADD_URL = "https://line.me/R/ti/p/@794wdxyu";

export function LineLinkForm({
  lineId,
  isLiff,
  token,
  isFriend,
}: {
  lineId: string;
  isLiff: boolean;
  token?: string;
  // null = 判定できず（そのときは促さない。誤って既に友だちの方に出さないため）
  isFriend?: boolean | null;
}) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [customerName, setCustomerName] = useState("");
  const [autoTried, setAutoTried] = useState(false);
  const [graceOver, setGraceOver] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setGraceOver(true), LIFF_GRACE_MS);
    return () => clearTimeout(id);
  }, []);

  const request = useCallback(async (body: Record<string, string>) => {
    const res = await fetch("/api/line/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }, []);

  const applyResult = useCallback(
    (data: { ok?: boolean; reason?: string; customerName?: string }, method: "email_token" | "phone") => {
      if (data.ok) {
        setCustomerName(data.customerName || "");
        setStatus("done");
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "line_link_complete", line_link_method: method });
        return;
      }
      if (data.reason === "not_a_customer") setStatus("not_customer");
      else if (data.reason === "occupied") setStatus("occupied");
      // 期限切れ・改ざん → 黙って電話番号入力へ落とす（お客様に技術的な理由は見せない）
      else if (data.reason === "invalid_token") setStatus("idle");
      else setStatus("error");
    },
    []
  );

  // メールのリンクから来た場合は、LIFFの初期化が終わり次第そのまま連携する（入力ゼロ）。
  // 画面は showAuto で「確認しています…」のまま保つので、ここで同期的に状態を変えない。
  useEffect(() => {
    if (!token || autoTried || !isLiff || !lineId) return;
    let cancelled = false;
    (async () => {
      const data = await request({ line_id: lineId, token }).catch(() => null);
      if (cancelled) return;
      setAutoTried(true);
      if (!data) setStatus("error");
      else applyResult(data, "email_token");
    })();
    return () => {
      cancelled = true;
    };
  }, [token, autoTried, isLiff, lineId, request, applyResult]);

  // token は BookingPage が URL から読むため初回描画には間に合わない。
  // 状態を増やさず描画時に導出して、電話番号フォームが一瞬見えるのを防ぐ。
  // （autoTried 済み＝トークンが失敗した後は導出しない＝電話番号入力に落とす）
  const showAuto = !!token && status === "idle" && !autoTried;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setStatus("sending");
    request({ line_id: lineId, phone })
      .then((data) => applyResult(data, "phone"))
      .catch(() => setStatus("error"));
  };

  // ── LINE外で開かれた場合（LINE IDが取れない）
  if (!isLiff || !lineId) {
    // トークン経由は初期化待ちの可能性が高いので、少しの間は読み込み表示にする
    if (token && !graceOver) {
      return (
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="text-4xl">🐾</div>
          <p className="mt-4 text-sm text-[#6e5340]">読み込んでいます…</p>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-[#3c200f]">お客様情報のご登録</h1>
        <p className="mt-4 text-sm leading-7 text-[#6e5340]">
          このページは、LINEアプリ内から開いていただく必要があります。
          <br />
          DogHub箱根仙石原のLINEトーク画面を開き、下のメニューから「お客様情報の登録」をタップしてください。
        </p>
      </div>
    );
  }

  // ── 自動連携中（メールのリンクから来た場合）
  if (showAuto) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="text-4xl">🐾</div>
        <p className="mt-4 text-sm text-[#6e5340]">お客様情報を確認しています…</p>
      </div>
    );
  }

  // ── 連携完了
  if (status === "done") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="text-4xl">🐾</div>
        <h1 className="mt-4 text-xl font-bold text-[#3c200f]">
          {customerName ? `${customerName} 様` : "ありがとうございます"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#6e5340]">
          お客様情報の登録が完了しました。
          <br />
          これからは、ご予約の確認やお知らせをLINEでもお送りできます。
        </p>
        {isFriend === false ? (
          // 友だちでないと push が届かない＝連携しても通知が来ない。ここで必ず促す。
          <div className="mt-6 rounded-xl bg-[#F0F7F0] px-4 py-5">
            <p className="text-sm font-bold text-[#3c200f]">あと1ステップだけお願いします</p>
            <p className="mt-2 text-xs leading-6 text-[#6e5340]">
              お知らせをお送りするには、DogHub箱根仙石原を友だち追加していただく必要があります。
            </p>
            <a
              href={LINE_ADD_URL}
              className="mt-4 inline-block rounded-lg px-6 py-3 text-sm font-bold text-white"
              style={{ backgroundColor: "#06C755" }}
            >
              友だち追加する
            </a>
          </div>
        ) : (
          <p className="mt-6 text-xs text-[#97826f]">
            この画面は閉じていただいて大丈夫です。
          </p>
        )}
      </div>
    );
  }

  // ── まだご利用のない方（顧客DBに電話番号がない）
  if (status === "not_customer") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-[#3c200f]">ご登録が見つかりませんでした</h1>
        <p className="mt-4 text-sm leading-7 text-[#6e5340]">
          入力いただいたお電話番号でのご利用履歴が見つかりませんでした。
          <br />
          まだ当店をご利用いただいたことがない場合は、はじめてのご予約の際にご登録いただけます。
        </p>
        <a
          href="/booking"
          className="mt-6 inline-block rounded-lg bg-[#b87942] px-6 py-3 text-sm font-bold text-white"
        >
          ご予約はこちらから
        </a>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 block w-full text-xs text-[#97826f] underline"
        >
          お電話番号を入力し直す
        </button>
      </div>
    );
  }

  // ── 既に別のLINEアカウントが連携済み
  if (status === "occupied") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-[#3c200f]">既にご登録があります</h1>
        <p className="mt-4 text-sm leading-7 text-[#6e5340]">
          このお客様情報には、別のLINEアカウントが登録されています。
          <br />
          お心当たりがない場合は、お手数ですがお電話（0460-80-0290）にてご連絡ください。
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-xl font-bold text-[#3c200f]">お客様情報のご登録</h1>
      <p className="mt-3 text-sm leading-7 text-[#6e5340]">
        これまでにご利用いただいたお客様情報とLINEを結びつけます。
        <br />
        ご登録いただくと、ご予約の確認やお知らせをLINEでもお受け取りいただけます。
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="link-phone" className="block text-sm font-bold text-[#3c200f]">
            ご登録のお電話番号
          </label>
          <input
            id="link-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="090-1234-5678"
            className="mt-2 w-full rounded-lg border border-[#e5ddd8] px-4 py-3 text-base"
          />
        </div>

        {status === "error" && (
          <p className="rounded-lg bg-[#f6e2de] px-4 py-3 text-sm text-[#b3402f]">
            通信に失敗しました。少し時間をおいてお試しください。
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-lg bg-[#b87942] px-6 py-4 text-base font-bold text-white disabled:opacity-50"
        >
          {status === "sending" ? "確認しています…" : "登録する"}
        </button>
      </form>
    </div>
  );
}
