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
  title: "箱根 犬のホテル 宿泊・お預かり｜24時間常駐・完全個室｜DogHub箱根仙石原",
  description: "箱根で犬のホテルをお探しなら、DogHub箱根仙石原。宿泊1泊¥7,700〜、日帰り預かり¥3,300〜。24時間スタッフ常駐・完全個室・専用ドッグラン併設。ペット不可の旅館に泊まる時、ゴルフや温泉の間にも。箱根仙石原の犬専門ペットホテル。",
  alternates: { canonical: "/stay" },
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
    title: "1日2回以上のお散歩付き",
    body: "スタッフが朝夕のお散歩にお連れします。屋根付きドッグランもあり、雨の日でも安心です。",
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
    body: "1泊お預けして、翌日チェックアウト（11時）後もそのまま預けたい場合、超過料金での延長も可能ですが、半日や1日のお預かりプランを組み合わせた方がお得になる場合があります。連泊にも対応していますので、2泊3日の箱根旅行でも安心です。",
  },
];

export default function StayPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"お預かりサービス",href:"/service"},{name:"宿泊プラン",href:"/stay"}]} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "犬の宿泊プラン",
            description: "箱根仙石原の犬の宿泊ペットホテル。1泊¥7,700〜。24時間スタッフ常駐・完全個室・ドッグラン併設。愛犬と泊まれる宿に空きがない時、宿泊する宿がペット不可の時に。チェックイン14時〜、チェックアウト〜11時。",
            provider: {
              "@type": "LocalBusiness",
              name: "DogHub箱根仙石原",
              url: "https://dog-hub.shop",
            },
            areaServed: { "@type": "Place", name: "箱根町, 神奈川県" },
            offers: {
              "@type": "Offer",
              price: "7700",
              priceCurrency: "JPY",
              url: "https://dog-hub.shop/stay",
            },
          }) }}
        />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-096.jpg" alt="箱根 犬のホテル DogHub箱根仙石原の宿泊プラン 愛犬を預けて箱根旅行を満喫" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(24px, 4.5vw, 44px)", fontWeight: 400 }}>箱根の犬のホテル<br /><span style={{ fontSize: "clamp(16px, 2.5vw, 24px)" }}>宿泊・お預かり</span></h1>
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
                      ※表示料金はすべて税込です。<br />
                      ※営業時間外のお預かり/受け取りは別途時間料金あり<br />
                      ※箱根町在住の方は¥5,500〜
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <a
                    href="/booking"
                    className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-10 py-4 hover:opacity-90 transition-opacity"
                    style={{ fontSize: "18px", fontWeight: 400 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    宿泊プランを予約する
                  </a>
                </div>
              </div>

              <div>
                <Image src="/images/img-035.png" alt="箱根ペットホテル DogHub箱根仙石原の完全個室 犬がリラックスして過ごせる空間" className="w-full h-auto" width={600} height={400} />
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
                <Image src="/images/img-028.png" alt="箱根ペットホテル宿泊プランのモデルケース 1泊2日のタイムライン例" className="w-full h-auto" width={600} height={400} />
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

        {/* Why Hakone needs a dog hotel */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>箱根で犬のホテルが必要な理由</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  箱根は関東屈指の人気観光地ですが、犬連れの旅行者にとって意外なハードルがあります。
                  箱根吟遊、富士屋ホテル、強羅花壇など人気の高級旅館はほとんどがペット不可。
                  温泉施設や美術館も犬の入場を認めていない施設が大半です。
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  「せっかくの箱根旅行なのに、愛犬を車の中で待たせるのはかわいそう…」
                  「ペット可の宿に泊まっても、チェックイン前後の観光が制限される…」
                  そんなお悩みを解決するのが、DogHub箱根仙石原です。
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { title: "ペット不可の旅館に泊まりたい時", desc: "愛犬はDogHubで一泊、飼い主様は憧れの旅館を満喫" },
                  { title: "温泉・ユネッサンを楽しみたい時", desc: "温泉なら半日¥3,300、ユネッサンなら1日¥5,500で自由に" },
                  { title: "ゴルフの朝、早朝から預けたい時", desc: "朝7時からお預かり対応。大箱根CC提携" },
                  { title: "美術館をゆっくり巡りたい時", desc: "ポーラ美術館から車6分。預けて美術館めぐり" },
                ].map((item) => (
                  <div key={item.title} className="border border-[#E5DDD8] p-4">
                    <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "16px", fontWeight: 400 }}>{item.title}</h3>
                    <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* DogHub difference */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>DogHub箱根仙石原が選ばれる理由</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" style={{ fontSize: "15px" }}>
                <thead>
                  <tr className="border-b-2 border-[#3C200F]">
                    <th className="py-3 px-4 text-[#3C200F]" style={{ fontWeight: 400 }}>比較項目</th>
                    <th className="py-3 px-4 text-[#B87942]" style={{ fontWeight: 400 }}>DogHub箱根仙石原</th>
                    <th className="py-3 px-4 text-[#8F7B65]" style={{ fontWeight: 400 }}>一般的なペットホテル</th>
                  </tr>
                </thead>
                <tbody className="text-[#3C200F]">
                  {[
                    ["お預かり環境", "完全個室（壁で仕切り）", "ケージ・サークル"],
                    ["スタッフ体制", "24時間常駐", "夜間無人の場合あり"],
                    ["運動環境", "専用ドッグラン併設", "散歩のみ or なし"],
                    ["早朝対応", "朝7時から可能", "9時〜が一般的"],
                    ["立地", "箱根仙石原（観光地の中心）", "市街地が多い"],
                    ["カフェ併設", "犬同伴ランチOK", "なし"],
                    ["料金（1泊）", "¥7,700〜", "¥5,000〜¥15,000"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-b border-[#E5DDD8]">
                      <td className="py-3 px-4" style={{ fontWeight: 400 }}>{row[0]}</td>
                      <td className="py-3 px-4 text-[#B87942]" style={{ fontWeight: 400 }}>{row[1]}</td>
                      <td className="py-3 px-4 text-[#8F7B65]" style={{ fontWeight: 400 }}>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>箱根の犬のホテル よくある質問</h2>
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  { "@type": "Question", name: "箱根で犬を預けられるペットホテルはありますか？", acceptedAnswer: { "@type": "Answer", text: "DogHub箱根仙石原では、宿泊（1泊¥7,700〜）と日帰り預かり（半日¥3,300〜）の両方に対応しています。24時間スタッフ常駐、完全個室、専用ドッグラン併設で、安心してお預けいただけます。" }},
                  { "@type": "Question", name: "箱根のペット不可の旅館に泊まる場合、犬はどうすればいいですか？", acceptedAnswer: { "@type": "Answer", text: "DogHub箱根仙石原の宿泊プランをご利用ください。チェックイン14時〜、チェックアウト〜11時。愛犬を完全個室でお預かりし、飼い主様はペット不可の旅館での特別な時間をお楽しみいただけます。" }},
                  { "@type": "Question", name: "犬のホテルの料金はいくらですか？", acceptedAnswer: { "@type": "Answer", text: "宿泊1泊¥7,700〜、1日預かり（8時間）¥5,500、半日預かり（4時間）¥3,300、スポット利用1時間¥1,100〜です。箱根町在住の方は宿泊¥5,500〜の地元割引もございます。すべて税込料金です。" }},
                  { "@type": "Question", name: "早朝からの預かりは可能ですか？", acceptedAnswer: { "@type": "Answer", text: "はい、朝7時からお預かり対応しています。大箱根カントリークラブとも提携しており、早朝のゴルフ前にお預けいただくお客様も多くいらっしゃいます。" }},
                  { "@type": "Question", name: "犬種や体重の制限はありますか？", acceptedAnswer: { "@type": "Answer", text: "体重15kgまでの犬をお預かりしています。小型犬・中型犬が対象です。犬種による制限は特にございません。" }},
                  { "@type": "Question", name: "当日の予約は可能ですか？", acceptedAnswer: { "@type": "Answer", text: "空きがあれば当日予約も承っております。ただし、繁忙期（GW、夏休み、年末年始、紅葉シーズン）は満室になることが多いため、お早めのご予約をおすすめします。" }},
                ],
              }) }}
            />
            <div className="space-y-4">
              {[
                { q: "箱根で犬を預けられるペットホテルはありますか？", a: "DogHub箱根仙石原では、宿泊（1泊¥7,700〜）と日帰り預かり（半日¥3,300〜）の両方に対応しています。24時間スタッフ常駐、完全個室、専用ドッグラン併設で、安心してお預けいただけます。" },
                { q: "箱根のペット不可の旅館に泊まる場合、犬はどうすればいいですか？", a: "DogHub箱根仙石原の宿泊プランをご利用ください。チェックイン14時〜、チェックアウト〜11時。愛犬を完全個室でお預かりし、飼い主様はペット不可の旅館での特別な時間をお楽しみいただけます。" },
                { q: "犬のホテルの料金はいくらですか？", a: "宿泊1泊¥7,700〜、1日預かり（8時間）¥5,500、半日預かり（4時間）¥3,300、スポット利用1時間¥1,100〜です。箱根町在住の方は宿泊¥5,500〜の地元割引もございます。すべて税込料金です。" },
                { q: "早朝からの預かりは可能ですか？", a: "はい、朝7時からお預かり対応しています。大箱根カントリークラブとも提携しており、早朝のゴルフ前にお預けいただくお客様も多くいらっしゃいます。" },
                { q: "犬種や体重の制限はありますか？", a: "体重15kgまでの犬をお預かりしています。小型犬・中型犬が対象です。犬種による制限は特にございません。" },
                { q: "当日の予約は可能ですか？", a: "空きがあれば当日予約も承っております。ただし、繁忙期（GW、夏休み、年末年始、紅葉シーズン）は満室になることが多いため、お早めのご予約をおすすめします。" },
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

        {/* Related articles */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>箱根の犬連れ旅行に役立つ記事</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/news/hakone-dog-trip-guide" className="block bg-white border border-[#E5DDD8] p-6 hover:shadow-md transition-shadow group">
                <p className="text-[#B87942] mb-2" style={{ fontSize: "13px", fontWeight: 400 }}>犬連れ旅行ガイド</p>
                <h3 className="text-[#3C200F] mb-2 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>箱根 犬連れ旅行ガイド</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>犬と一緒に行ける箱根のスポットや注意点をまとめました</p>
              </Link>
              <Link href="/news/hakone-pet-hotel-comparison" className="block bg-white border border-[#E5DDD8] p-6 hover:shadow-md transition-shadow group">
                <p className="text-[#B87942] mb-2" style={{ fontSize: "13px", fontWeight: 400 }}>ペットホテル選び</p>
                <h3 className="text-[#3C200F] mb-2 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>箱根のペットホテル比較</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>箱根エリアのペットホテルの特徴を比較しました</p>
              </Link>
              <Link href="/news/hakone-dog-friendly-hotels" className="block bg-white border border-[#E5DDD8] p-6 hover:shadow-md transition-shadow group">
                <p className="text-[#B87942] mb-2" style={{ fontSize: "13px", fontWeight: 400 }}>ペット可の宿</p>
                <h3 className="text-[#3C200F] mb-2 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>箱根のペット可旅館・ホテル</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>犬と泊まれる箱根の宿を紹介します</p>
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
                <Link href="/news/hakone-dog-hotel-guide" className="block text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>
                  → 箱根で犬のホテルを探している方へ｜預かり・宿泊・選び方のポイント
                </Link>
                <Link href="/news/hakone-dog-friendly-hotels" className="block text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>
                  → 箱根で犬と泊まれる宿｜ペット可の宿リスト＆ペット不可の宿を楽しむ方法
                </Link>
                <Link href="/news/hakone-dog-hotel-cost-comparison" className="block text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>
                  → 犬と別々に泊まったほうがお得？｜箱根旅行の宿泊費を比べてみた
                </Link>
              </div>
            </div>
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
