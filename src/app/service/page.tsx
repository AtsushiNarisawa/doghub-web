import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { ModelCase } from "@/components/model-case";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";
import { InstagramFollowLight } from "@/components/instagram-follow";

export const metadata: Metadata = {
  title: "箱根のペット ホテル｜犬の一時預かり・宿泊｜DogHub箱根仙石原",
  description: "箱根仙石原のペットホテル DogHub。犬の一時預かり¥1,100〜/1時間・宿泊¥7,700〜。24時間スタッフ常駐・完全個室・ドッグラン併設で安心。箱根観光中の愛犬のお預け先に。",
  alternates: { canonical: "/service" },
};

const features = [
  {
    num: "01",
    title: "観光施設などの\u200b目的地に近い",
    body: "箱根の山を登った仙石原に位置しているので、目的地のすぐ近くまで愛犬と一緒に過ごせます。また、強羅や芦ノ湖など、人気の観光地へのアクセスも良好です。DogHub箱根仙石原は好立地を活かし、愛犬と一緒に箱根を思う存分楽しめる環境を提供しています。",
    img: "/images/img-026.png",
    alt: "箱根の観光地マップ",
  },
  {
    num: "02",
    title: "２４時間スタッフ常駐",
    body: "当店では２４時間スタッフが常駐して、わんちゃんたちを見守ります。夜間も宿直のスタッフがおり、随時ライブカメラで様子を確認しておりますので、ご安心ください。",
    img: "/images/img-015.png",
    alt: "24時間スタッフ常駐",
  },
  {
    num: "03",
    title: "ストレスフリーな完全個室",
    body: "わんちゃん用個室は壁に囲まれた部屋でお預かりします。ケージやサークルのように狭く息苦しい思いをさせたり、慣れない環境でのひっかき等、ケガの心配が極力ないよう過ごしてもらいます。",
    img: "/images/img-048.jpg",
    alt: "完全個室のお部屋",
  },
  {
    num: "04",
    title: "専用ドッグラン併設",
    body: "ペットホテルを利用する際は、ドッグランも併設しており、安全な敷地内でリフレッシュしてもらいます。雨の苦手なわんちゃんでも、ドッグランには屋根付きのエリアもございますので、安心してご利用可能となっております。",
    img: "/images/img-021.jpg",
    alt: "専用ドッグラン",
  },
];

