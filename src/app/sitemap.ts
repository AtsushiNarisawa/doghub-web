import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://dog-hub.shop";
  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/service`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/stay`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/8h`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/4h`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/cafe`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/spots`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/access`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/news`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];
}
