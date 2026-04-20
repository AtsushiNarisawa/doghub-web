"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const LINE_ADD_URL = "https://line.me/R/ti/p/@794wdxyu";

export function MobileCta() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname === "/booking" || pathname.startsWith("/admin") || pathname.startsWith("/news/")) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-[#3C200F] px-4 py-3 flex items-center justify-between gap-2">
        <div className="text-white flex-shrink-0">
          <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "1.4" }}>
            Google ★4.8（32件）
          </p>
          <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "1.4" }}>
            DogHub箱根仙石原
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={LINE_ADD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg"
            style={{ background: "#06C755", width: "42px", height: "42px" }}
            aria-label="LINEで予約"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.95 1.91 5.53 4.75 7.05-.17.6-.62 2.24-.71 2.58-.12.43.16.43.33.31.13-.09 2.1-1.38 2.94-1.95.88.13 1.79.2 2.69.2 5.52 0 10-3.82 10-8.5S17.52 2 12 2z" />
            </svg>
          </a>
          <a
            href="/booking"
            className="bg-white text-[#3C200F] px-5 py-2.5 flex items-center gap-2 hover:bg-[#F7F7F7] transition-colors rounded-lg"
            style={{ fontSize: "14px", fontWeight: 400 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            予約する
          </a>
        </div>
      </div>
    </div>
  );
}
