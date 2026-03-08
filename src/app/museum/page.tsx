import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "箱根美術館 × ペット預かり｜美術館めぐりの間に愛犬をお預け｜DogHub箱根仙石原",
  description: "箱根の美術館はペット入館不可。DogHub箱根仙石原はポーラ美術館から車4分、ガラスの森から車3分。半日4時間¥3,300。美術館めぐりの間に愛犬を安心してお預けください。",
};

const museums = [
  {
    name: "箱根ラリック美術館",
    distance: "車で2分",
    body: "フランスの宝飾・ガラス工芸の巨匠ルネ・ラリックの作品を展示。",
    img: "/images/img-075.jpg",
  },
  {
    name: "箱根ガラスの森美術館",
    distance: "車で3分",
    body: "日本初のヴェネチアン・グラス専門美術館。庭園のガラスオブジェも必見。",
    img: "/images/img-054.png",
  },
  {
    name: "ポーラ美術館",
    distance: "車で4分",
    body: "印象派から現代アートまで約1万点。森の遊歩道も楽しめる。",
    img: "/images/img-005.png",
  },
  {
    name: "彫刻の森美術館",
    distance: "車で13分",
    body: "国内初の野外美術館。7万平方メートルに120点以上の彫刻作品。",
    img: "/images/img-060.png",
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
          <img
            src="/images/img-006.jpg"
            alt="箱根美術館 × ペット預かり"
            className="w-full object-cover"
            style={{ height: "clamp(180px, 30vw, 424px)" }}
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
            <p className="text-sm mb-2 opacity-80">/ 美術館 × ペット預かり</p>
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
                  箱根ラリック美術館が集まるエリアですが、いずれもペット入館はできません。
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
                      <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>2〜3つの美術館をゆっくり巡るなら半日プラン</p>
                    </div>
                  </div>
                  <p className="text-[#8F7B65] mt-3" style={{ fontSize: "13px" }}>※表示料金はすべて税込です。</p>
                </div>

                <a
                  href="https://airrsv.net/doghubhakone/calendar" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-10 py-4 hover:opacity-90 transition-opacity"
                  style={{ fontSize: "18px", fontWeight: 400 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  ご予約はこちら
                </a>
              </div>

              <div>
                <img
                  src="/images/img-027.png"
                  alt="DogHub箱根仙石原からの周辺マップ"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Nearby museums */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>DogHub周辺の美術館</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {museums.map((m) => (
                <div key={m.name} className="bg-white border border-[#E5DDD8]">
                  <img src={m.img} alt={m.name} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "18px", fontWeight: 400 }}>{m.name}</h3>
                    <p className="text-[#B87942] mb-3" style={{ fontSize: "14px", fontWeight: 400 }}>DogHubから{m.distance}</p>
                    <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{m.body}</p>
                  </div>
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
                  <p>11:30 鑑賞終了・カフェでひと息</p>
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
                  <p>10:30 箱根ガラスの森美術館（車3分）</p>
                  <p>12:00 ポーラ美術館（車4分）</p>
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
            <div className="grid md:grid-cols-3 gap-6">
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
