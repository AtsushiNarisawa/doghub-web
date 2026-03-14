import Link from "next/link";
import type { Metadata } from "next";
import { getAreasWithRouteCount, getAllPublishedRoutes } from "@/lib/walks/data";
import RouteCard from "@/components/walks/RouteCard";
import WalksAppCTA from "@/components/walks/WalksAppCTA";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "犬と歩く散歩コース | DogHub",
  description:
    "愛犬と一緒に楽しめる散歩ルートを紹介。箱根・鎌倉・湘南など人気エリアの犬連れ散歩コースを写真・地図・体験つきで詳しく紹介。",
  openGraph: {
    title: "犬と歩く散歩コース | DogHub",
    description: "愛犬と一緒に楽しめる散歩ルートを地図・写真・体験つきで詳しく紹介。",
  },
};

export default async function WalksTopPage() {
  const [areas, routes] = await Promise.all([
    getAreasWithRouteCount(),
    getAllPublishedRoutes(),
  ]);

  const featuredAreas = areas
    .filter((a) => a.route_count > 0)
    .sort((a, b) => b.route_count - a.route_count)
    .slice(0, 8);

  const featuredRoutes = routes.slice(0, 6);

  return (
    <>
      {/* ヒーロー */}
      <section className="relative bg-gradient-to-br from-amber-50 via-white to-orange-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-amber-600 text-sm font-medium mb-2">WanWalk by DogHub</p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            犬と歩く、日本の散歩道
          </h1>
          <p className="text-gray-500 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            愛犬と一緒に楽しめる散歩ルートを、
            <br className="hidden md:inline" />
            地図・写真・体験つきで詳しく紹介
          </p>
          <Link
            href="/walks/areas"
            className="inline-block bg-amber-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-amber-700 transition-colors"
          >
            エリアから探す
          </Link>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">
        {/* エリア一覧 */}
        <section className="py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">人気エリア</h2>
            <Link href="/walks/areas" className="text-sm text-amber-600 hover:underline">
              すべて見る
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {featuredAreas.map((area) => (
              <Link
                key={area.id}
                href={`/walks/areas/${area.slug}`}
                className="group block p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-colors"
              >
                <h3 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">
                  {area.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {area.prefecture} &middot; {area.route_count}コース
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ピックアップルート */}
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-6">おすすめ散歩コース</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRoutes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </section>

        {/* WanWalkとは */}
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-6 text-center">WanWalkとは？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">犬連れ専門ルート</h3>
              <p className="text-sm text-gray-500">駐車場・トイレ・犬可カフェなど犬連れに必要な情報を完備</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">写真で体験を伝える</h3>
              <p className="text-sm text-gray-500">実際に歩いた人の写真と体験で、コースの魅力をリアルにお届け</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">アプリで記録</h3>
              <p className="text-sm text-gray-500">WanWalkアプリで散歩を記録。GPS追跡で歩いたルートを自動保存</p>
            </div>
          </div>
        </section>

        <div className="py-12">
          <WalksAppCTA />
        </div>
      </div>
    </>
  );
}
