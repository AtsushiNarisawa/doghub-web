import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "アクセス・店舗情報｜DogHub箱根仙石原 ペットホテル＆カフェ",
  description: "DogHub箱根仙石原の店舗情報・アクセス。神奈川県足柄下郡箱根町仙石原928-15。ドッグホテル営業時間9時〜17時、カフェ11時〜17時、定休日水木。",
};

export default function AccessPage() {
  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* Hero */}
        <div className="relative">
          <img
            src="https://static.wixstatic.com/media/a21f47_d33337e039334333a9a4c6b03a025f7a~mv2.jpg/v1/fill/w_1440,h_249,fp_0.50_0.23,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg"
            alt="店舗情報"
            className="w-full object-cover"
            style={{ height: "clamp(140px, 18vw, 249px)" }}
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <p className="text-sm mb-2 opacity-80">/ 店舗情報</p>
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
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  DogHub箱根仙石原<br />ペットホテル<br />おむすび＆スープカフェ
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
                    href="https://www.airrsv.net/doghubhakone/calendar" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-3 hover:bg-[#3C200F] hover:text-white transition-colors"
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
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1625.7!2d139.0253!3d35.2667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601f9fa331828267%3A0x99920975f0f164f5!2sDogHub%E7%AE%B1%E6%A0%B9%E4%BB%99%E7%9F%B3%E5%8E%9F!5e0!3m2!1sja!2sjp!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="DogHub箱根仙石原 地図"
                  />
                </div>
                <img
                  src="https://static.wixstatic.com/media/a21f47_4d6b447b190e49808ed16e5bd76bd1bc~mv2.jpg/v1/fill/w_687,h_489,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg"
                  alt="DogHub箱根仙石原の外観"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "36px", fontWeight: 400, letterSpacing: "1.8px" }}>ABOUT</h2>
                <p className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>事業所について</p>

                <div className="bg-white p-8">
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
                <img
                  src="https://static.wixstatic.com/media/a21f47_9dfc57001c124292a2cc892216ec5c62~mv2.png/v1/fill/w_441,h_607,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.png"
                  alt="証明書"
                  className="w-full max-w-xs h-auto mx-auto"
                />
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
                  className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-3 hover:bg-[#3C200F] hover:text-white transition-colors"
                  style={{ fontSize: "16px", fontWeight: 400 }}
                >
                  お問い合わせ
                </a>
              </div>
              <div>
                <img
                  src="https://static.wixstatic.com/media/a21f47_3090ee025a2e4d0689b546ad39e42a6f~mv2.png/v1/fill/w_583,h_439,al_c,lg_1,q_85,enc_avif,quality_auto/image.png"
                  alt="DogHub箱根仙石原のスタッフたち"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Reservation */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <a
              href="https://www.airrsv.net/doghubhakone/calendar" target="_blank" rel="noopener noreferrer"
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
