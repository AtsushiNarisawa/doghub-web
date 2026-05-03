"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

const STORAGE_KEY = "doghub_utm";

export function UtmPersistence() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (/^\/(admin|api)(\/|$)/.test(pathname)) return;

    const currentParams = new URLSearchParams(searchParams?.toString() || "");
    const hasUtmInUrl = UTM_KEYS.some((k) => currentParams.has(k));

    // URL に UTM があれば sessionStorage に保存して終了
    if (hasUtmInUrl) {
      const stored: Record<string, string> = {};
      UTM_KEYS.forEach((k) => {
        const v = currentParams.get(k);
        if (v) stored[k] = v;
      });
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      } catch {
        /* sessionStorage 利用不可時は無視 */
      }
      return;
    }

    // URL に UTM がなく sessionStorage にあれば URL に復元
    let stored: Record<string, string> | null = null;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as Record<string, string>;
    } catch {
      return;
    }
    if (!stored || Object.keys(stored).length === 0) return;

    Object.entries(stored).forEach(([k, v]) => {
      if (!currentParams.has(k)) currentParams.set(k, v);
    });
    const qs = currentParams.toString();
    const newUrl = pathname + (qs ? `?${qs}` : "") + window.location.hash;
    window.history.replaceState(window.history.state, "", newUrl);
  }, [pathname, searchParams]);

  return null;
}
