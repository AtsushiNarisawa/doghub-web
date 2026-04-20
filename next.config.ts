import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Vercel Image Optimization の月間クォータ到達により /_next/image が 402 を返す問題への恒久対策。
    // Supabase Storage 側で 600KB 以下に最適化済みのため、Vercelの変換を経由せず直接配信する。
    // 2026-04-09 本番不具合対応。
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "jkpenklhrlbctebkpvax.supabase.co" },
      { protocol: "https", hostname: "sspark.genspark.ai" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
    ],
  },
  // WanWalk独立ドメイン移行リダイレクト（2026-04-16）
  // redirects() は middleware・trailingSlash正規化より先に評価されるため、
  // 末尾スラッシュ有/無の両方を1段で wanwalk.jp に飛ばせる。
  // 旧Wix系のリダイレクトは middleware.ts に残置（パス変換ロジックが複雑なため）。
  // statusCode: 301 を明示（permanent: true は308を返すため、SEO慣例の301に揃える）。
  async redirects() {
    return [
      // /walks → wanwalk.jp トップ
      { source: "/walks", destination: "https://wanwalk.jp/", statusCode: 301 },
      { source: "/walks/", destination: "https://wanwalk.jp/", statusCode: 301 },
      // /walks/areas → /areas
      { source: "/walks/areas", destination: "https://wanwalk.jp/areas", statusCode: 301 },
      { source: "/walks/areas/", destination: "https://wanwalk.jp/areas", statusCode: 301 },
      // /walks/areas/:slug → /areas/:slug
      { source: "/walks/areas/:slug", destination: "https://wanwalk.jp/areas/:slug", statusCode: 301 },
      { source: "/walks/areas/:slug/", destination: "https://wanwalk.jp/areas/:slug", statusCode: 301 },
      // /walks/routes/:slug → /routes/:slug（保険: ローカル実装で使われていた構造）
      { source: "/walks/routes/:slug", destination: "https://wanwalk.jp/routes/:slug", statusCode: 301 },
      { source: "/walks/routes/:slug/", destination: "https://wanwalk.jp/routes/:slug", statusCode: 301 },
      // /walks/:slug → /routes/:slug（GSCインデックス済のフラットURL）
      { source: "/walks/:slug", destination: "https://wanwalk.jp/routes/:slug", statusCode: 301 },
      { source: "/walks/:slug/", destination: "https://wanwalk.jp/routes/:slug", statusCode: 301 },
    ];
  },
};

export default nextConfig;
