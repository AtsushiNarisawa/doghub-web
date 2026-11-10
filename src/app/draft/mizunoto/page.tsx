import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// 箱根小涌谷温泉 水の音 × DogHub の記事（下書き・先方確認用）。原稿＝marketing/drafts/mizunoto_article_rough_2026-11-10.md（ここは原稿から生成）。
// 🔴 先方の確認が取れるまで非公開＝noindex・サイトマップ外・サイト内リンクなし。URL を知っている人だけが見られる。
// 写真＝水の音 公式サイト（dormy-hotels.com/resort/hotels/mizunoto/・11-10 取得）を仮に使用（外観・貸切露天風呂・朝食）。差し替える場合は先方からいただく（CEO 11-10）。当店の写真＝お部屋・ドッグラン・外観。
// 確認が取れたら: ご確認バナーを外し、/news の記事（CMS・slug hakone-mizunoto-dog-guide）として公開し直す。
// 犬の可否＝11-10 CEO（面談で確認）愛犬と一緒には泊まれない。書かないこと:「提携」・電話番号・組数・他の宿の名前。

export const metadata: Metadata = {
  title: "愛犬は近くに預けて、箱根小涌谷温泉 水の音に泊まる｜DogHub箱根仙石原",
  description: "箱根小涌谷温泉 水の音に泊まる日、愛犬は車で約18分の仙石原でお預かりします。1泊2日の流れと料金をご案内します。",
  robots: { index: false, follow: false },
};

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[#3C200F] mt-14 mb-5 pb-2 border-b border-[#E5DDD8]" style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 400, lineHeight: 1.5 }}>{children}</h2>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[#3C200F] mb-5" style={{ fontSize: "16px", lineHeight: "2" }}>{children}</p>
);
function Photo({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-7">
      <Image src={src} alt={alt} width={1400} height={835} className="w-full h-auto rounded" sizes="(max-width: 768px) 100vw, 720px" />
      {caption && <figcaption className="text-[#8F7B65] mt-2" style={{ fontSize: "12px" }}>{caption}</figcaption>}
    </figure>
  );
}

