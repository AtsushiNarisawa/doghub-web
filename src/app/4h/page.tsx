import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";
import { InstagramFollowLight } from "@/components/instagram-follow";

export const metadata: Metadata = {
  title: "箱根 半日預かり 4時間プラン｜DogHub箱根仙石原 ペットホテル",
  description: "箱根仙石原の犬の半日お預かりプラン。4時間¥3,300〜。温泉や美術館の間にちょこっとお預け。スポット利用¥1,100/1時間も。24時間スタッフ常駐。",
  alternates: { canonical: "/4h" },
};

const scenes = [
  {
    title: "ユネッサンを楽しむ間に",
    body: "箱根小涌園ユネッサンはペット同伴不可。DogHubから車で約15分。ユネッサンは移動含めると半日では足りないため、1日プラン（¥5,500）がおすすめです。",
    keyword: "ユネッサン ペット 預かり",
  },
  {
    title: "温泉旅館でランチ＆日帰り入浴",
    body: "箱根には魅力的な日帰り温泉がたくさん。愛犬をDogHubに預けて、ゆっくり温泉とお食事を楽しんだ後、愛犬と一緒に仙石原を散策するプランが人気です。",
    keyword: "箱根 温泉 犬 預かり",
  },
  {
    title: "美術館めぐりの間に",
    body: "ポーラ美術館（車4分）、箱根ガラスの森美術館（車3分）、箱根ラリック美術館（車2分）と、いずれもDogHubから近い距離です。",
    keyword: "箱根 美術館 犬",
  },
  {
    title: "宿泊プランの前後に組み合わせ",
    body: "宿泊のチェックアウト（11時）後、午後までもう少し預けたい場合、超過料金での延長も可能ですが、半日プランを組み合わせた方がお得になる場合があります。チェックイン（14時）前に朝から預けたい場合も同様です。",
    keyword: "",
  },
  {
    title: "ペット可の宿に泊まりながら、日中だけお預け",
    body: "レジーナリゾート箱根仙石原などペット可の施設に泊まっていても、チェックイン前やチェックアウト後に美術館・温泉・ユネッサンなどを楽しみたい方は多くいらっしゃいます。近隣のペット可宿泊施設にお泊まりのお客様にも多くご利用いただいており、「日中だけ預けたい」というご利用にぴったりです。",
    keyword: "",
  },
  {
    title: "ちょっとした用事の間に",
    body: "スポット利用なら¥1,100/1時間から。「2時間だけ預けたい」「ランチの間だけ」といったご利用も大歓迎です。",
    keyword: "",
  },
];

