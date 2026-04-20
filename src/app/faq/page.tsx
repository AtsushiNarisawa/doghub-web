import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { FaqAccordion } from "@/components/faq-accordion";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  title: "よくある質問（FAQ）｜DogHub箱根仙石原 ペットホテル",
  description: "DogHub箱根仙石原のよくある質問。予約方法、料金、持ち物、キャンセルポリシー、犬種制限、営業時間など。初めてご利用の方はこちらをご確認ください。",
  alternates: { canonical: "/faq" },
};

const faqCategories = [
  {
    title: "ご利用について",
    items: [
      {
        q: "予約は必要ですか？",
        a: "はい、事前予約制です。オンラインまたはお電話（0460-80-0290）でご予約ください。前日17時以降のご予約は仮予約として受け付け、翌朝スタッフが確認のうえ確定のご連絡をいたします。当日のご予約はお電話にて承っております。",
      },
      {
        q: "何時から何時まで預けられますか？",
        a: "お預かり時間は9時〜17時です。1日プラン（8時間）のみ早朝7時からのお預かりに対応しております。お預かり最終受付は15時、お引き取り最終は17時です。",
      },
      {
        q: "当日の持ち物は何が必要ですか？",
        a: "1年以内の混合ワクチン証明書（必須）、狂犬病予防接種証明書（必須）、普段食べているご飯、リード・首輪をお持ちください。お気に入りのおもちゃやブランケットもあると安心です。",
      },
      {
        q: "キャンセルはできますか？",
        a: "キャンセルは可能です。前日キャンセルは予約日数の50%、当日キャンセルは予約日数の100%のキャンセル料が発生いたします。なお、ペットの体調不良・ケガ・病気、飼い主様の病気、台風や大雪などの場合はキャンセル料をいただかない場合もございます。キャンセル・変更の際はできるだけ速やかにご連絡ください。お電話（0460-80-0290）またはメール（info@dog-hub.shop）でお問い合わせいただけます。",
      },
      {
        q: "定休日はいつですか？",
        a: "水曜・木曜が定休日です。ドッグホテルの営業時間は午前9時〜午後5時、カフェは午前11時〜午後5時です。",
      },
    ],
  },
  {
    title: "わんちゃんについて",
    items: [
      {
        q: "大型犬も預けられますか？",
        a: "基本的に体重15kgまでのわんちゃんをお預かりしております。ただし、落ち着きのある犬種であれば若干のオーバーでも受け入れ可能な場合がございます。15kg以上の場合は仮予約となり、24時間以内にスタッフよりご連絡いたします。まずはお気軽にご予約・ご相談ください。",
      },
      {
        q: "複数頭の預かりはできますか？",
        a: "はい、複数頭のお預かりに対応しています。ご予約時にそれぞれのわんちゃんの情報をご入力ください。",
      },
      {
        q: "ワクチン未接種でも預けられますか？",
        a: "申し訳ございませんが、他のわんちゃんの安全のため、1年以内の混合ワクチンおよび狂犬病予防接種の証明書が必要です。証明書をお持ちでない場合はお預かりできません。",
      },
      {
        q: "持病があるのですが預けられますか？",
        a: "ご予約時に健康状態や服薬情報をお知らせください。スタッフが確認の上、対応可能かご連絡いたします。投薬が必要な場合は薬をご持参ください。",
      },
      {
        q: "去勢・避妊していなくても大丈夫ですか？",
        a: "はい、去勢・避妊の有無に関わらずお預かり可能です。ただし、ヒート中（発情期）のわんちゃんはお預かりできませんのでご了承ください。",
      },
    ],
  },
  {
    title: "料金・プランについて",
    items: [
      {
        q: "料金プランを教えてください",
        a: "半日お預かり（4時間）¥3,300、1日お預かり（8時間）¥5,500、宿泊（1泊）¥7,700〜、スポット利用（1時間）¥1,100です。営業時間外は追加1時間あたり¥1,100の時間料金をいただきます。表示料金はすべて税込です。",
      },
      {
        q: "オプションサービスはありますか？",
        a: "お散歩オプション（¥550/回）をご用意しています。また、ご飯やおやつ、マナーウェアなどの販売（¥220〜）もございますので、持ち物を忘れてしまった場合もご安心ください。",
      },
      {
        q: "支払い方法は？",
        a: "現金・各種クレジットカード・電子マネー・QR決済に対応しています。お支払いはお迎え時にお願いいたします。",
      },
      {
        q: "リロクラブの割引は使えますか？",
        a: "はい、リロクラブ会員の方は10%OFFでご利用いただけます。お迎え時に会員証をご提示ください。",
      },
    ],
  },
  {
    title: "施設について",
    items: [
      {
        q: "ドッグランはありますか？",
        a: "はい、専用ドッグランを併設しています。屋根付きエリアもございますので、雨の日でもわんちゃんが外で遊べます。お預かり中にスタッフがドッグランでリフレッシュさせます。",
      },
      {
        q: "預けている間の様子は確認できますか？",
        a: "施設内にライブカメラを設置しており、24時間スタッフが見守っています。お預かり中のわんちゃんの様子が気になる場合は、お気軽にお電話ください。",
      },
      {
        q: "駐車場はありますか？",
        a: "はい、店舗横に2台分、その手前に1台分の計3台分の無料駐車場をご用意しています。当店の案内看板がございますので、看板をご確認の上、駐車をお願いいたします。なお、店舗前の駐車場は当店の駐車場ではございませんのでご注意ください。",
      },
      {
        q: "カフェも併設していると聞きましたが？",
        a: "はい、OMUSUBI & SOUP CAFEを併設しています。テイクアウトメインですが、わんちゃんと入れるイートインスペースもございます。お預け・お迎えの際にぜひご利用ください。",
      },
    ],
  },
  {
    title: "アクセスについて",
    items: [
      {
        q: "場所はどこですか？",
        a: "神奈川県足柄下郡箱根町仙石原928-15です。箱根ガラスの森美術館から車で4分、ポーラ美術館から車で6分の場所にあります。",
      },
      {
        q: "公共交通機関でのアクセスは？",
        a: "箱根登山バス「仙石原」バス停から徒歩約5分です。箱根湯本駅からバスで約30分です。",
      },
    ],
  },
  {
    title: "箱根の犬連れ旅行について",
    items: [
      {
        q: "箱根は犬連れで楽しめますか？",
        a: "はい、箱根は犬連れ旅行に人気のエリアです。仙石原すすき草原、芦ノ湖畔の散歩、箱根神社など犬と一緒に行けるスポットがあります。ただし、美術館（ポーラ美術館、ガラスの森美術館、彫刻の森美術館）、温泉施設、ユネッサンなど主要観光スポットの多くはペット不可です。ペットホテルを活用すると、犬連れでもこれらのスポットを楽しめます。",
      },
      {
        q: "箱根で犬を一時的に預けられる場所はありますか？",
        a: "箱根仙石原にDogHub箱根仙石原があります。半日（4時間）¥3,300〜、1日（8時間）¥5,500、宿泊1泊¥7,700〜で犬を預けられます。ポーラ美術館から車6分、ガラスの森美術館から車4分の立地で、美術館巡りやユネッサン、ゴルフの間に愛犬を預けるお客さまが多いです。24時間スタッフ常駐・完全個室・ドッグラン併設。体重15kgまでの小型犬・中型犬が対象です。",
      },
      {
        q: "箱根で犬と泊まれる宿はありますか？",
        a: "箱根にはペット可の宿泊施設がいくつかあります。仙石原エリアではレジーナリゾート箱根仙石原、ドッグレストプレイスなど。強羅エリアでは強羅グアムドッグ、リトナ箱根。芦ノ湖エリアでは箱根園コテージなどがあります。ただし、富士屋ホテル、強羅花壇、箱根吟遊などの人気旅館はペット不可です。ペット不可の宿に泊まりたい場合は、近くのペットホテル（DogHub箱根仙石原）に愛犬を預けて飼い主さんは好きな宿に泊まる、という方法もあります。",
      },
      {
        q: "箱根で犬連れでランチできるお店はありますか？",
        a: "箱根でテラス席なら犬OKのお店はいくつかありますが、室内で犬と一緒に食事できるお店は非常に限られています。DogHub箱根仙石原に併設のOMUSUBI & SOUP CAFEは室内犬同伴OK・予約不要・頭数制限なしで利用できます。おむすび（¥280〜）とスープ（¥400〜）がメニューの中心で、ドッグラン併設なので食後にわんちゃんを遊ばせることもできます。営業時間は11:00〜17:00、水曜・木曜定休。",
      },
      {
        q: "ユネッサンに犬は連れて行けますか？",
        a: "ユネッサンはペット不可です。敷地内に犬を連れて入ることはできません。犬連れでユネッサンを楽しみたい場合は、近くのペットホテルに預ける方法があります。DogHub箱根仙石原はユネッサンから車で約15分の場所にあり、1日預かり（8時間）¥5,500で預けている間にユネッサンを満喫できます。温泉プールだけでも半日以上かかるので、1日預かりがおすすめです。",
      },
      {
        q: "箱根の美術館に犬は入れますか？",
        a: "箱根の主要美術館（ポーラ美術館、ガラスの森美術館、彫刻の森美術館、岡田美術館）は全て犬の館内入場はNGです。ポーラ美術館の森の遊歩道やガラスの森美術館の庭園は犬連れで散策できますが、展示エリアには入れません。美術館巡りをしたい場合は、愛犬をペットホテルに預けるのが一般的です。DogHub箱根仙石原はポーラ美術館から車6分、ガラスの森美術館から車4分の立地です。",
      },
      {
        q: "箱根でゴルフをする時、犬はどうすればいいですか？",
        a: "ゴルフ場はペット不可のため、プレー中は犬を預ける必要があります。DogHub箱根仙石原は大箱根カントリークラブと提携しており、早朝7時からのお預かりに対応しています。1日預かり（8時間）¥5,500で、ラウンド中に愛犬はドッグランで過ごせます。箱根周辺のゴルフ場を利用する方の預かりが当店で最も多い利用目的です。",
      },
    ],
  },
];

