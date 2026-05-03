"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function GtmPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // 初回レンダリングはGTMが自動でpage_viewを発火するのでスキップ
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // 内部トラフィック除外: /admin, /api 配下ではpage_viewを送らない
    if (/^\/(admin|api)(\/|$)/.test(pathname)) return;

    // UtmPersistence が history.replaceState で URL を書き換えている可能性があるので
    // window.location を直接参照して常に最新の URL を送る。
    window.dataLayer?.push({
      event: "page_view",
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

// window.dataLayer の型定義
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}
