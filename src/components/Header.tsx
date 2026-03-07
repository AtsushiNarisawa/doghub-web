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
  { label: "おすすめスポット", href: "/spots" },
  { label: "カフェ・グッズ販売", href: "/cafe" },
  { label: "店舗情報", href: "/access" },
  { label: "よくある質問", href: "/faq" },
  { label: "お知らせ", href: "/news" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5DDD8]">
        <div className="w-full px-3 pr-[90px] h-[80px] flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="https://static.wixstatic.com/media/a21f47_81c40c3955fe4490bf251cb04d7e4737~mv2.png/v1/crop/x_0,y_31,w_432,h_179/fill/w_144,h_60,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a21f47_81c40c3955fe4490bf251cb04d7e4737~mv2.png"
              alt="DogHub箱根仙石原"
              className="h-[60px] w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) =>
              item.children ? (
                <div
                  key={item.href}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
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
                  {dropdownOpen && (
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
            className="lg:hidden p-2 text-[#3C200F]"
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
          <div className="lg:hidden bg-white border-t border-[#E5DDD8] px-6 py-4 flex flex-col">
            {navItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-[#3C200F] py-3 border-b border-[#E5DDD8] hover:text-[#B87942] transition-colors block"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="text-sm text-[#8F7B65] py-2 border-b border-[#E5DDD8] hover:text-[#B87942] transition-colors block"
                        onClick={() => setMenuOpen(false)}
                      >
                        └ {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a
              href="https://www.airrsv.net/doghubhakone/calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#3C200F] text-white text-sm font-medium px-6 py-3 text-center mt-3"
              onClick={() => setMenuOpen(false)}
            >
              ペットホテル予約
            </a>
          </div>
        )}
      </header>

      {/* Right fixed booking tab */}
      <a
        href="https://www.airrsv.net/doghubhakone/calendar"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed right-0 z-40 bg-[#3C200F] text-white flex flex-col items-center justify-center gap-3 hover:bg-[#5a3e28] transition-colors rounded-l-md"
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
