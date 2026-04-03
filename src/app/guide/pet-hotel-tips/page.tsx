import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  title: "ペットホテル 初めて 不安解消ガイド｜預ける前に知っておきたいこと｜DogHub箱根仙石原",
  description: "はじめてペットホテルを利用する方へ。ペットホテル選びのポイント、預ける前の準備、当日の流れ、愛犬のストレス対策まで。DogHub箱根仙石原が初めての不安を解消します。",
  alternates: { canonical: "/guide/pet-hotel-tips" },
};

export default function PetHotelTipsPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"はじめてガイド",href:"/guide"},{name:"ペットホテル選びのコツ",href:"/guide/pet-hotel-tips"}]} />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-038.jpg" alt="ペットホテル 初めて ガイド" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 style={{ fontSize: "clamp(22px, 4.5vw, 40px)", fontWeight: 400 }}>
              はじめてのペットホテル 不安解消ガイド
            </h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <Link href="/guide" className="hover:text-[#3C200F]">はじめてガイド</Link>
            <span className="mx-2"></span>
            <span>ペットホテル不安解消ガイド</span>
          </p>
        </div>

        {/* Intro */}
        <section className="py-12 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              「ペットホテルに預けるのは初めてで不安…」「うちの子、ちゃんとお留守番できるかな？」
              そんな飼い主様の不安を少しでも解消できるよう、ペットホテルを初めて利用する際に
              知っておきたいポイントをまとめました。
            </p>
          </div>
        </section>

        {/* よくある不安 */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>よくある不安と答え</h2>
            <div className="space-y-6">
              {[
                {
                  q: "うちの子がストレスで体調を崩さないか心配",
                  a: "環境の変化にストレスを感じるわんちゃんもいますが、DogHubでは完全個室でお預かりするため、他のわんちゃんとの接触によるストレスを最小限にしています。また、お気に入りのブランケットやおもちゃを持ち込んでいただくことで、安心できる環境を作ります。",
                },
                {
                  q: "ケージに閉じ込められっぱなしにならないか",
                  a: "DogHubではケージではなく壁に囲まれた個室でお預かりします。さらに、1日2回以上お散歩にお連れしており、閉じ込めっぱなしにはしません。",
                },
                {
                  q: "夜中に何かあったらどうするの",
                  a: "24時間スタッフが常駐しています。夜間も宿直スタッフがおり、ライブカメラで随時見守っています。万が一の体調不良時は、飼い主様に緊急連絡いたします。",
                },
                {
                  q: "ごはんを食べてくれるか心配",
                  a: "普段食べ慣れたフードをご持参いただいています。いつもと同じご飯なら、ほとんどのわんちゃんがしっかり食べてくれます。食事量もスタッフが確認してフィードバックします。",
                },
                {
                  q: "他のわんちゃんに吠えたり噛みつかないか",
                  a: "完全個室なので、他のわんちゃんと直接接触することはありません。ドッグランは個別に利用する場合もございますのでご安心ください。",
                },
              ].map((faq) => (
                <div key={faq.q} className="bg-white border border-[#E5DDD8] p-6">
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "18px", fontWeight: 400 }}>{faq.q}</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ペットホテル選びのポイント */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>ペットホテル選び 5つのチェックポイント</h2>
            <div className="space-y-6">
              {[
                { num: "01", title: "スタッフの常駐体制", body: "24時間スタッフが常駐しているかどうかは最重要ポイント。夜間無人の施設もあるため、必ず確認を。DogHubは24時間スタッフ常駐です。" },
                { num: "02", title: "預かり環境（ケージ or 個室）", body: "ケージ預かりとお部屋預かりでは、わんちゃんのストレスが大きく異なります。DogHubは完全個室でのお預かりです。" },
                { num: "03", title: "運動・リフレッシュの機会", body: "お預かり中に散歩の時間があるか確認を。DogHubは1日2回以上お散歩にお連れします。" },
                { num: "04", title: "緊急時の対応", body: "体調不良時の連絡体制、近隣の動物病院との連携が整っているか。DogHubは緊急時に速やかに飼い主様へ連絡します。" },
                { num: "05", title: "口コミ・実績", body: "実際に利用した方の声を参考に。Google口コミやSNSでの評判をチェックしましょう。" },
              ].map((point) => (
                <div key={point.num} className="flex gap-6 items-start pb-6 border-b border-[#E5DDD8] last:border-b-0">
                  <span className="text-[#B87942] flex-shrink-0" style={{ fontSize: "32px", fontWeight: 400 }}>{point.num}</span>
                  <div>
                    <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>{point.title}</h3>
                    <p className="text-[#8F7B65]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>{point.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 預ける前の準備 */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>預ける前に準備しておくこと</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: "ワクチン接種を済ませる", body: "1年以内の混合ワクチンと狂犬病予防接種が必要です。接種後2週間は免疫が安定しないため、余裕をもって準備を。" },
                { title: "普段のフードを多めに用意", body: "環境が変わるとストレスで食欲が落ちることも。いつものフードなら安心です。必要日数+予備分を持参しましょう。" },
                { title: "安心できるアイテムを持参", body: "飼い主の匂いがついたブランケットやおもちゃがあると、わんちゃんが安心します。" },
                { title: "健康状態・注意点をメモ", body: "アレルギー、持病、服薬情報、食事の量やタイミング、トイレの癖などをメモしておくとスムーズです。" },
              ].map((prep) => (
                <div key={prep.title} className="bg-white border border-[#E5DDD8] p-6">
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "18px", fontWeight: 400 }}>{prep.title}</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{prep.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DogHub CTA */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "24px", fontWeight: 400 }}>DogHub箱根仙石原でお待ちしています</h2>
            <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              初めてのペットホテルでも安心してお預けいただけるよう、<br />
              スタッフ一同、心を込めてお世話いたします。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/booking"
                className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-10 py-4 hover:opacity-90 transition-opacity"
                style={{ fontSize: "18px", fontWeight: 400 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                ご予約はこちら
              </a>
              <Link href="/guide" className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-3 hover:bg-[#3C200F] hover:text-white transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>
                ご利用ガイドを見る →
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
