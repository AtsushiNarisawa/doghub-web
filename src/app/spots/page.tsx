import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  title: "箱根 犬連れ観光ガイド｜犬と箱根を楽しむおすすめスポット｜DogHub",
  description: "犬と箱根を満喫！犬連れOKのスポットとペット不可施設での預け方をまとめて紹介。ポーラ美術館・ガラスの森・すすき草原など仙石原エリア中心に厳選。観光中のお預かりはDogHubへ。",
  alternates: { canonical: "/spots" },
};

const spots = [
  {
    name: "箱根ガラスの森美術館",
    category: "美術館",
    canBring: false,
    distance: "店舗から車で3分",
    address: "〒250-0631 神奈川県足柄下郡箱根町仙石原940-48",
    gmaps: "https://maps.google.com/?q=箱根ガラスの森美術館",
    hp: "https://www.hakone-garasunomori.jp/",
    body: "箱根仙石原に位置する日本初のヴェネチアン・グラス専門美術館。15-19世紀の美しいガラス作品を展示するほか、現代作家の斬新な作品も。緑豊かな庭園では、ガラスのオブジェや季節の花々を楽しめ、カフェテラスからは景色を眺められます。ガラス工房では吹きガラスや切子の体験も。ガラスの芸術と自然が調和した心地よい空間です。",
    img: "/images/img-054.png",
  },
  {
    name: "ポーラ美術館",
    category: "美術館",
    canBring: false,
    distance: "店舗から車で4分",
    address: "〒250-0631 神奈川県足柄下郡箱根町仙石原 小塚山1285",
    gmaps: "https://maps.google.com/?q=ポーラ美術館",
    hp: "https://www.polamuseum.or.jp/",
    body: "ポーラ美術館は、神奈川県箱根町の国立公園内に位置する美術館です。約1万点の西洋絵画コレクションを有し、印象派から現代アートまでの作品を展示しています。企画展や常設展を開催し、アートを気軽に体験できる空間を提供しています。緑豊かな自然に囲まれた美術館では、絵画鑑賞と共に、カフェテラスからの景色を楽しめます。",
    img: "/images/img-005.png",
  },
  {
    name: "彫刻の森美術館",
    category: "美術館",
    canBring: false,
    distance: "店舗から車で13分",
    address: "〒250-0493 神奈川県足柄下郡箱根町二ノ平1121",
    gmaps: "https://maps.google.com/?q=彫刻の森美術館",
    hp: "https://www.hakone-oam.or.jp/",
    body: "彫刻の森美術館は、自然と芸術の調和を目指して箱根に造られた国内初の野外美術館です。約7万平方メートルの広大な敷地には、ロダンをはじめとする近現代を代表する彫刻作品が120点以上常設展示されています。屋外展示のほか、緑陰ギャラリーやピカソ館など館内の展示も充実しており、自然の中でアートを楽しめます。",
    img: "/images/img-060.png",
  },
  {
    name: "仙石原 すすき草原",
    category: "散策スポット",
    canBring: true,
    distance: "店舗から車で3分",
    address: "〒250-0631 神奈川県足柄下郡箱根町仙石原",
    gmaps: "https://maps.google.com/?q=仙石原すすき草原",
    hp: "https://www.hakone.or.jp/",
    body: "仙石原のすすき草原は、「かながわの景勝50選」「かながわの花100選」に選ばれた箱根の代表的な観光スポットです。春は緑、秋は黄金色に輝く広大な草原が広がり、金時山などの外輪山と調和した風景を楽しめます。毎年多くの観光客が訪れ、箱根の秋を代表する景色として知られています。",
    img: "/images/img-051.png",
  },
  {
    name: "箱根強羅公園",
    category: "散策スポット",
    canBring: true,
    distance: "店舗から車で11分",
    address: "〒250-0408 神奈川県足柄下郡箱根町強羅1300",
    gmaps: "https://maps.google.com/?q=箱根強羅公園",
    hp: "https://www.gora-park.com/",
    body: "箱根強羅公園は、1914年に開園した日本最古のフランス式整型庭園です。四季折々の美しい植物が楽しめ、桜、つつじ、あじさい、紅葉など、様々な花が咲き誇ります。園内にはクラフトハウスや点茶体験、陶芸・吹きガラス体験などの施設もあり、ただ眺めるだけでなく、ものづくり体験も楽しめます。",
    img: "/images/img-025.png",
  },
  {
    name: "箱根湿生花園",
    category: "散策スポット",
    canBring: true,
    distance: "店舗から車で２分",
    address: "〒250-0631 神奈川県足柄下郡箱根町仙石原817",
    gmaps: "https://maps.google.com/?q=箱根湿生花園",
    hp: "https://www.hakone-shisseikaen.jp/",
    body: "箱根湿生花園は、日本各地の湿地帯に生育する約1,700種もの植物を集めた植物園です。園内には、低地から高山まで、様々な湿地帯の植物が観察できます。湿原、川、湖沼などの水湿地に生育する植物を中心に、草原や林、高山の植物も楽しめます。四季折々の表情を見せる園内は、自然観察や写真撮影に最適で、箱根の自然を存分に堪能できます。",
    img: "/images/img-065.png",
  },
  {
    name: "箱根ラリック美術館",
    category: "美術館",
    canBring: false,
    distance: "店舗から車で2分",
    address: "〒250-0631 神奈川県足柄下郡箱根町仙石原186-1",
    gmaps: "https://maps.google.com/?q=箱根ラリック美術館",
    hp: "https://www.lalique-museum.com/",
    body: "箱根ラリック美術館は、フランスの宝飾・ガラス工芸の巨匠ルネ・ラリックの作品を展示する美術館です。アール・ヌーヴォーやアール・デコ時代の美麗なガラス作品や、大胆さと繊細さを兼ね備えたジュエリーなど、約1,500点の作品から230点を贅沢に展示しています。自然豊かな箱根の地に佇む美術館では、ラリックの芸術世界を心ゆくまで堪能できます。",
    img: "/images/img-075.jpg",
  },
];

