import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "箱根 犬連れ 完全ガイド｜愛犬と楽しむ箱根旅行の過ごし方｜DogHub箱根仙石原",
  description: "箱根に犬連れで旅行する方のための完全ガイド。犬と一緒に行ける観光スポット、ペット不可施設での過ごし方、犬連れにおすすめのエリア、持ち物チェックリストまで。DogHub箱根仙石原が解説。",
  alternates: { canonical: "/guide/hakone-dog" },
};

const dogFriendlySpots = [
  { name: "仙石原すすき草原", area: "仙石原", note: "リード着用で散策OK。秋は黄金色のすすきが絶景。" },
  { name: "箱根湿生花園", area: "仙石原", note: "リード着用で入園OK。四季折々の植物を楽しめる。" },
  { name: "箱根強羅公園", area: "強羅", note: "リード着用で入園OK。フランス式庭園を散策。" },
  { name: "芦ノ湖畔遊歩道", area: "元箱根", note: "湖畔の散歩道をリードで散策。景色が美しい。" },
  { name: "箱根旧街道", area: "箱根町", note: "石畳の旧街道を愛犬と歴史散歩。" },
];

const petNGSpots = [
  { name: "箱根小涌園ユネッサン", type: "温泉施設", solution: "DogHub半日お預かり（車15分）" },
  { name: "ポーラ美術館", type: "美術館", solution: "DogHubスポット利用（車4分）" },
  { name: "箱根ガラスの森美術館", type: "美術館", solution: "DogHubスポット利用（車3分）" },
  { name: "彫刻の森美術館", type: "美術館", solution: "DogHub半日お預かり（車13分）" },
  { name: "箱根ロープウェイ", type: "交通", solution: "DogHub1日お預かり" },
  { name: "箱根海賊船", type: "観光", solution: "DogHub1日お預かり" },
  { name: "大涌谷", type: "観光", solution: "DogHub1日お預かり（有毒ガスのため犬NG）" },
];

const checklist = [
  { category: "必須", items: ["リード・首輪（予備も推奨）", "ワクチン証明書（1年以内）", "狂犬病予防接種証明書", "普段のフード・おやつ", "水・携帯用水皿", "マナーポーチ（うんち袋）", "ペットシーツ"] },
  { category: "あると便利", items: ["キャリーバッグ・クレート", "ブランケット・タオル", "お気に入りのおもちゃ", "レインコート（雨天時）", "迷子札・マイクロチップ情報", "カフェマット", "虫よけスプレー（夏季）"] },
];