export default function ServicePage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"お預かりサービス",href:"/service"}]} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "犬の一時預かり・宿泊サービス",
            description: "箱根仙石原のドッグホテル。一時預かり¥1,100〜/1時間・宿泊¥7,700〜。24時間スタッフ常駐、完全個室、ドッグラン併設。",
            provider: {
              "@type": "LocalBusiness",
              name: "DogHub箱根仙石原",
              url: "https://dog-hub.shop",
            },
            areaServed: { "@type": "Place", name: "箱根町, 神奈川県" },
          }) }}
        />
        {/* Hero Banner */}
        <div className="relative">
          <Image src="/images/img-003.jpg" alt="お預かりサービス" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400 }}>お預かりサービス</h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>お預かりサービス</span>
          </p>
        </div>

        {/* DOG HOTEL intro */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 400 }}>DOG HOTEL</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 400, lineHeight: "1.6" }}>
                  一時預かりも、宿泊も対応できるドッグホテル
                </h3>
                <p className="text-[#3C200F] mb-2" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  箱根の山を登る間も一緒に過ごすことができます。
                </p>
                <p className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  例えば、一時預かりで温泉と、愛犬と散策をしたり、
                  宿泊プランで愛犬との旅行中にゴルフなどを楽しんだり。
                  当ホテルを活用して愛犬と箱根で充実した時間をお過ごしいただければと思います。
                </p>
              </div>
              <div>
                <Image src="/images/img-035.png" alt="DogHub お預かりスペース" className="w-full h-auto" width={600} height={400} />
              </div>
            </div>
          </div>
        </section>

        {/* KOWADARI */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-[1050px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-[#3C200F] mb-3" style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 400, letterSpacing: "1.8px" }}>KOWADARI</h2>
              <p className="text-[#311908]" style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 400 }}>DogHubの4つのこだわり</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 md:gap-y-10">
              {features.map((f) => (
                <div key={f.num}>
                  <Image src={f.img} alt="" className="w-full h-auto object-cover" width={700} height={400} />
                  <div className="mt-4">
                    <p className="text-[#3C200F] mb-1" style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 400 }}>{f.num}</p>
                    <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 400, lineHeight: "1.5" }}>{f.title}</h3>
                    <p className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "1.8" }}>{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-5">
              {/* TEMPORARY SERVICE */}
              <div className="bg-white px-4 sm:px-8 py-8 sm:py-10 text-center">
                <h3 className="text-[#311908] mb-2" style={{ fontSize: "clamp(24px, 5vw, 38.4px)", fontWeight: 400, letterSpacing: "2.7px" }}>TEMPORARY SERVICE</h3>
                <h4 className="text-[#311908] mb-4" style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 400 }}>一時お預かり</h4>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "1.8" }}>
                  旅行プランの中に組み合わせて、<br />箱根旅行をもっと自由に。
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "18px", fontWeight: 400, lineHeight: "2" }}>
                  1日：¥5,500/8時間<br />
                  半日：¥3,300/4時間<br />
                  スポット：¥1,100/1時間
                </p>
                <p className="text-[#8F7B65] mb-4" style={{ fontSize: "13px", fontWeight: 400 }}>※表示料金はすべて税込です。</p>
                <div className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  <p>お預かり時間：午前9時〜午後5時</p>
                  <p>早朝対応：午前7時〜（1日プランのみ）</p>
                  <p>お預かり最終受付：15時 ／ お引き取り最終：17時</p>
                </div>
                <a
                  href="/booking"
                  className="flex items-center justify-center gap-2 w-full border border-[#C2C2C2] bg-white text-[#3C200F] py-4 hover:bg-[#F7F7F7] transition-colors rounded-[2px]"
                  style={{ fontSize: "18px", fontWeight: 400 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg><span>このプランで予約する</span>
                </a>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Link href="/4h" className="text-[#3C200F] hover:text-[#B87942] transition-colors group" style={{ fontSize: "14px", fontWeight: 400 }}>
                    半日プラン詳細 <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                  <Link href="/8h" className="text-[#3C200F] hover:text-[#B87942] transition-colors group" style={{ fontSize: "14px", fontWeight: 400 }}>
                    1日プラン詳細 <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>

              {/* PET HOTEL */}
              <div className="bg-white px-4 sm:px-8 py-8 sm:py-10 text-center">
                <h3 className="text-[#311908] mb-2" style={{ fontSize: "clamp(24px, 5vw, 38.4px)", fontWeight: 400, letterSpacing: "2.7px" }}>PET HOTEL</h3>
                <h4 className="text-[#311908] mb-4" style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 400 }}>宿泊プラン</h4>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "1.8" }}>
                  愛犬と泊まれる宿に空きがない。<br />
                  宿泊する宿は愛犬と泊まれない<br />
                  そんな時に。
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "18px", fontWeight: 400, lineHeight: "2" }}>
                  1泊：¥7,700-<br />
                  追加1時間あたり：¥1,100-
                </p>
                <p className="text-[#8F7B65] mb-4" style={{ fontSize: "13px", fontWeight: 400 }}>※表示料金はすべて税込です。</p>
                <div className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  <p>チェックイン：14時〜17時</p>
                  <p>チェックアウト：9時〜11時</p>
                  <p className="mt-2">
                    営業時間外のお預かり/受け取りに関しては、別途時間料金を頂戴いたします。
                    箱根町に在住する方々に関しては、利用料金が¥5,500-となります。
                  </p>
                </div>
                <a
                  href="/booking"
                  className="flex items-center justify-center gap-2 w-full bg-[#3C200F] border border-[#C2C2C2] text-white py-4 hover:opacity-90 transition-opacity rounded-[2px]"
                  style={{ fontSize: "18px", fontWeight: 400 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg><span>このプランで予約する</span>
                </a>
                <div className="mt-4">
                  <Link href="/stay" className="text-[#3C200F] hover:text-[#B87942] transition-colors group" style={{ fontSize: "14px", fontWeight: 400 }}>
                    宿泊プラン詳細 <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OPTION MENU */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 400, letterSpacing: "1.6px" }}>OPTION MENU</h2>
            <p className="text-[#8F7B65] mb-8" style={{ fontSize: "18px", fontWeight: 400 }}>オプション</p>
            <p className="text-[#8F7B65] mb-8" style={{ fontSize: "14px", fontWeight: 400 }}>※一時預かり、宿泊をご利用時に追加可能</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              <div>
                <Image src="/images/img-008.jpg" alt="お散歩" className="w-full object-cover rounded" width={700} height={400} style={{ aspectRatio: "4/3" }} />
                <div className="mt-3">
                  <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "18px", fontWeight: 400 }}>お散歩</h3>
                  <p className="text-[#B87942]" style={{ fontSize: "16px", fontWeight: 400 }}>¥550-/1回</p>
                </div>
              </div>
              <div>
                <Image src="/images/img-052.webp" alt="わんちゃんが利用するおもちゃや食べ物" className="w-full object-cover rounded" width={700} height={400} style={{ aspectRatio: "4/3" }} />
                <div className="mt-3">
                  <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "18px", fontWeight: 400 }}>持ち物を忘れてしまった時に</h3>
                  <p className="text-[#B87942]" style={{ fontSize: "16px", fontWeight: 400 }}>¥220-</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>ご飯、おやつ、マナーウェアなども販売しています</p>
                </div>
              </div>
            </div>

            {/* Goods promo */}
            <div className="mt-12 max-w-4xl mx-auto">
              <Image src="/images/img-057.jpg" alt="DogHub箱根仙石原のグッズ一覧" className="w-full object-cover rounded" width={700} height={400} style={{ aspectRatio: "16/9" }} />
              <div className="mt-6 text-center">
                <p className="text-[#3C200F] mb-3" style={{ fontSize: "16px", fontWeight: 400 }}>わんちゃん向けのグッズ・雑貨なども販売中です</p>
                <Link href="/cafe" className="flex items-center justify-center gap-2 text-black hover:text-[#B87942] transition-colors group" style={{ fontSize: "16px", fontWeight: 400 }}>
                  <span>詳しくはこちら</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* はじめての方バナー */}
        <section className="bg-[#3C200F] py-10 px-6">
          <div className="max-w-7xl mx-auto text-center text-white">
            <p className="mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>はじめてご利用の方はご予約前に必ずこちらをご覧ください</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/guide" className="inline-flex items-center gap-2 border border-white text-white px-4 sm:px-8 py-4 hover:bg-white hover:text-[#3C200F] transition-colors min-h-11" style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 400 }}>
                ご利用ガイド・注意事項はこちら →
              </Link>
              <Link href="/faq" className="inline-flex items-center gap-2 border border-white text-white px-4 sm:px-8 py-4 hover:bg-white hover:text-[#3C200F] transition-colors min-h-11" style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 400 }}>
                よくある質問 →
              </Link>
            </div>
          </div>
        </section>

        {/* Instagram */}
        <section className="px-6 py-4 max-w-7xl mx-auto">
          <InstagramFollowLight />
        </section>

        {/* Reservation */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <a
              href="/booking"
              className="block w-full border border-[#3C200F] py-10 text-center hover:bg-[#F7F7F7] transition-colors"
            >
              <p className="text-[#3C200F] mb-2 flex items-center justify-center gap-3" style={{ fontSize: "clamp(24px,4vw,38.4px)", fontWeight: 400, letterSpacing: "2.7px" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> RESERVATION</p>
              <p className="text-[#8F7B65]" style={{ fontSize: "clamp(14px,2vw,20px)", fontWeight: 400 }}>DogHub箱根仙石原ご予約はこちら</p>
            </a>
          </div>
        </section>

        <ModelCase />
        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
