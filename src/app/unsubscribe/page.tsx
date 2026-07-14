"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function UnsubscribeInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleUnsubscribe() {
    if (!token) {
      setState("error");
      return;
    }
    setState("loading");
    try {
      const res = await fetch(`/api/email/unsubscribe?token=${encodeURIComponent(token)}`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({ ok: false }));
      setState(json.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7f5f0", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "-apple-system, 'Hiragino Sans', sans-serif" }}>
      <div style={{ maxWidth: 480, width: "100%", background: "white", borderRadius: 16, padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#3C200F", borderRadius: 10, padding: "8px 20px", marginBottom: 20 }}>
          <span style={{ color: "white", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>DogHub</span>
        </div>

        {state === "done" ? (
          <>
            <h1 style={{ fontSize: 18, color: "#3C200F", margin: "0 0 12px" }}>配信を停止しました</h1>
            <p style={{ fontSize: 14, color: "#888", lineHeight: 1.9, margin: 0 }}>
              今後、DogHubからのご案内メールはお送りしません。<br />
              またのご利用を心よりお待ちしております。
            </p>
          </>
        ) : state === "error" ? (
          <>
            <h1 style={{ fontSize: 18, color: "#3C200F", margin: "0 0 12px" }}>手続きができませんでした</h1>
            <p style={{ fontSize: 14, color: "#888", lineHeight: 1.9, margin: "0 0 8px" }}>
              リンクの有効期限が切れているか、既に停止済みの可能性があります。
            </p>
            <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.8, margin: 0 }}>
              お手数ですが、配信停止をご希望の場合は <a href="tel:0460800290" style={{ color: "#B87942" }}>0460-80-0290</a> までご連絡ください。
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 18, color: "#3C200F", margin: "0 0 12px" }}>配信停止のお手続き</h1>
            <p style={{ fontSize: 14, color: "#888", lineHeight: 1.9, margin: "0 0 24px" }}>
              DogHub箱根仙石原からのご案内メールの配信を停止します。<br />
              よろしければ下のボタンを押してください。
            </p>
            <button
              onClick={handleUnsubscribe}
              disabled={state === "loading" || !token}
              style={{ background: state === "loading" || !token ? "#ccc" : "#3C200F", color: "white", border: "none", fontSize: 15, fontWeight: 600, padding: "13px 32px", borderRadius: 10, cursor: state === "loading" || !token ? "default" : "pointer" }}
            >
              {state === "loading" ? "手続き中..." : "配信を停止する"}
            </button>
            {!token && (
              <p style={{ fontSize: 12, color: "#c00", marginTop: 16 }}>
                リンクが正しくありません。メール内のリンクから再度お試しください。
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={null}>
      <UnsubscribeInner />
    </Suspense>
  );
}
