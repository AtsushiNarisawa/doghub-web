import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/cms";

// 記事の戦略的priority（トラフィックポテンシャル順）
const ARTICLE_PRIORITY: Record<string, number> = {
  "hakone-dog-trip-guide": 0.9,        // 最大流入（354セッション/月）
  "hakone-dog-friendly-hotels": 0.9,   // 最大機会損失KW（517imp/月）
  "hakone-museum-dog-guide": 0.8,      // 80セッション/月
  "hakone-dog-travel-model-course": 0.8, // モデルコースKW独占
  "hakone-yunessun-pet-guide": 0.8,    // CV率10.7%
  "hakone-dog-lunch-guide": 0.8,       // ランチKW狙い
  "hakone-dog-hotel-guide": 0.8,       // 犬のホテルKW
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://dog-hub.shop";
  const now = new Date();
  const articles = await getArticles();

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/news/${a.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: ARTICLE_PRIORITY[a.slug] ?? 0.7,
  }));

  return [
    // コアページ（priority 1.0-0.9）
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/service`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/stay`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/booking`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/cafe`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/hakone`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },

    // シーン別ページ（priority 0.8）
    { url: `${baseUrl}/golf`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/yunessun`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/onsen`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/museum`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/ryokan`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/pethotel`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/8h`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/4h`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/beginner`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/dogrun`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // ガイドページ（priority 0.7）
    { url: `${baseUrl}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guide/hakone-dog`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guide/pet-hotel-tips`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guide/sengokuhara`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/spots`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/access`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },

    // 記事ページ（priorityは戦略的に設定）
    ...articlePages,
  ];
}
