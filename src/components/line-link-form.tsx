"use client";

import { useState } from "react";

// LINE友だちと既存のお客様情報を結びつけるフォーム。
// LIFF（LINE内ブラウザ）から `?mode=link` で開かれ、BookingPage が予約フォームの代わりに描画する。
//
// 入力はお電話番号のみ（CEO判断・2026-07-21）。店内部での紐付けが目的であり、
// 項目を増やすと登録率が落ちるため。身に覚えのない連携は完了通知メールで本人が気づける。
// 設計の詳細は marketing/reports/line_linking_implementation_plan_2026-07-21.md

type Status = "idle" | "sending" | "done" | "not_customer" | "occupied" | "error";

export function LineLinkForm({ lineId, isLiff }: { lineId: string; isLiff: boolean }) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [customerName, setCustomerName] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/line/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line_id: lineId, phone }),
      });
      const data = await res.json();
      if (data.ok) {
        setCustomerName(data.customerName || "");
        setStatus("done");
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "line_link_complete" });
      } else if (data.reason === "not_a_customer") {
        setStatus("not_customer");
      } else if (data.reason === "occupied") {
        setStatus("occupied");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  // ── LINE外で開かれた場合（LINE IDが取れない）
  if (!isLiff || !lineId) {
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
        <p className="mt-6 text-xs text-[#97826f]">
          この画面は閉じていただいて大丈夫です。
        </p>
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
          このお電話番号には、別のLINEアカウントが登録されています。
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