export default function MizunotoDraftPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20 bg-white">
        <div className="bg-[#FFF8DC] border-b border-[#E8D9A0] px-6 py-4">
          <div className="max-w-3xl mx-auto text-[#5A4A1E]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
            <p className="font-medium">ご確認用の下書きです（公開前）</p>
            <p>このページは検索結果に表示されず、当店のホームページからもリンクしておりません。水の音様の写真は、公式サイトから仮にお借りしています。差し替える場合は、お写真をご提供いただけますと幸いです。直すべき点がございましたら、お知らせください。</p>
          </div>
        </div>
        <article className="max-w-3xl mx-auto px-6 py-10 md:py-12">
          <p className="text-[#8F7B65] mb-3" style={{ fontSize: "13px" }}>宿泊施設 ／ 箱根・小涌谷</p>
          <h1 className="text-[#3C200F] mb-10" style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 400, lineHeight: 1.5 }}>{"愛犬は近くに預けて、箱根小涌谷温泉 水の音に泊まる"}</h1>
          <Photo src="/images/mizunoto-exterior.jpg" alt="箱根小涌谷温泉 水の音の外観" caption="写真：箱根小涌谷温泉 水の音 公式サイトより（仮）" /><P>{"小涌谷の森の中に、庭を川が流れる温泉宿があります。箱根小涌谷温泉 水の音です。"}</P><P>{"「あの宿でゆっくり湯めぐりをしたいけれど、うちには犬がいて」"}</P><P>{"仙石原で犬のホテルをしている私たちのところにも、水の音にお泊まりの日に、愛犬を預けてくださるお客さまがいらっしゃいます。"}</P><P>{"愛犬は近くに預けて、飼い主さんは宿でのんびり過ごす。そんな旅の組み立て方を、道のりと時間の目安といっしょにご案内します。"}</P><H2>{"湯めぐりの宿で過ごす、飼い主さんの時間"}</H2><Photo src="/images/mizunoto-private-bath.jpg" alt="水の音の貸切露天風呂" caption="写真：箱根小涌谷温泉 水の音 公式サイトより（仮）" /><P>{"水の音には、「小涌谷温泉」と「宮ノ下温泉」の2つの源泉が湧いていて、貸切の露天風呂を含めて13の湯舟があります。2つの大浴場は男女の入れ替え制なので、夜と朝で違うお湯に入れます。"}</P><P>{"庭園へ向かう道の途中には、貸切の露天風呂が3つ。予約はいらず、空いていればいつでも無料で入れます。夕方に川の流れる庭園を歩いて、そのまま貸切のお湯へ、という過ごし方もできそうです。"}</P><P>{"夕食は「炙り焼き会席」と「足柄遊膳会席」から選べます。館内には夜食のコーナーもあって、公式の過ごし方の例では、夜10時に夜鳴きそばで一日をしめくくっています。"}</P><P>{"水の音は、愛犬とご一緒にはお泊まりいただけません（盲導犬を除く）。"}</P><P>{"湯上がりにもう一度お湯へ、夜食をつまんでまたお湯へ。時計を気にせずに行ったり来たりできるのが、湯めぐりの宿のいいところですよね。愛犬の時間とご自身の時間を分けて組むと、その行ったり来たりを心おきなく楽しんでいただけます。"}</P><H2>{"愛犬が過ごすのは、車で約18分の仙石原"}</H2><P>{"当店から水の音までは、車で約18分、7.6kmほどです。"}</P><P>{"宿から当店へは、道が2つあります。国道138号を通る道は、県道723号で木賀へ出て、国道138号で仙石原へ。県道733号を通る道は、強羅の温泉街を抜けて、ポーラ美術館の前を通り仙石原へ。どちらも約18分です。仙石原に入ったら、当店の案内看板が目印です。なお、当店は送迎をしておりません。お車でのご旅行に向いた方法です。"}</P><P>{"お預かりするのは、鉄格子のケージではなく、木で仕切った完全個室のお部屋です。お預かり中はスタッフがドッグランにも出します。夜は宿直スタッフが建物に泊まり、寝る前に見回りをして、そのあともカメラで様子を見ています。"}</P><P>{"うちで一番年長のぱんち（マルプー）を見ていると、年齢を重ねた子ほど、静かな自分だけの場所で過ごすほうが落ち着くように感じます。看板犬のムック（ミニチュアシュナウザー）はマイペースな性格で、はじめましての子にも、のんびり接してくれます。"}</P><Photo src="/images/doghub-hotel-room-full-01.jpg" alt="DogHub箱根仙石原" /><H2>{"1泊2日の流れ"}</H2><Photo src="/images/mizunoto-breakfast.jpg" alt="水の音の朝食" caption="写真：箱根小涌谷温泉 水の音 公式サイトより（仮）" /><P>{"水の音のチェックインは15時から、当店の宿泊のお預かりは14時から17時までです。先に当店へ寄って愛犬を預けてから宿へ向かうと、ちょうど無理なくつながります。"}</P><div className="overflow-x-auto my-6"><table className="w-full text-[14px] text-[#3C200F] border-collapse"><thead><tr><th className="text-left p-2 bg-[#F8F5F0] border border-[#E5DDD8]">{"いつ"}</th><th className="text-left p-2 bg-[#F8F5F0] border border-[#E5DDD8]">{"どこで"}</th><th className="text-left p-2 bg-[#F8F5F0] border border-[#E5DDD8]">{"すること"}</th></tr></thead><tbody><tr><td className="p-2 border border-[#E5DDD8] align-top">{"1日目 14:00〜17:00"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"DogHub"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"愛犬をお預け（受付と持ち物の確認で10分ほど）"}</td></tr><tr><td className="p-2 border border-[#E5DDD8] align-top">{"1日目 15:00〜"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"水の音"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"車で約18分。チェックイン"}</td></tr><tr><td className="p-2 border border-[#E5DDD8] align-top">{"2日目 〜11:00"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"水の音"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"朝風呂とご朝食のあと、チェックアウト"}</td></tr><tr><td className="p-2 border border-[#E5DDD8] align-top">{"2日目 〜12:00"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"DogHub"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"お迎え"}</td></tr></tbody></table></div><P>{"料金は、宿泊お預かりが1泊¥7,700（1頭あたり・税込）です。"}</P><P>{"当店のお迎えは翌朝9時から11時までが基本です。水の音のチェックアウトは11時なので、11時ちょうどに宿を出られるなら、12時のお迎えにしておくと道中も慌てずに済みます。そのあとの延長は1時間¥1,100（1頭あたり）で、ご予約フォームの「お迎えの延長」で時刻をお選びください。10時40分ごろに宿を出られるなら、延長なしで間に合います。"}</P><P>{"チェックアウトのあと、少し歩いてから帰りたい日も、この延長で足ります。午後までゆっくりされるなら、「半日お預かり（4時間）」¥3,300（1頭あたり）を続けて、15時までお預けいただくこともできます。"}</P><P>{"美術館などをまわってから帰る日は、「1日お預かり（8時間）」¥5,500（1頭あたり）を続けて、17時までお預けいただけます。半日・1日は、ご予約フォームでチェックアウト後のご希望をお選びください。スタッフが空きを確認して確定します。2泊以上のご滞在も承っています。"}</P><P>{"お昼前に箱根へ着かれる日は、9時から先にお預けいただいて、身軽に観光されてから宿へ向かうこともできます（1時間¥1,100・1頭あたり）。"}</P><P>{"水曜・木曜は当店の定休日です。定休日をまたぐご宿泊は、ご予約の際にご相談ください。"}</P><H2>{"お迎えのあとは、愛犬と仙石原で"}</H2><P>{"お迎えのあとは、愛犬といっしょの時間です。"}</P><P>{"土日祝なら、当店併設のカフェでおむすびとスープをどうぞ（11時から17時まで）。犬連れで店内で召し上がれて、カフェをご利用の方はドッグランもお使いいただけます。平日（金・月・火）はお飲み物のテイクアウト販売のみで、店内とドッグランはご利用いただけません。"}</P><P>{"仙石原は朝晩が冷えるので、秋から冬は愛犬の上着があると安心です。"}</P><Photo src="/images/doghub-dogrun-sunset.jpg" alt="DogHub箱根仙石原" /><H2>{"ご予約のこと"}</H2><Photo src="/images/doghub-exterior-flowers-01.jpg" alt="DogHub箱根仙石原の外観" /><P>{"水の音のご予約は水の音へ、お預かりのご予約は当店へ、それぞれお願いします。週末や連休、年末年始は当店もかなりお部屋が埋まってしまうので、宿が決まったら早めに押さえておくと安心です。"}</P><P>{"Webのご予約は翌日以降の分を承っています。当日のご相談はお電話でどうぞ。"}</P><P>{"お持ちいただくものは、狂犬病と混合ワクチンの証明書、普段のごはん、あればお気に入りのタオルやおもちゃです。体重はちょうど15kgまでの子はそのままご予約いただけて、15kgを超える子はスタッフが確認してからの確定になります。"}</P><H2>{"川の音を聴きながら"}</H2><P>{"貸切のお湯で庭の川の音を聴いているころ、愛犬は仙石原の自分のお部屋で、のんびり夜を過ごしています。"}</P><P>{"お迎えのあと、愛犬とどこを歩こうか迷ったら、"}<a href="https://wanwalk.jp/hakone" className="underline" target="_blank" rel="noopener noreferrer">{"WanWalk の箱根 愛犬さんぽマップ"}</a>{"をのぞいてみてください。仙石原や芦ノ湖の散歩コースを、駐車場や犬連れで寄れる場所といっしょに紹介しています。"}</P>
          <div className="mt-12 p-6 bg-[#F8F5F0] border-l-4 border-[#B87942]">
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "15px", lineHeight: 1.9 }}>水の音から車で約18分。宿泊のお預かりは1泊¥7,700（1頭あたり・税込）です。</p>
            <Link href="/partner/mizunoto" className="inline-block bg-[#B87942] text-white px-6 py-3 rounded" style={{ fontSize: "15px" }}>水の音にお泊まりの方のご案内とご予約</Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
