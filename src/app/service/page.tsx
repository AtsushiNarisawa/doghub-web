import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "犬の一時預かり・宿泊サービス｜DogHub箱根仙石原 ペットホテル",
  description: "箱根仙石原のドッグホテル。一時預かり¥1,100〜/1時間・宿泊¥7,700〜。24時間スタッフ常駐、完全個室、ドッグラン併設。",
};

const features = [
  {
    num: "01",
    title: "観光施設などの\u200b目的地に近い",
    body: "箱根の山を登った仙石原に位置しているので、目的地のすぐ近くまで愛犬と一緒に過ごせます。また、強羅や芦ノ湖など、人気の観光地へのアクセスも良好です。DogHub箱根仙石原は好立地を活かし、愛犬と一緒に箱根を思う存分楽しめる環境を提供しています。",
    img: "https://static.wixstatic.com/media/a21f47_3ed9b14958dd4ff5a255f820f1e3f2ad~mv2.png/v1/fill/w_494,h_329,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.png",
    alt: "箱根の観光地マップ",
  },
  {
    num: "02",
    title: "２４時間スタッフ常駐",
    body: "当店では２４時間スタッフが常駐して、わんちゃんたちを見守ります。夜間も宿直のスタッフがおり、随時ライブカメラで様子を確認しておりますので、ご安心ください。",
    img: "https://static.wixstatic.com/media/a21f47_24d9346c3bd149d186f9bdc6f068211e~mv2.png/v1/fill/w_494,h_329,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.png",
    alt: "24時間スタッフ常駐",
  },
  {
    num: "03",
    title: "ストレスフリーな完全個室",
    body: "わんちゃん用個室は壁に囲まれた部屋でお預かりします。ケージやサークルのように狭く息苦しい思いをさせたり、慣れない環境でのひっかき等、ケガの心配が極力ないよう過ごしてもらいます。",
    img: "https://static.wixstatic.com/media/a21f47_83b3dead7b084aa3a8980879f5cadd9e~mv2.jpg/v1/fill/w_494,h_329,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg",
    alt: "完全個室のお部屋",
  },
  {
    num: "04",
    title: "専用ドッグラン併設",
    body: "ペットホテルを利用する際は、ドッグランも併設しており、安全な敷地内でリフレッシュしてもらいます。雨の苦手なわんちゃんでも、ドッグランには屋根付きのエリアもございますので、安心してご利用可能となっております。",
    img: "https://static.wixstatic.com/media/a21f47_2b218fae49a34d0b97ef9b0990fec251~mv2.jpg/v1/fill/w_494,h_329,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg",
    alt: "専用ドッグラン",
  },
];

