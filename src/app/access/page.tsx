import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  title: "アクセス・店舗情報｜DogHub箱根仙石原 ペットホテル＆カフェ",
  description: "DogHub箱根仙石原の店舗情報・アクセス。神奈川県足柄下郡箱根町仙石原928-15。ドッグホテル営業時間9時〜17時、カフェ11時〜17時、定休日水木。",
  alternates: { canonical: "/access" },
};

export default function AccessPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"店舗情報・アクセス",href:"/access"}]} />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-064.jpg" alt="店舗情報" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(140px, 18vw, 249px)" }} />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400 }}>店舗情報／アクセス</h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>店舗情報</span>
          </p>
        </div>

        {/* Basic info */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 md:gap-12">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "clamp(22px, 4vw, 26px)", fontWeight: 400, lineHeight: "1.6" }}>
                  DogHub箱根仙石原<br className="sm:hidden" />ペットホテル ／ おむすび＆スープカフェ
                </h2>

                <div className="space-y-4 text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400 }}>
                  <p>神奈川県足柄下郡箱根町仙石原928-15</p>
                  <a href="tel:0460800290" className="block text-[#3C200F] hover:text-[#B87942]" style={{ fontSize: "18px" }}>0460-80-0290</a>
                  <a href="mailto:info@dog-hub.shop" className="block text-[#3C200F] hover:text-[#B87942]" style={{ fontSize: "18px" }}>info@dog-hub.shop</a>
                </div>

                <div className="mt-8 space-y-2 text-[#3C200F]" style={{ fontSize: "18px", fontWeight: 400 }}>
                  <div>
                    <p className="mb-1">ドッグホテル</p>
                    <p>営業時間：午前9時〜午後5時</p>
                  </div>
                  <div>
                    <p className="mb-1">カフェ</p>
                    <p>営業時間：午前11時〜午後5時</p>
                  </div>
                  <p>定休日：水曜・木曜</p>
                  <p className="mt-3" style={{ fontSize: "16px" }}>
                    ※不在にしている場合もございますので、その際はメールおよび公式LINEよりお問い合わせお願いいたします。担当者よりご連絡させていただきます。
                  </p>
                </div>

                <div className="mt-8">
                  <a
                    href="/booking"
                    className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-4 hover:bg-[#3C200F] hover:text-white transition-colors min-h-11"
                    style={{ fontSize: "16px", fontWeight: 400 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> ペットホテル予約
                  </a>
                </div>
              </div>

              {/* Map & exterior photo */}
              <div className="space-y-6">
                {/* Google Maps embed */}
                <div className="w-full" style={{ height: "300px" }}>
                  <iframe
                    src="https://www.google.com/maps?q=DogHub%E7%AE%B1%E6%A0%B9%E4%BB%99%E7%9F%B3%E5%8E%9F&ll=35.265472,139.011744&z=16&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="DogHub箱根仙石原 地図"
                  />
                </div>
                <Image src="/images/img-033.jpg" alt="DogHub箱根仙石原の外観" className="w-full h-auto" width={600} height={400} />
              </div>
            </div>
          </div>
        </section>

        {/* Access details */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 400, letterSpacing: "1.6px" }}>ACCESS</h2>
            <p className="text-[#3C200F] mb-10" style={{ fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 400 }}>アクセス方法</p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Route 1: Odawara */}
              <div className="bg-white p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3C200F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <h3 className="text-[#3C200F]" style={{ fontSize: "18px", fontWeight: 400 }}>小田原方面から</h3>
                </div>
                <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", lineHeight: "1.9" }}>
                  <p>小田原駅 → 国道1号線を箱根方面へ → 宮ノ下交差点を右折（国道138号線）→ 強羅・仙石原方面へ直進 → 仙石原交差点を通過し約500m</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>所要時間：小田原駅から約40分</p>
                </div>
              </div>

              {/* Route 2: Gotemba IC */}
              <div className="bg-white p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3C200F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <h3 className="text-[#3C200F]" style={{ fontSize: "18px", fontWeight: 400 }}>東名高速 御殿場ICから</h3>
                </div>
                <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", lineHeight: "1.9" }}>
                  <p>御殿場IC → 国道138号線を箱根方面へ → 乙女峠を越え仙石原方面へ直進 → 仙石原交差点を通過し約500m</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>所要時間：御殿場ICから約30分</p>
                </div>
              </div>
            </div>

            {/* Bus */}
            <div className="bg-white p-6 sm:p-8 mt-8">
              <div className="flex items-center gap-3 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3C200F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M7 21v-4" /><path d="M17 21v-4" /></svg>
                <h3 className="text-[#3C200F]" style={{ fontSize: "18px", fontWeight: 400 }}>バスでお越しの場合</h3>
              </div>
              <div className="text-[#3C200F]" style={{ fontSize: "15px", lineHeight: "1.9" }}>
                <p>箱根登山バス「仙石原」バス停より徒歩約5分</p>
                <p className="text-[#8F7B65] mt-1" style={{ fontSize: "14px" }}>小田原駅・箱根湯本駅から箱根登山バス（桃源台行き）をご利用ください。</p>
              </div>
            </div>

            {/* Parking */}
            <div className="bg-white p-6 sm:p-8 mt-8">
              <div className="flex items-center gap-3 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3C200F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 17V7h4a3 3 0 0 1 0 6H9" /></svg>
                <h3 className="text-[#3C200F]" style={{ fontSize: "18px", fontWeight: 400 }}>駐車場のご案内</h3>
              </div>
              <div className="text-[#3C200F]" style={{ fontSize: "15px", lineHeight: "1.9" }}>
                <p>店舗横に2台分、その手前に1台分の計3台分の無料駐車場をご用意しています。</p>
                <p>当店の案内看板がございますので、看板をご確認の上、駐車をお願いいたします。</p>
                <p className="text-[#B87942] mt-2" style={{ fontSize: "14px" }}>※店舗前の駐車場は当店の駐車場ではございませんのでご注意ください。</p>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 400, letterSpacing: "1.8px" }}>ABOUT</h2>
                <p className="text-[#3C200F] mb-8" style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 400 }}>事業所について</p>

                <div className="bg-white p-4 sm:p-8">
                  <table className="w-full" style={{ fontSize: "14px", fontWeight: 400 }}>
                    <tbody className="space-y-0">
                      {[
                        ["事業所の名称", "DogHub箱根仙石原"],
                        ["動物取扱責任者の氏名", "成澤元子"],
                        ["住所", "神奈川県足柄下郡箱根町仙石原928-15"],
                        ["登録に係る第一種動物取扱業の種別", "保管"],
                        ["登録番号", "動愛第240073号"],
                        ["登録年月日", "2024年7月1日"],
                        ["有効期間の末日", "2029年6月30日"],
                      ].map(([label, value]) => (
                        <tr key={label} className="border-b border-[#E5DDD8]">
                          <td className="py-3 pr-4 text-[#8F7B65] align-top w-1/2">{label}</td>
                          <td className="py-3 text-[#3C200F]">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 証明書 + スタッフ写真 */}
              <div className="space-y-6">
                <Image src="/images/img-053.png" alt="証明書" className="w-full max-w-xs h-auto mx-auto" width={600} height={400} />
              </div>
            </div>
          </div>
        </section>

        {/* Recruiting */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  わたしたちと一緒に働く<br />仲間を募集しています
                </h2>
                <p className="text-[#8F7B65] mb-6" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                  わたしたちの職場は、わんちゃんが好きな仲間が集まるあたたかい雰囲気のチームです。大切な家族をお預かりするからこそ、やさしさと笑顔を大事にしています。
                  未経験でも大歓迎！動物が好きな方、誰かの役に立つ仕事がしたい方、ぜひ一緒に働きませんか？
                  あなたのご応募、お待ちしています♪
                </p>
                <a
                  href="mailto:info@dog-hub.shop?subject=スタッフ応募について"
                  className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-4 hover:bg-[#3C200F] hover:text-white transition-colors min-h-11"
                  style={{ fontSize: "16px", fontWeight: 400 }}
                >
                  お問い合わせ
                </a>
              </div>
              <div>
                <Image src="/images/img-024.png" alt="DogHub箱根仙石原のスタッフたち" className="w-full h-auto" width={600} height={400} />
              </div>
            </div>
          </div>
        </section>

        {/* Reservation */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <a
              href="/booking"
              className="block w-full border border-[#3C200F] py-10 text-center hover:bg-white transition-colors"
            >
              <p className="text-[#3C200F] mb-2 flex items-center justify-center gap-3" style={{ fontSize: "clamp(24px,4vw,38.4px)", fontWeight: 400, letterSpacing: "2.7px" }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> RESERVATION</p>
              <p className="text-[#3C200F]" style={{ fontSize: "clamp(14px,2vw,20px)", fontWeight: 400 }}>DogHub箱根仙石原ご予約はこちら</p>
            </a>
          </div>
        </section>

        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
