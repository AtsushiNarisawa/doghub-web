import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "箱根 犬 ホテル 宿泊プラン｜DogHub箱根仙石原 ペットホテル",
  description: "箱根仙石原の犬の宿泊ペットホテル。1泊¥7,700〜。24時間スタッフ常駐・完全個室・ドッグラン併設。愛犬と泊まれる宿に空きがない時、宿泊する宿がペット不可の時に。チェックイン14時〜、チェックアウト〜11時。",
};

const points = [
  {
    icon: "🌙",
    title: "24時間スタッフ常駐",
    body: "夜間も宿直スタッフがおり、随時ライブカメラで見守っています。飼い主様も安心してお休みいただけます。",
  },
  {
    icon: "🏠",
    title: "完全個室でストレスフリー",
    body: "ケージやサークルではなく、壁に囲まれた個室でお預かり。わんちゃんがリラックスできる空間です。",
  },
  {
    icon: "🌿",
    title: "専用ドッグランで遊べる",
    body: "屋根付きエリアもある専用ドッグランで、お散歩やリフレッシュ。雨の日でも安心です。",
  },
  {
    icon: "📍",
    title: "仙石原の好立地",
    body: "箱根の主要観光地へアクセス良好。強羅・芦ノ湖・ユネッサンなど、お迎えの前後に観光も楽しめます。",
  },
];

const scenes = [
  {
    title: "愛犬と泊まれる宿に空きがない時",
    body: "箱根の人気宿はペット可の部屋がすぐに埋まります。DogHubに愛犬を預けて、お好きな旅館やホテルに宿泊。翌朝お迎えに来ていただければOKです。",
  },
  {
    title: "宿泊する宿がペット不可の時",
    body: "箱根吟遊、富士屋ホテル、強羅花壇など、憧れの高級旅館はペット不可がほとんど。DogHubなら愛犬を安心して預けて、特別な宿での滞在を楽しめます。",
  },
  {
    title: "翌日もゴルフや観光を楽しみたい時",
    body: "1泊お預けして、翌日チェックアウト後にゴルフや美術館へ。連泊にも対応していますので、2泊3日の箱根旅行でも安心です。",
  },
];

export default function StayPage() {
  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* Hero */}
        <div className="relative">
          <img
            src="https://static.wixstatic.com/media/a21f47_83b3dead7b084aa3a8980879f5cadd9e~mv2.jpg/v1/fill/w_1440,h_424,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg"
            alt="DogHub箱根仙石原 宿泊プラン"
            className="w-full object-cover"
            style={{ height: "clamp(180px, 30vw, 424px)" }}
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <p className="text-sm mb-2 opacity-80">/ 宿泊プラン</p>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400 }}>宿泊プラン</h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <Link href="/service" className="hover:text-[#3C200F]">お預かりサービス</Link>
            <span className="mx-2"></span>
            <span>宿泊プラン</span>
          </p>
        </div>

        {/* Plan overview */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>PET HOTEL</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  愛犬と泊まれない宿でも、<br />箱根旅行をあきらめない
                </h3>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  箱根には素晴らしい旅館やホテルがたくさんありますが、ペット不可の施設も多いのが現実です。
                  DogHub箱根仙石原の宿泊プランなら、愛犬を安心してお預けいただき、
                  お好きな宿での特別な時間をお楽しみいただけます。
                </p>
                <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  24時間スタッフ常駐の完全個室で、ケージではなくお部屋でのびのびとお過ごしいただけます。
                  専用ドッグランも併設しており、わんちゃんにとってもリゾート気分の滞在です。
                </p>

                {/* Pricing */}
                <div className="bg-[#F7F7F7] p-8">
                  <h4 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>料金</h4>
                  <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "18px", fontWeight: 400, lineHeight: "2" }}>
                    <p>1泊：<span className="text-[#B87942]" style={{ fontSize: "24px" }}>¥7,700</span>〜</p>
                    <p>追加1時間あたり：¥1,100</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E5DDD8] text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                    <p>チェックイン：14時〜17時</p>
                    <p>チェックアウト：9時〜11時</p>
                    <p className="mt-2 text-[#8F7B65]" style={{ fontSize: "14px" }}>
                      ※営業時間外のお預かり/受け取りは別途時間料金あり<br />
                      ※箱根町在住の方は¥5,500〜
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-10 py-4 hover:opacity-90 transition-opacity"
                    style={{ fontSize: "18px", fontWeight: 400 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    宿泊プランを予約する
                  </Link>
                </div>
              </div>

              <div>
                <img
                  src="https://static.wixstatic.com/media/a21f47_57b05fba0d8d434b92c073193341c680~mv2.png/v1/fill/w_621,h_603,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.png"
                  alt="DogHub箱根仙石原 宿泊用個室"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4 Points */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] text-center mb-3" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>FEATURES</h2>
            <p className="text-[#311908] text-center mb-12" style={{ fontSize: "20px", fontWeight: 400 }}>宿泊プランの特徴</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {points.map((p) => (
                <div key={p.title} className="bg-white p-6 text-center">
                  <p className="text-3xl mb-4">{p.icon}</p>
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "18px", fontWeight: 400 }}>{p.title}</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use scenes */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-3" style={{ fontSize: "26px", fontWeight: 400 }}>こんな時にご利用ください</h2>
            <div className="space-y-6 mt-8">
              {scenes.map((s, i) => (
                <div key={i} className="border border-[#E5DDD8] p-8">
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "20px", fontWeight: 400 }}>{s.title}</h3>
                  <p className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Model case */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>宿泊プランのモデルケース</h2>
            <div className="border border-[#E5DDD8] bg-white">
              <div className="bg-[#3C200F] px-6 py-3">
                <p className="text-white" style={{ fontSize: "16px", fontWeight: 400 }}>プレミアムホテルでゆったり宿泊 & 愛犬と箱根満喫プラン</p>
              </div>
              <div className="p-6">
                <img
                  src="https://static.wixstatic.com/media/a21f47_46c79369b63846749bda19bbcdf8bf6b~mv2.png/v1/fill/w_1051,h_515,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/Group%20478.png"
                  alt="宿泊プラン モデルケース タイムライン"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Other plans */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>その他のプラン</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/8h" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "14px", fontWeight: 400 }}>1日お預かり</p>
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>¥5,500 / 8時間</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>ゴルフや観光の間にお預け。旅行プランに組み合わせて箱根をもっと自由に。</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/4h" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "14px", fontWeight: 400 }}>半日お預かり</p>
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>¥3,300 / 4時間</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>温泉やユネッサンの間にちょこっとお預け。日帰り旅行にぴったり。</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="bg-[#3C200F] py-10 px-6">
          <div className="max-w-7xl mx-auto text-center text-white">
            <p className="mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>はじめてご利用の方はご予約前に必ずこちらをご覧ください</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/guide" className="inline-flex items-center gap-2 border border-white text-white px-8 py-3 hover:bg-white hover:text-[#3C200F] transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>
                ご利用ガイド・注意事項はこちら →
              </Link>
              <Link href="/faq" className="inline-flex items-center gap-2 border border-white text-white px-8 py-3 hover:bg-white hover:text-[#3C200F] transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>
                よくある質問 →
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
