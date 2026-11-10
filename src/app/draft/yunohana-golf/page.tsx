import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// 箱根湯の花ゴルフ場 の記事（下書き・先方確認用）。原稿＝../drafts/yunohana-golf_article_rough_2026-11-10.md（marketing/scripts/draft_page_from_rough.py で生成）。
// 🔴 先方の確認が取れるまで非公開＝noindex・サイトマップ外・サイト内リンクなし。URL を知っている人だけが見られる。
// 写真＝公式サイトから仮に使用。差し替える場合は先方からいただく。確認が取れたら帯を外し /news の記事（CMS）として公開し直す。

export const metadata: Metadata = {
  title: "箱根湯の花ゴルフ場でプレーする日、愛犬は仙石原で｜DogHub箱根仙石原",
  description: "箱根湯の花ゴルフ場でプレーする日、愛犬は車で約26分の仙石原でお預かりします。ラウンドの長さに合うプランと、前泊の組み方をご案内します。",
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

export default function YunohanaGolfDraftPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20 bg-white">
        <div className="bg-[#FFF8DC] border-b border-[#E8D9A0] px-6 py-4">
          <div className="max-w-3xl mx-auto text-[#5A4A1E]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
            <p className="font-medium">ご確認用の下書きです（公開前）</p>
            <p>このページは検索結果に表示されず、当店のホームページからもリンクしておりません。箱根湯の花ゴルフ場様の写真は、公式サイトから仮にお借りしています。差し替える場合は、お写真をご提供いただけますと幸いです。直すべき点がございましたら、お知らせください。</p>
          </div>
        </div>
        <article className="max-w-3xl mx-auto px-6 py-10 md:py-12">
          <p className="text-[#8F7B65] mb-3" style={{ fontSize: "13px" }}>ゴルフ場 ／ 箱根・芦之湯</p>
          <h1 className="text-[#3C200F] mb-10" style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 400, lineHeight: 1.5 }}>{"箱根湯の花ゴルフ場でプレーする日、愛犬は仙石原で"}</h1>
          <Photo src="/images/yunohana-golf-aerial.jpg" alt="箱根湯の花ゴルフ場" caption="写真：箱根湯の花ゴルフ場 公式サイトより（仮）" /><P>{"箱根でいちばん高いところにあるゴルフコースを、ご存じですか。芦之湯の箱根湯の花ゴルフ場は標高935m。公式サイトでは、駒ヶ岳を背に、眼下に相模湾や江ノ島を望む18ホールと紹介されています。夏でも涼しい風が吹く、高原のコースです。"}</P><P>{"その日、愛犬をどうするか。仙石原で犬のホテルをしている私たちが、ラウンドのあいだお預かりします。"}</P><H2>{"まずは、ラウンドの長さから"}</H2><P>{"箱根湯の花ゴルフ場は、昼休みをはさまずに18ホールを続けて回るスループレーのコースで、公式の案内では平均4時間40分です。当店からゴルフ場までは車で約26分なので、行き帰りを足すと、5時間半ほどになります。"}</P><P>{"そのため、プランは「1日お預かり（8時間）」がおすすめです。早朝の枠なら7時から15時、通常の枠なら9時から17時で、料金は¥5,500（1頭あたり・税込）。8時間を超えそうなときは、1時間¥1,100（1頭あたり）で延ばせます。「半日お預かり（4時間）」¥3,300もありますが、18ホールだとはみ出してしまうことがほとんどです。"}</P><H2>{"朝7時に、仙石原を出る"}</H2><P>{"当店が開くのは朝7時です。受付と持ち物の確認をして、10分ほどで出発すれば、7時半すぎにはゴルフ場に着きます。ゴルフ場のフロントが開くのは、その日のいちばん早いスタートの45分前だそうなので、スタートの時刻はゴルフ場にご確認ください。7時より前のお預かりはしていません。"}</P><P>{"道は、ポーラ美術館の前を通って強羅へ下る道と、国道138号で宮ノ下へ出る道の2つがあり、どちらも国道1号で芦之湯へ上がります。当店は送迎をしていないので、お車で来られる方のための方法です。"}</P><Photo src="/images/doghub-exterior-awning-large.jpg" alt="DogHub箱根仙石原" /><H2>{"相模湾を見下ろす18ホール"}</H2><P>{"コースは18ホール・パー71。プレーはセルフで、GPSナビの付いたカートで回ります。2人でのプレーもできるので、ご夫婦で来られる日にも組みやすいコースです。公式のコース紹介では、1番ホールは秋に紅葉を一望でき、名物の17番ホールからは相模湾を一望できるそうです。"}</P><Photo src="/images/yunohana-golf-green.jpg" alt="箱根湯の花ゴルフ場" caption="写真：箱根湯の花ゴルフ場 公式サイトより（仮）" /><H2>{"前の晩は、隣のホテルに泊まる"}</H2><P>{"ゴルフ場は、箱根湯の花プリンスホテルのすぐ隣にあります。遠くから来られるなら、前の日のうちに箱根へ入っておく形もあります。"}</P><P>{"前日の14時から17時のあいだに、宿泊のお預かり（1泊¥7,700・1頭あたり・税込）で愛犬を預けてから、ホテルへ。プレーの朝は当店に寄らず、ホテルから歩いてゴルフ場へ向かえます。翌日は、チェックアウトのあとの「半日（15時まで）」か「1日（17時まで）」を、ご予約フォームでお選びください。ラウンドのあとにお迎えに来ていただければ大丈夫です。"}</P><P>{"ホテルに泊まる日の流れは、"}<a href="/draft/yunohana-prince" className="underline">{"箱根湯の花プリンスホテルの記事"}</a>{"にまとめました。"}</P><H2>{"上がったら、ホテルのお風呂へ"}</H2><P>{"ゴルフ場にはクラブハウスがなく、お風呂の代わりに、隣のホテルの大浴場を無料で使えます（公式の施設案内・2027年3月31日まで）。乳白色のにごり湯で汗を流してから、山を下りてお迎えに来ていただく。そんな締めくくり方もできます。大浴場の時間は平日13時から、土日は12時から、どちらも18時までです。"}</P><Photo src="/images/yunohana-golf-sunset.jpg" alt="箱根湯の花ゴルフ場" caption="写真：箱根湯の花ゴルフ場 公式サイトより（仮）" /><H2>{"ラウンドのあいだの愛犬"}</H2><P>{"ラウンドのあいだ、愛犬は木で仕切ったお部屋で過ごし、日中はスタッフと一緒にドッグランにも出ます。看板犬のムック（ミニチュアシュナウザー）はマイペースな性格で、朝早く着いたばかりの子にも、のんびり寄っていきます。"}</P><P>{"受付の流れや持ち物、ご予約の方法は、"}<a href="/partner/yunohana-golf" className="underline">{"箱根湯の花ゴルフ場でプレーされる方へのご案内"}</a>{"に載せています。お預かりのご予約は当店へ、プレーのご予約はゴルフ場へお願いします。"}</P><P>{"当店は水曜と木曜がお休みです。ゴルフ場も冬は休業の期間があるので、どちらの予定も先に見ておいてくださいね。"}</P><Photo src="/images/doghub-hotel-room-full-01.jpg" alt="DogHub箱根仙石原" /><H2>{"山を下りて、仙石原へ"}</H2><P>{"最後のホールを終えて、相模湾に別れを告げたら、山を下りて仙石原へ。お迎えのときに、その日のお部屋での様子をお伝えしますね。"}</P>
          <div className="mt-12 p-6 bg-[#F8F5F0] border-l-4 border-[#B87942]">
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "15px", lineHeight: 1.9 }}>{"箱根湯の花ゴルフ場から車で約26分。1日お預かり（8時間）¥5,500（1頭あたり・税込）。8時間を超える場合は1時間¥1,100（1頭あたり）で延長できます。"}</p>
            <Link href="/partner/yunohana-golf" className="inline-block bg-[#B87942] text-white px-6 py-3 rounded" style={{ fontSize: "15px" }}>箱根湯の花ゴルフ場のお客様へのご案内とご予約</Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