export default function HakoneDogGuidePage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"はじめてガイド",href:"/guide"},{name:"箱根犬連れガイド",href:"/guide/hakone-dog"}]} />
        {/* Hero */}
        <div className="relative">
          <img
            src="/images/img-006.jpg"
            alt="箱根 犬連れ 完全ガイド"
            className="w-full object-cover"
            style={{ height: "clamp(180px, 30vw, 424px)" }}
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 style={{ fontSize: "clamp(22px, 4.5vw, 40px)", fontWeight: 400 }}>
              箱根 犬連れ 完全ガイド
            </h1>
            <p className="mt-3 opacity-80" style={{ fontSize: "clamp(14px, 2vw, 18px)" }}>
              愛犬と楽しむ箱根旅行の過ごし方
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
            <span>箱根 犬連れガイド</span>
          </p>
        </div>

        {/* TOC */}
        <nav className="bg-white border-b border-[#E5DDD8] sticky top-[80px] z-40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex overflow-x-auto gap-0">
              {[
                { label: "犬OKスポット", id: "dog-friendly" },
                { label: "ペット不可施設", id: "pet-ng" },
                { label: "エリアガイド", id: "area" },
                { label: "持ち物", id: "checklist" },
                { label: "注意事項", id: "tips" },
              ].map((tab) => (
                <a key={tab.id} href={`#${tab.id}`} className="flex-shrink-0 px-4 py-4 text-[#3C200F] border-b-2 border-transparent hover:border-[#B87942] whitespace-nowrap" style={{ fontSize: "16px", fontWeight: 400 }}>
                  {tab.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* Intro */}
        <section className="py-12 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              箱根は犬連れ旅行にぴったりの観光地。自然豊かな散策スポットがたくさんあり、
              愛犬と一緒に楽しめる場所が多いのが魅力です。一方で、美術館や温泉施設など
              ペット不可の施設も多いのが現実。このガイドでは、犬連れで箱根を最大限に楽しむための
              情報をまとめました。
            </p>
          </div>
        </section>

        {/* Dog-friendly spots */}
        <section id="dog-friendly" className="py-16 px-6 bg-[#F7F7F7] scroll-mt-[140px]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>犬と一緒に行けるスポット</h2>
            <div className="space-y-4">
              {dogFriendlySpots.map((spot) => (
                <div key={spot.name} className="bg-white border border-[#E5DDD8] p-6 flex gap-4 items-start">
                  <span className="text-[#B87942] flex-shrink-0 mt-1" style={{ fontSize: "14px" }}>OK</span>
                  <div>
                    <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "18px", fontWeight: 400 }}>{spot.name}</h3>
                    <p className="text-[#B87942] mb-1" style={{ fontSize: "13px", fontWeight: 400 }}>{spot.area}エリア</p>
                    <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{spot.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pet NG spots + solution */}
        <section id="pet-ng" className="py-16 px-6 bg-white scroll-mt-[140px]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "26px", fontWeight: 400 }}>ペット不可の施設と解決策</h2>
            <p className="text-[#8F7B65] mb-8" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.8" }}>
              以下の施設はペット同伴ができません。DogHub箱根仙石原にお預けいただければ、
              安心してお楽しみいただけます。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#3C200F] text-white">
                    <th className="px-4 py-3 text-left" style={{ fontSize: "14px", fontWeight: 400 }}>施設名</th>
                    <th className="px-4 py-3 text-left" style={{ fontSize: "14px", fontWeight: 400 }}>種別</th>
                    <th className="px-4 py-3 text-left" style={{ fontSize: "14px", fontWeight: 400 }}>DogHubプラン</th>
                  </tr>
                </thead>
                <tbody>
                  {petNGSpots.map((spot, i) => (
                    <tr key={spot.name} className={i % 2 === 0 ? "bg-white" : "bg-[#F7F7F7]"}>
                      <td className="px-4 py-3 border-b border-[#E5DDD8] text-[#3C200F]" style={{ fontSize: "14px" }}>{spot.name}</td>
                      <td className="px-4 py-3 border-b border-[#E5DDD8] text-[#8F7B65]" style={{ fontSize: "14px" }}>{spot.type}</td>
                      <td className="px-4 py-3 border-b border-[#E5DDD8] text-[#B87942]" style={{ fontSize: "14px" }}>{spot.solution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <a
                href="/booking"
                className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-8 py-3 hover:opacity-90 transition-opacity"
                style={{ fontSize: "16px", fontWeight: 400 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                DogHubを予約する
              </a>
            </div>
          </div>
        </section>

        {/* Area guide */}
        <section id="area" className="py-16 px-6 bg-[#F7F7F7] scroll-mt-[140px]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>犬連れにおすすめのエリア</h2>
            <div className="space-y-8">
              {[
                {
                  area: "仙石原エリア（DogHub周辺）",
                  desc: "DogHub箱根仙石原があるエリア。すすき草原、湿生花園、美術館が集まる文化エリア。自然豊かで犬の散歩に最適。比較的平坦な道が多く、犬連れでも歩きやすい。",
                  spots: "すすき草原・湿生花園・ラリック美術館・ガラスの森美術館・ポーラ美術館",
                },
                {
                  area: "強羅エリア",
                  desc: "箱根登山鉄道の終点。強羅公園は犬OK。急な坂道が多いので、体力のあるわんちゃん向き。温泉旅館が多く、DogHubに預けて宿泊するのにも便利。",
                  spots: "強羅公園・彫刻の森美術館（犬NG→DogHubへ）",
                },
                {
                  area: "芦ノ湖エリア",
                  desc: "芦ノ湖畔の遊歩道は犬連れ散歩に人気。箱根神社の参道も散策できる。海賊船はペット不可なので、DogHubに預けてから。",
                  spots: "芦ノ湖畔遊歩道・箱根神社参道・箱根関所跡",
                },
                {
                  area: "箱根湯本エリア",
                  desc: "箱根の玄関口。商店街を犬と散策できるが、混雑時は注意。日帰り温泉施設が多く、DogHubに預けて温泉を楽しむプランに最適。",
                  spots: "箱根湯本商店街・早川沿い散歩",
                },
              ].map((a) => (
                <div key={a.area} className="bg-white border border-[#E5DDD8] p-8">
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "20px", fontWeight: 400 }}>{a.area}</h3>
                  <p className="text-[#3C200F] mb-3" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>{a.desc}</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>主なスポット：{a.spots}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section id="checklist" className="py-16 px-6 bg-white scroll-mt-[140px]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>犬連れ箱根旅行 持ち物チェックリスト</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {checklist.map((cat) => (
                <div key={cat.category} className="border border-[#E5DDD8] p-6">
                  <h3 className="text-[#3C200F] mb-4 pb-2 border-b border-[#E5DDD8]" style={{ fontSize: "20px", fontWeight: 400 }}>{cat.category}</h3>
                  <ul className="space-y-2">
                    {cat.items.map((item) => (
                      <li key={item} className="flex gap-2 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400 }}>
                        <span className="text-[#B87942] flex-shrink-0">&#9744;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips */}
        <section id="tips" className="py-16 px-6 bg-[#F7F7F7] scroll-mt-[140px]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>犬連れ箱根旅行の注意事項</h2>
            <div className="space-y-4">
              {[
                { title: "リードは必ず着用", body: "箱根は自然が豊かな分、野生動物もいます。安全のため、散歩中は必ずリードを着用してください。" },
                { title: "車移動が基本", body: "箱根は公共交通機関でのペット移動に制限があります。自家用車やレンタカーでの移動が便利です。" },
                { title: "夏は暑さ対策を", body: "箱根は標高が高いため涼しいですが、夏場はアスファルトの照り返しに注意。早朝や夕方の散歩がおすすめです。" },
                { title: "冬は防寒対策を", body: "仙石原は箱根でも標高が高いエリア。冬は氷点下になることも。小型犬は特に防寒対策を。" },
                { title: "温泉の湯気に注意", body: "大涌谷周辺は有毒ガス（硫化水素）が発生するため、犬の立ち入りは禁止されています。" },
                { title: "マナーを守って", body: "フンの持ち帰り、リード着用、吠え声への配慮など、基本的なマナーを守って楽しい旅行を。" },
              ].map((tip) => (
                <div key={tip.title} className="bg-white border border-[#E5DDD8] p-6">
                  <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>{tip.title}</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{tip.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DogHub CTA */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "24px", fontWeight: 400 }}>ペット不可施設も諦めない</h2>
            <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              DogHub箱根仙石原なら、愛犬を安心してお預けいただき、<br />
              温泉もユネッサンも美術館もゴルフも楽しめます。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/yunessun" className="border border-[#3C200F] text-[#3C200F] px-6 py-3 hover:bg-[#3C200F] hover:text-white transition-colors" style={{ fontSize: "14px" }}>ユネッサン × ペット預かり</Link>
              <Link href="/onsen" className="border border-[#3C200F] text-[#3C200F] px-6 py-3 hover:bg-[#3C200F] hover:text-white transition-colors" style={{ fontSize: "14px" }}>温泉 × ペット預かり</Link>
              <Link href="/museum" className="border border-[#3C200F] text-[#3C200F] px-6 py-3 hover:bg-[#3C200F] hover:text-white transition-colors" style={{ fontSize: "14px" }}>美術館 × ペット預かり</Link>
              <Link href="/golf" className="border border-[#3C200F] text-[#3C200F] px-6 py-3 hover:bg-[#3C200F] hover:text-white transition-colors" style={{ fontSize: "14px" }}>ゴルフ × ペットホテル</Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#3C200F] py-10 px-6">
          <div className="max-w-7xl mx-auto text-center text-white">
            <p className="mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>はじめてご利用の方はご予約前に必ずこちらをご覧ください</p>
            <Link href="/guide" className="inline-flex items-center gap-2 border border-white text-white px-8 py-3 hover:bg-white hover:text-[#3C200F] transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>
              ご利用ガイド・注意事項はこちら →
            </Link>
          </div>
        </section>

        <Reservation />
        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
