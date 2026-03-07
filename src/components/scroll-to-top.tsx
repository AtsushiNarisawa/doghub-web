"use client";

import { useState, useEffect } from "react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-5 bottom-5 z-40 bg-white border border-[#8F7B65] flex items-center justify-center hover:bg-[#F7F7F7] transition-colors cursor-pointer"
      style={{ width: "50px", height: "50px" }}
      aria-label="ページトップへ戻る"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8F7B65" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
