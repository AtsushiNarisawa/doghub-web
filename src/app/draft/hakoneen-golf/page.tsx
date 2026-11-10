import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// 箱根園ゴルフ場 の記事（下書き・先方確認用）。原稿＝hakoneen-golf_article_rough_2026-11-09.md（marketing/scripts/draft_page_from_rough.py で生成）。
// 🔴 先方の確認が取れるまで非公開＝noindex・サイトマップ外・サイト内リンクなし。URL を知っている人だけが見られる。
// 写真＝公式サイトから仮に使用。差し替える場合は先方からいただく。確認が取れたら帯を外し /news の記事（CMS）として公開し直す。

export const metadata: Metadata = {
  title: "朝7時に愛犬を預けて、箱根園ゴルフ場へ｜DogHub箱根仙石原",
  description: "1日お預かりは朝7時から。箱根園ゴルフ場まで車で17分の仙石原で愛犬を預けて、ラウンドのあとにお迎えに来る1日の組み方です。",
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

export default function HakoneenGolfDraftPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20 bg-white">
        <div className="bg-[#FFF8DC] border-b border-[#E8D9A0] px-6 py-4">
          <div className="max-w-3xl mx-auto text-[#5A4A1E]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
            <p className="font-medium">ご確認用の下書きです（公開前）</p>
            <p>このページは検索結果に表示されず、当店のホームページからもリンクしておりません。箱根園ゴルフ場様の写真は、公式サイトから仮にお借りしています。差し替える場合は、お写真をご提供いただけますと幸いです。直すべき点がございましたら、お知らせください。</p>
          </div>
        </div>
        <article className="max-w-3xl mx-auto px-6 py-10 md:py-12">
          <p className="text-[#8F7B65] mb-3" style={{ fontSize: "13px" }}>ゴルフ場 ／ 箱根・芦ノ湖</p>
          <h1 className="text-[#3C200F] mb-10" style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 400, lineHeight: 1.5 }}>{"朝7時に愛犬を預けて、箱根園ゴルフ場へ"}</h1>
          <Photo src="/images/hakoneen-golf-course.jpg" alt="箱根園ゴルフ場" caption="写真：箱根園ゴルフ場 公式サイトより（仮）" /><P>{"仙石原の当店が開くのは、朝7時です。ゴルフの日のお客さまは、この時間にゴルフバッグを積んだ車でいらっしゃることがあります。受付と持ち物の確認をして、愛犬をお部屋に案内したら、10分ほどで出発です。"}</P><P>{"そこから箱根園ゴルフ場までは、車で17分。プレーの日の朝を、犬連れでも慌てずに始めるための組み方をお話しします。"}</P><H2>{"7時に預けて、7時半にはゴルフ場"}</H2><P>{"当店から箱根園ゴルフ場までは、10.3kmほどです。御殿場ICから乙女峠を越えてくる道なら、仙石原はゴルフ場へ向かう途中にあたり、帰りも同じ道で乙女峠へ戻れます。小田原方面からだと遠回りになるので、行きの時間は多めに見ておいてください。当店は送迎をしていないので、お車で来られる方のための方法です。"}</P><P>{"朝7時にお預けいただいて、7時半ごろにゴルフ場へ着く。これが、いちばん早い組み方の目安です。7時より前のお預かりはしていません。クラブハウスが開く時刻は時期によって変わるので、ゴルフ場のお知らせを見て、スタートに間に合うかを確かめてからご予約くださいね。"}</P><Photo src="/images/doghub-exterior-awning-large.jpg" alt="DogHub箱根仙石原" /><H2>{"富士山を正面に、芦ノ湖へ下る18ホール"}</H2><P>{"箱根園ゴルフ場は、駒ヶ岳を背にして、芦ノ湖へ向かって下っていく斜面に広がる18ホール（パー71）です。山の裾をなぞるように作られていて、公式の案内でも、アップダウンはそれほど感じないコースと紹介されています。7番ホールでは、正面に富士山、眼下に芦ノ湖。ほとんどのホールからこの二つが見えるので、晴れた日はスコアより景色が気になってしまうかもしれません。"}</P><P>{"プレーはセルフで、GPSナビの付いたカートで回ります。お昼は芦ノ湖を見下ろすレストランで。練習場もあり、ゴルフ場は年中無休です。"}</P><Photo src="/images/hakoneen-golf-green.jpg" alt="箱根園ゴルフ場" caption="写真：箱根園ゴルフ場 公式サイトより（仮）" /><H2>{"ラウンドの長さで、プランを選ぶ"}</H2><P>{"18ホールを回ってお昼までとる日は、「1日お預かり（8時間）」です。早朝の枠なら7時から15時、通常の枠なら9時から17時で、料金は¥5,500（1頭あたり・税込）。ラウンドが長引いて8時間を超えそうなときは、1時間¥1,100（1頭あたり）で延ばせます。お迎えの最終は17時です。"}</P><P>{"ハーフだけの日や、午後からのスタートの日は、「半日お預かり（4時間）」¥3,300（1頭あたり・税込）でも足ります。お預けは9時から13時のあいだです。ただ、ゴルフ場との行き帰りで35分ほどかかるので、ハーフにお昼まで付けると4時間をはみ出しがちです。迷ったら1日にしておくと、最後まで時間を気にせず回れます。ハーフや午後スタートのプランがあるかは、ゴルフ場の予約ページでご確認ください。"}</P><P>{"ラウンドのあいだ、愛犬は木で仕切ったお部屋で過ごし、日中はスタッフと一緒にドッグランにも出ます。看板犬のムック（ミニチュアシュナウザー）はのんびり屋で、朝早く着いたばかりの子にも、自分のペースで寄っていきます。"}</P><P>{"受付の流れや持ち物、ご予約の方法は、"}<a href="/partner/hakoneen-golf" className="underline">{"箱根園ゴルフ場でプレーされる方へのご案内"}</a>{"に載せています。お預かりのご予約は当店へ、プレーのご予約はゴルフ場へお願いします。"}</P><Photo src="/images/doghub-schnauzer-exterior.jpg" alt="DogHub箱根仙石原" /><H2>{"遠くからなら、前の晩から預ける"}</H2><P>{"遠方から来られる方は、前の日のうちに箱根へ入っておく形もあります。前日の14時から17時のあいだに宿泊のお預かり（1泊¥7,700・1頭あたり・税込）で愛犬を預けておけば、プレーの朝は当店に寄らず、宿からまっすぐゴルフ場へ向かえます。翌日は、チェックアウト後の半日（15時まで）か1日（17時まで）にそのまま続けて、ラウンドのあとにお迎えに来てください。"}</P><P>{"ゴルフ場のすぐ近くのザ・プリンス 箱根芦ノ湖に前泊する場合の2日間の流れは、"}<a href="/draft/the-prince-hakone" className="underline">{"ザ・プリンス 箱根芦ノ湖の記事"}</a>{"にまとめました。ホテルからゴルフ場までは車で約5分です。"}</P><P>{"ゴルフ場は年中無休ですが、当店は水曜と木曜がお休みです。平日にプレーされる方は、曜日だけ先に見ておいてくださいね。"}</P><Photo src="/images/doghub-hotel-interior-rooms-01.jpg" alt="DogHub箱根仙石原" /><H2>{"最後のパットのあとで"}</H2><P>{"最後のパットを沈めて車に乗り、乙女峠へ戻る道の途中で仙石原に寄る。それで、プレーの1日がおしまいです。お迎えのときに、その日のお部屋での様子をお伝えしますね。"}</P>
          <div className="mt-12 p-6 bg-[#F8F5F0] border-l-4 border-[#B87942]">
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "15px", lineHeight: 1.9 }}>{"ゴルフ場まで車で約17分。1日のお預かり（8時間）は¥5,500（1頭あたり・税込）、朝7時からお預けいただけます。"}</p>
            <Link href="/partner/hakoneen-golf" className="inline-block bg-[#B87942] text-white px-6 py-3 rounded" style={{ fontSize: "15px" }}>箱根園ゴルフ場のお客様へのご案内とご予約</Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
