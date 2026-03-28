import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getAllPublishedRoutes,
  getRouteBySlug,
  getRouteSpots,
  getRouteLineCoordinates,
} from "@/lib/walks/data";
import WalksAppCTA from "@/components/walks/WalksAppCTA";
import RouteMapWrapper from "@/components/walks/RouteMapWrapper";

// ISR: 30分ごとに再検証
export const revalidate = 1800;

export async function generateStaticParams() {
  try {
    const routes = await getAllPublishedRoutes();
    return routes.filter((r) => r.slug && typeof r.slug === "string").map((r) => ({ slug: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) return {};

  const distanceKm = (route.distance_meters / 1000).toFixed(1);
  const description =
    route.meta_description ??
    `${route.areas.name}の犬連れ散歩コース「${route.name}」。距離${distanceKm}km、所要${route.estimated_minutes}分。${route.description?.slice(0, 80) ?? ""}`;

  return {
    title: `${route.name} - ${route.areas.name}の犬連れ散歩コース | DogHub`,
    description,
    openGraph: {
      title: `${route.name} | DogHub`,
      description,
      images: route.thumbnail_url ? [route.thumbnail_url] : undefined,
    },
  };
}

const difficultyLabels = { easy: "初級", moderate: "中級", hard: "上級" };
const difficultyColors = {
  easy: "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};
const spotTypeLabels: Record<string, string> = {
  start: "スタート",
  landscape: "景色",
  photo_spot: "撮影スポット",
  facility: "施設",
  end: "ゴール",
};
const spotTypeColors: Record<string, string> = {
  start: "bg-blue-500",
  landscape: "bg-green-500",
  photo_spot: "bg-purple-500",
  facility: "bg-orange-500",
  end: "bg-red-500",
};

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) notFound();

  const [spots, coordinates] = await Promise.all([
    getRouteSpots(route.id),
    getRouteLineCoordinates(route.id),
  ]);

  const distanceKm = (route.distance_meters / 1000).toFixed(1);
  const petInfo = route.pet_info;

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-amber-600">トップ</Link>
        <span className="mx-2">/</span>
        <Link href="/walks" className="hover:text-amber-600">散歩コース</Link>
        <span className="mx-2">/</span>
        <Link href="/walks/areas" className="hover:text-amber-600">エリア一覧</Link>
        <span className="mx-2">/</span>
        <Link href={`/walks/areas/${route.areas.slug}`} className="hover:text-amber-600">
          {route.areas.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{route.name}</span>
      </nav>

      {/* ヒーロー画像 */}
      {route.thumbnail_url && (
        <div className="aspect-[16/9] relative rounded-2xl overflow-hidden mb-8 bg-gray-100">
          <Image
            src={route.thumbnail_url}
            alt={route.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      )}

      {/* タイトル・基本情報 */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[route.difficulty_level]}`}>
            {difficultyLabels[route.difficulty_level]}
          </span>
          <Link href={`/walks/areas/${route.areas.slug}`} className="text-xs text-gray-500 hover:text-amber-600">
            {route.areas.name}
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{route.name}</h1>

        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span><strong>{distanceKm}</strong> km</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>約 <strong>{route.estimated_minutes}</strong> 分</span>
          </div>
          {route.elevation_gain_meters && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8" />
              </svg>
              <span>標高差 <strong>{route.elevation_gain_meters}</strong> m</span>
            </div>
          )}
          {route.total_walks > 0 && (
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span><strong>{route.total_walks}</strong> 人が歩いた</span>
            </div>
          )}
        </div>
      </header>

      {/* コース紹介 */}
      {route.description && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-3">このコースの体験</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{route.description}</p>
        </section>
      )}

      {/* ルートマップ */}
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">ルートマップ</h2>
        <RouteMapWrapper
          coordinates={coordinates}
          startLat={route.start_lat}
          startLng={route.start_lng}
          routeName={route.name}
        />
      </section>

      {/* スポット一覧 */}
      {spots.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">コースのみどころ</h2>
          <div className="space-y-0">
            {spots.map((spot, i) => (
              <div key={spot.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full ${spotTypeColors[spot.spot_type] ?? "bg-gray-400"} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                    {spot.spot_order}
                  </div>
                  {i < spots.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 min-h-[24px]" />}
                </div>
                <div className="pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">{spotTypeLabels[spot.spot_type] ?? spot.spot_type}</span>
                    {spot.distance_from_start != null && (
                      <span className="text-xs text-gray-300">{spot.distance_from_start}m</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800">{spot.name}</h3>
                  {spot.description && (
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{spot.description}</p>
                  )}
                  {spot.tips && <p className="text-xs text-amber-600 mt-1">{spot.tips}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 犬連れメモ */}
      {petInfo && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">犬連れメモ</h2>
          <div className="bg-amber-50 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {petInfo.parking && (
              <div><span className="font-semibold text-gray-700">駐車場:</span><span className="text-gray-600 ml-2">{petInfo.parking}</span></div>
            )}
            {petInfo.restroom && (
              <div><span className="font-semibold text-gray-700">トイレ:</span><span className="text-gray-600 ml-2">{petInfo.restroom}</span></div>
            )}
            {petInfo.water_station && (
              <div><span className="font-semibold text-gray-700">水飲み場:</span><span className="text-gray-600 ml-2">{petInfo.water_station}</span></div>
            )}
            {petInfo.surface && (
              <div><span className="font-semibold text-gray-700">路面:</span><span className="text-gray-600 ml-2">{petInfo.surface}</span></div>
            )}
            {petInfo.pet_facilities && (
              <div className="md:col-span-2"><span className="font-semibold text-gray-700">ペット施設:</span><span className="text-gray-600 ml-2">{petInfo.pet_facilities}</span></div>
            )}
            {petInfo.others && (
              <div className="md:col-span-2"><span className="font-semibold text-gray-700">その他:</span><span className="text-gray-600 ml-2">{petInfo.others}</span></div>
            )}
          </div>
        </section>
      )}

      {/* ギャラリー */}
      {route.gallery_images && route.gallery_images.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">みんなの写真</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {route.gallery_images.map((img, i) => (
              <div key={i} className="aspect-square relative rounded-xl overflow-hidden bg-gray-100">
                <Image src={img} alt={`${route.name} の写真 ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="mt-12">
        <WalksAppCTA />
      </div>

      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: route.name,
            description: route.description,
            touristType: "犬連れ",
            itinerary: {
              "@type": "ItemList",
              itemListElement: spots.map((spot, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: spot.name,
                description: spot.description,
              })),
            },
          }),
        }}
      />
    </article>
  );
}
