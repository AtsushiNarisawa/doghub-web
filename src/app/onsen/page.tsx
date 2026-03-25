import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  title: "箱根温泉 × ペット預かり｜日帰り温泉の間に愛犬をお預け｜DogHub箱根仙石原",
  description: "箱根の日帰り温泉を楽しむ間、愛犬をDogHubにお預け。半日4時間¥3,300〜。仙石原・強羅・箱根湯本の温泉施設へ好アクセス。24時間スタッフ常駐・完全個室・ドッグラン併設。",
  alternates: { canonical: "/onsen" },
};

const onsens = [
  {
    name: "一の湯 仙石原品の木",
    distance: "車で約3分",
    area: "仙石原",
  },
  {
    name: "一の湯 仙石原新館",
    distance: "車で約5分",
    area: "仙石原",
  },
  {
    name: "龍宮殿本館",
    distance: "車で約10分",
    area: "芦ノ湖",
  },
  {
    name: "箱根高原ホテル",
    distance: "車で約10分",
    area: "仙石原",
  },
  {
    name: "森の湯（箱根小涌園）",
    distance: "車で約15分",
    area: "小涌谷",
  },
  {
    name: "箱根小涌園ユネッサン",
    distance: "車で約15分",
    area: "小涌谷",
  },
  {
    name: "一の湯 塔ノ沢キャトルセゾン",
    distance: "車で約20分",
    area: "塔之沢",
  },
  {
    name: "一の湯 塔ノ沢本館",
    distance: "車で約20分",
    area: "塔之沢",
  },
  {
    name: "強羅 翠光館",
    distance: "車で約10分",
    area: "強羅",
  },
  {
    name: "箱根小涌谷温泉 三河屋旅館",
    distance: "車で約12分",
    area: "小涌谷",
  },
  {
    name: "箱根の湯",
    distance: "車で約20分",
    area: "湯本",
  },
  {
    name: "箱根湯寮",
    distance: "車で約25分",
    area: "塔之沢",
  },
  {
    name: "箱根湯本 天成園",
    distance: "車で約25分",
    area: "箱根湯本",
  },
];

export default function OnsenPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"箱根温泉 × ペットホテル",href:"/onsen"}]} />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-019.jpg" alt="箱根温泉 × ペット預かり" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(22px, 4.5vw, 40px)", fontWeight: 400 }}>
              温泉を満喫する間、愛犬をお預け
            </h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>温泉 × ペット預かり</span>
          </p>
        </div>

        {/* Main content */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>ONSEN × DOG HOTEL</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  「温泉に入りたいけど、<br />愛犬がいるから…」を解決
                </h3>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  箱根といえば温泉。でも、ほとんどの温泉施設はペット同伴NG。
                  車の中で待たせるのも心配だし、かといって温泉を諦めるのももったいない。
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  DogHub箱根仙石原なら、日帰り温泉やランチの間だけ愛犬をお預かり。
                  半日プラン（4時間 ¥3,300）で温泉を満喫した後、
                  愛犬と一緒に仙石原を散策するのが人気のプランです。
                </p>

                <div className="bg-[#F7F7F7] p-8 mb-8">
                  <h4 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>おすすめプラン</h4>
                  <div className="space-y-4 text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                    <div className="pb-3 border-b border-[#E5DDD8]">
                      <p className="text-[#B87942]" style={{ fontSize: "14px" }}>半日お預かり（4時間）</p>
                      <p style={{ fontSize: "24px" }}>¥3,300</p>
                      <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>日帰り温泉＆ランチにぴったり</p>
                    </div>
                    <div>
                      <p className="text-[#B87942]" style={{ fontSize: "14px" }}>スポット利用（1時間〜）</p>
                      <p style={{ fontSize: "24px" }}>¥1,100〜</p>
                      <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>「温泉だけ入りたい」なら2〜3時間でOK</p>
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
                <Image src="/images/img-035.png" alt="DogHub箱根仙石原 完全個室" className="w-full h-auto" width={600} height={400} />
                <Image src="/images/img-011.jpg" alt="DogHub箱根仙石原 ドッグラン" className="w-full h-auto mt-4" width={600} height={400} />
              </div>
            </div>
          </div>
        </section>

        {/* Model case */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>温泉 × DogHubのモデルケース</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-[#E5DDD8] p-8">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>日帰り温泉＆ランチプラン</h3>
                <p className="text-[#B87942] mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>半日お預かり（4時間）¥3,300</p>
                <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                  <p>10:00 DogHubにお預け</p>
                  <p>10:30 日帰り温泉施設到着</p>
                  <p>11:00 温泉でゆっくり</p>
                  <p>12:00 館内でランチ</p>
                  <p>13:30 DogHubでお迎え</p>
                  <p>14:00 愛犬と湿生花園を散策</p>
                </div>
              </div>
              <div className="bg-white border border-[#E5DDD8] p-8">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>温泉旅館 + 宿泊プラン</h3>
                <p className="text-[#B87942] mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>宿泊プラン ¥7,700〜</p>
                <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                  <p>【1日目】14:00 DogHubにチェックイン</p>
                  <p>15:00 温泉旅館でチェックイン</p>
                  <p>夕食・温泉を堪能</p>
                  <p>【2日目】10:00 旅館チェックアウト</p>
                  <p>10:30 DogHubでお迎え</p>
                  <p>11:00 愛犬と箱根ドライブ</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby onsens */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>DogHubからアクセスしやすい温泉施設</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {onsens.map((o) => (
                <div key={o.name} className="border border-[#E5DDD8] p-6">
                  <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "16px", fontWeight: 400 }}>{o.name}</h3>
                  <p className="text-[#B87942]" style={{ fontSize: "14px", fontWeight: 400 }}>{o.distance}</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>{o.area}エリア</p>
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
              <Link href="/yunessun" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>ユネッサン × ペット預かり</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>車で約15分。半日¥3,300〜</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/museum" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>美術館 × ペット預かり</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>仙石原の美術館めぐり</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/ryokan" className="block bg-white border border-[#E5DDD8] p-6 hover:bg-white/80 transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>高級旅館 × ペットホテル</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>憧れの宿に泊まりながら</p>
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
