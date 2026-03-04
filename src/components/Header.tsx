"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { label: "お預かりサービス", href: "/service" },
  { label: "ご予約", href: "/booking" },
  { label: "カフェ", href: "/cafe" },
  { label: "箱根観光", href: "/hakone" },
  { label: "アクセス", href: "/access" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F5F0]/95 backdrop-blur-sm border-b border-[#DDD8D0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-dm font-bold text-[#1A1A1A] text-2xl tracking-tight">
            Dog<span className="text-[#2A5C45]">Hub</span>
          </span>
          <span className="hidden sm:block text-[#6B6B6B] text-xs mt-1">
            箱根仙石原
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[#1A1A1A] hover:text-[#2A5C45] transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="bg-[#C49A3C] hover:bg-[#d4aa4c] text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
          >
            今すぐ予約
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-[#1A1A1A]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="メニュー"
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#F7F5F0] border-t border-[#DDD8D0] px-4 py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-[#1A1A1A] py-2 border-b border-[#DDD8D0]"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/booking"
            className="bg-[#C49A3C] text-white text-sm font-medium px-5 py-3 rounded-full text-center mt-2"
            onClick={() => setMenuOpen(false)}
          >
            今すぐ予約
          </Link>
        </div>
      )}
    </header>
  );
}
