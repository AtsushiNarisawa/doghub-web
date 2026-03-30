import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAreasWithRouteCount, getAllPublishedRoutes } from "@/lib/walks/data";
import type { RouteWithArea } from "@/types/walks";
import RouteCard from "@/components/walks/RouteCard";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import SupportedBadge from "@/components/walks/SupportedBadge";

// ISR: 30分ごとに再検証
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "次の休日、どこ歩く？ 犬連れ散歩コース | WanWalk by DogHub",
  description:
    "箱根・鎌倉・伊豆など、犬連れに優しい散歩ルートを体験つきで紹介。駐車場・犬可カフェ・トイレ情報も完備。",
  openGraph: {
    title: "次の休日、どこ歩く？ | WanWalk",
    description: "箱根・鎌倉・伊豆…犬連れに優しいルートを体験つきで紹介。",
  },
};

export default async function WalksTopPage() {
  const [areas, routes] = await Promise.all([
    getAreasWithRouteCount(),
    getAllPublishedRoutes(),
  ]);

  const activeAreas = areas.filter((a) => a.route_count > 0);
  const featuredAreas = [...activeAreas]
    .sort((a, b) => b.route_count - a.route_count)
    .slice(0, 8);

  // おすすめ: 箱根4エリア + 鎌倉 + 伊豆（DogHub周遊は除外）
  const featuredSlugs = [
    "hakone-ashinoko-onshi-park-walk",       // 箱根・芦ノ湖
    "hakone-gora-chokoku-park",              // 箱根・強羅
    "hakone-sengokuhara-susuki-highland-walk",// 箱根・仙石原
    "hakone-yumoto-onsen-town-walk",         // 箱根・箱根湯本
    "kamakura-hasedera-daibutsu-walk",       // 鎌倉
    "izu-shuzenji-onsen",                    // 伊豆
  ];
  const featuredRoutes = featuredSlugs
    .map((slug) => routes.find((r) => r.slug === slug))
    .filter((r): r is RouteWithArea => r !== undefined);

  return (
    <>
      {/* ヒーロー: KV + テキスト */}
      <section>
        {/* KV画像 */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
          <Image
            src="https://jkpenklhrlbctebkpvax.supabase.co/storage/v1/object/public/route-photos/sengokuhara_susuki/01.jpg"
            alt="仙石原すすき草原と箱根の山々"
            fill
            priority
            className="object-cover object-[center_65%]"
            sizes="100vw"
          />
          {/* 下端フェード: 画像→背景色に自然に溶け込む */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f5f0ea] to-transparent" />
        </div>

        {/* テキストエリア: 確実に背景色の上 */}
        <div className="bg-[#f5f0ea] pb-12 pt-6">
          <div className="max-w-6xl mx-auto px-4 text-center">
            {/* Branding */}
            <div className="inline-flex items-center gap-3 mb-5">
              <span className="text-[#5E7254] text-base font-bold tracking-wide">WanWalk</span>
              <span className="text-[#8B6F47]/50 text-xs tracking-wide">Supported by 箱根DMO</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
              次の休日、どこ歩く？
            </h1>
            <p className="text-gray-500 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              箱根・鎌倉・伊豆…
              <br className="hidden md:inline" />
              犬連れに優しいルートを体験つきで紹介
            </p>

            {/* 数字 */}
            <div className="flex items-center justify-center gap-6 md:gap-10 mb-8">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-[#5E7254]">{routes.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">散歩コース</p>
              </div>
              <div className="w-px h-10 bg-gray-300/40" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-[#5E7254]">{activeAreas.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">エリア</p>
              </div>
              <div className="w-px h-10 bg-gray-300/40" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-[#5E7254]">All</p>
                <p className="text-xs text-gray-400 mt-0.5">犬連れ対応</p>
              </div>
            </div>

            <Link
              href="/walks/areas"
              className="inline-block bg-[#5E7254] text-white font-semibold px-8 py-3 rounded-full hover:bg-[#4A5E42] transition-colors shadow-sm"
            >
              エリアから探す
            </Link>
          </div>
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

        <SupportedBadge />
      </div>
    </>
  );
}
