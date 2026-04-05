import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  title: "箱根 犬連れ旅行ガイド｜犬と箱根を楽しむすべてがここに｜DogHub箱根仙石原",
  description: "箱根に犬連れで旅行するなら。犬OKスポット、ペット可の宿、犬連れランチ、ペットホテル、モデルコースなど箱根×犬の情報をまとめました。DogHub箱根仙石原は預かり・カフェ・ドッグランが一か所に。",
  alternates: { canonical: "/hakone" },
};

const scenes = [
  { href: "/golf", label: "ゴルフ × 預かり", desc: "早朝7時からお預かり対応。大箱根CC提携。", img: "/images/img-003.jpg", imgAlt: "箱根ゴルフ場の緑豊かなコース 愛犬を預けてプレーを満喫" },
  { href: "/onsen", label: "温泉 × 預かり", desc: "温泉を楽しむ間、愛犬はDogHubへ。", img: "/images/img-096.jpg", imgAlt: "箱根 犬のホテル DogHub箱根仙石原の宿泊プラン 温泉旅行の拠点に" },
  { href: "/museum", label: "美術館 × 預かり", desc: "ポーラ美術館まで車6分。", img: "/images/img-006.jpg", imgAlt: "箱根仙石原の美術館イメージ ポーラ美術館やガラスの森へのアクセス良好" },
  { href: "/yunessun", label: "ユネッサン × 預かり", desc: "ユネッサンまで車約15分。", img: "/images/img-021.jpg", imgAlt: "箱根ドッグラン DogHub箱根仙石原 ユネッサンへ行く間も愛犬が遊べる環境" },
  { href: "/ryokan", label: "高級旅館 × 預かり", desc: "ペット不可の憧れの宿に泊まれる。", img: "/images/img-035.png", imgAlt: "箱根ペットホテル DogHub箱根仙石原の完全個室 高級旅館宿泊中も愛犬が安心" },
  { href: "/pethotel", label: "ペット可ホテル × 預かり", desc: "チェックイン前後の観光を自由に。", img: "/images/img-011.jpg", imgAlt: "箱根ドッグラン DogHub箱根仙石原で2匹の犬が元気に遊ぶ様子" },
  { href: "/yumoto", label: "箱根湯本エリア", desc: "湯本から犬のホテルをお探しの方へ。", img: "/images/img-041.jpg", imgAlt: "DogHub箱根仙石原 箱根湯本からのアクセスも便利な犬のホテル" },
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
          <Image src="/images/img-008.jpg" alt="箱根 犬連れ旅行ガイド 愛犬と仙石原の自然の中を散歩する様子" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(180px, 30vw, 424px)" }} />
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
                  <Image src={s.img} alt="" className="w-full h-40 object-cover" width={600} height={300} />
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

        {/* FAQ */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>箱根 犬連れ旅行 よくある質問</h2>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  { "@type": "Question", name: "箱根で犬と一緒に行ける観光スポットは？", acceptedAnswer: { "@type": "Answer", text: "すすき草原（仙石原）、芦ノ湖畔の遊歩道、箱根神社、恩賜箱根公園などが犬連れOKです。一方、美術館（ポーラ、ガラスの森等）、温泉施設、ユネッサンはペット不可です。" }},
                  { "@type": "Question", name: "犬連れで箱根のレストランに入れますか？", acceptedAnswer: { "@type": "Answer", text: "テラス席のみ犬OKのお店はいくつかあります。室内で犬と食事できるお店は限られていますが、DogHub箱根仙石原のOMUSUBI & SOUP CAFEは室内犬同伴OKです。" }},
                  { "@type": "Question", name: "箱根に犬のペットホテルはありますか？", acceptedAnswer: { "@type": "Answer", text: "DogHub箱根仙石原が箱根エリアのペットホテルです。宿泊1泊¥7,700〜、半日預かり¥3,300〜。24時間スタッフ常駐・完全個室・ドッグラン併設。仙石原の中心にあり、強羅・芦ノ湖・ユネッサンなど主要観光地へアクセス良好です。" }},
                  { "@type": "Question", name: "犬連れの箱根旅行で車は必要ですか？", acceptedAnswer: { "@type": "Answer", text: "車での移動がおすすめです。箱根登山鉄道はキャリーバッグに入れれば犬も乗車可能ですが、観光の自由度を考えると車が一番便利です。" }},
                ],
              }) }}
            />
            <div className="space-y-4">
              {[
                { q: "箱根で犬と一緒に行ける観光スポットは？", a: "すすき草原（仙石原）、芦ノ湖畔の遊歩道、箱根神社、恩賜箱根公園などが犬連れOKです。一方、美術館（ポーラ、ガラスの森等）、温泉施設、ユネッサンはペット不可です。" },
                { q: "犬連れで箱根のレストランに入れますか？", a: "テラス席のみ犬OKのお店はいくつかあります。室内で犬と食事できるお店は限られていますが、DogHub箱根仙石原のOMUSUBI & SOUP CAFEは室内犬同伴OKです。" },
                { q: "箱根に犬のペットホテルはありますか？", a: "DogHub箱根仙石原が箱根エリアのペットホテルです。宿泊1泊¥7,700〜、半日預かり¥3,300〜。24時間スタッフ常駐・完全個室・ドッグラン併設。仙石原の中心にあり、強羅・芦ノ湖・ユネッサンなど主要観光地へアクセス良好です。" },
                { q: "犬連れの箱根旅行で車は必要ですか？", a: "車での移動がおすすめです。箱根登山鉄道はキャリーバッグに入れれば犬も乗車可能ですが、観光の自由度を考えると車が一番便利です。" },
              ].map((faq) => (
                <details key={faq.q} className="border border-[#E5DDD8] group">
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

        {/* 関連記事 */}
        <section className="px-6 py-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="p-6 bg-[#F8F5F0] rounded-xl">
              <p className="text-[#3C200F] font-medium mb-2" style={{ fontSize: "16px" }}>あわせて読みたい</p>
              <div className="space-y-2">
                <Link href="/news/hakone-dog-trip-guide" className="block text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>
                  → 箱根 犬連れ旅行ガイド｜1泊2日モデルコース
                </Link>
                <Link href="/news/hakone-dog-travel-model-course" className="block text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>
                  → 箱根 犬連れ旅行モデルコース｜日帰り＆1泊2日プラン
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
