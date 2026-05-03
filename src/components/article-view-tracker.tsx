"use client";

import { useEffect } from "react";

export function ArticleViewTracker({
  slug,
  category,
}: {
  slug: string;
  category: string;
}) {
  useEffect(() => {
    // page_view が GTM 側で先に処理されるよう次の task で送る。
    // useEffect は子→親の順で実行されるため、何もしないと layout の
    // GtmPageView より先に article_view が dataLayer に積まれ、
    // GA4 のセッション初期化前にカスタムイベントが届いてしまう。
    const timer = setTimeout(() => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "article_view",
        article_slug: slug,
        article_category: category || "unknown",
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [slug, category]);

  return null;
}