export default function SpotsPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"おすすめスポット",href:"/spots"}]} />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-006.jpg" alt="おすすめスポット" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(140px, 18vw, 249px)" }} />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400 }}>おすすめスポット</h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>おすすめスポット</span>
          </p>
        </div>

        {/* Intro */}
        <section className="py-10 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-3" style={{ fontSize: "28px", fontWeight: 400 }}>DogHubおすすめ周辺観光施設</h2>
            {/* Category tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {["散策スポット", "美術館", "愛犬と一緒", "愛犬をお預り"].map((tag) => (
                <span key={tag} className="border border-[#3C200F] text-[#3C200F] px-4 py-1 text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Spots list */}
        <section className="pb-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto space-y-12">
            {spots.map((spot) => (
              <div key={spot.name} className="border-t border-[#E5DDD8] pt-10">
                <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-6 md:gap-8">
                  <div className="flex-shrink-0">
                    <Image src={spot.img} alt="" className="w-full h-auto object-cover" width={700} height={400} />
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="border border-[#311908] text-[#311908] px-3 py-0.5" style={{ fontSize: "13px" }}>{spot.category}</span>
                      <span className={`px-3 py-0.5 border ${spot.canBring ? "border-[#311908] text-[#311908]" : "border-[#311908] text-[#311908]"}`} style={{ fontSize: "13px" }}>
                        {spot.canBring ? "愛犬と一緒" : "愛犬をお預り"}
                      </span>
                    </div>
                    <h3 className="text-[#311908] mb-2" style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 400 }}>{spot.name}</h3>
                    <p className="text-[#3C200F] mb-3" style={{ fontSize: "clamp(14px, 3vw, 18px)", fontWeight: 400 }}>{spot.address}</p>
                    <div className="flex gap-4 mb-4">
                      <a href={spot.gmaps} data-directions="spots" target="_blank" rel="noopener noreferrer" className="text-sm text-[#3C200F] border-b border-[#3C200F] hover:text-[#B87942] hover:border-[#B87942] py-2">
                        Google maps
                      </a>
                      <a href={spot.hp} className="text-sm text-[#3C200F] border-b border-[#3C200F] hover:text-[#B87942] hover:border-[#B87942] py-2">
                        ホームページ
                      </a>
                    </div>
                    <p className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>{spot.distance}</p>
                    <p className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "1.9" }}>{spot.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto text-center">
            <Link href="/hakone" className="text-[#B87942] hover:underline" style={{ fontSize: "15px" }}>
              箱根 犬連れ旅行ガイド トップへ →
            </Link>
          </div>
        </section>

        {/* 関連記事 */}
        <section className="px-6 py-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="p-6 bg-[#F8F5F0] rounded-xl">
              <p className="text-[#3C200F] font-medium mb-2" style={{ fontSize: "16px" }}>あわせて読みたい</p>
              <div className="space-y-2">
                <Link href="/news/hakone-dog-trip-guide" className="block text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>
                  → 箱根 犬連れ旅行ガイド｜地元スタッフおすすめの1泊2日プラン
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ペット不可スポットの解決策 */}
        <section className="px-6 py-12 bg-[#F8F5F0] border-t border-[#E5DDD8]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[#3C200F] mb-3" style={{ fontSize: "20px", fontWeight: 400 }}>ペット不可のスポットに行きたい時は</h2>
            <p className="text-[#8F7B65] mb-6" style={{ fontSize: "14px" }}>
              箱根のメインスポットの多くは犬NG。でも諦める必要はありません。DogHubに預けて、自由に箱根を楽しめます。
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { href: "/museum", label: "美術館 × 預かり", desc: "ポーラ・彫刻の森へ" },
                { href: "/yunessun", label: "ユネッサン × 預かり", desc: "温泉プールを満喫" },
                { href: "/onsen", label: "温泉 × 預かり", desc: "日帰り温泉を堪能" },
                { href: "/golf", label: "ゴルフ × 預かり", desc: "早朝7時から対応" },
                { href: "/ryokan", label: "旅館 × 預かり", desc: "憧れの宿に泊まる" },
                { href: "/service", label: "料金・プラン一覧", desc: "半日¥3,300〜" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="block bg-white border border-[#E5DDD8] hover:border-[#B87942] transition-colors p-4">
                  <p className="text-[#3C200F]" style={{ fontSize: "14px", fontWeight: 500 }}>{item.label}</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "12px", marginTop: "2px" }}>{item.desc}</p>
                </Link>
              ))}
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
