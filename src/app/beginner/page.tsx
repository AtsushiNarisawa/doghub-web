import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "初めての方へ｜DogHub箱根仙石原 ペットホテル＆カフェ",
  description: "DogHub箱根仙石原を初めてご利用の方へ。ご利用の流れ、料金プラン、持ち物、よくある質問をまとめました。24時間スタッフ常駐・完全個室・ドッグラン併設の犬専門ペットホテルです。",
  alternates: { canonical: "/beginner" },
};

const steps = [
  { num: "1", title: "ご予約", desc: "オンラインまたはお電話でご予約ください。当日予約も空きがあれば可能です。繁忙期は早めのご予約がおすすめです。" },
  { num: "2", title: "チェックイン", desc: "ご来店いただき、わんちゃんをお預けいただきます。体調やご飯の量、お散歩の希望などをスタッフにお伝えください。" },
  { num: "3", title: "お預かり中", desc: "個室でのんびり過ごしたり、ドッグランで遊んだり。スタッフが見守りながらお世話します。" },
  { num: "4", title: "チェックアウト", desc: "お迎えにいらしてください。お預かり中の様子をスタッフからお伝えします。カフェでランチもどうぞ。" },
];

const faqs = [
  { q: "どんな犬でも預けられますか？", a: "体重15kgまでの犬をお預かりしています。小型犬・中型犬が対象です。犬種の制限は特にありません。" },
  { q: "予防接種は必要ですか？", a: "狂犬病予防接種証明書と混合ワクチン接種証明書（1年以内）が必要です。ご来店時にご提示ください。" },
  { q: "何を持っていけばいいですか？", a: "予防接種証明書、リード、普段のフード（1食分ずつ小分け）をお持ちください。お気に入りのおもちゃやブランケットもあると安心です。ケージ・食器はこちらで用意があります。" },
  { q: "当日予約はできますか？", a: "空きがあれば当日でもお受けしています。ただし繁忙期（GW、夏休み、年末年始、紅葉シーズン）は満室になることが多いため、お早めに。" },
  { q: "カフェだけの利用もできますか？", a: "もちろんです。ペットホテルを使わなくても、カフェとドッグランだけのご利用も歓迎です。予約不要です。" },
  { q: "営業時間は？", a: "ペットホテルは9:00〜17:00（早朝7時からの預かりも対応）。カフェは11:00〜17:00。定休日は水曜・木曜です。" },
];

export default function BeginnerPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"初めての方へ",href:"/beginner"}]} />
        {/* Hero */}
        <div className="relative">
          <img src="/images/img-009.jpg" alt="DogHub箱根仙石原 初めての方へ" className="w-full object-cover" style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 style={{ fontSize: "clamp(24px, 4.5vw, 44px)", fontWeight: 400 }}>初めての方へ</h1>
            <p className="mt-2" style={{ fontSize: "clamp(14px, 2vw, 18px)", fontWeight: 400 }}>DogHub箱根仙石原のご利用案内</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>初めての方へ</span>
          </p>
        </div>

        {/* What is DogHub */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400 }}>DogHub箱根仙石原とは</h2>
              <p className="text-[#3C200F] mb-4" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                箱根仙石原にある、犬専門のペットホテル＆カフェです。
                宿泊・日帰り預かりの両方に対応しており、犬同伴OKのカフェと専用ドッグランも併設しています。
              </p>
              <p className="text-[#3C200F] mb-4" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                箱根旅行中のペット預かりはもちろん、カフェやドッグランだけのご利用も歓迎しています。
              </p>
              <div className="space-y-2 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                <p>24時間スタッフ常駐</p>
                <p>壁で仕切った完全個室（ケージではありません）</p>
                <p>専用ドッグラン併設（屋根付きエリアあり）</p>
                <p>犬同伴OKのカフェ（OMUSUBI & SOUP CAFE）</p>
                <p>早朝7時からお預かり対応</p>
                <p>体重15kgまでの犬が対象</p>
              </div>
            </div>
            <div>
              <img src="/images/img-041.jpg" alt="DogHub箱根仙石原の施設" className="w-full h-auto" />
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] text-center mb-12" style={{ fontSize: "26px", fontWeight: 400 }}>料金プラン</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: "宿泊", price: "¥7,700〜", desc: "1泊。チェックイン14時〜、チェックアウト〜11時", href: "/stay" },
                { name: "1日預かり", price: "¥5,500", desc: "8時間。ゴルフや丸一日観光に", href: "/8h" },
                { name: "半日預かり", price: "¥3,300〜", desc: "4時間。温泉や美術館の間に", href: "/4h" },
                { name: "スポット", price: "¥1,100〜", desc: "1時間から。ちょっとだけ預けたい時に", href: "/service" },
              ].map((plan) => (
                <Link key={plan.name} href={plan.href} className="block bg-white border border-[#E5DDD8] p-6 hover:border-[#B87942] transition-colors group text-center">
                  <p className="text-[#B87942] mb-1" style={{ fontSize: "14px", fontWeight: 400 }}>{plan.name}</p>
                  <p className="text-[#3C200F] mb-3" style={{ fontSize: "28px", fontWeight: 400 }}>{plan.price}</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400, lineHeight: "1.6" }}>{plan.desc}</p>
                </Link>
              ))}
            </div>
            <p className="text-center text-[#8F7B65] mt-4" style={{ fontSize: "13px", fontWeight: 400 }}>※すべて税込料金です。箱根町在住の方は宿泊¥5,500〜の地元割引あり。</p>
          </div>
        </section>

        {/* Flow */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] text-center mb-12" style={{ fontSize: "26px", fontWeight: 400 }}>ご利用の流れ</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s) => (
                <div key={s.num} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-[#3C200F] text-white flex items-center justify-center" style={{ fontSize: "20px", fontWeight: 400, borderRadius: "50%" }}>{s.num}</div>
                  <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>{s.title}</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a href="/booking" className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-10 py-4 hover:opacity-90 transition-opacity" style={{ fontSize: "18px", fontWeight: 400 }}>
                ご予約はこちら
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] text-center mb-12" style={{ fontSize: "26px", fontWeight: 400 }}>よくある質問</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((faq) => (
                <details key={faq.q} className="border border-[#E5DDD8] bg-white group">
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
            <div className="text-center mt-8">
              <Link href="/faq" className="text-[#B87942] hover:underline" style={{ fontSize: "15px" }}>もっとよくある質問を見る →</Link>
            </div>
          </div>
        </section>

        {/* Related pages */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>もっと詳しく知りたい方へ</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/guide" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <h3 className="text-[#3C200F] mb-2 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "18px", fontWeight: 400 }}>ご利用ガイド・注意事項</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>ご予約方法や持ち物、注意事項の詳細</p>
              </Link>
              <Link href="/service" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <h3 className="text-[#3C200F] mb-2 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "18px", fontWeight: 400 }}>料金・サービス</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>各プランの詳細と追加オプション</p>
              </Link>
              <Link href="/news/pet-hotel-first-time-tips" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <h3 className="text-[#3C200F] mb-2 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "18px", fontWeight: 400 }}>初めてのペットホテル</h3>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>預ける前に知っておきたいこと</p>
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
