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
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "article_view",
      article_slug: slug,
      article_category: category || "unknown",
    });
  }, [slug, category]);

  return null;
}
