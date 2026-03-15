"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const slides = [
  "/images/img-009.jpg",
  "/images/img-036.jpg",
  "/images/img-044.jpg",
  "/images/img-072.jpg",
];

export function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Hero photo slideshow */}
      <section className="relative overflow-hidden" style={{ height: "clamp(320px, 50vw, 719px)" }}>
        {slides.map((src, i) => (
          <img
            key={src}
            src={src}
            alt="DogHub 箱根仙石原"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: i === current ? 1 : 0 }}
          />
        ))}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40" style={{ zIndex: 5 }} />

        {/* Text overlay - bottom left */}
        <div className="absolute bottom-8 sm:bottom-12 left-6 sm:left-12 text-left" style={{ zIndex: 10 }}>
          <h1
            className="text-white mb-3"
            style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 400, lineHeight: "1.6", letterSpacing: "0.05em" }}
          >
            愛犬と箱根旅をつなぐ場所
          </h1>
          <p
            className="text-white/80 max-w-lg"
            style={{ fontSize: "clamp(12px, 1.3vw, 15px)", fontWeight: 400, lineHeight: "1.8" }}
          >
            愛犬と一緒に箱根を楽しむ際に、愛犬と入れる場所と<br className="hidden md:inline" />入れない場所を繋ぐHUBとしてご利用ください。
          </p>
        </div>
      </section>

      {/* CTA button bar */}
      <section className="bg-white border-b border-[#C2C2C2]">
        <div className="w-full flex flex-col sm:flex-row">
          <Link
            href="/service"
            className="flex items-center justify-center gap-2 py-5 sm:h-[67px] sm:flex-1 border-b sm:border-b-0 sm:border-r border-[#C2C2C2] hover:bg-[#F7F7F7] transition-colors"
          >
            <span className="text-[#3C200F] flex items-center gap-1.5" style={{ fontSize: "clamp(13px, 1.5vw, 18px)", fontWeight: 400 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> お預かりサービスについて</span>
          </Link>
          <Link
            href="/guide"
            className="flex items-center justify-center gap-2 py-5 sm:h-[67px] sm:flex-1 border-b sm:border-b-0 sm:border-r border-[#C2C2C2] hover:bg-[#F7F7F7] transition-colors"
          >
            <span className="text-[#3C200F]" style={{ fontSize: "clamp(13px, 1.5vw, 18px)", fontWeight: 400 }}>はじめての方へ</span>
          </Link>
          <a
            href="https://airrsv.net/doghubhakone/calendar" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-5 sm:h-[67px] sm:flex-1 hover:bg-[#F7F7F7] transition-colors"
          >
            <span className="text-[#3C200F] flex items-center gap-1.5" style={{ fontSize: "clamp(13px, 1.5vw, 18px)", fontWeight: 400 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> ご予約はこちら</span>
          </a>
        </div>
      </section>
    </>
  );
}
