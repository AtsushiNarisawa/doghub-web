"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

// Hotel & Cafe 系メニュー
const hotelNavItems = [
  { label: "HOME", href: "/" },
  { label: "はじめてガイド", href: "/guide" },
  {
    label: "お預かりサービス",
    href: "/service",
    children: [
      { label: "半日お預かり（4時間）", href: "/4h" },
      { label: "1日お預かり（8時間）", href: "/8h" },
      { label: "宿泊プラン", href: "/stay" },
    ],
  },
  {
    label: "シーン別ガイド",
    href: "/golf",
    children: [
      { label: "ゴルフ × ペットホテル", href: "/golf" },
      { label: "ユネッサン × ペット預かり", href: "/yunessun" },
      { label: "温泉 × ペット預かり", href: "/onsen" },
      { label: "美術館 × ペット預かり", href: "/museum" },
      { label: "高級旅館 × ペットホテル", href: "/ryokan" },
      { label: "ドッグラン", href: "/dogrun" },
    ],
  },
  { label: "おすすめスポット", href: "/spots" },
  { label: "カフェ・グッズ販売", href: "/cafe" },
  { label: "店舗情報", href: "/access" },
  { label: "よくある質問", href: "/faq" },
  { label: "お知らせ", href: "/news" },
];

// WanWalk（独立サービス）
const wanwalkNavItem = { label: "散歩コース", href: "/walks" };

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5DDD8]">
        <div className="w-full px-3 pr-4 lg:pr-[90px] h-[60px] lg:h-[80px] flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/images/img-046.png"
              alt="DogHub箱根仙石原"
              className="h-[60px] w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-5">
            {hotelNavItems.map((item) =>
              item.children ? (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="text-black hover:text-[#B87942] transition-colors whitespace-nowrap flex items-center gap-1"
                    style={{ fontSize: "14px", fontWeight: 400 }}
                  >
                    {item.label}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </Link>
                  {openDropdown === item.label && (
                    <div className="absolute top-full left-0 pt-2">
                      <div className="bg-white border border-[#E5DDD8] shadow-md min-w-[200px]">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-5 py-3 text-[#3C200F] hover:bg-[#F7F7F7] hover:text-[#B87942] transition-colors border-b border-[#E5DDD8] last:border-b-0"
                            style={{ fontSize: "13px", fontWeight: 400 }}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-black hover:text-[#B87942] transition-colors whitespace-nowrap"
                  style={{ fontSize: "14px", fontWeight: 400 }}
                >
                  {item.label}
                </Link>
              )
            )}
            {/* WanWalk（独立サービス） - セパレーター付き */}
            <span className="h-5 w-px bg-[#E5DDD8]" />
            <Link
              href={wanwalkNavItem.href}
              className="text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap flex items-center gap-1 font-medium"
              style={{ fontSize: "14px" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {wanwalkNavItem.label}
            </Link>
            <div className="flex items-center gap-1 ml-2">
              <a
                href="https://www.instagram.com/doghub.hakone__/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8F7B65] hover:text-[#3C200F] transition-colors p-1"
                aria-label="Instagram"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61580635661602"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8F7B65] hover:text-[#3C200F] transition-colors p-1"
                aria-label="Facebook"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </nav>

          <div className="lg:hidden flex items-center gap-1">
            <a
              href="https://www.instagram.com/doghub.hakone__/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8F7B65] hover:text-[#3C200F] transition-colors p-2"
              aria-label="Instagram"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61580635661602"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8F7B65] hover:text-[#3C200F] transition-colors p-2"
              aria-label="Facebook"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
          <button
            className="p-3 min-h-11 min-w-11 flex items-center justify-center text-[#3C200F]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="メニュー"
          >
            <div className="w-5 flex flex-col gap-1.5">
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E5DDD8] px-6 py-4 flex flex-col overflow-y-auto" style={{ maxHeight: "calc(100dvh - 60px)" }}>
            {hotelNavItems.map((item) => (
              <div key={item.href}>
                {item.children ? (
                  <>
                    <button
                      className="text-sm text-[#3C200F] py-4 border-b border-[#E5DDD8] hover:text-[#B87942] transition-colors w-full text-left flex items-center justify-between"
                      onClick={() => setMobileDropdown(mobileDropdown === item.label ? null : item.label)}
                    >
                      {item.label}
                      <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className={`transition-transform ${mobileDropdown === item.label ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    {mobileDropdown === item.label && (
                      <div className="pl-4">
                        <Link
                          href={item.href}
                          className="text-sm text-[#8F7B65] py-3 border-b border-[#E5DDD8] hover:text-[#B87942] transition-colors block"
                          onClick={() => setMenuOpen(false)}
                        >
                          └ {item.label}（一覧）
                        </Link>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="text-sm text-[#8F7B65] py-3 border-b border-[#E5DDD8] hover:text-[#B87942] transition-colors block"
                            onClick={() => setMenuOpen(false)}
                          >
                            └ {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm text-[#3C200F] py-4 border-b border-[#E5DDD8] hover:text-[#B87942] transition-colors block"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <a
              href="https://airrsv.net/doghubhakone/calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#3C200F] text-white text-sm font-medium px-6 py-4 text-center mt-3 min-h-11"
              onClick={() => setMenuOpen(false)}
            >
              ペットホテル予約
            </a>
            {/* WanWalk（独立サービス） */}
            <div className="border-t-2 border-amber-200 mt-4 pt-4">
              <p className="text-xs text-amber-600 font-medium mb-2 tracking-wide">WanWalk - 散歩ルート情報</p>
              <Link
                href="/walks"
                className="flex items-center gap-2 text-sm text-amber-700 font-medium py-3 hover:text-amber-900 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                散歩コースを探す
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Right fixed booking tab */}
      <a
        href="https://airrsv.net/doghubhakone/calendar"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:flex fixed right-0 z-40 bg-[#3C200F] text-white flex-col items-center justify-center gap-3 hover:bg-[#5a3e28] transition-colors rounded-l-md"
        style={{ top: "76px", width: "74px", height: "296px" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span
          className="text-white"
          style={{ writingMode: "vertical-rl", fontSize: "19px", fontWeight: 400, letterSpacing: "0.1em" }}
        >
          ペットホテル予約
        </span>
      </a>
    </>
  );
}

export default Header;
