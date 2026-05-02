import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  title: "箱根美術館 × ペット預かり｜美術館めぐりの間に愛犬をお預け｜DogHub箱根仙石原",
  description: "箱根の美術館はペット入館不可。DogHub箱根仙石原はポーラ美術館から車4分、ガラスの森から車3分。半日4時間¥3,300。美術館めぐりの間に愛犬を安心してお預けください。",
  alternates: { canonical: "/museum" },
};

const museums = [
  {
    name: "箱根ラリック美術館",
    distance: "車で約2分",
    area: "仙石原",
    note: "",
  },
  {
    name: "箱根ガラスの森美術館",
    distance: "車で約3分",
    area: "仙石原",
    note: "",
  },
  {
    name: "ポーラ美術館",
    distance: "車で約4分",
    area: "仙石原",
    note: "",
  },
  {
    name: "箱根湿生花園",
    distance: "車で約5分",
    area: "仙石原",
    note: "",
  },
  {
    name: "箱根美術館",
    distance: "車で約10分",
    area: "強羅",
    note: "",
  },
  {
    name: "箱根写真美術館",
    distance: "車で約10分",
    area: "強羅",
    note: "",
  },
  {
    name: "彫刻の森美術館",
    distance: "車で約13分",
    area: "強羅",
    note: "",
  },
  {
    name: "岡田美術館",
    distance: "車で約15分",
    area: "小涌谷",
    note: "",
  },
  {
    name: "成川美術館",
    distance: "車で約20分",
    area: "元箱根",
    note: "わんちゃん同伴可",
  },
  {
    name: "箱根関所・箱根関所資料館",
    distance: "車で約20分",
    area: "箱根町",
    note: "",
  },
];

export default function MuseumPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"箱根美術館 × ペットホテル",href:"/museum"}]} />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-055.jpg" alt="箱根美術館 × ペット預かり" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(22px, 4.5vw, 40px)", fontWeight: 400 }}>
              美術館めぐりの間、愛犬をお預け
            </h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>美術館 × ペット預かり</span>
          </p>
        </div>

        {/* Main content */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>MUSEUM × DOG HOTEL</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  仙石原の美術館は<br />DogHubから車で2〜4分
                </h3>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  箱根仙石原は美術館の宝庫。ポーラ美術館、箱根ガラスの森美術館、
                  箱根ラリック美術館が集まるエリアですが、ほとんどの美術館はペット入館不可です。
                  唯一、成川美術館はわんちゃん同伴で入館できます。
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  DogHub箱根仙石原はこれらの美術館から車でわずか2〜4分。
                  愛犬をお預けして美術館を楽しんだ後、すぐにお迎えに来られます。
                  スポット利用（1時間 ¥1,100）から対応しているので、
                  「美術館1つだけ見たい」という短時間のご利用にも最適です。
                </p>

                <div className="bg-[#F7F7F7] p-8 mb-8">
                  <h4 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>おすすめプラン</h4>
                  <div className="space-y-4 text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                    <div className="pb-3 border-b border-[#E5DDD8]">
                      <p className="text-[#B87942]" style={{ fontSize: "14px" }}>スポット利用（1時間〜）</p>
                      <p style={{ fontSize: "24px" }}>¥1,100〜</p>
                      <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>美術館1つだけなら2〜3時間でOK</p>
                    </div>
                    <div>
                      <p className="text-[#B87942]" style={{ fontSize: "14px" }}>半日お預かり（4時間）</p>
                      <p style={{ fontSize: "24px" }}>¥3,300</p>
                      <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>2つの美術館をゆっくり巡るなら半日プラン</p>
                    </div>
                  </div>
                  <p className="text-[#8F7B65] mt-3" style={{ fontSize: "13px" }}>※表示料金はすべて税込です。</p>
                </div>

                <a
                  href="/booking"
                  className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-10 py-4 hover:opacity-90 transition-opacity"
                  style={{ fontSize: "18px", fontWeight: 400 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  ご予約はこちら
                </a>
              </div>

              <div>
                <Image src="/images/img-027.png" alt="DogHub箱根仙石原からの周辺マップ" className="w-full h-auto" width={600} height={400} />
              </div>
            </div>
          </div>
        </section>

        {/* Nearby museums */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>DogHub周辺の美術館・施設</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {museums.map((m) => (
                <div key={m.name} className="border border-[#E5DDD8] p-6 bg-white">
                  <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "16px", fontWeight: 400 }}>{m.name}</h3>
                  <p className="text-[#B87942]" style={{ fontSize: "14px", fontWeight: 400 }}>{m.distance}</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>{m.area}エリア</p>
                  {m.note && <p className="text-[#2A7B4F] mt-2" style={{ fontSize: "13px", fontWeight: 400 }}>{m.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Model case */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>美術館 × DogHubのモデルケース</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border border-[#E5DDD8] p-8">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>サクッと美術館1つプラン</h3>
                <p className="text-[#B87942] mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>スポット利用 ¥2,200（2時間）</p>
                <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                  <p>10:00 DogHubにお預け</p>
                  <p>10:05 ポーラ美術館到着（車4分）</p>
                  <p>11:50 鑑賞終了</p>
                  <p>12:00 DogHubでお迎え</p>
                  <p>12:15 愛犬と仙石原ランチ</p>
                </div>
              </div>
              <div className="border border-[#E5DDD8] p-8">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>美術館はしごプラン</h3>
                <p className="text-[#B87942] mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>半日お預かり（4時間）¥3,300</p>
                <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                  <p>9:00 DogHubにお預け</p>
                  <p>9:05 箱根ラリック美術館（車2分）</p>
                  <p>11:00 箱根ガラスの森美術館（車3分）</p>
                  <p>13:00 DogHubでお迎え</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other scenes */}
        <section className="py-16 px-6 bg-[#F7F7F7] border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>箱根でこんな過ごし方も</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/onsen" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>温泉 × ペット預かり</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>日帰り温泉を満喫</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/yunessun" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>ユネッサン × ペット預かり</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>車で約15分。半日¥3,300〜</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/golf" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>ゴルフ × ペットホテル</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>早朝7時からお預かり</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/pethotel" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>ペット可ホテル × 日中預かり</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>チェックイン前後の観光に</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
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

        <section className="px-6 py-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto text-center">
            <Link href="/hakone" className="text-[#B87942] hover:underline" style={{ fontSize: "15px" }}>
              箱根 犬連れ旅行ガイド トップへ →
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
