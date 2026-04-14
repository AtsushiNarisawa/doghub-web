import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  title: "箱根の日帰り温泉×犬連れ｜愛犬はDogHubに預けて温泉を満喫｜仙石原",
  description: "箱根の日帰り温泉を犬連れで楽しみたい方へ。犬OKの温泉は限定的ですが、愛犬をDogHub箱根仙石原に預ければ自由に温泉を満喫できます。半日4時間¥3,300〜。仙石原・強羅・箱根湯本エリアの温泉施設へ好アクセス。",
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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "箱根で犬と一緒に入れる日帰り温泉はありますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ほぼありません。箱根湯寮の貸切風呂など一部でペット可プランはありますが、数は限定的で事前予約必須です。犬連れで気軽に箱根の日帰り温泉を楽しみたい方には、愛犬をDogHubに預けて温泉を楽しむスタイルが現実的です。"
      }
    },
    {
      "@type": "Question",
      "name": "DogHubに愛犬を預けて温泉に行く場合の料金は？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "日帰り温泉とランチなら半日プラン（4時間¥3,300）がちょうどいい時間配分です。1時間¥1,100〜のスポット利用も可能で、温泉だけサッと楽しむ使い方もできます。宿泊プランは¥7,700/泊〜。"
      }
    },
    {
      "@type": "Question",
      "name": "DogHubから近い日帰り温泉はどこですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "仙石原エリアなら車3〜5分で一の湯仙石原品の木・新館。小涌谷の森の湯やユネッサンは車15分、箱根湯本の天成園・箱根の湯は車20〜25分です。"
      }
    },
    {
      "@type": "Question",
      "name": "温泉の間、車の中で犬を待たせるのは大丈夫？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "おすすめできません。夏は短時間でも熱中症、冬は低温で体調を崩すリスクがあります。短時間でも駐車場に残すのは避け、ペットホテルに預けるか犬連れOKの場所で待つのが安全です。"
      }
    },
    {
      "@type": "Question",
      "name": "当日予約はできますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "WEB予約は翌日以降です。前日17時以降の翌日予約は仮予約として受付します。当日ご利用ご希望の場合はお電話（0460-80-0290）でご相談ください。"
      }
    }
  ]
};

export default function OnsenPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"箱根温泉 × ペットホテル",href:"/onsen"}]} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-019.jpg" alt="箱根の日帰り温泉と犬連れ" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 style={{ fontSize: "clamp(20px, 4.2vw, 38px)", fontWeight: 400, lineHeight: 1.4 }}>
              箱根の日帰り温泉×犬連れ
            </h1>
            <p className="mt-3 opacity-90" style={{ fontSize: "clamp(13px, 2vw, 16px)", fontWeight: 400, lineHeight: 1.7 }}>
              犬と入れる温泉は少ない。愛犬はDogHubに預けて、箱根の温泉を満喫する。
            </p>
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

        {/* 箱根の温泉事情セクション */}
        <section className="py-12 px-6 bg-[#F7F5F0]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 400, lineHeight: "1.5" }}>
              箱根の日帰り温泉、犬連れで入れるところはある？
            </h2>
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              正直に言うと、<b>箱根で犬と一緒に入れる温泉はほぼありません</b>。箱根湯寮の貸切風呂など一部でペット可プランもありますが、数は非常に限定的で、事前予約必須・料金も高め。「犬連れで気軽に日帰り温泉」は難しいのが実情です。
            </p>
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              車の中で待たせるのも、夏は熱中症・冬は低温のリスクがあります。でも、だからといって箱根の温泉を諦めるのはもったいない。
            </p>
            <p className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              うちのお客さまで一番多いのは「<b>犬はDogHubに預けて、飼い主さんだけ温泉を満喫する</b>」スタイル。半日4時間¥3,300〜で、日帰り温泉＋ランチがちょうど収まる時間配分です。
            </p>
          </div>
        </section>

        {/* Main content */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 400, lineHeight: "1.6" }}>
                  愛犬を預けて、箱根の日帰り温泉を自由に
                </h2>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  DogHub箱根仙石原は、箱根の犬連れ旅行を前提に設計されたペットホテル。日帰り温泉や観光の間だけ愛犬をお預かりします。
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  半日プラン（4時間 ¥3,300）で温泉を満喫した後、愛犬と一緒に仙石原を散策するのが人気の過ごし方。宿泊×温泉旅館の組み合わせも、犬連れ旅行の自由度を上げる定番プランです。
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

        {/* FAQ */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>箱根 犬連れ温泉 よくある質問</h2>
            <div className="space-y-6">
              <div className="border border-[#E5DDD8] p-6 rounded-sm">
                <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "17px", fontWeight: 500 }}>Q. 箱根で犬と一緒に入れる日帰り温泉はありますか？</h3>
                <p className="text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.9" }}>
                  ほぼありません。箱根湯寮の貸切風呂など一部でペット可プランはありますが、数は限定的で事前予約必須です。「犬連れで気軽に箱根の日帰り温泉」を探している方には、愛犬をDogHubに預けて温泉を楽しむスタイルが現実的です。
                </p>
              </div>
              <div className="border border-[#E5DDD8] p-6 rounded-sm">
                <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "17px", fontWeight: 500 }}>Q. DogHubに預けるとどのくらいの料金ですか？</h3>
                <p className="text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.9" }}>
                  日帰り温泉＋ランチなら半日プラン（4時間 ¥3,300）がちょうどいい時間配分です。1時間¥1,100〜のスポット利用も可能なので、「温泉だけサッと」という使い方もできます。宿泊プランは¥7,700/泊〜。
                </p>
              </div>
              <div className="border border-[#E5DDD8] p-6 rounded-sm">
                <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "17px", fontWeight: 500 }}>Q. DogHubから近い日帰り温泉はどこですか？</h3>
                <p className="text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.9" }}>
                  仙石原エリアなら車3〜5分で一の湯仙石原品の木・新館。小涌谷の森の湯やユネッサンは車15分、箱根湯本の天成園・箱根の湯は車20〜25分です。ページ下部の施設リストをご覧ください。
                </p>
              </div>
              <div className="border border-[#E5DDD8] p-6 rounded-sm">
                <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "17px", fontWeight: 500 }}>Q. 温泉の間、車の中で犬を待たせるのは大丈夫？</h3>
                <p className="text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.9" }}>
                  おすすめできません。夏は短時間でも熱中症、冬は低温で体調を崩すリスクがあります。短時間でも駐車場に残すのは避け、ペットホテルに預けるか、犬連れOKの場所で待つのが安全です。
                </p>
              </div>
              <div className="border border-[#E5DDD8] p-6 rounded-sm">
                <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "17px", fontWeight: 500 }}>Q. 当日予約はできますか？</h3>
                <p className="text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.9" }}>
                  WEB予約は翌日以降です（前日17時以降の翌日予約は仮予約として受付）。当日ご利用をご希望の場合はお電話（0460-80-0290）でご相談ください。
                </p>
              </div>
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
