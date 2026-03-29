import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  title: "ご利用ガイド・ご予約方法｜DogHub箱根仙石原 ペットホテル",
  description: "DogHub箱根仙石原のご利用ガイド。ご予約方法・必要なもの・料金プラン・注意事項・よくある質問をまとめています。",
  alternates: { canonical: "/guide" },
};

const steps = [
  {
    num: "Step01",
    title: "オンライン予約",
    body: "ご希望の日時・コースをご選択の上、ご予約ください。ご予約時に、愛犬の名前・犬種・体重・年齢などをお伺いいたします。\n※ご予約完了後、お申し込み時のメールアドレスへご予約内容がメールで届きます。\n※お電話にてご予約を受け付けられる場合もございます。お急ぎの場合はご連絡ください。",
    img: "/images/img-031.webp",
    note: "基本的に体重15kgまでのお預かりとなっております。ただし、落ち着きのある犬種であれば若干のオーバーでも受け入れ可能な場合がございます。15kgを超える場合は仮予約となり、24時間以内にスタッフよりご連絡いたします。",
  },
  {
    num: "Step02",
    title: "ご来店・チェックイン",
    body: "・ご予約時間にご来店ください。\n・受付にて同意書のご記入と愛犬の健康状態などを確認いたします。",
    img: "/images/img-017.jpg",
  },
  {
    num: "Step03",
    title: "お預かり",
    body: "・スタッフが24時間常駐し、安心してお出かけいただけるよう、スタッフが丁寧にお世話します。夜間も室内カメラで愛犬の様子を見守りします。\n・事前に相談した内容に沿って食事やお散歩（オプション）等を行います。",
    img: "/images/img-019.jpg",
  },
  {
    num: "Step04",
    title: "お迎え",
    body: "・お約束のお時間にお迎えくださいますようお願いいたします。\n・当日の様子や体調などをフィードバックさせていただきます。",
    img: "/images/img-050.jpg",
  },
];

const requiredItems = [
  "ワクチン証明書（1年以内の接種記録）\n└ 混合ワクチン、狂犬病（犬の場合）など\n※ワクチン証明書を撮影した写真でも可\n※事情により接種ができないわんちゃんの場合、ご予約時に備考欄へその旨をご記載ください",
  "身分証明書（飼い主本人の確認用）",
  "首輪・リード",
  "普段食べているフード・おやつ（必要日数分）",
];

const optionalItems = [
  "お気に入りのおもちゃや毛布（安心できる匂いのあるもの）",
  "においつきタオル（飼い主の香りがするもの）",
  "服用中のお薬・サプリメント（あれば必ず指示書と一緒に）",
];

const recommendedItems = [
  "トイレ用品（ペットシーツ・マナーパッド など）",
  "キャリーバッグ or クレート（移動用）",
];

const precautions = [
  "体重15kg以下のわんちゃんのお預かりとなります。",
  "気性の荒いわんちゃんは、お預かりをお断りする場合があります。",
  "お申し込みの際に１年以内のワクチン接種証明書・狂犬病予防接種証明書をご持参ください。",
  "ワクチン接種をしていないわんちゃんに関しましては、お預かりできない場合もございます。",
  "道路混雑状況による30分前後の遅延はご連絡不要ですが、お預かり時間はご予約時の時間となります。予めご了承ください。",
  "お預かりのわんちゃんに関しては朝・夕の２回以上はドッグランで遊んでいただきます。",
  "宿泊のわんちゃんの食事は完全持ち込み制になっていますので、普段食べている食べなれたご飯をお持ち頂けると安心して食べてもらえます。",
  "食器・給水器は、ご用意しております。",
  "わんちゃんが安心できる毛布などの持ち込みも可能です。",
  "営業時間外のお預かり、お受け取りに関しては追加にて時間預かり料金が発生いたします。",
  "表示料金は全て税込価格です。",
];


