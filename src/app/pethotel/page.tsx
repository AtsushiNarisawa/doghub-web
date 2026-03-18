import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "箱根 ペットホテル × 日中預かり｜観光中の愛犬をお預け｜DogHub箱根仙石原",
  description: "箱根のペットホテルDogHub。ペット可の宿に泊まりながら観光中は愛犬をお預け。半日4時間¥3,300〜。レジーナ仙石原など近隣ペット可施設からのご案内多数。24時間スタッフ常駐・完全個室・ドッグラン併設。",
  alternates: { canonical: "/pethotel" },
};

const petHotels = [
  { name: "レジーナリゾート箱根仙石原", area: "仙石原", distance: "車で約3分" },
  { name: "ドッグレストプレイス", area: "仙石原", distance: "車で約5分" },
  { name: "強羅グアムドッグ", area: "強羅", distance: "車で約10分" },
  { name: "リトナ箱根", area: "強羅", distance: "車で約10分" },
  { name: "モリトソラ", area: "仙石原", distance: "車で約5分" },
  { name: "ゆるり箱根", area: "仙石原", distance: "車で約3分" },
  { name: "カーロ・フォレスタ箱根", area: "強羅", distance: "車で約12分" },
  { name: "箱根園コテージ", area: "芦ノ湖", distance: "車で約15分" },
  { name: "犬御殿 箱根仙石原温泉", area: "仙石原", distance: "車で約5分" },
  { name: "森の風 箱根仙石原", area: "仙石原", distance: "車で約3分" },
];

export default function PetHotelPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"ペット可ホテル × 日中預かり",href:"/pethotel"}]} />
        {/* Hero */}
        <div className="relative">
          <img
            src="/images/img-006.jpg"
            alt="ペット可ホテル × 日中預かり"
            className="w-full object-cover"
            style={{ height: "clamp(180px, 30vw, 424px)" }}
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(22px, 4.5vw, 40px)", fontWeight: 400 }}>
              チェックイン前後の観光も、愛犬を安心して
            </h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>ペット可ホテル × 日中預かり</span>
          </p>
        </div>

        {/* Main content */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>PET HOTEL × DAY CARE</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  ペット可の宿に泊まっていても、<br />観光中は預けたいとき
                </h3>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  箱根にはペットと泊まれる宿がたくさんあります。
                  でも、チェックインは15時、チェックアウトは10時。
                  その前後の時間に「愛犬を連れて行けないスポット」に行きたいこと、ありませんか？
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  美術館、温泉、ユネッサン、ショッピング…
                  ペット不可の施設を諦めず、DogHubに愛犬を預けて箱根を満喫できます。
                  近隣のレジーナリゾート仙石原をはじめ、多くのペット可宿泊施設から
                  お客様をご案内いただいています。
                </p>
                <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  ドッグラン併設だから、お預かり中も愛犬はのびのび。
                  車の中や狭いケージで待たせる心配がなく、飼い主様も安心して観光を楽しめます。
                </p>

                <div className="bg-[#F7F7F7] p-8 mb-8">
                  <h4 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>日中預かりプラン</h4>
                  <div className="space-y-4 text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                    <div className="pb-3 border-b border-[#E5DDD8]">
                      <p className="text-[#B87942]" style={{ fontSize: "14px" }}>半日お預かり（4時間）</p>
                      <p style={{ fontSize: "24px" }}>¥3,300</p>
                      <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>チェックイン前・チェックアウト後の観光に</p>
                    </div>
                    <div className="pb-3 border-b border-[#E5DDD8]">
                      <p className="text-[#B87942]" style={{ fontSize: "14px" }}>1日お預かり（8時間）</p>
                      <p style={{ fontSize: "24px" }}>¥5,500</p>
                      <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>丸一日たっぷり観光したい方に</p>
                    </div>
                    <div>
                      <p className="text-[#B87942]" style={{ fontSize: "14px" }}>スポット利用（1時間〜）</p>
                      <p style={{ fontSize: "24px" }}>¥1,100〜</p>
                      <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>ちょっとだけ預けたい時にも</p>
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
                  src="/images/img-011.jpg"
                  alt="DogHub箱根仙石原 ドッグラン"
                  className="w-full h-auto"
                />
                <img
                  src="/images/img-035.png"
                  alt="DogHub箱根仙石原 お預かりスペース"
                  className="w-full h-auto mt-4"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Model cases */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>ペット可ホテル × DogHubのモデルケース</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-[#E5DDD8] p-8">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>チェックイン前に観光プラン</h3>
                <p className="text-[#B87942] mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>半日お預かり（4時間）¥3,300</p>
                <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                  <p>10:00 箱根到着、DogHubにお預け</p>
                  <p>10:30 ポーラ美術館でアート鑑賞</p>
                  <p>12:00 仙石原でランチ</p>
                  <p>13:30 DogHubでお迎え</p>
                  <p>14:00 愛犬と一緒にお散歩</p>
                  <p>15:00 ペット可ホテルにチェックイン</p>
                </div>
              </div>
              <div className="bg-white border border-[#E5DDD8] p-8">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>チェックアウト後に観光プラン</h3>
                <p className="text-[#B87942] mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>半日お預かり（4時間）¥3,300</p>
                <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                  <p>10:00 ペット可ホテルをチェックアウト</p>
                  <p>10:30 DogHubにお預け</p>
                  <p>11:00 箱根小涌園ユネッサンへ</p>
                  <p>13:00 ユネッサンで温泉＆ランチ</p>
                  <p>14:00 DogHubでお迎え</p>
                  <p>14:30 愛犬とドッグランで遊んで帰路へ</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby pet-friendly hotels */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "26px", fontWeight: 400 }}>DogHubをご案内いただいている近隣のペット可施設</h2>
            <p className="text-[#8F7B65] mb-8" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.8" }}>
              以下のペット可宿泊施設から、日中のお預かり先としてDogHubをご案内いただいています。
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {petHotels.map((h) => (
                <div key={h.name} className="border border-[#E5DDD8] p-5">
                  <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "16px", fontWeight: 400 }}>{h.name}</h3>
                  <p className="text-[#B87942]" style={{ fontSize: "14px", fontWeight: 400 }}>{h.distance}</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>{h.area}エリア</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why DogHub */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>車の中で待たせるのは不安…という方へ</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { title: "ドッグラン併設", body: "お預かり中もドッグランで自由に遊べます。ケージに入れっぱなしにしない、のびのびした環境です。" },
                { title: "仙石原の中心で好アクセス", body: "レジーナ仙石原から車3分。仙石原エリアのペット可施設からすぐの立地です。" },
                { title: "当日予約・短時間もOK", body: "スポット利用は1時間¥1,100から。「ちょっとだけ預けたい」にも柔軟に対応します。" },
              ].map((item) => (
                <div key={item.title} className="bg-white p-6">
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "18px", fontWeight: 400 }}>{item.title}</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other scenes */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>箱根でこんな過ごし方も</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/onsen" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>温泉 × ペット預かり</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>日帰り温泉を満喫</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/museum" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>美術館 × ペット預かり</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>仙石原の美術館めぐり</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/ryokan" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>高級旅館 × ペットホテル</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>ペット不可の憧れの宿に</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
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
