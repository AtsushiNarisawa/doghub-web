import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { FaqAccordion } from "@/components/faq-accordion";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "よくある質問（FAQ）｜DogHub箱根仙石原 ペットホテル",
  description: "DogHub箱根仙石原のよくある質問。予約方法、料金、持ち物、キャンセルポリシー、犬種制限、営業時間など。初めてご利用の方はこちらをご確認ください。",
};

const faqCategories = [
  {
    title: "ご利用について",
    items: [
      {
        q: "予約は必要ですか？",
        a: "はい、事前予約制です。前日17時までにオンラインまたはお電話（0460-80-0290）でご予約ください。当日予約はお受けできません。",
      },
      {
        q: "何時から何時まで預けられますか？",
        a: "通常プランは9時〜17時、早朝プランは7時〜15時です。お預かり最終受付は15時、お引き取り最終は17時となります。早朝プランをご希望の場合は事前にご連絡ください。",
      },
      {
        q: "当日の持ち物は何が必要ですか？",
        a: "1年以内の混合ワクチン証明書（必須）、狂犬病予防接種証明書（必須）、普段食べているご飯、リード・首輪をお持ちください。お気に入りのおもちゃやブランケットもあると安心です。",
      },
      {
        q: "キャンセルはできますか？",
        a: "キャンセルは可能です。キャンセルポリシーについてはご予約時にご案内いたします。詳しくはお電話（0460-80-0290）またはメール（info@dog-hub.shop）でお問い合わせください。",
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
        a: "体重15kg未満のわんちゃんは即時確定でお預かり可能です。15kg以上の場合はスタッフ確認の上、仮予約として対応させていただきます。まずはお気軽にご相談ください。",
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
        a: "半日お預かり（4時間）¥3,300、1日お預かり（8時間）¥5,500、宿泊（1泊）¥7,700〜、スポット利用（1時間）¥1,100です。営業時間外は追加1時間あたり¥1,100の時間料金をいただきます。",
      },
      {
        q: "オプションサービスはありますか？",
        a: "お散歩オプション（¥550/回）をご用意しています。また、ご飯やおやつ、マナーウェアなどの販売（¥220〜）もございますので、持ち物を忘れてしまった場合もご安心ください。",
      },
      {
        q: "支払い方法は？",
        a: "現金のほか、各種クレジットカード、電子マネーに対応しています。お支払いはお迎え時にお願いいたします。",
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
        a: "はい、店舗前に無料駐車場をご用意しています。",
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
        a: "神奈川県足柄下郡箱根町仙石原928-15です。箱根ガラスの森美術館から車で3分、ポーラ美術館から車で4分の場所にあります。",
      },
      {
        q: "公共交通機関でのアクセスは？",
        a: "箱根登山バス「仙石原」バス停から徒歩約5分です。箱根湯本駅からバスで約30分です。",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* Hero */}
        <div className="relative">
          <img
            src="/images/img-064.jpg"
            alt="よくある質問"
            className="w-full object-cover"
            style={{ height: "clamp(140px, 18vw, 249px)" }}
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <p className="text-sm mb-2 opacity-80">/ よくある質問</p>
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
              こちらに記載のない内容については、お気軽にお電話（<a href="tel:0460800290" className="text-[#B87942] hover:underline">0460-80-0290</a>）
              またはメール（<a href="mailto:info@dog-hub.shop" className="text-[#B87942] hover:underline">info@dog-hub.shop</a>）でお問い合わせください。
            </p>

            <div className="space-y-12">
              {faqCategories.map((cat) => (
                <div key={cat.title}>
                  <h2 className="text-[#3C200F] mb-6 pb-3 border-b-2 border-[#3C200F]" style={{ fontSize: "24px", fontWeight: 400 }}>{cat.title}</h2>
                  <FaqAccordion faqs={cat.items} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "24px", fontWeight: 400 }}>解決しない場合は</h2>
            <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              お気軽にお電話またはメールでお問い合わせください。<br />
              公式LINEからもお問い合わせいただけます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="tel:0460800290"
                className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-3 hover:bg-[#3C200F] hover:text-white transition-colors"
                style={{ fontSize: "18px", fontWeight: 400 }}
              >
                0460-80-0290
              </a>
              <a
                href="mailto:info@dog-hub.shop"
                className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-3 hover:bg-[#3C200F] hover:text-white transition-colors"
                style={{ fontSize: "16px", fontWeight: 400 }}
              >
                info@dog-hub.shop
              </a>
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
