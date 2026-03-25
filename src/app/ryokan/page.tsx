import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  title: "箱根 高級旅館 × ペットホテル｜ペット不可の宿でも愛犬と箱根旅行｜DogHub箱根仙石原",
  description: "箱根吟遊、富士屋ホテル、強羅花壇など憧れの高級旅館はペット不可。DogHub箱根仙石原なら愛犬を安心して預けて特別な宿に宿泊。1泊¥7,700〜。24時間スタッフ常駐・完全個室。",
  alternates: { canonical: "/ryokan" },
};

const ryokans = [
  { name: "箱根吟遊", area: "宮ノ下", distance: "車で約15分" },
  { name: "富士屋ホテル", area: "宮ノ下", distance: "車で約15分" },
  { name: "強羅花壇", area: "強羅", distance: "車で約12分" },
  { name: "翠松園", area: "小涌谷", distance: "車で約12分" },
  { name: "金乃竹 仙石原", area: "仙石原", distance: "車で約5分" },
  { name: "きたの風茶寮", area: "仙石原", distance: "車で約5分" },
  { name: "佳ら久", area: "強羅", distance: "車で約10分" },
  { name: "箱根・翠松園", area: "小涌谷", distance: "車で約12分" },
];

export default function RyokanPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"箱根旅館 × ペットホテル",href:"/ryokan"}]} />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-071.jpg" alt="箱根高級旅館 × ペットホテル" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(22px, 4.5vw, 40px)", fontWeight: 400 }}>
              憧れの宿に泊まりながら、愛犬も安心
            </h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>高級旅館 × ペットホテル</span>
          </p>
        </div>

        {/* Main content */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>RYOKAN × DOG HOTEL</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  ペット不可の憧れの宿でも、<br />愛犬との箱根旅行をあきらめない
                </h3>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  箱根吟遊、富士屋ホテル、強羅花壇、翠松園…。
                  箱根には一度は泊まりたい憧れの高級旅館がたくさんありますが、
                  そのほとんどがペット不可です。
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  「愛犬がいるから行けない」と諦める必要はありません。
                  DogHub箱根仙石原の宿泊プランなら、愛犬を24時間スタッフ常駐の完全個室で
                  安心してお預けいただき、飼い主様は特別な宿での滞在をお楽しみいただけます。
                </p>
                <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  翌朝お迎えに来て、愛犬と一緒に仙石原を散策。
                  飼い主様も愛犬も、それぞれ最高の箱根旅行を。
                </p>

                <div className="bg-[#F7F7F7] p-8 mb-8">
                  <h4 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>宿泊プラン</h4>
                  <div className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                    <p>1泊：<span className="text-[#B87942]" style={{ fontSize: "24px" }}>¥7,700</span>〜</p>
                    <p>追加1時間あたり：¥1,100</p>
                    <div className="mt-4 pt-4 border-t border-[#E5DDD8] text-[#8F7B65]" style={{ fontSize: "14px" }}>
                      <p>チェックイン：14時〜17時</p>
                      <p>チェックアウト：9時〜11時</p>
                      <p className="mt-2">※表示料金はすべて税込です。</p>
                      <p>※箱根町在住の方は¥5,500〜</p>
                    </div>
                  </div>
                </div>

                <a
                  href="/booking"
                  className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-10 py-4 hover:opacity-90 transition-opacity"
                  style={{ fontSize: "18px", fontWeight: 400 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  宿泊プランを予約する
                </a>
              </div>

              <div>
                <Image src="/images/img-048.jpg" alt="DogHub箱根仙石原 完全個室" className="w-full h-auto" width={600} height={400} />
                <Image src="/images/img-035.png" alt="DogHub箱根仙石原 お預かりスペース" className="w-full h-auto mt-4" width={600} height={400} />
              </div>
            </div>
          </div>
        </section>

        {/* Model case */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>高級旅館 × DogHubのモデルケース</h2>
            <div className="border border-[#E5DDD8] bg-white p-8">
              <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>箱根吟遊 × DogHub 1泊2日プラン</h3>
              <p className="text-[#B87942] mb-6" style={{ fontSize: "14px", fontWeight: 400 }}>宿泊プラン ¥7,700〜</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[#3C200F] mb-3" style={{ fontSize: "16px", fontWeight: 400 }}>1日目</p>
                  <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                    <p>11:00 箱根到着・愛犬と仙石原を散策</p>
                    <p>12:00 DogHubカフェでランチ</p>
                    <p>14:00 DogHubにチェックイン</p>
                    <p>15:00 箱根吟遊にチェックイン</p>
                    <p>夕食・露天風呂を堪能</p>
                  </div>
                </div>
                <div>
                  <p className="text-[#3C200F] mb-3" style={{ fontSize: "16px", fontWeight: 400 }}>2日目</p>
                  <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                    <p>朝食・朝風呂</p>
                    <p>10:00 旅館チェックアウト</p>
                    <p>10:30 DogHubでお迎え</p>
                    <p>11:00 愛犬と仙石原すすき草原を散策</p>
                    <p>12:00 愛犬と一緒に帰宅</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby ryokans */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "26px", fontWeight: 400 }}>DogHub周辺の高級旅館・ホテル</h2>
            <p className="text-[#8F7B65] mb-8" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.8" }}>
              以下の旅館・ホテルはペット不可の施設です。DogHubに愛犬を預けてご宿泊いただけます。
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {ryokans.map((r) => (
                <div key={r.name} className="border border-[#E5DDD8] p-5">
                  <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "16px", fontWeight: 400 }}>{r.name}</h3>
                  <p className="text-[#B87942]" style={{ fontSize: "14px", fontWeight: 400 }}>{r.distance}</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>{r.area}エリア</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why DogHub for ryokan guests */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>旅館宿泊者に安心のポイント</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { title: "24時間スタッフ常駐", body: "夜間も宿直スタッフが常駐。ライブカメラで随時見守り、飼い主様も安心してお休みいただけます。" },
                { title: "完全個室でのびのび", body: "ケージではなく壁に囲まれた個室。わんちゃんがリラックスして過ごせる空間です。" },
                { title: "連泊も対応", body: "2泊3日の箱根旅行にも対応。連泊中もドッグランで毎日リフレッシュさせます。" },
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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/onsen" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>温泉 × ペット預かり</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>日帰り温泉を満喫</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/golf" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>ゴルフ × ペットホテル</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>早朝7時からお預かり</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/museum" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>美術館 × ペット預かり</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>仙石原の美術館めぐり</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/pethotel" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
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

        <section className="px-6 py-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto text-center">
            <Link href="/hakone" className="text-[#B87942] hover:underline" style={{ fontSize: "15px" }}>
              箱根 犬連れ旅行ガイド トップへ →
            </Link>
          </div>
        </section>

        {/* 関連記事 */}
        <section className="px-6 py-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="p-6 bg-[#F8F5F0] rounded-xl">
              <p className="text-[#3C200F] font-medium mb-2" style={{ fontSize: "16px" }}>あわせて読みたい</p>
              <div className="space-y-2">
                <Link href="/news/hakone-dog-friendly-hotels" className="block text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>
                  → 箱根で犬と泊まれる宿｜ペット可の宿リスト
                </Link>
                <Link href="/news/hakone-dog-hotel-cost-comparison" className="block text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>
                  → 犬と別々に泊まったほうがお得？
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
