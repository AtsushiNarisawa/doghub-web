"use client";

import { useState } from "react";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const params = new URLSearchParams(window.location.search);
      const res = await fetch("/api/fragrance/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          website,
          utm_source: params.get("utm_source") || undefined,
          utm_medium: params.get("utm_medium") || undefined,
          utm_campaign: params.get("utm_campaign") || undefined,
          referrer: document.referrer || undefined,
        }),
      });
      const json = await res.json().catch(() => ({ ok: false }));
      if (json.ok) {
        setState("done");
        window.dataLayer?.push({ event: "fragrance_waitlist_signup" });
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="text-center py-6">
        <p className="text-[#3C200F] font-medium mb-2">承りました。</p>
        <p className="text-sm text-[#3C200F]/60 leading-relaxed">
          できあがりましたら、このアドレスに先にお知らせします。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      {/* honeypot: 人間には見えない。埋まっていたらAPI側でbot判定 */}
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
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          className="flex-1 border border-[#3C200F]/20 rounded-lg px-4 py-3 text-[#3C200F] placeholder:text-[#3C200F]/35 focus:outline-none focus:border-[#3C200F]/50 bg-white"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="bg-[#3C200F] text-white rounded-lg px-6 py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
        >
          {state === "loading" ? "送信中…" : "お知らせを受け取る"}
        </button>
      </div>
      {state === "error" && (
        <p className="text-sm text-red-700 mt-3">
          送信できませんでした。時間をおいてもう一度お試しください。
        </p>
      )}
      <p className="text-xs text-[#3C200F]/50 mt-3 leading-relaxed">
        ご入力いただいたメールアドレスは、この商品のご案内にのみ使用します（
        <a href="/privacy" className="underline">プライバシーポリシー</a>）。
      </p>
    </form>
  );
}
