import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "jkpenklhrlbctebkpvax.supabase.co" },
      { protocol: "https", hostname: "sspark.genspark.ai" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    return [
      // Wix旧URL → 新URL 301リダイレクト
      { source: "/beginner", destination: "/guide", permanent: true },
      { source: "/hakone", destination: "/spots", permanent: true },
      { source: "/dog-run", destination: "/spots", permanent: true },
      { source: "/home", destination: "/booking", permanent: true },
      { source: "/service-page", destination: "/service", permanent: true },
      { source: "/service-page/:path*", destination: "/service", permanent: true },
      { source: "/blog", destination: "/news", permanent: true },
      { source: "/post/:path*", destination: "/news", permanent: true },
    ];
  },
};

export default nextConfig;
