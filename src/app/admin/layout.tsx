"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuthGuard } from "@/components/admin/auth-guard";

const NAV_ITEMS = [
  { href: "/admin", label: "ダッシュボード", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/admin/calendar", label: "カレンダー", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/admin/capacity", label: "容量設定", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
  { href: "/admin/customers", label: "顧客", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
];

function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-2 pt-3 text-[10px] ${
              isActive(href) ? "text-[#B87942]" : "text-gray-400"
            }`}
          >
            <svg
              className="w-6 h-6 mb-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function AdminHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="font-medium text-[15px] text-gray-900">DogHub 管理</h1>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  ログアウト
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ログインページは認証ガード外
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="min-h-dvh bg-gray-50 pb-20">
        <AdminHeader />
        <main className="max-w-lg mx-auto px-4 py-4">{children}</main>
        <AdminNav />
      </div>
    </AuthGuard>
  );
}
