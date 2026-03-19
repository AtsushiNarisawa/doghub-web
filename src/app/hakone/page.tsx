import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "箱根 犬連れ旅行ガイド｜犬と箱根を楽しむすべてがここに｜DogHub箱根仙石原",
  description: "箱根に犬連れで旅行するなら。犬OKスポット、ペット可の宿、犬連れランチ、ペットホテル、モデルコースなど箱根×犬の情報をまとめました。DogHub箱根仙石原は預かり・カフェ・ドッグランが一か所に。",
  alternates: { canonical: "/hakone" },
};

const scenes = [
  { href: "/golf", label: "ゴルフ × 預かり", desc: "早朝7時からお預かり対応。大箱根CC提携。", img: "/images/img-003.jpg" },
  { href: "/onsen", label: "温泉 × 預かり", desc: "温泉を楽しむ間、愛犬はDogHubへ。", img: "/images/img-096.jpg" },
  { href: "/museum", label: "美術館 × 預かり", desc: "ポーラ美術館まで車4分。", img: "/images/img-006.jpg" },
  { href: "/yunessun", label: "ユネッサン × 預かり", desc: "ユネッサンまで車約15分。", img: "/images/img-021.jpg" },
  { href: "/ryokan", label: "高級旅館 × 預かり", desc: "ペット不可の憧れの宿に泊まれる。", img: "/images/img-035.png" },
  { href: "/pethotel", label: "ペット可ホテル × 預かり", desc: "チェックイン前後の観光を自由に。", img: "/images/img-011.jpg" },
];

const articles = [
  { href: "/news/hakone-dog-trip-guide", label: "犬連れ旅行ガイド", desc: "犬と行けるスポット、モデルコース付き" },
  { href: "/news/hakone-dog-hotel-guide", label: "犬のホテルの選び方", desc: "預かりの種類と選び方のポイント" },
  { href: "/news/hakone-dog-lunch-guide", label: "犬連れランチガイド", desc: "室内OKのお店と楽しむコツ" },
  { href: "/news/hakone-dog-travel-model-course", label: "モデルコース集", desc: "日帰り3プラン＋1泊2日2プラン" },
  { href: "/news/hakone-dog-rainy-day", label: "雨の日の過ごし方", desc: "屋内スポットとペットホテル活用術" },
  { href: "/news/hakone-dog-hotel-cost-comparison", label: "別々に泊まるとお得？", desc: "ペット可の宿との料金比較" },
];

export default function HakonePage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"箱根 犬連れガイド",href:"/hakone"}]} />
        {/* Hero */}
        <div className="relative">
          <img src="/images/img-008.jpg" alt="箱根 犬連れ旅行" className="w-full object-cover" style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 style={{ fontSize: "clamp(24px, 4.5vw, 44px)", fontWeight: 400 }}>箱根 犬連れ旅行ガイド</h1>
            <p className="mt-2" style={{ fontSize: "clamp(14px, 2vw, 18px)", fontWeight: 400 }}>犬と箱根を楽しむすべてがここに</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>箱根 犬連れガイド</span>
          </p>
        </div>

        {/* Intro */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400 }}>箱根は犬連れ旅行に最高のエリアです</h2>
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              すすき草原のお散歩、芦ノ湖畔の散策、箱根神社で記念撮影…箱根には犬と一緒に楽しめるスポットがたくさんあります。
            </p>
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              一方で、温泉、美術館、ユネッサンなどペット不可の施設も多いのが現実。
              でもDogHub箱根仙石原をうまく使えば、犬連れでも箱根を100%楽しめます。
            </p>
            <p className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              このページでは、箱根×犬の情報をまとめました。シーン別の過ごし方、お役立ち記事、
              そしてDogHubのサービスまで、箱根犬連れ旅行のすべてがここにあります。
            </p>
          </div>
        </section>

        {/* Scene pages */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] text-center mb-3" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>SCENES</h2>
            <p className="text-[#311908] text-center mb-12" style={{ fontSize: "20px", fontWeight: 400 }}>シーン別の過ごし方</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {scenes.map((s) => (
                <Link key={s.href} href={s.href} className="block bg-white border border-[#E5DDD8] hover:border-[#B87942] transition-colors group overflow-hidden">
                  <img src={s.img} alt={s.label} className="w-full h-40 object-cover" />
                  <div className="p-5">
                    <h3 className="text-[#3C200F] mb-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "18px", fontWeight: 400 }}>{s.label}</h3>
                    <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>{s.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Articles */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] text-center mb-3" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>ARTICLES</h2>
            <p className="text-[#311908] text-center mb-12" style={{ fontSize: "20px", fontWeight: 400 }}>犬連れ箱根旅行のお役立ち記事</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <Link key={a.href} href={a.href} className="block border border-[#E5DDD8] p-6 hover:border-[#B87942] transition-colors group">
                  <h3 className="text-[#3C200F] mb-2 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "18px", fontWeight: 400 }}>{a.label}</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>{a.desc}</p>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/news" className="inline-flex items-center gap-2 text-[#3C200F] hover:text-[#B87942] transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>
                すべての記事を見る →
              </Link>
            </div>
          </div>
        </section>

        {/* DogHub services */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>DogHub箱根仙石原でできること</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6">
                <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "18px", fontWeight: 400 }}>ペットホテル</h3>
                <p className="text-[#8F7B65] mb-3" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>
                  宿泊¥7,700〜、半日¥3,300〜。24時間スタッフ常駐・個室・ドッグラン併設。
                </p>
                <Link href="/service" className="text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>料金・サービス →</Link>
              </div>
              <div className="bg-white p-6">
                <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "18px", fontWeight: 400 }}>犬連れカフェ</h3>
                <p className="text-[#8F7B65] mb-3" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>
                  室内で犬と食事OK。おむすび＆スープ。予約不要・頭数制限なし。
                </p>
                <Link href="/cafe" className="text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>カフェメニュー →</Link>
              </div>
              <div className="bg-white p-6">
                <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "18px", fontWeight: 400 }}>ドッグラン</h3>
                <p className="text-[#8F7B65] mb-3" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>
                  専用ドッグラン併設。屋根付きエリアあり。カフェ利用時も使えます。
                </p>
                <Link href="/dogrun" className="text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>ドッグラン →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Access */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400 }}>アクセス</h2>
            <p className="text-[#3C200F] mb-2" style={{ fontSize: "16px", fontWeight: 400 }}>DogHub箱根仙石原</p>
            <p className="text-[#8F7B65] mb-4" style={{ fontSize: "15px", fontWeight: 400 }}>〒250-0631 神奈川県足柄下郡箱根町仙石原928-15</p>
            <div className="grid sm:grid-cols-3 gap-4 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400 }}>
              <p>強羅から車で約10分</p>
              <p>芦ノ湖（桃源台）から車で約10分</p>
              <p>ユネッサンから車で約15分</p>
            </div>
            <div className="mt-6">
              <Link href="/access" className="text-[#B87942] hover:underline" style={{ fontSize: "15px" }}>詳しいアクセス情報 →</Link>
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
