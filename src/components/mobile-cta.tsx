"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

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

  if (pathname === "/booking" || pathname.startsWith("/admin")) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-[#3C200F] px-4 py-3 flex items-center justify-between gap-3">
        <div className="text-white flex-shrink-0">
          <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "1.4" }}>
            Google ★4.8（32件）
          </p>
          <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: "1.4" }}>
            DogHub箱根仙石原
          </p>
        </div>
        <a
          href="https://airrsv.net/doghubhakone/calendar"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 bg-white text-[#3C200F] px-5 py-2.5 flex items-center gap-2 hover:bg-[#F7F7F7] transition-colors"
          style={{ fontSize: "14px", fontWeight: 400 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          予約する
        </a>
      </div>
    </div>
  );
}
