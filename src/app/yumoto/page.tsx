import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "箱根湯本から犬のホテルをお探しなら｜DogHub箱根仙石原",
  description: "箱根湯本エリアで犬のホテル・ペットホテルをお探しの方へ。DogHub箱根仙石原は箱根湯本から車で約25分。宿泊1泊¥7,700〜、半日預かり¥3,300〜。24時間スタッフ常駐・完全個室・ドッグラン併設。",
  alternates: { canonical: "/yumoto" },
};

const nearbySpots = [
  { name: "箱根湯本駅周辺", desc: "お土産街・食べ歩き。犬連れでも歩けますが、混雑時は抱っこが安心。", dog: true },
  { name: "早雲寺", desc: "北条氏ゆかりの寺院。境内は犬連れ不可。", dog: false },
  { name: "玉簾の瀧（天成園）", desc: "ホテル敷地内の滝。犬連れでの散策は不可。", dog: false },
  { name: "箱根旧街道（石畳）", desc: "江戸時代の石畳を犬と散策できます。", dog: true },
  { name: "湯本の温泉施設", desc: "日帰り温泉はペット不可。犬はDogHubへ。", dog: false },
];

export default function YumotoPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"箱根湯本エリアガイド",href:"/yumoto"}]} />
        {/* Hero */}
        <div className="relative">
          <img src="/images/img-041.jpg" alt="DogHub箱根仙石原 犬のホテル外観 箱根湯本からのアクセスも便利" className="w-full object-cover" style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 style={{ fontSize: "clamp(24px, 4.5vw, 44px)", fontWeight: 400 }}>箱根湯本エリアガイド</h1>
            <p className="mt-2" style={{ fontSize: "clamp(14px, 2vw, 18px)", fontWeight: 400 }}>箱根湯本から犬のホテルをお探しの方へ</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <Link href="/hakone" className="hover:text-[#3C200F]">箱根 犬連れガイド</Link>
            <span className="mx-2"></span>
            <span>箱根湯本エリア</span>
          </p>
        </div>

        {/* Intro */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400 }}>箱根湯本で犬のホテルが見つからない方へ</h2>
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              箱根の玄関口・箱根湯本。温泉街の散策やお土産めぐりが楽しいエリアですが、
              犬を預けられるペットホテルは湯本駅周辺にはほとんどありません。
            </p>
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              DogHub箱根仙石原は、箱根湯本から車で約25分の仙石原エリアにあります。
              箱根の中心に位置しているので、湯本だけでなく強羅・芦ノ湖・ユネッサンなど
              箱根の主要エリアへのアクセスも便利。犬を預けて箱根観光を自由に楽しめます。
            </p>
          </div>
        </section>

        {/* Access from Yumoto */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>箱根湯本からDogHubへのアクセス</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6">
                <h3 className="text-[#3C200F] mb-4" style={{ fontSize: "18px", fontWeight: 400 }}>車でのルート</h3>
                <p className="text-[#3C200F] mb-3" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.8" }}>
                  箱根湯本 → 国道1号 → 宮ノ下 → 国道138号 → 仙石原
                </p>
                <p className="text-[#B87942] font-medium" style={{ fontSize: "20px" }}>約25分</p>
                <p className="text-[#8F7B65] mt-2" style={{ fontSize: "14px", fontWeight: 400 }}>
                  ※ 週末・連休は宮ノ下付近で渋滞の場合あり（+10〜15分）
                </p>
              </div>
              <div className="bg-white p-6">
                <h3 className="text-[#3C200F] mb-4" style={{ fontSize: "18px", fontWeight: 400 }}>各エリアへの所要時間</h3>
                <div className="space-y-3" style={{ fontSize: "15px", fontWeight: 400 }}>
                  <div className="flex justify-between text-[#3C200F]">
                    <span>DogHub → 強羅</span><span>車で約10分</span>
                  </div>
                  <div className="flex justify-between text-[#3C200F]">
                    <span>DogHub → 芦ノ湖（桃源台）</span><span>車で約10分</span>
                  </div>
                  <div className="flex justify-between text-[#3C200F]">
                    <span>DogHub → ユネッサン</span><span>車で約15分</span>
                  </div>
                  <div className="flex justify-between text-[#3C200F]">
                    <span>DogHub → 大涌谷</span><span>車で約15分</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Model Course */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>箱根湯本発 犬連れモデルコース</h2>
            <div className="bg-[#F8F5F0] p-8 rounded-xl">
              <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "18px", fontWeight: 400 }}>日帰りプラン（温泉+観光）</h3>
              <div className="space-y-4">
                {[
                  { time: "9:00", text: "箱根湯本を出発" },
                  { time: "9:25", text: "DogHubに到着 → 愛犬をお預け" },
                  { time: "9:30", text: "仙石原すすき草原をお散歩" },
                  { time: "10:30", text: "ポーラ美術館（車4分）" },
                  { time: "12:30", text: "DogHubのカフェでランチ（愛犬と合流）" },
                  { time: "13:30", text: "再度お預け → ユネッサンへ（車15分）" },
                  { time: "16:00", text: "DogHubでお迎え → 帰路" },
                ].map((step) => (
                  <div key={step.time} className="flex gap-4 items-start">
                    <span className="text-[#B87942] shrink-0" style={{ fontSize: "16px", fontWeight: 500, minWidth: "50px" }}>{step.time}</span>
                    <span className="text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400 }}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Nearby spots */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>箱根湯本周辺の犬連れ情報</h2>
            <div className="space-y-4">
              {nearbySpots.map((spot) => (
                <div key={spot.name} className="bg-white p-5 flex items-start gap-4">
                  <span className={`shrink-0 mt-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${spot.dog ? "bg-[#B87942]" : "bg-[#999]"}`}>
                    {spot.dog ? "OK" : "NG"}
                  </span>
                  <div>
                    <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "16px", fontWeight: 400 }}>{spot.name}</h3>
                    <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>{spot.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[#3C200F] mt-6" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
              箱根湯本は温泉街なので、犬NGの施設が多いのが現実です。
              犬を連れて行けない場所に行きたいときは、DogHubにお預けいただければ安心して観光を楽しめます。
            </p>
          </div>
        </section>

        {/* DogHub info */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>DogHub箱根仙石原について</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img src="/images/img-035.png" alt="DogHub箱根仙石原 犬の個室 清潔な宿泊環境" className="w-full h-60 object-cover" />
              </div>
              <div>
                <div className="space-y-4" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.8" }}>
                  <div className="flex gap-3 text-[#3C200F]">
                    <span className="text-[#B87942] shrink-0">&#9679;</span>
                    <span>24時間スタッフ常駐・完全個室</span>
                  </div>
                  <div className="flex gap-3 text-[#3C200F]">
                    <span className="text-[#B87942] shrink-0">&#9679;</span>
                    <span>ドッグラン併設（屋根付きエリアあり）</span>
                  </div>
                  <div className="flex gap-3 text-[#3C200F]">
                    <span className="text-[#B87942] shrink-0">&#9679;</span>
                    <span>早朝7時からお預かり対応</span>
                  </div>
                  <div className="flex gap-3 text-[#3C200F]">
                    <span className="text-[#B87942] shrink-0">&#9679;</span>
                    <span>犬連れカフェ併設（室内OK）</span>
                  </div>
                  <div className="flex gap-3 text-[#3C200F]">
                    <span className="text-[#B87942] shrink-0">&#9679;</span>
                    <span>体重15kgまで対応</span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <Link href="/service" className="block text-[#B87942] hover:underline" style={{ fontSize: "15px" }}>料金・サービス詳細 →</Link>
                  <Link href="/booking" className="block text-[#B87942] hover:underline" style={{ fontSize: "15px" }}>ご予約はこちら →</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>よくある質問</h2>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  { "@type": "Question", name: "箱根湯本にペットホテルはありますか？", acceptedAnswer: { "@type": "Answer", text: "箱根湯本駅周辺にはペットホテル専門施設はほとんどありません。DogHub箱根仙石原は箱根湯本から車で約25分の仙石原エリアにあり、箱根エリアのペットホテルとしてご利用いただけます。" }},
                  { "@type": "Question", name: "箱根湯本からDogHubまでどのくらいかかりますか？", acceptedAnswer: { "@type": "Answer", text: "車で約25分です。国道1号から宮ノ下を経由し国道138号で仙石原へ。週末は宮ノ下付近で渋滞の場合があり、+10〜15分かかることがあります。" }},
                  { "@type": "Question", name: "箱根湯本の温泉に行く間だけ犬を預けられますか？", acceptedAnswer: { "@type": "Answer", text: "はい。半日お預かり（4時間）¥3,300〜、1日お預かり（8時間）¥5,500〜でご利用いただけます。温泉や美術館など犬連れNGの施設に行く間だけのご利用も歓迎です。" }},
                ],
              }) }}
            />
            <div className="space-y-4">
              {[
                { q: "箱根湯本にペットホテルはありますか？", a: "箱根湯本駅周辺にはペットホテル専門施設はほとんどありません。DogHub箱根仙石原は箱根湯本から車で約25分の仙石原エリアにあり、箱根エリアのペットホテルとしてご利用いただけます。" },
                { q: "箱根湯本からDogHubまでどのくらいかかりますか？", a: "車で約25分です。国道1号から宮ノ下を経由し国道138号で仙石原へ。週末は宮ノ下付近で渋滞の場合があり、+10〜15分かかることがあります。" },
                { q: "箱根湯本の温泉に行く間だけ犬を預けられますか？", a: "はい。半日お預かり（4時間）¥3,300〜、1日お預かり（8時間）¥5,500〜でご利用いただけます。温泉や美術館など犬連れNGの施設に行く間だけのご利用も歓迎です。" },
              ].map((faq) => (
                <details key={faq.q} className="border border-[#E5DDD8] bg-white group">
                  <summary className="flex items-center justify-between cursor-pointer p-6 text-[#3C200F] hover:bg-[#F7F7F7] transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>
                    <span>{faq.q}</span>
                    <span className="ml-4 text-[#B87942] group-open:rotate-45 transition-transform" style={{ fontSize: "24px" }}>+</span>
                  </summary>
                  <div className="px-6 pb-6 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 関連記事 */}
        <section className="px-6 py-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="p-6 bg-[#F8F5F0] rounded-xl">
              <p className="text-[#3C200F] font-medium mb-2" style={{ fontSize: "16px" }}>あわせて読みたい</p>
              <div className="space-y-2">
                <Link href="/news/hakone-dog-hotel-guide" className="block text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>
                  → 箱根で犬のホテルを探している方へ｜預かり・宿泊・選び方のポイント
                </Link>
                <Link href="/news/hakone-dog-trip-guide" className="block text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>
                  → 箱根 犬連れ旅行ガイド｜犬と行けるスポットまとめ
                </Link>
                <Link href="/hakone" className="block text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>
                  → 箱根 犬連れ旅行ガイド｜犬と箱根を楽しむすべてがここに
                </Link>
              </div>
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
