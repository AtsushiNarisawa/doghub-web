"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getPartner } from "@/lib/partners";

const LINE_ADD_URL = "https://line.me/R/ti/p/@794wdxyu";
const TEL = "0460800290";

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

  // 提携先専用ページ（/partner/<slug>）では、提携先の印を付けたまま予約フォームへ渡す
  const partner = getPartner(pathname.match(/^\/partner\/([^/]+)/)?.[1]);
  const bookingHref = partner ? `/booking?partner=${partner.slug}` : "/booking";

  if (pathname === "/booking" || pathname.startsWith("/admin") || pathname.startsWith("/news/")) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="bg-[#3C200F] px-3 py-3 flex items-center justify-between gap-2">
        <div className="text-white min-w-0">
          <p style={{ fontSize: "11px", fontWeight: 400, lineHeight: "1.4" }}>
            Google ★4.9（63件）
          </p>
          <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: "1.4" }}>
            電話 9〜17時・水木休
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={`tel:${TEL}`}
            data-cta-id="mobile_cta_tel"
            className="flex items-center justify-center rounded-lg bg-white"
            style={{ width: "42px", height: "42px" }}
            aria-label="電話する（0460-80-0290・受付9〜17時）"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3C200F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
          </a>
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
            href={bookingHref}
            className="bg-white text-[#3C200F] px-3 py-2.5 flex items-center gap-2 hover:bg-[#F7F7F7] transition-colors rounded-lg"
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
