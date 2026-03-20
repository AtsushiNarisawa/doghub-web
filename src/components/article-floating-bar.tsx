"use client";

import { useEffect, useState } from "react";

export function ArticleFloatingBar({ href, label }: { href: string; label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setVisible(scrollPercent > 0.35 && scrollPercent < 0.9);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
      <a
        href={href}
        className="flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur border border-border rounded-xl shadow-lg"
        style={{ textDecoration: "none" }}
      >
        <span className="text-text" style={{ fontSize: "13px" }}>DogHub箱根仙石原って？</span>
        <span className="text-accent" style={{ fontSize: "13px", fontWeight: 500 }}>→ {label}</span>
      </a>
    </div>
  );
}
