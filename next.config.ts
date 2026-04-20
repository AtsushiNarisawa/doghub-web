import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // 末尾スラッシュ正規化を middleware で一元管理するため無効化
  // /walks/* の1段301維持のため（Next.js デフォルト308が先に発火するのを抑止）
  skipTrailingSlashRedirect: true,
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
  // 旧URLリダイレクトは middleware.ts で一元管理
};

export default nextConfig;
