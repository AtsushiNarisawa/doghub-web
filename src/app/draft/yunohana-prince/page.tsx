import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// 箱根湯の花プリンスホテル の記事（下書き・先方確認用）。原稿＝../drafts/yunohana-prince_article_rough_2026-11-10.md（marketing/scripts/draft_page_from_rough.py で生成）。
// 🔴 先方の確認が取れるまで非公開＝noindex・サイトマップ外・サイト内リンクなし。URL を知っている人だけが見られる。
// 写真＝公式サイトから仮に使用。差し替える場合は先方からいただく。確認が取れたら帯を外し /news の記事（CMS）として公開し直す。

export const metadata: Metadata = {
  title: "愛犬は仙石原に預けて、箱根湯の花プリンスホテルへ｜DogHub箱根仙石原",
  description: "標高935mの箱根湯の花プリンスホテルに泊まる日、愛犬は車で約26分の仙石原でお預かりします。道順と1泊2日の流れをご案内します。",
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

export default function YunohanaPrinceDraftPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20 bg-white">
        <div className="bg-[#FFF8DC] border-b border-[#E8D9A0] px-6 py-4">
          <div className="max-w-3xl mx-auto text-[#5A4A1E]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
            <p className="font-medium">ご確認用の下書きです（公開前）</p>
            <p>このページは検索結果に表示されず、当店のホームページからもリンクしておりません。箱根湯の花プリンスホテル様の写真は、公式サイトから仮にお借りしています。差し替える場合は、お写真をご提供いただけますと幸いです。直すべき点がございましたら、お知らせください。</p>
          </div>
        </div>
        <article className="max-w-3xl mx-auto px-6 py-10 md:py-12">
          <p className="text-[#8F7B65] mb-3" style={{ fontSize: "13px" }}>宿泊施設 ／ 箱根・芦之湯</p>
          <h1 className="text-[#3C200F] mb-10" style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 400, lineHeight: 1.5 }}>{"愛犬は仙石原に預けて、箱根湯の花プリンスホテルへ"}</h1>
          <Photo src="/images/yunohana-prince-exterior.jpg" alt="箱根湯の花プリンスホテル" caption="写真：箱根湯の花プリンスホテル 公式サイトより（仮）" /><P>{"芦ノ湖の北東、芦之湯の山の上に、標高935mの宿があります。箱根湯の花プリンスホテルです。公式サイトでは「箱根一の標高」と紹介されていて、まわりは国立公園の森。野鳥がよく集まる場所として、「かながわ探鳥地50選」にも選ばれています。"}</P><P>{"「あの乳白色のお湯に浸かりたいけれど、うちには犬がいて」"}</P><P>{"仙石原で犬のホテルをしている私たちのところには、箱根の宿に泊まる日に、愛犬を預けてくださるお客さまがいらっしゃいます。山の上の宿でゆっくりする日の、愛犬の預け方をご案内します。"}</P><H2>{"先に仙石原へ寄ってから、山を上がる"}</H2><P>{"当店の宿泊のお預かりは、14時から17時までです。ホテルのチェックインは15時からなので、先に当店へ寄って愛犬を預けてから、ホテルへ向かうと無理なくつながります。"}</P><P>{"当店からホテルまでは、車で約26分、13kmほどです。道は2つあります。ひとつは強羅を通る道で、仙石原からポーラ美術館の前を通って強羅へ下り、国道1号で芦之湯へ上がります。もうひとつは宮ノ下を通る道で、国道138号で宮城野・木賀を抜けて宮ノ下へ、そこから国道1号を上がります（約28分）。"}</P><P>{"ホテルのあたりは標高が高いので、冬は路面の凍結や雪に気をつけてください。公式のアクセスのご案内でも、冬はスタッドレスタイヤやチェーンをすすめています。なお、当店は送迎をしておりません。お車でのご旅行に向いた方法です。"}</P><div className="overflow-x-auto my-6"><table className="w-full text-[14px] text-[#3C200F] border-collapse"><thead><tr><th className="text-left p-2 bg-[#F8F5F0] border border-[#E5DDD8]">{"いつ"}</th><th className="text-left p-2 bg-[#F8F5F0] border border-[#E5DDD8]">{"どこで"}</th><th className="text-left p-2 bg-[#F8F5F0] border border-[#E5DDD8]">{"すること"}</th></tr></thead><tbody><tr><td className="p-2 border border-[#E5DDD8] align-top">{"1日目 14:00〜17:00"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"DogHub"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"愛犬をお預け（受付と持ち物の確認で10分ほど）"}</td></tr><tr><td className="p-2 border border-[#E5DDD8] align-top">{"1日目 15:00〜"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"ホテル"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"車で約26分。チェックイン"}</td></tr><tr><td className="p-2 border border-[#E5DDD8] align-top">{"2日目 〜11:00"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"ホテル"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"朝風呂とご朝食のあと、チェックアウト"}</td></tr><tr><td className="p-2 border border-[#E5DDD8] align-top">{"2日目 〜12:00"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"DogHub"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"お迎え"}</td></tr></tbody></table></div><H2>{"乳白色のにごり湯と、相模湾まで見える部屋"}</H2><P>{"ホテルの露天風呂は、湯ノ花沢温泉の乳白色のにごり湯です。泉質は単純硫黄温泉で、公式サイトでは「美肌の湯」と紹介されています。温泉が引かれているのは露天風呂で、内湯は沸かし湯です。お泊まりの方は、到着から夜0時まで、翌朝は5時から10時まで入れます。"}</P><Photo src="/images/yunohana-prince-onsen.jpg" alt="箱根湯の花プリンスホテル" caption="写真：箱根湯の花プリンスホテル 公式サイトより（仮）" /><P>{"客室は和室が中心で、4階の角部屋「和 プレミアツイン」からは、遠く相模湾や三浦半島・房総半島まで見渡せるそうです。秋は中庭が紅葉で色づきます。"}</P><P>{"ホテルからはザ・プリンス 箱根芦ノ湖と箱根園への無料の送迎バスが毎日出ているので、2日目の朝に芦ノ湖まで足をのばすこともできます。"}</P><Photo src="/images/yunohana-prince-room.jpg" alt="箱根湯の花プリンスホテル" caption="写真：箱根湯の花プリンスホテル 公式サイトより（仮）" /><H2>{"愛犬が過ごすのは、仙石原の木のお部屋"}</H2><P>{"お預かりするのは、鉄格子のケージではなく、木で仕切った完全個室のお部屋です。お預かり中はスタッフがドッグランにも出します。夜は宿直のスタッフが建物に泊まり、寝る前に見回りをして、そのあともカメラで様子を見ています。"}</P><P>{"うちで一番年長のぱんち（マルプー）を見ていると、年齢を重ねた子ほど、静かな自分だけの場所で過ごすほうが落ち着くように感じます。にごり湯でのんびりしているあいだ、愛犬も自分のお部屋で、ゆっくり夜を過ごしています。"}</P><Photo src="/images/doghub-hotel-room-plant-side.jpg" alt="DogHub箱根仙石原" /><H2>{"翌朝は、急がずに山を下りる"}</H2><P>{"当店のお迎えは、翌朝9時から11時までが基本です。ホテルのチェックアウトは11時なので、11時ちょうどに出られるなら、ご予約フォームの「お迎えの延長」で12時を選んでおくと、山道も慌てずに下りられます。延長は1時間¥1,100（1頭あたり）です。10時半ごろにホテルを出られるなら、延長なしで間に合います。"}</P><P>{"午後まで箱根で過ごされるなら、チェックアウトのあとに「半日お預かり（4時間）」¥3,300（1頭あたり）を続けて15時まで、「1日お預かり（8時間）」¥5,500（1頭あたり）を続けて17時までお預けいただけます。ご予約フォームでチェックアウト後のご希望をお選びください。スタッフが空きを確認して確定します。"}</P><P>{"水曜・木曜は当店の定休日です。定休日をまたぐご宿泊は、ご予約の際にご相談ください。"}</P><Photo src="/images/doghub-exterior-entrance-02.jpg" alt="DogHub箱根仙石原" /><H2>{"お隣のゴルフ場でプレーする日は"}</H2><P>{"ホテルのすぐ隣には、箱根湯の花ゴルフ場があります。前の日にホテルへ泊まって、翌朝プレーするなら、愛犬は前日から当店で預かり、ラウンドのあとにお迎えに来ていただく形がいちばん身軽です。ゴルフの日の組み方は、"}<a href="/draft/yunohana-golf" className="underline">{"箱根湯の花ゴルフ場の記事"}</a>{"にまとめました。"}</P><H2>{"ご予約のこと"}</H2><P>{"ホテルのご予約はホテルへ、お預かりのご予約は当店へ、それぞれお願いします。受付の流れや持ち物は、"}<a href="/partner/yunohana-prince" className="underline">{"箱根湯の花プリンスホテルにご宿泊のお客様へのご案内"}</a>{"に載せています。週末や連休、年末年始は当店もかなりお部屋が埋まってしまうので、宿が決まったら早めに押さえておくと安心です。"}</P><H2>{"にごり湯から上がるころ"}</H2><P>{"湯上がりに窓の外の森を眺めているころ、愛犬は仙石原の自分のお部屋で、のんびり夜を過ごしています。翌朝、山を下りてお迎えに来ていただいたら、そこからは愛犬といっしょの時間です。"}</P>
          <div className="mt-12 p-6 bg-[#F8F5F0] border-l-4 border-[#B87942]">
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "15px", lineHeight: 1.9 }}>{"箱根湯の花プリンスホテルから車で約26分。宿泊お預かり1泊¥7,700（1頭あたり・税込）。お迎えを遅らせる場合は1時間¥1,100（1頭あたり）です。"}</p>
            <Link href="/partner/yunohana-prince" className="inline-block bg-[#B87942] text-white px-6 py-3 rounded" style={{ fontSize: "15px" }}>箱根湯の花プリンスホテルのお客様へのご案内とご予約</Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
