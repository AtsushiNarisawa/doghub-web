"use client";

import Link from "next/link";

// 季節バナー（トップページ用）。表示期間とコピーは季節ごとに差し替える。
// 現在: 夏のお預かり訴求（2026 夏シーズン）。
export function GwBanner() {
  const now = new Date();
  const start = new Date("2026-06-01");
  const end = new Date("2026-09-01");
  if (now < start || now >= end) return null;

  return (
    <Link
      href="/booking"
      style={{
        display: "block",
        background: "#FFF8F3",
        borderBottom: "1px solid #E5DDD8",
        padding: "12px 16px",
        textAlign: "center",
        fontSize: "14px",
        color: "#3C200F",
        textDecoration: "none",
      }}
    >
      <span>
        🐾 <strong>夏のご予約を受付中</strong>：仙石原は標高が高く、夏でも涼しい高原のまち。観光やゴルフの時間だけ、早朝7時から愛犬をお預かりします。ご予約はこちら →
      </span>
    </Link>
  );
}
