import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "箱根 犬連れ観光おすすめスポット｜DogHub箱根仙石原",
  description: "DogHub箱根仙石原おすすめの周辺観光スポット。箱根ガラスの森、ポーラ美術館、仙石原すすき草原など、愛犬と一緒に楽しめるスポットをご紹介。",
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
      <main className="pt-[80px]">
        {/* Hero */}
        <div className="relative">
          <img
            src="/images/img-006.jpg"
            alt="おすすめスポット"
            className="w-full object-cover"
            style={{ height: "clamp(140px, 18vw, 249px)" }}
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <p className="text-sm mb-2 opacity-80">/ おすすめスポット</p>
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
                <div className="grid md:grid-cols-[340px_1fr] gap-8">
                  <div className="flex-shrink-0">
                    <img src={spot.img} alt={spot.name} className="w-full h-auto object-cover" />
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="border border-[#311908] text-[#311908] px-3 py-0.5" style={{ fontSize: "13px" }}>{spot.category}</span>
                      <span className={`px-3 py-0.5 border ${spot.canBring ? "border-[#311908] text-[#311908]" : "border-[#311908] text-[#311908]"}`} style={{ fontSize: "13px" }}>
                        {spot.canBring ? "愛犬と一緒" : "愛犬をお預り"}
                      </span>
                    </div>
                    <h3 className="text-[#311908] mb-2" style={{ fontSize: "24px", fontWeight: 400 }}>{spot.name}</h3>
                    <p className="text-[#3C200F] mb-3" style={{ fontSize: "18px", fontWeight: 400 }}>{spot.address}</p>
                    <div className="flex gap-4 mb-4">
                      <a href={spot.gmaps} target="_blank" rel="noopener noreferrer" className="text-sm text-[#3C200F] border-b border-[#3C200F] hover:text-[#B87942] hover:border-[#B87942]">
                        Google maps
                      </a>
                      <a href={spot.hp} target="_blank" rel="noopener noreferrer" className="text-sm text-[#3C200F] border-b border-[#3C200F] hover:text-[#B87942] hover:border-[#B87942]">
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

        {/* Reservation */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <a
              href="https://airrsv.net/doghubhakone/calendar" target="_blank" rel="noopener noreferrer"
              className="block w-full border border-[#3C200F] py-10 text-center hover:bg-[#F7F7F7] transition-colors"
            >
              <p className="text-[#3C200F] mb-2 flex items-center justify-center gap-3" style={{ fontSize: "clamp(24px,4vw,38.4px)", fontWeight: 400, letterSpacing: "2.7px" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> RESERVATION</p>
              <p className="text-[#8F7B65]" style={{ fontSize: "clamp(14px,2vw,20px)", fontWeight: 400 }}>DogHub箱根仙石原ご予約はこちら</p>
            </a>
          </div>
        </section>

        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
