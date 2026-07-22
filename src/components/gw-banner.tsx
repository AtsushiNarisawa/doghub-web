"use client";

import Link from "next/link";

// 季節バナー（トップページ用）。表示期間とコピーは季節ごとに差し替える。
// 現在: 夏のお預かり訴求（2026 夏シーズン）。会期前後（2026-08-21〜23の大箱根CCゴルフ大会）は告知に切替。
export function GwBanner() {
  const now = new Date();
  const start = new Date("2026-06-01");
  const end = new Date("2026-09-01");
  if (now < start || now >= end) return null;

  // 大箱根カントリークラブでの女子プロゴルフ大会（2026-08-21〜23）会期前後は告知に差し替え。
  // ※大会名・ロゴは使わず「女子プロゴルフの大会」という一般表現に留める。
  const golfActive =
    now >= new Date("2026-07-15") && now < new Date("2026-08-24");

  return (
    <Link
      href={golfActive ? "/golf" : "/booking"}
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
      {golfActive ? (
        <span>
          🐾 <strong>8/21〜23は大箱根カントリークラブで女子プロゴルフの大会</strong>。観戦・ご旅行の間、愛犬をお預かりします（会場まで車で約5分）。詳しくはこちら →
        </span>
      ) : (
        <span>
          🐾 <strong>夏のご予約を受付中</strong>：仙石原は標高が高く、夏でも涼しい高原のまち。観光やゴルフの時間だけ、早朝7時から愛犬をお預かりします。ご予約はこちら →
        </span>
      )}
    </Link>
  );
}
