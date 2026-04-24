"use client";

export function GwBanner() {
  const now = new Date();
  const start = new Date("2026-04-06");
  const end = new Date("2026-05-12");
  if (now < start || now >= end) return null;

  return (
    <div style={{
      background: "#FFF8F3",
      borderBottom: "1px solid #E5DDD8",
      padding: "12px 16px",
      textAlign: "center",
      fontSize: "14px",
      color: "#3C200F",
    }}>
      <span>🐾 <strong>GW営業のお知らせ</strong>: 4/30〜5/10はペットホテル休まず営業。カフェは5/7・5/8お休み。</span>
    </div>
  );
}
