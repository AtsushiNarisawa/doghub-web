import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  title: "仙石原 犬 散歩ガイド｜愛犬と歩く箱根仙石原のおすすめコース｜DogHub箱根仙石原",
  description: "箱根仙石原で愛犬と散歩するならここ。すすき草原、湿生花園、仙石原自然探勝歩道など犬OKの散策コースを紹介。DogHub箱根仙石原スタッフおすすめのお散歩マップ。",
  alternates: { canonical: "/guide/sengokuhara" },
};

const courses = [
  {
    name: "すすき草原コース",
    time: "約30〜60分",
    distance: "約1.5km",
    level: "初心者向け",
    body: "仙石原を代表する絶景スポット。秋は一面の黄金色のすすきが広がります。遊歩道は比較的平坦で、小型犬でも歩きやすい。リード着用で散策OK。春〜夏は緑のすすきも美しい。DogHubから車で3分。",
    season: "通年（ベストシーズン：9月下旬〜11月上旬）",
  },
  {
    name: "箱根湿生花園コース",
    time: "約60〜90分",
    distance: "園内周遊約1.5km",
    level: "初心者向け",
    body: "日本各地の湿地帯の植物約1,700種を集めた植物園。木道を中心とした遊歩道で、犬連れで入園OK（リード着用）。四季折々の花が楽しめます。DogHubから車で2分。",
    season: "3月下旬〜11月下旬（冬季休園）",
  },
  {
    name: "仙石原自然探勝歩道コース",
    time: "約60〜120分",
    distance: "約3km",
    level: "中級者向け",
    body: "仙石原の自然を満喫できるトレッキングコース。木々に囲まれた森の中を歩く気持ちの良いコースです。一部階段や坂道があるため、足腰がしっかりしたわんちゃん向け。",
    season: "通年（冬季は凍結注意）",
  },
  {
    name: "DogHub周辺お散歩コース",
    time: "約20〜30分",
    distance: "約1km",
    level: "初心者向け",
    body: "DogHub周辺の住宅街〜田園エリアを歩くお手軽コース。交通量が少なく、のんびり歩けます。チェックイン前やお迎え後のちょっとしたお散歩に最適。",
    season: "通年",
  },
];

export default function SengokuharaGuidePage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"はじめてガイド",href:"/guide"},{name:"仙石原エリアガイド",href:"/guide/sengokuhara"}]} />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-051.png" alt="仙石原 犬 散歩ガイド" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 style={{ fontSize: "clamp(22px, 4.5vw, 40px)", fontWeight: 400 }}>
              仙石原 犬の散歩ガイド
            </h1>
            <p className="mt-3 opacity-80" style={{ fontSize: "clamp(14px, 2vw, 18px)" }}>
              愛犬と歩く仙石原のおすすめコース
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <Link href="/guide" className="hover:text-[#3C200F]">はじめてガイド</Link>
            <span className="mx-2"></span>
            <span>仙石原 お散歩ガイド</span>
          </p>
        </div>

        {/* Intro */}
        <section className="py-12 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              箱根仙石原は標高約650mに位置する高原エリア。すすき草原や湿生花園など、
              自然豊かな散歩コースが点在しています。比較的平坦な道が多く、
              小型犬から中型犬まで楽しめるのが魅力。DogHub箱根仙石原のスタッフがおすすめする
              お散歩コースをご紹介します。
            </p>
          </div>
        </section>

        {/* Courses */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>おすすめ散歩コース</h2>
            <div className="space-y-8">
              {courses.map((c) => (
                <div key={c.name} className="bg-white border border-[#E5DDD8] p-8">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="border border-[#B87942] text-[#B87942] px-3 py-0.5" style={{ fontSize: "13px" }}>{c.level}</span>
                    <span className="border border-[#3C200F] text-[#3C200F] px-3 py-0.5" style={{ fontSize: "13px" }}>{c.time}</span>
                    <span className="border border-[#3C200F] text-[#3C200F] px-3 py-0.5" style={{ fontSize: "13px" }}>{c.distance}</span>
                  </div>
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "22px", fontWeight: 400 }}>{c.name}</h3>
                  <p className="text-[#3C200F] mb-3" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>{c.body}</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>シーズン：{c.season}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>仙石原で犬の散歩をする際の注意点</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "リード必須", body: "すべてのコースでリード着用が必要です。伸縮リードは他の歩行者の迷惑になるため、1m程度の短いリードがおすすめ。" },
                { title: "水分補給", body: "標高が高いため空気が乾燥しています。愛犬用の水と携帯ボウルを持参してください。" },
                { title: "フンの持ち帰り", body: "自然を守るため、フンは必ず持ち帰りましょう。マナーポーチをお忘れなく。" },
                { title: "野生動物に注意", body: "シカやイノシシが出ることがあります。見かけたら静かに離れましょう。" },
                { title: "冬季の凍結", body: "冬場は路面が凍結することがあります。滑りにくい靴で、わんちゃんの肉球のケアもお忘れなく。" },
                { title: "日よけ・防寒", body: "夏は直射日光、冬は冷たい風に注意。季節に合わせた対策を。" },
              ].map((tip) => (
                <div key={tip.title} className="border border-[#E5DDD8] p-5">
                  <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "16px", fontWeight: 400 }}>{tip.title}</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{tip.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DogHub CTA */}
        <section className="py-16 px-6 bg-[#F7F7F7] border-t border-[#E5DDD8]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "24px", fontWeight: 400 }}>お散歩の前後に DogHub カフェへ</h2>
            <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              DogHub箱根仙石原にはOMUSUBI & SOUP CAFEを併設。<br />
              お散歩の後に、わんちゃんと一緒にひと休みできます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/cafe" className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-3 hover:bg-[#3C200F] hover:text-white transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>
                カフェ・グッズ販売 →
              </Link>
              <Link href="/spots" className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-3 hover:bg-[#3C200F] hover:text-white transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>
                おすすめスポット →
              </Link>
            </div>
          </div>
        </section>

        <Reservation />
        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
