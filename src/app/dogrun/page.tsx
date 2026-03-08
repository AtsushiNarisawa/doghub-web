import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "箱根 ドッグラン｜DogHub箱根仙石原 専用ドッグラン併設ペットホテル",
  description: "DogHub箱根仙石原は専用ドッグラン併設のペットホテル。屋根付きエリアあり、雨の日でもOK。お預かり中は1日2回以上ドッグランで遊べます。仙石原の自然の中で愛犬ものびのび。",
};

export default function DogrunPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"ドッグラン",href:"/dogrun"}]} />
        {/* Hero */}
        <div className="relative">
          <img
            src="/images/img-021.jpg"
            alt="DogHub箱根仙石原 ドッグラン"
            className="w-full object-cover"
            style={{ height: "clamp(180px, 30vw, 424px)" }}
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
            <p className="text-sm mb-2 opacity-80">/ ドッグラン</p>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 44px)", fontWeight: 400 }}>
              専用ドッグラン併設
            </h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>ドッグラン</span>
          </p>
        </div>

        {/* Main content */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>DOG RUN</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  仙石原の自然の中で<br />のびのび遊べるドッグラン
                </h3>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  DogHub箱根仙石原には、わんちゃんが思いっきり走り回れる専用ドッグランがあります。
                  箱根の豊かな自然に囲まれた環境で、愛犬ものびのびリフレッシュ。
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  屋根付きエリアもあるので、雨の日でも安心して遊べます。
                  お預かり中のわんちゃんは、朝・夕の1日2回以上ドッグランで遊ぶ時間を設けています。
                  ケージに閉じ込めっぱなしにはしません。
                </p>
                <div className="bg-[#FFF8F3] border-l-4 border-[#B87942] px-4 py-3 mb-6">
                  <p className="text-[#3C200F]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>
                    <span className="font-medium">ご利用について：</span>ドッグランの単独利用はできません。お預かりサービスまたはカフェをご利用のお客様にご利用いただけます。お預かり中のわんちゃんが優先となりますので、カフェご利用時の長時間のご利用はご遠慮ください。
                  </p>
                </div>
              </div>

              <div>
                <img
                  src="/images/img-022.jpg"
                  alt="DogHub箱根仙石原 ドッグランで遊ぶ犬"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] text-center mb-3" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>FEATURES</h2>
            <p className="text-[#311908] text-center mb-12" style={{ fontSize: "20px", fontWeight: 400 }}>ドッグランの特徴</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "屋根付きエリア",
                  body: "雨の日でもわんちゃんが外で遊べる屋根付きエリアを完備。天候に左右されません。",
                },
                {
                  title: "1日2回以上の遊び時間",
                  body: "お預かり中のわんちゃんは朝・夕の2回以上、ドッグランでリフレッシュ。ストレスフリーに過ごせます。",
                },
                {
                  title: "安全な柵で囲まれた敷地",
                  body: "しっかりとした柵で囲まれた安全な敷地内。脱走の心配なく、安心して遊ばせられます。",
                },
                {
                  title: "仙石原の自然環境",
                  body: "箱根仙石原の豊かな自然に囲まれた環境。新鮮な空気の中、わんちゃんも気持ちよく過ごせます。",
                },
                {
                  title: "スタッフ見守り",
                  body: "ドッグランでの遊び時間中もスタッフが見守り。わんちゃん同士のトラブルにも即座に対応します。",
                },
                {
                  title: "お散歩オプション",
                  body: "ドッグランに加え、お散歩オプション（¥550/回・税込）もご用意。仙石原周辺を一緒にお散歩します。",
                },
              ].map((item) => (
                <div key={item.title} className="bg-white p-6">
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "18px", fontWeight: 400 }}>{item.title}</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Photo gallery */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>ドッグランの様子</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { src: "/images/img-011.jpg", alt: "ドッグランで走る犬" },
                { src: "/images/img-012.jpg", alt: "ドッグラン全景" },
                { src: "/images/img-022.jpg", alt: "ドッグランで遊ぶ犬" },
                { src: "/images/img-019.jpg", alt: "お預かり中の様子" },
                { src: "/images/img-008.jpg", alt: "お散歩" },
                { src: "/images/img-048.jpg", alt: "完全個室" },
              ].map((img) => (
                <img key={img.src} src={img.src} alt={img.alt} className="w-full h-48 object-cover" />
              ))}
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="py-16 px-6 bg-[#F7F7F7] border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "26px", fontWeight: 400 }}>お預かりプラン</h2>
            <p className="text-[#8F7B65] mb-8" style={{ fontSize: "13px", fontWeight: 400 }}>※表示料金はすべて税込です。</p>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/4h" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "14px", fontWeight: 400 }}>半日お預かり</p>
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>¥3,300 / 4時間</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>温泉や美術館の間にちょこっとお預け</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/8h" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "14px", fontWeight: 400 }}>1日お預かり</p>
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>¥5,500 / 8時間</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>ゴルフや観光にぴったり</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/stay" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "14px", fontWeight: 400 }}>宿泊プラン</p>
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>¥7,700〜 / 1泊</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>24時間スタッフ常駐で安心</p>
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
