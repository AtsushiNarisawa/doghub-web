import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "箱根 犬 1日預かり 8時間プラン｜DogHub箱根仙石原 ペットホテル",
  description: "箱根仙石原の犬の1日お預かりプラン。8時間¥5,500。ゴルフ、観光、日帰り旅行の間に愛犬を安心してお預け。早朝7時からお預かり対応。24時間スタッフ常駐・ドッグラン併設。",
};

const scenes = [
  {
    title: "ゴルフの間にお預け",
    body: "大箱根カントリークラブをはじめ、箱根には名門ゴルフ場がたくさん。早朝7時からお預かり可能なので、朝イチのスタートにも対応。プレー後にお迎えに来ていただければOKです。",
    note: "大箱根カントリークラブ提携",
  },
  {
    title: "1日観光を楽しむ間に",
    body: "箱根湯本でショッピング、強羅で温泉、芦ノ湖で遊覧船。朝預けて夕方お迎えで、愛犬を気にせず1日たっぷり箱根を満喫できます。",
    note: "",
  },
  {
    title: "ユネッサン＋美術館の欲張りプラン",
    body: "ユネッサンで遊んだ後にポーラ美術館へ。8時間あれば2つ以上の観光スポットを巡れます。DogHubは仙石原の中心に位置しているので、移動もスムーズです。",
    note: "",
  },
  {
    title: "連泊の合間にも",
    body: "宿泊プランと組み合わせて、2日目の日中も預けることが可能です。例えば宿泊＋1日お預かりで、2泊3日のうち丸1日を観光に充てられます。",
    note: "",
  },
];

export default function EightHourPage() {
  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* Hero */}
        <div className="relative">
          <img
            src="https://static.wixstatic.com/media/a21f47_0c4d1725107f4997b41cfb2104c63821~mv2.jpg/v1/fill/w_1440,h_424,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg"
            alt="DogHub箱根仙石原 1日お預かり"
            className="w-full object-cover"
            style={{ height: "clamp(180px, 30vw, 424px)" }}
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <p className="text-sm mb-2 opacity-80">/ 1日お預かり</p>
            <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400 }}>1日お預かりプラン</h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <Link href="/service" className="hover:text-[#3C200F]">お預かりサービス</Link>
            <span className="mx-2"></span>
            <span>1日お預かりプラン</span>
          </p>
        </div>

        {/* Plan overview */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>FULL DAY SERVICE</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  ゴルフも観光も1日たっぷり。<br />愛犬を安心して預けて箱根を満喫
                </h3>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  箱根でゴルフを楽しみたい。1日かけて観光スポットを巡りたい。
                  でも愛犬を連れていけない場所も多い。そんな時に活躍するのが、
                  DogHub箱根仙石原の1日お預かりプランです。
                </p>
                <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  早朝7時からお預かり対応。ゴルフの朝イチスタートにも間に合います。
                  大箱根カントリークラブとも提携しており、ゴルフ前に愛犬を預けるお客様に多くご利用いただいています。
                </p>

                {/* Pricing */}
                <div className="bg-[#F7F7F7] p-8">
                  <h4 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>料金</h4>
                  <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "18px", fontWeight: 400, lineHeight: "2" }}>
                    <p>1日（8時間）：<span className="text-[#B87942]" style={{ fontSize: "24px" }}>¥5,500</span></p>
                    <p>スポット（1時間）：<span className="text-[#B87942]" style={{ fontSize: "24px" }}>¥1,100</span></p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E5DDD8] text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                    <p>通常プラン：9時〜17時</p>
                    <p>早朝プラン：7時〜15時</p>
                    <p>お預かり最終受付：15時 ／ お引き取り最終：17時</p>
                    <p className="mt-2 text-[#8F7B65]" style={{ fontSize: "14px" }}>※早朝プランは事前にご連絡お願いします。</p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-10 py-4 hover:opacity-90 transition-opacity"
                    style={{ fontSize: "18px", fontWeight: 400 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    1日プランを予約する
                  </Link>
                </div>
              </div>

              <div>
                <img
                  src="https://static.wixstatic.com/media/a21f47_1265d1bf2e6241239bb3e1a9fde80253~mv2.jpg/v1/fill/w_621,h_413,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg"
                  alt="DogHub箱根仙石原 ドッグラン"
                  className="w-full h-auto"
                />
                <img
                  src="https://static.wixstatic.com/media/a21f47_24d9346c3bd149d186f9bdc6f068211e~mv2.png/v1/fill/w_621,h_413,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.png"
                  alt="24時間スタッフ常駐"
                  className="w-full h-auto mt-4"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Use scenes */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-3" style={{ fontSize: "26px", fontWeight: 400 }}>こんな時にご利用ください</h2>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {scenes.map((s, i) => (
                <div key={i} className="bg-white border border-[#E5DDD8] p-8">
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "20px", fontWeight: 400 }}>{s.title}</h3>
                  <p className="text-[#3C200F] mb-2" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>{s.body}</p>
                  {s.note && <p className="text-[#B87942]" style={{ fontSize: "13px", fontWeight: 400 }}>{s.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Model case */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>1日お預かりのモデルケース</h2>
            <div className="border border-[#E5DDD8]">
              <div className="bg-[#3C200F] px-6 py-3">
                <p className="text-white" style={{ fontSize: "16px", fontWeight: 400 }}>1泊2日｜箱根小涌園ユネッサン & 美術館満喫プラン</p>
              </div>
              <div className="p-6">
                <img
                  src="https://static.wixstatic.com/media/a21f47_63af2590269d4652a5c2171542997f5f~mv2.png/v1/fill/w_1051,h_515,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/Group%20463.png"
                  alt="1日お預かり モデルケース タイムライン"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Other plans */}
        <section className="py-16 px-6 bg-[#F7F7F7] border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>その他のプラン</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link href="/4h" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "14px", fontWeight: 400 }}>半日お預かり</p>
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>¥3,300 / 4時間</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>温泉やユネッサンの間にちょこっとお預け。日帰り旅行にぴったり。</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/stay" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "14px", fontWeight: 400 }}>宿泊プラン</p>
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>¥7,700〜 / 1泊</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>愛犬と泊まれない宿でも箱根旅行を。24時間スタッフ常駐。</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA banner */}
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