export default function FourHourPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"お預かりサービス",href:"/service"},{name:"半日お預かり",href:"/4h"}]} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "犬の半日お預かり（4時間）",
            description: "箱根仙石原の犬の半日お預かりプラン。4時間¥3,300〜。温泉や美術館の間にちょこっとお預け。スポット利用¥1,100/1時間も。24時間スタッフ常駐。",
            provider: {
              "@type": "LocalBusiness",
              name: "DogHub箱根仙石原",
              url: "https://dog-hub.shop",
            },
            areaServed: { "@type": "Place", name: "箱根町, 神奈川県" },
            offers: {
              "@type": "Offer",
              price: "3300",
              priceCurrency: "JPY",
              url: "https://dog-hub.shop/4h",
            },
          }) }}
        />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-020.jpg" alt="DogHub箱根仙石原 半日お預かり" className="w-full object-cover object-top" width={700} height={400} priority style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400 }}>半日お預かりプラン</h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <Link href="/service" className="hover:text-[#3C200F]">お預かりサービス</Link>
            <span className="mx-2"></span>
            <span>半日お預かりプラン</span>
          </p>
        </div>

        {/* Plan overview */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>TEMPORARY SERVICE</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  温泉も美術館も。<br />半日預けて、箱根をもっと自由に
                </h3>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  「この温泉に入りたいけど、わんちゃんは入れない」「ユネッサンに行きたいけど、愛犬をどうしよう」
                  そんな箱根旅行のお悩みを解決するのが、DogHub箱根仙石原の半日お預かりプランです。
                </p>
                <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  4時間¥3,300からご利用いただけます。スポット利用なら1時間¥1,100から。
                  日帰り旅行の中に組み合わせて、愛犬も飼い主様も箱根を満喫してください。
                </p>

                {/* Pricing */}
                <div className="bg-[#F7F7F7] p-8">
                  <h4 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>料金</h4>
                  <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "18px", fontWeight: 400, lineHeight: "2" }}>
                    <p>半日（4時間）：<span className="text-[#B87942]" style={{ fontSize: "24px" }}>¥3,300</span></p>
                    <p>スポット（1時間）：<span className="text-[#B87942]" style={{ fontSize: "24px" }}>¥1,100</span></p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E5DDD8] text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                    <p>お預かり時間：9時〜17時</p>
                    <p>受付時間：9時〜13時 ／ お引き取り最終：17時</p>
                    <p className="mt-2 text-[#8F7B65]" style={{ fontSize: "14px" }}>※表示料金はすべて税込です。</p>
                  </div>
                </div>

                <div className="mt-8">
                  <a
                    href="/booking"
                    className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-10 py-4 hover:opacity-90 transition-opacity"
                    style={{ fontSize: "18px", fontWeight: 400 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    半日プランを予約する
                  </a>
                </div>
              </div>

              <div>
                <Image src="/images/img-027.png" alt="DogHub箱根仙石原からの周辺マップ" className="w-full h-auto" width={600} height={400} />
                <Image src="/images/img-022.jpg" alt="DogHub箱根仙石原 ドッグラン" className="w-full h-auto mt-4" width={600} height={400} />
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
                  <p className="text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Model case */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>半日お預かりのモデルケース</h2>
            <div className="border border-[#E5DDD8]">
              <div className="bg-[#3C200F] px-6 py-3">
                <p className="text-white" style={{ fontSize: "16px", fontWeight: 400 }}>温泉もグルメもショッピングもそして愛犬も満足プラン</p>
              </div>
              <div className="p-6">
                <Image src="/images/img-040.png" alt="半日お預かり モデルケース タイムライン" className="w-full h-auto" width={600} height={400} />
              </div>
            </div>
          </div>
        </section>

        {/* Nearby spots */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>DogHubから近い観光スポット</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { name: "ポーラ美術館", time: "車で4分", href: "/spots" },
                { name: "箱根ガラスの森美術館", time: "車で3分", href: "/spots" },
                { name: "箱根ラリック美術館", time: "車で2分", href: "/spots" },
                { name: "仙石原すすき草原", time: "車で2分", href: "/spots" },
                { name: "箱根湿生花園", time: "車で3分", href: "/spots" },
                { name: "箱根小涌園ユネッサン", time: "車で15分", href: "/spots" },
              ].map((spot) => (
                <Link key={spot.name} href={spot.href} className="bg-white border border-[#E5DDD8] p-5 hover:bg-white/80 transition-colors">
                  <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "16px", fontWeight: 400 }}>{spot.name}</h3>
                  <p className="text-[#B87942]" style={{ fontSize: "14px", fontWeight: 400 }}>{spot.time}</p>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/spots" className="flex items-center gap-2 text-[#3C200F] hover:text-[#B87942] transition-colors group" style={{ fontSize: "16px", fontWeight: 400 }}>
                <span>おすすめスポット一覧を見る</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
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
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>ゴルフや1日観光にぴったり。朝預けて夕方お迎え。</p>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/stay" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
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

        {/* Instagram */}
        <section className="px-6 py-4 max-w-7xl mx-auto">
          <InstagramFollowLight />
        </section>

        <Reservation />
        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
