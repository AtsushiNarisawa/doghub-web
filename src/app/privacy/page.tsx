import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "プライバシーポリシー｜DogHub箱根仙石原",
  description: "DogHub箱根仙石原のプライバシーポリシー。お客様の個人情報の取り扱いについて。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <section className="py-12 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-medium text-[#3C200F] mb-8">プライバシーポリシー</h1>

            <div className="prose prose-sm max-w-none text-[#3C200F] space-y-8" style={{ lineHeight: "1.8" }}>
              <p>
                DogHub箱根仙石原（以下「当店」）は、お客様の個人情報の保護を重要な責務と認識し、以下のとおりプライバシーポリシーを定めます。
              </p>

              <section>
                <h2 className="text-lg font-medium mb-3">1. 収集する個人情報</h2>
                <p>当店は、以下の個人情報をお客様から収集します。</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>氏名、フリガナ</li>
                  <li>電話番号、メールアドレス</li>
                  <li>郵便番号、住所</li>
                  <li>ご利用のきっかけ（アンケート項目）</li>
                  <li>ワンちゃんの情報（名前、犬種、体重、年齢、性別、ワクチン接種状況、アレルギー・食事・投薬に関する注意事項）</li>
                  <li>LINE ID（LINE連携をご利用の場合）</li>
                  <li>ご予約内容（プラン、日程、備考）</li>
                  <li>お預かり中にスタッフが撮影したワンちゃんの動画・写真（お渡しする場合）</li>
                  <li>ウェブサイトの閲覧履歴（Cookie等による）</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-medium mb-3">2. 個人情報の利用目的</h2>
                <p>収集した個人情報は、以下の目的で利用します。</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>ご予約の受付・確認・変更・キャンセルの対応</li>
                  <li>お預かりするワンちゃんの安全なケア（アレルギー・投薬等の管理）</li>
                  <li>予約確認メール・リマインドメール・お礼メールの送信</li>
                  <li>LINE通知の送信（友だち追加いただいた場合）</li>
                  <li>お預かり中に撮影した動画・写真のお渡し（ご本人だけが開けるページでお渡しし、最後のご利用から2年で削除します。それより前の削除もお申し出いただけます）</li>
                  <li>お問い合わせへの回答</li>
                  <li>サービスの改善・新サービスのご案内</li>
                  <li>ウェブサイトの利用状況の分析（アクセス解析）</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-medium mb-3">3. 個人情報の第三者提供</h2>
                <p>
                  当店は、法令に基づく場合を除き、お客様の同意を得ずに個人情報を第三者に提供することはありません。ただし、以下の場合を除きます。
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>法令に基づく場合</li>
                  <li>人の生命、身体または財産の保護のために必要がある場合</li>
                  <li>公衆衛生の向上または児童の健全な育成の推進のために必要がある場合</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-medium mb-3">4. 個人情報の共同利用</h2>
                <p>
                  当店のオンラインショップ（DogHub のEC）は、Motonari株式会社が運営しています。当店と Motonari株式会社は、以下のとおりお客様の個人情報を共同して利用します。
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>共同して利用する個人情報の項目</strong>：氏名、フリガナ、電話番号、メールアドレス、郵便番号、住所、ワンちゃんの情報（名前・犬種）、ご利用・ご購入の履歴、配信の停止のお申し出</li>
                  <li><strong>共同して利用する者の範囲</strong>：DogHub箱根仙石原（当店）および Motonari株式会社</li>
                  <li><strong>利用する者の利用目的</strong>：商品・サービスのご案内（メール等によるお知らせを含みます）、ご注文の受付・発送・お問い合わせへの対応、サービスの改善</li>
                  <li><strong>個人情報の管理について責任を有する者</strong>：Motonari株式会社（〒250-0631 神奈川県足柄下郡箱根町仙石原928-15・代表取締役 成澤 元子）</li>
                </ul>
                <p className="mt-2">
                  ご案内の配信は、メールに記載のリンクまたは下記のお問い合わせ先から、いつでも停止をお申し出いただけます。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-medium mb-3">5. 個人情報の管理</h2>
                <p>
                  当店は、個人情報の正確性を保ち、不正アクセス・紛失・破損・改ざん・漏洩を防止するため、適切なセキュリティ対策を講じます。個人情報はSSL暗号化通信により保護されたサーバーに保存されます。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-medium mb-3">6. Cookieの使用</h2>
                <p>当店のウェブサイトでは、以下の目的でCookieを使用しています。</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Google Analytics（GA4）</strong>：ウェブサイトの利用状況を分析し、サービス向上に役立てるため</li>
                  <li><strong>Google Tag Manager</strong>：ウェブサイトのタグ管理のため</li>
                  <li><strong>Google Ads</strong>：広告の効果測定のため</li>
                </ul>
                <p className="mt-2">
                  Cookieはブラウザの設定により無効にすることができますが、一部のサービスが正常に機能しなくなる場合があります。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-medium mb-3">7. 個人情報の開示・訂正・削除</h2>
                <p>
                  お客様は、ご自身の個人情報の開示・訂正・削除を求めることができます。ご希望の場合は、下記のお問い合わせ先までご連絡ください。本人確認のうえ、速やかに対応いたします。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-medium mb-3">8. LINE公式アカウントについて</h2>
                <p>
                  当店のLINE公式アカウントをご利用いただく場合、LINEのプロフィール情報（表示名・プロフィール画像・ステータスメッセージ）を取得します。取得した情報は、予約管理およびお客様へのご連絡にのみ使用し、第三者に提供することはありません。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-medium mb-3">9. プライバシーポリシーの変更</h2>
                <p>
                  当店は、必要に応じて本ポリシーを変更することがあります。変更後のポリシーは、本ページに掲載した時点で効力を生じるものとします。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-medium mb-3">10. お問い合わせ</h2>
                <p>個人情報の取り扱いに関するお問い合わせは、下記までご連絡ください。</p>
                <div className="bg-[#F8F5F0] rounded-lg p-4 mt-3">
                  <p className="font-medium">DogHub箱根仙石原</p>
                  <p className="text-sm text-[#8F7B65] mt-1">〒250-0631 神奈川県足柄下郡箱根町仙石原928-15</p>
                  <p className="text-sm text-[#8F7B65]">TEL: <a href="tel:0460800290" data-phone-location="privacy" className="text-[#B87942]">0460-80-0290</a></p>
                  <p className="text-sm text-[#8F7B65]">E-mail: <a href="mailto:info@dog-hub.shop" className="text-[#B87942]">info@dog-hub.shop</a></p>
                </div>
                <div className="bg-[#F8F5F0] rounded-lg p-4 mt-3">
                  <p className="font-medium">オンラインショップ・共同利用について：Motonari株式会社</p>
                  <p className="text-sm text-[#8F7B65] mt-1">〒250-0631 神奈川県足柄下郡箱根町仙石原928-15（代表取締役 成澤 元子）</p>
                  <p className="text-sm text-[#8F7B65]">TEL: <a href="tel:08050310488" className="text-[#B87942]">080-5031-0488</a></p>
                  <p className="text-sm text-[#8F7B65]">E-mail: <a href="mailto:info@dog-hub.shop" className="text-[#B87942]">info@dog-hub.shop</a></p>
                </div>
              </section>

              <p className="text-sm text-[#888] mt-8">制定日: 2026年4月7日<br />改定日: 2026年11月19日（個人情報の共同利用を追記）<br />改定日: 2026年11月28日（動画・写真のお渡しを追記）</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
