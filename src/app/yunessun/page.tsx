import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "ユネッサン × ペット預かり｜箱根小涌園の間に愛犬をお預け｜DogHub箱根仙石原",
  description: "箱根小涌園ユネッサンはペット同伴不可。DogHub箱根仙石原なら車で約15分。半日4時間¥3,300でユネッサンを満喫。24時間スタッフ常駐・完全個室・ドッグラン併設のペットホテル。",
  alternates: { canonical: "/yunessun" },
};

export default function YunessunPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"ユネッサン × ペットホテル",href:"/yunessun"}]} />
        {/* Hero */}
        <div className="relative">
          <img
            src="/images/img-050.jpg"
            alt="ユネッサン × ペット預かり"
            className="w-full object-cover"
            style={{ height: "clamp(180px, 30vw, 424px)" }}
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(22px, 4.5vw, 40px)", fontWeight: 400 }}>
              ユネッサンを楽しむ間、愛犬をお預け
            </h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>ユネッサン × ペット預かり</span>
          </p>
        </div>

        {/* Main content */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>YUNESSUN × DOG HOTEL</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  ユネッサンはペット同伴不可。<br />DogHubから車で約15分
                </h3>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  箱根小涌園ユネッサンは家族旅行やカップルに大人気の温泉テーマパーク。
                  でもペット同伴はできません。「愛犬がいるから行けない」と諦めていませんか？
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  DogHub箱根仙石原はユネッサンから車で約15分。
                  ユネッサンの温泉プールだけなら半日プラン（4時間 ¥3,300）、
                  隣接する森の湯もセットで楽しむなら1日プラン（8時間 ¥5,500）がおすすめ。
                  ほとんどのお客様がユネッサンと森の湯をセットで楽しまれています。
                </p>

                <div className="bg-[#F7F7F7] p-8 mb-8">
                  <h4 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>おすすめプラン</h4>
                  <div className="space-y-4 text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                    <div className="pb-3 border-b border-[#E5DDD8]">
                      <p className="text-[#B87942]" style={{ fontSize: "14px" }}>半日お預かり（4時間）</p>
                      <p style={{ fontSize: "24px" }}>¥3,300</p>
                      <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>ユネッサンの温泉プールだけなら半日プラン</p>
                    </div>
                    <div>
                      <p className="text-[#B87942]" style={{ fontSize: "14px" }}>1日お預かり（8時間）</p>
                      <p style={{ fontSize: "24px" }}>¥5,500</p>
                      <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>ユネッサン + 森の湯をセットで楽しむなら1日プラン</p>
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
                <img
                  src="/images/img-027.png"
                  alt="DogHub箱根仙石原からの周辺マップ"
                  className="w-full h-auto"
                />
                <img
                  src="/images/img-022.jpg"
                  alt="DogHub箱根仙石原 ドッグラン"
                  className="w-full h-auto mt-4"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Model case */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>ユネッサン × DogHubのモデルケース</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-[#E5DDD8] p-8">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>ユネッサン温泉プールプラン</h3>
                <p className="text-[#B87942] mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>半日お預かり（4時間）¥3,300</p>
                <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                  <p>9:00 DogHubにお預け</p>
                  <p>9:20 ユネッサン到着（車で約15分）</p>
                  <p>9:30 ユネッサン入場・温泉プールを満喫</p>
                  <p>12:30 ユネッサン退場・ランチ</p>
                  <p>13:00 DogHubでお迎え</p>
                  <p>13:30 愛犬とすすき草原を散策</p>
                </div>
              </div>
              <div className="bg-white border border-[#E5DDD8] p-8">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>ユネッサン + 森の湯セットプラン</h3>
                <p className="text-[#B87942] mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>1日お預かり（8時間）¥5,500</p>
                <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                  <p>9:00 DogHubにお預け</p>
                  <p>9:20 ユネッサン到着・温泉プールで遊ぶ</p>
                  <p>12:30 ランチ</p>
                  <p>13:30 森の湯でゆっくり温泉</p>
                  <p>16:00 DogHubでお迎え</p>
                  <p>16:30 愛犬とカフェでおやつ</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why DogHub */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>DogHubが選ばれる理由</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { title: "ユネッサンから車15分", body: "箱根仙石原に位置するDogHubは、ユネッサンから車で約15分。お預け・お迎えがスムーズです。" },
                { title: "半日¥3,300から", body: "ユネッサンだけなら半日プラン（4時間 ¥3,300）で十分。スポット利用なら1時間¥1,100から。" },
                { title: "完全個室＆ドッグラン", body: "ケージではなく完全個室。専用ドッグランで遊べるので、わんちゃんもストレスフリーです。" },
              ].map((item) => (
                <div key={item.title} className="bg-[#F7F7F7] p-6">
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "18px", fontWeight: 400 }}>{item.title}</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{item.body}</p>
                </div>
              ))}
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
              <Link href="/museum" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>美術館 × ペット預かり</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>仙石原の美術館めぐり</p>
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

        <Reservation />
        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
