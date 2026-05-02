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

    // SPA遷移時にdataLayerへpushしてGTMに通知
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    window.dataLayer?.push({
      event: "page_view",
      page_location: window.location.origin + url,
      page_path: pathname,
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