export default function GuidePage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"はじめてガイド",href:"/guide"}]} />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-018.jpg" alt="はじめてガイド" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(140px, 18vw, 249px)" }} />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400 }}>はじめての方へ</h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>はじめてガイド</span>
          </p>
        </div>

        {/* Navigation tabs */}
        <nav className="bg-white border-b border-[#E5DDD8] sticky top-15 lg:top-20 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-6">
            <div className="flex overflow-x-auto gap-0 -mx-1">
              {[
                { label: "必要なもの", id: "items" },
                { label: "料金・プラン", href: "/service" },
                { label: "注意事項", id: "precautions" },
                { label: "よくある質問", href: "/faq" },
              ].map((tab) => (
                <a key={tab.id ?? tab.href} href={tab.href ?? `#${tab.id}`} className="flex-shrink-0 px-3 sm:px-4 py-4 text-[#3C200F] border-b-2 border-transparent hover:border-[#B87942] whitespace-nowrap min-h-11" style={{ fontSize: "clamp(13px, 3vw, 18px)", fontWeight: 400 }}>
                  {tab.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* Steps */}
        <section id="flow" className="py-16 px-6 bg-[#F7F7F7] scroll-mt-[140px]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-12" style={{ fontSize: "26px", fontWeight: 400 }}>ご利用〜お預かりまでの流れ</h2>
            <div className="space-y-6">
              {steps.map((s) => (
                <div key={s.num} className="bg-white p-4 sm:p-8">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <Image src={s.img} alt="" className="object-cover flex-shrink-0 w-full sm:w-[227px] h-auto sm:h-[126px]" width={700} height={400} />
                    <div>
                      <p className="text-[#311908] mb-1" style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 400 }}>{s.num}</p>
                      <h3 className="text-[#311908] mb-3" style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 400 }}>{s.title}</h3>
                      {s.num === "Step01" && (
                        <div className="mb-4">
                          <a
                            href="/booking"
                            className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-6 py-3 hover:bg-[#3C200F] hover:text-white transition-colors min-h-11"
                            style={{ fontSize: "14px", fontWeight: 400 }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> ご予約はこちら
                          </a>
                        </div>
                      )}
                      <p className="text-[#8F7B65] whitespace-pre-line" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{s.body}</p>
                      {s.note && (
                        <div className="mt-3 bg-[#FFF8F3] border-l-4 border-[#B87942] px-4 py-3">
                          <p className="text-[#3C200F]" style={{ fontSize: "13px", fontWeight: 400, lineHeight: "1.8" }}>
                            <span className="font-medium">重要：</span>{s.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 必要なもの */}
        <section id="items" className="py-16 px-6 bg-white border-t border-[#E5DDD8] scroll-mt-[140px]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-10" style={{ fontSize: "26px", fontWeight: 400 }}>必要なもの</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-[#311908] mb-4 pb-2 border-b border-[#E5DDD8]" style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 400 }}>必ずご持参いただくもの</h3>
                <ul className="space-y-3">
                  {requiredItems.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#B87942] flex-shrink-0 mt-1">●</span>
                      <p className="text-[#3C200F] whitespace-pre-line" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.7" }}>{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[#311908] mb-4 pb-2 border-b border-[#E5DDD8]" style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 400 }}>あると愛犬が安心するもの</h3>
                <ul className="space-y-3">
                  {optionalItems.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#B87942] flex-shrink-0 mt-1">●</span>
                      <p className="text-[#3C200F]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.7" }}>{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[#311908] mb-4 pb-2 border-b border-[#E5DDD8]" style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 400 }}>ご持参を推奨しているもの</h3>
                <ul className="space-y-3">
                  {recommendedItems.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#B87942] flex-shrink-0 mt-1">●</span>
                      <p className="text-[#3C200F]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.7" }}>{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ドッグラン写真 */}
        <section className="px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <Image src="/images/img-011.jpg" alt="DogHub箱根仙石原のドッグランで走る犬" className="w-full h-auto" width={600} height={400} style={{ maxWidth: "562px" }} />
          </div>
        </section>

        {/* 料金・プランへのリンク */}
        <section className="py-12 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "26px", fontWeight: 400 }}>料金・プラン</h2>
            <p className="text-[#8F7B65] mb-6" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.8" }}>
              半日お預かり ¥3,300〜 ／ 1日お預かり ¥5,500〜 ／ 宿泊 ¥7,700〜
            </p>
            <Link
              href="/service"
              className="text-[#3C200F] hover:text-[#B87942] transition-colors group border-b border-[#3C200F] pb-1"
              style={{ fontSize: "16px", fontWeight: 400 }}
            >
              料金・サービスの詳細はこちら <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </section>

        {/* 注意事項 */}
        <section id="precautions" className="py-16 px-6 bg-white border-t border-[#E5DDD8] scroll-mt-[140px]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>注意事項</h2>
            <ul className="space-y-4">
              {precautions.map((item, i) => (
                <li key={i} className="flex gap-3 pb-4 border-b border-[#E5DDD8]">
                  <span className="text-[#B87942] flex-shrink-0">●</span>
                  <p className="text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.7" }}>{item}</p>
                </li>
              ))}
            </ul>

            {/* 免責事項 */}
            <div className="mt-12 bg-[#F7F7F7] p-4 sm:p-8">
              <h3 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>免責事項</h3>
              <div className="text-[#8F7B65] space-y-2" style={{ fontSize: "13px", fontWeight: 400, lineHeight: "1.8" }}>
                <p>当店の判断の下、万が一、ペットの体調不良などの異変・異常が見られた場合は、お客様への緊急連絡（深夜でもご了承下さい。）をさせていただきます。</p>
                <p>万全を期しておりますが、人間同様に環境の変化により、体調不良に至る場合もございます。</p>
                <p className="font-medium text-[#3C200F]">以下の場合につきましては、当店は責任を負いかねます。</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>天災による、雪災・噴火・地震・風災・雹災・火災、その他の災害等による全ての事故。及び、災害注意報・警報発令時はご予約をいただいている場合におかれましても、こちらよりお断りさせていただく場合がございます。</li>
                  <li>他のペットからの感染症の発症。</li>
                  <li>備品（首輪・鎖・リード等）の破損、当施設の破壊行為に起因する逃亡。（窓など）</li>
                  <li>発症した全ての病気・怪我・死亡。（お客様からの申し出が無い場合）</li>
                  <li>お引渡し後、発症した全ての病気・怪我。</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQへのリンク */}
        <section className="py-12 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "26px", fontWeight: 400 }}>よくある質問</h2>
            <p className="text-[#8F7B65] mb-6" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.8" }}>
              予約方法、持ち物、料金、犬種制限など、よくいただくご質問をまとめています。
            </p>
            <Link
              href="/faq"
              className="text-[#3C200F] hover:text-[#B87942] transition-colors group border-b border-[#3C200F] pb-1"
              style={{ fontSize: "16px", fontWeight: 400 }}
            >
              よくある質問を見る <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
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

        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
