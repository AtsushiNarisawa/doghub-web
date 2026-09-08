"use client";

import { useState } from "react";

// 購入パネル。数量と受取方法を選んで、Stripe の決済ページへ送り出す。
//
// 🔴 残数は「オンライン分」と必ず明記する。
//    店頭に在庫がある状態で「残り◯本」とだけ書くと、実際より少なく見せる表示になる（景表法）。
// 🔴 「残りわずか」「今だけ」の類は出さない。数字は在庫の実数だけを見せる。

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type Product = {
  id: string;
  name: string;
  series: string;
  size: string;
  price: number;
  shipping: number;
  shipping_label: string;
  max_qty: number;
  state: "before_sale" | "on_sale" | "sold_out";
  available: number;
};

const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

export function BuyPanel({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [fulfillment, setFulfillment] = useState<"pickup" | "ship">("pickup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [website, setWebsite] = useState(""); // honeypot

  const max = Math.min(product.max_qty, Math.max(1, product.available));
  const total = product.price * qty + (fulfillment === "ship" ? product.shipping : 0);

  async function handleBuy() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      window.dataLayer?.push({ ecommerce: null });
      window.dataLayer?.push({
        event: "begin_checkout",
        ecommerce: {
          currency: "JPY",
          value: total,
          items: [
            {
              item_id: product.id,
              item_name: product.name,
              price: product.price,
              quantity: qty,
            },
          ],
        },
        delivery: fulfillment,
      });

      const res = await fetch("/api/fragrance/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          qty,
          fulfillment,
          website,
          utm_source: params.get("utm_source") || undefined,
          utm_medium: params.get("utm_medium") || undefined,
          utm_campaign: params.get("utm_campaign") || undefined,
          referrer: document.referrer || undefined,
        }),
      });
      const json = await res.json().catch(() => ({ ok: false }));

      if (json.ok && json.url) {
        window.location.href = json.url;
        return;
      }
      setError(messageFor(json.error));
    } catch {
      setError("通信できませんでした。時間をおいてもう一度お試しください。");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* 人には見えない入力欄（自動投稿よけ） */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="text-center mb-8">
        <p className="text-[#3C200F] text-lg">{product.name}</p>
        <p className="text-sm text-[#3C200F]/60 mt-1">{product.size}</p>
        <p className="text-2xl text-[#3C200F] mt-4">{yen(product.price)}</p>
        <p className="text-xs text-[#3C200F]/50 mt-1">税込</p>
        <p className="text-sm text-[#3C200F]/70 mt-4">
          オンライン分 残り {product.available} 本
        </p>
      </div>

      {/* 受け取り方 */}
      <fieldset className="mb-6">
        <legend className="text-sm text-[#3C200F]/70 mb-3">お受け取りの方法</legend>
        <div className="space-y-2">
          <label
            className={`flex items-start gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
              fulfillment === "pickup"
                ? "border-[#3C200F] bg-white"
                : "border-[#3C200F]/20 bg-white/60"
            }`}
          >
            <input
              type="radio"
              name="fulfillment"
              checked={fulfillment === "pickup"}
              onChange={() => setFulfillment("pickup")}
              className="mt-1"
            />
            <span>
              <span className="text-[#3C200F]">店頭でお受け取り</span>
              <span className="block text-xs text-[#3C200F]/60 mt-1 leading-relaxed">
                送料はかかりません。次にご来店いただいたときに、ホテル受付でお渡しします。
                ご決済日から90日以内にお受け取りください。
              </span>
            </span>
          </label>

          <label
            className={`flex items-start gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
              fulfillment === "ship"
                ? "border-[#3C200F] bg-white"
                : "border-[#3C200F]/20 bg-white/60"
            }`}
          >
            <input
              type="radio"
              name="fulfillment"
              checked={fulfillment === "ship"}
              onChange={() => setFulfillment("ship")}
              className="mt-1"
            />
            <span>
              <span className="text-[#3C200F]">配送</span>
              <span className="block text-xs text-[#3C200F]/60 mt-1 leading-relaxed">
                {product.shipping_label}・{yen(product.shipping)}。ご注文から3〜7営業日以内に発送します。
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      {/* 数量 */}
      <div className="flex items-center justify-between mb-6">
        <label htmlFor="qty" className="text-sm text-[#3C200F]/70">
          本数
        </label>
        <select
          id="qty"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="border border-[#3C200F]/20 rounded-lg px-4 py-2 bg-white text-[#3C200F]"
        >
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} 本
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between border-t border-[#3C200F]/10 pt-4 mb-6">
        <span className="text-sm text-[#3C200F]/70">お支払金額</span>
        <span className="text-lg text-[#3C200F]">{yen(total)}</span>
      </div>

      <button
        onClick={handleBuy}
        disabled={busy}
        className="w-full bg-[#3C200F] text-white rounded-lg px-6 py-4 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {busy ? "お手続きの画面へ移動しています…" : "購入手続きへ"}
      </button>

      {error && <p className="text-sm text-red-700 mt-4 text-center">{error}</p>}

      <p className="text-xs text-[#3C200F]/50 mt-5 leading-relaxed text-center">
        お支払いは Stripe の画面で行います。カード情報は当店を通りません。
        <br />
        <a href="/fragrance/legal" className="underline">
          特定商取引法に基づく表記・返品について
        </a>
      </p>
      <p className="text-xs text-[#3C200F]/45 mt-3 leading-relaxed text-center">
        ※ 詰め替え用とのセットは、店頭でのみ承っております。
      </p>
    </div>
  );
}

function messageFor(code: string | undefined): string {
  switch (code) {
    case "sold_out":
      return "申し訳ありません。ちょうど売り切れました。ページを開き直すと、再入荷のお知らせにご登録いただけます。";
    case "closed":
      return "ただいま販売を停止しています。";
    case "rate_limited":
      return "お手続きが続いています。少し時間をおいてからお試しください。";
    case "too_many":
      return "お一人さまあたりの本数を超えています。";
    case "not_available":
      return "ただいまお取り扱いしておりません。";
    default:
      return "手続きを開始できませんでした。時間をおいてもう一度お試しください。";
  }
}
