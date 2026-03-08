"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const navItems = [
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

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) =>
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
          </nav>

          <button
            className="lg:hidden p-3 min-h-11 min-w-11 flex items-center justify-center text-[#3C200F]"
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

        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E5DDD8] px-6 py-4 flex flex-col overflow-y-auto" style={{ maxHeight: "calc(100dvh - 60px)" }}>
            {navItems.map((item) => (
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
