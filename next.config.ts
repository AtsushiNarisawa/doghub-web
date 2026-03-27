import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "jkpenklhrlbctebkpvax.supabase.co" },
      { protocol: "https", hostname: "sspark.genspark.ai" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
    ],
  },
  // 旧URLリダイレクトは middleware.ts で一元管理（二重リダイレクト防止）
};

export default nextConfig;