export default function ServicePage() {
  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* Hero Banner */}
        <div className="relative">
          <img
            src="https://static.wixstatic.com/media/a21f47_01966bb1dd164cfa83b63d4e1e3a3cd0~mv2.jpg/v1/fill/w_1440,h_424,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg"
            alt="お預かりサービス"
            className="w-full object-cover"
            style={{ height: "clamp(180px, 30vw, 424px)" }}
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <p className="text-sm mb-2 opacity-80">/ お預かりサービス</p>
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
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "32px", fontWeight: 400 }}>DOG HOTEL</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  一時預かりも、宿泊も対応できる<br />ドッグホテル
                </h3>
                <p className="text-[#3C200F] mb-4" style={{ fontSize: "16px", fontWeight: 400 }}>箱根町で唯一のドッグホテル となります。</p>
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
                <img
                  src="https://static.wixstatic.com/media/a21f47_57b05fba0d8d434b92c073193341c680~mv2.png/v1/fill/w_621,h_603,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.png"
                  alt="DogHub お預かりスペース"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* KOWADARI */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-[1050px] mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-[#3C200F] mb-3" style={{ fontSize: "36px", fontWeight: 400, letterSpacing: "1.8px" }}>KOWADARI</h2>
              <p className="text-[#311908]" style={{ fontSize: "24px", fontWeight: 400 }}>DogHubの4つのこだわり</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
              {features.map((f) => (
                <div key={f.num}>
                  <img src={f.img} alt={f.alt} className="w-full h-auto object-cover" />
                  <div className="mt-4">
                    <p className="text-[#3C200F] mb-1" style={{ fontSize: "32px", fontWeight: 400 }}>{f.num}</p>
                    <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "24px", fontWeight: 400, lineHeight: "1.5" }}>{f.title}</h3>
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
              <div className="bg-white px-8 py-10 text-center">
                <h3 className="text-[#311908] mb-2" style={{ fontSize: "38.4px", fontWeight: 400, letterSpacing: "2.7px" }}>TEMPORARY SERVICE</h3>
                <h4 className="text-[#311908] mb-4" style={{ fontSize: "24px", fontWeight: 400 }}>一時お預かり</h4>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "1.8" }}>
                  旅行プランの中に組み合わせて、<br />箱根旅行をもっと自由に。
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "18px", fontWeight: 400, lineHeight: "2" }}>
                  1日：¥5,500/8時間<br />
                  半日：¥3,300/4時間<br />
                  スポット：¥1,100/1時間
                </p>
                <div className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  <p>通常プランのお預かり時間：9時-17時</p>
                  <p>早朝プランのお預かり時間：7時-15時</p>
                  <p>お預かり最終受付：15時</p>
                  <p>お引き取り最終：17時</p>
                  <p className="mt-2">※早朝プランは事前にご連絡お願いします。</p>
                </div>
                <a
                  href="https://airrsv.net/doghubhakone/calendar" target="_blank" rel="noopener noreferrer"
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
              <div className="bg-white px-8 py-10 text-center">
                <h3 className="text-[#311908] mb-2" style={{ fontSize: "38.4px", fontWeight: 400, letterSpacing: "2.7px" }}>PET HOTEL</h3>
                <h4 className="text-[#311908] mb-4" style={{ fontSize: "24px", fontWeight: 400 }}>宿泊プラン</h4>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "1.8" }}>
                  愛犬と泊まれる宿に空きがない。<br />
                  宿泊する宿は愛犬と泊まれない<br />
                  そんな時に。
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "18px", fontWeight: 400, lineHeight: "2" }}>
                  1泊：¥7,700-<br />
                  追加1時間あたり：¥1,100-
                </p>
                <div className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  <p>チェックイン：14時〜17時</p>
                  <p>チェックアウト：9時〜11時</p>
                  <p className="mt-2">
                    営業時間外のお預かり/受け取りに関しては、別途時間料金を頂戴いたします。
                    箱根町に在住する方々に関しては、利用料金が¥5,500-となります。
                  </p>
                </div>
                <a
                  href="https://airrsv.net/doghubhakone/calendar" target="_blank" rel="noopener noreferrer"
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
            <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>OPTION MENU</h2>
            <p className="text-[#8F7B65] mb-8" style={{ fontSize: "18px", fontWeight: 400 }}>オプション</p>
            <p className="text-[#8F7B65] mb-8" style={{ fontSize: "14px", fontWeight: 400 }}>※一時預かり、宿泊をご利用時に追加可能</p>
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <img
                  src="https://static.wixstatic.com/media/a21f47_0c4d1725107f4997b41cfb2104c63821~mv2.jpg/v1/fill/w_365,h_259,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg"
                  alt="お散歩"
                  className="w-full object-cover"
                  style={{ maxWidth: "365px", height: "auto", aspectRatio: "365/259" }}
                />
                <div className="mt-4">
                  <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "18px", fontWeight: 400 }}>お散歩</h3>
                  <p className="text-[#B87942]" style={{ fontSize: "16px", fontWeight: 400 }}>¥550-/1回</p>
                </div>
              </div>
              <div>
                <img
                  src="https://static.wixstatic.com/media/a21f47_9461ecf7cd244e1bb59d415aa83aea61~mv2.webp/v1/fill/w_366,h_259,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.webp"
                  alt="わんちゃんが利用するおもちゃや食べ物"
                  className="w-full object-cover"
                  style={{ maxWidth: "366px", height: "auto", aspectRatio: "366/259" }}
                />
                <div className="mt-4">
                  <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "18px", fontWeight: 400 }}>持ち物を忘れてしまった時に</h3>
                  <p className="text-[#B87942]" style={{ fontSize: "16px", fontWeight: 400 }}>¥220-</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>ご飯、おやつ、マナーウェアなども販売しています</p>
                </div>
              </div>
            </div>

            {/* Goods promo */}
            <div className="mt-12">
              <img
                src="https://static.wixstatic.com/media/a21f47_a4040d8f3f8d47c8ae08475c7917b51a~mv2.jpg/v1/crop/x_0,y_180,w_4032,h_844/fill/w_1164,h_244,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg"
                alt="DogHub箱根仙石原のグッズ一覧"
                className="w-full object-cover"
                style={{ maxWidth: "1164px", aspectRatio: "1164/244", margin: "0 auto" }}
              />
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
              <Link href="/guide" className="inline-flex items-center gap-2 border border-white text-white px-8 py-3 hover:bg-white hover:text-[#3C200F] transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>
                ご利用ガイド・注意事項はこちら →
              </Link>
              <Link href="/faq" className="inline-flex items-center gap-2 border border-white text-white px-8 py-3 hover:bg-white hover:text-[#3C200F] transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>
                よくある質問 →
              </Link>
            </div>
          </div>
        </section>

        {/* Reservation */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <a
              href="https://airrsv.net/doghubhakone/calendar" target="_blank" rel="noopener noreferrer"
              className="block w-full border border-[#3C200F] py-10 text-center hover:bg-[#F7F7F7] transition-colors"
            >
              <p className="text-[#3C200F] mb-2 flex items-center justify-center gap-3" style={{ fontSize: "clamp(24px,4vw,38.4px)", fontWeight: 400, letterSpacing: "2.7px" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> RESERVATION</p>
              <p className="text-[#8F7B65]" style={{ fontSize: "clamp(14px,2vw,20px)", fontWeight: 400 }}>DogHub箱根仙石原ご予約はこちら</p>
            </a>
          </div>
        </section>

        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
