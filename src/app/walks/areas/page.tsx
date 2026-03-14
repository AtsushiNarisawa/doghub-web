import Link from "next/link";
import type { Metadata } from "next";
import { getAreasWithRouteCount } from "@/lib/walks/data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "エリア一覧 - 犬と歩ける散歩コース | DogHub",
  description:
    "箱根・鎌倉・湘南・横浜など、愛犬と一緒に楽しめる散歩コースのあるエリア一覧。犬連れに必要な情報つきで紹介。",
};

export default async function AreasPage() {
  const areas = await getAreasWithRouteCount();

  const byPrefecture = areas.reduce<Record<string, (typeof areas)[number][]>>(
    (acc, area) => {
      const pref = area.prefecture;
      if (!acc[pref]) acc[pref] = [];
      acc[pref].push(area);
      return acc;
    },
    {}
  );

  const prefOrder = ["神奈川県", "東京都"];
  const sortedPrefs = [
    ...prefOrder.filter((p) => byPrefecture[p]),
    ...Object.keys(byPrefecture)
      .filter((p) => !prefOrder.includes(p))
      .sort(),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* パンくず */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-amber-600">トップ</Link>
        <span className="mx-2">/</span>
        <Link href="/walks" className="hover:text-amber-600">散歩コース</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">エリア一覧</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">エリア一覧</h1>
      <p className="text-gray-500 mb-10">
        愛犬と歩ける散歩コースのあるエリアを都道府県別にご紹介
      </p>

      {sortedPrefs.map((pref) => (
        <section key={pref} className="mb-10">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-100">{pref}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {byPrefecture[pref].map((area) => (
              <Link
                key={area.id}
                href={`/walks/areas/${area.slug}`}
                className="group block p-5 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all"
              >
                <h3 className="font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">
                  {area.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{area.route_count}コース</p>
                {area.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{area.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
