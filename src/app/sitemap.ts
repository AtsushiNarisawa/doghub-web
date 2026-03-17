import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://dog-hub.shop";
  const now = new Date();
  const articles = await getArticles();

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/news/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/service`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/stay`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/8h`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/4h`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/golf`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/yunessun`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/onsen`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/museum`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/ryokan`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/pethotel`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/dogrun`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guide/hakone-dog`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guide/pet-hotel-tips`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guide/sengokuhara`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/cafe`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/spots`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/booking`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/access`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    ...articlePages,
  ];
}
