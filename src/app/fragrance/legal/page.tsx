import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// 特定商取引法に基づく表記と、ご購入にあたっての規約。
//
// 🔴 このページは Stripe の本番申請の【前】に公開しておく必要がある。
//    日本の Stripe は有効化の審査で「特商法の表記があり、販売する商品が載っていて、
//    パスワードなしで到達できるサイト」を確認する。発売前日に用意したのでは審査が始められない。
//
// 🔴 返品特約は、この広告ページと決済の最終確認画面の【両方】に出さないと効かない。
//    片方だけだと「商品到着後8日以内は理由を問わず返品可」が法律上の既定になる。
//    決済画面側は src/lib/fragrance/config.ts の consentText() が担っている。
//
// 🔴 事業者名は登記が済んだら法人名に差し替える。環境変数で切り替えられるようにしてあるのは、
//    ラベルの「販売元」表記・Stripe の名義・入金口座と必ず一致させるため。

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記｜DogHub FRAGRANCE",
  description: "DogHub FRAGRANCE のご購入にあたっての表記・返品について。",
  alternates: { canonical: "/fragrance/legal" },
};

const SELLER_LEGAL_NAME = process.env.FRAGRANCE_SELLER_LEGAL_NAME || "";
const SELLER_REPRESENTATIVE = process.env.FRAGRANCE_SELLER_REPRESENTATIVE || "成澤 篤志";

export default function FragranceLegalPage() {
  const sellerName = SELLER_LEGAL_NAME || "DogHub箱根仙石原";

  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <section className="bg-white">
          <div className="max-w-2xl mx-auto px-6 py-16">
            <p className="text-sm tracking-[0.3em] text-[#3C200F]/50 mb-6">DogHub FRAGRANCE</p>
            <h1 className="text-xl font-medium text-[#3C200F] mb-10">
              特定商取引法に基づく表記
            </h1>

            <dl className="text-sm text-[#3C200F]/85 space-y-5 leading-relaxed">
              <Item label="販売業者">
                {sellerName}
                {SELLER_LEGAL_NAME && (
                  <span className="block text-[#3C200F]/60">
                    （DogHub FRAGRANCE は {SELLER_LEGAL_NAME} が運営しています）
                  </span>
                )}
              </Item>
              <Item label="運営責任者">{SELLER_REPRESENTATIVE}</Item>
              <Item label="所在地">神奈川県足柄下郡箱根町仙石原928-15</Item>
              <Item label="電話番号">
                0460-80-0290
                <span className="block text-[#3C200F]/60">
                  受付時間 9:00〜17:00（水曜・木曜は定休）
                </span>
              </Item>
              <Item label="メールアドレス">info@dog-hub.shop</Item>

              <Item label="販売価格">
                各商品ページに表示された金額（消費税を含みます）
              </Item>
              <Item label="商品代金以外の必要料金">
                <span className="block">送料：配送をお選びの場合、商品ページに表示された金額</span>
                <span className="block">店頭でのお受け取りをお選びの場合、送料はかかりません</span>
                <span className="block text-[#3C200F]/60">
                  ※ インターネット接続にかかる通信料はお客様のご負担となります
                </span>
              </Item>
              <Item label="お支払い方法">
                クレジットカード（Stripe による決済）
                <span className="block text-[#3C200F]/60">
                  カード情報は決済代行会社が扱い、当店では保持しません
                </span>
              </Item>
              <Item label="お支払い時期">ご注文時にお支払いが確定します</Item>

              <Item label="商品の引渡時期">
                <span className="block">
                  配送：ご注文から3〜7営業日以内に発送します
                </span>
                <span className="block">
                  店頭でのお受け取り：ご決済日から90日以内に、当店ホテル受付にてお渡しします
                </span>
              </Item>

              <Item label="返品・交換について">
                <span className="block font-medium text-[#3C200F]">
                  お客様のご都合による返品
                </span>
                <span className="block">
                  未開封のものに限り、商品到着後8日以内にご連絡をいただいた場合にお受けします。
                  返送にかかる送料はお客様のご負担となります。
                </span>
                <span className="block mt-2">
                  開封後の商品、およびお名前をお入れした商品の返品はお受けできません。
                </span>
                <span className="block mt-3 font-medium text-[#3C200F]">
                  商品に不備があった場合
                </span>
                <span className="block">
                  商品の破損・汚損、ご注文と異なる商品が届いた場合は、
                  商品到着後8日以内にご連絡ください。送料は当店が負担し、
                  交換または返金にて対応いたします。
                </span>
              </Item>

              <Item label="お問い合わせ">
                info@dog-hub.shop または 0460-80-0290
              </Item>
            </dl>

            <h2 className="text-lg font-medium text-[#3C200F] mt-14 mb-6">
              ご購入にあたって
            </h2>
            <div className="text-sm text-[#3C200F]/85 space-y-4 leading-relaxed">
              <p>
                ご注文の確認とご承諾のご連絡は、電子メールでお送りします。
                ご注文手続きの画面で、この方法によるご連絡にご同意いただいたうえで
                お申し込みいただいております。
              </p>
              <p>
                ご登録いただいたメールアドレスと配送先の住所は、ご注文の履行と
                アフターサービスのために使用します。取り扱いについては
                <a href="/privacy" className="underline">
                  プライバシーポリシー
                </a>
                をご覧ください。
              </p>
              <p className="text-[#3C200F]/60">
                本品は化粧品です。お肌に異常があらわれた場合は、ご使用をおやめください。
              </p>
            </div>

            <p className="mt-14 text-xs text-[#3C200F]/45">
              <a href="/fragrance" className="underline">
                DogHub FRAGRANCE に戻る
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#3C200F]/10 pb-4">
      <dt className="text-[#3C200F]/55 mb-1">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