function FaqJsonLd() {
  const allItems = faqCategories.flatMap((cat) => cat.items);
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function FaqPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"よくある質問",href:"/faq"}]} />
        <FaqJsonLd />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-067.jpg" alt="よくある質問" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(140px, 18vw, 249px)" }} />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400 }}>よくある質問</h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>よくある質問</span>
          </p>
        </div>

        {/* FAQ content */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#3C200F] mb-12" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              DogHub箱根仙石原についてよくいただくご質問をまとめました。
              こちらに記載のない内容については、お気軽にお電話（<a href="tel:0460800290" data-phone-location="faq_intro" className="text-[#B87942] hover:underline">0460-80-0290</a>）
              またはメール（<a href="mailto:info@dog-hub.shop" className="text-[#B87942] hover:underline">info@dog-hub.shop</a>）でお問い合わせください。
            </p>

            <div className="space-y-12">
              {faqCategories.map((cat) => (
                <div key={cat.title}>
                  <h2 className="text-[#3C200F] mb-6 pb-3 border-b-2 border-[#3C200F]" style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 400 }}>{cat.title}</h2>
                  <FaqAccordion faqs={cat.items} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 400 }}>解決しない場合は</h2>
            <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              お気軽にお電話またはメールでお問い合わせください。<br />
              公式LINEからもお問い合わせいただけます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:0460800290"
                data-phone-location="faq_cta"
                className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-4 min-h-11 hover:bg-[#3C200F] hover:text-white transition-colors"
                style={{ fontSize: "18px", fontWeight: 400 }}
              >
                0460-80-0290
              </a>
              <a
                href="mailto:info@dog-hub.shop"
                className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-4 min-h-11 hover:bg-[#3C200F] hover:text-white transition-colors"
                style={{ fontSize: "16px", fontWeight: 400 }}
              >
                info@dog-hub.shop
              </a>
            </div>
          </div>
        </section>

        {/* 次のステップ導線 */}
        <section className="px-6 py-12 bg-[#F8F5F0] border-t border-[#E5DDD8]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "20px", fontWeight: 400 }}>次のステップ</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <Link href="/service" className="block bg-white border border-[#E5DDD8] hover:border-[#B87942] transition-colors p-5 text-center">
                <p style={{ fontSize: "24px", marginBottom: "8px" }}>📋</p>
                <p className="text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 500 }}>料金・プランを見る</p>
                <p className="text-[#8F7B65]" style={{ fontSize: "13px", marginTop: "4px" }}>半日¥3,300〜</p>
              </Link>
              <Link href="/booking" className="block bg-white border border-[#E5DDD8] hover:border-[#B87942] transition-colors p-5 text-center">
                <p style={{ fontSize: "24px", marginBottom: "8px" }}>📱</p>
                <p className="text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 500 }}>オンライン予約</p>
                <p className="text-[#8F7B65]" style={{ fontSize: "13px", marginTop: "4px" }}>24時間受付・当日はお電話で</p>
              </Link>
              <Link href="/access" className="block bg-white border border-[#E5DDD8] hover:border-[#B87942] transition-colors p-5 text-center">
                <p style={{ fontSize: "24px", marginBottom: "8px" }}>📍</p>
                <p className="text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 500 }}>アクセス</p>
                <p className="text-[#8F7B65]" style={{ fontSize: "13px", marginTop: "4px" }}>仙石原928-15</p>
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
