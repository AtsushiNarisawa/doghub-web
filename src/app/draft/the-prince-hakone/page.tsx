import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// ザ・プリンス 箱根芦ノ湖 の記事（下書き・先方確認用）。原稿＝the-prince-hakone_article_rough_2026-11-06.md（marketing/scripts/draft_page_from_rough.py で生成）。
// 🔴 先方の確認が取れるまで非公開＝noindex・サイトマップ外・サイト内リンクなし。URL を知っている人だけが見られる。
// 写真＝公式サイトから仮に使用。差し替える場合は先方からいただく。確認が取れたら帯を外し /news の記事（CMS）として公開し直す。

export const metadata: Metadata = {
  title: "ザ・プリンス 箱根芦ノ湖の朝と、仙石原で眠る愛犬｜DogHub箱根仙石原",
  description: "湖畔の湯は朝6時から。ザ・プリンス 箱根芦ノ湖で湖の朝を迎える日、愛犬は車で約20分の仙石原の個室でお泊まりです。",
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

export default function ThePrinceHakoneDraftPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20 bg-white">
        <div className="bg-[#FFF8DC] border-b border-[#E8D9A0] px-6 py-4">
          <div className="max-w-3xl mx-auto text-[#5A4A1E]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
            <p className="font-medium">ご確認用の下書きです（公開前）</p>
            <p>このページは検索結果に表示されず、当店のホームページからもリンクしておりません。ザ・プリンス 箱根芦ノ湖様の写真は、公式サイトから仮にお借りしています。差し替える場合は、お写真をご提供いただけますと幸いです。直すべき点がございましたら、お知らせください。</p>
          </div>
        </div>
        <article className="max-w-3xl mx-auto px-6 py-10 md:py-12">
          <p className="text-[#8F7B65] mb-3" style={{ fontSize: "13px" }}>宿泊施設 ／ 箱根・芦ノ湖</p>
          <h1 className="text-[#3C200F] mb-10" style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 400, lineHeight: 1.5 }}>{"ザ・プリンス 箱根芦ノ湖の朝と、仙石原で眠る愛犬"}</h1>
          <Photo src="/images/the-prince-hakone-interior.jpg" alt="ザ・プリンス 箱根芦ノ湖" caption="写真：ザ・プリンス 箱根芦ノ湖 公式サイトより（仮）" /><P>{"朝6時、ザ・プリンス 箱根芦ノ湖の「箱根 湖畔の湯」が開きます。露天風呂の目の前は芦ノ湖。夜のあいだ黒く沈んでいた湖面が、少しずつ色を取り戻していくのを、湯船の中から眺められる時間です。"}</P><P>{"この朝を迎えるために泊まりたい。けれど、家には犬がいる。そんなご相談は、仙石原にある私たちの店にもときどき届きます。"}</P><P>{"このホテルは、客室もレストランも、補助犬を除いてペットとご一緒にはご利用いただけません。それなら、愛犬には一晩だけ近くの個室で休んでもらい、飼い主さんは湖の朝に集中する。そういう泊まり方を、このホテルならではの過ごし方と合わせてご紹介します。"}</P><H2>{"森に円を描く建物と、湖に向いた窓"}</H2><P>{"ザ・プリンス 箱根芦ノ湖は、建築家の村野藤吾さんが手がけたホテルです。芦ノ湖のほとりの森に、ゆるやかな円を描くように建っていて、湖側のお部屋の窓には芦ノ湖と山並みが広がります。空気の澄んだ日には、その向こうに富士山まで見えるそうです。"}</P><P>{"箱根には景色のいい宿がたくさんありますが、建物そのものが森と湖に合わせて設計されている、というのはこのホテルの大きな個性だと思います。チェックインの15時から窓辺で過ごしているだけで、湖の色が午後から夕方へ移っていくのが分かるはずです。"}</P><H2>{"朝の湖畔の湯と、ル・トリアノンの朝食"}</H2><P>{"宿泊の方だけが入れる「箱根 湖畔の湯」は、敷地内に湧く自家源泉のお湯です。朝は6時から入れるので、早起きして一番に湖を見に行く、という朝の使い方ができます。"}</P><P>{"湯上がりの朝食は、2フロア分の高さがある「メインダイニングルーム ル・トリアノン」で。前日のチェックインまでに申し込んでおくと、テラス席を用意してもらえるそうです。冬は庭園のイルミネーションもあり、夜と朝で違う表情の芦ノ湖に出会えます。"}</P><P>{"お湯にも朝食にも、時計を気にせず身をゆだねたい。愛犬を別のところで休ませる理由は、そこにあると思っています。"}</P><H2>{"湖の朝から逆算する、愛犬の一泊"}</H2><P>{"当店の宿泊のお預かりは、14時から17時のあいだにお連れいただきます。ホテルのチェックインが15時からなので、14時台に仙石原で愛犬を預けて、そのまま湖へ向かうと、ちょうどいい流れになります。"}</P><P>{"翌朝は、湖畔の湯と朝食をすませてホテルを出てから、仙石原へお迎えに来てください。お迎えは11時までが基本で、もう少しゆっくりしたい朝は1時間¥1,100（1頭あたり）で延ばせます。チェックアウトのあとに美術館へ寄るなら、そのまま半日や1日のお預かりに続けることもできます。"}</P><P>{"宿泊のお預かりは1泊¥7,700（1頭あたり・税込）です。延長や半日・1日の料金、お持ちいただくもの、ご予約の方法は、"}<a href="/partner/the-prince-hakone" className="underline">{"ザ・プリンス 箱根芦ノ湖にお泊まりの方へのご案内"}</a>{"にまとめました。ホテルのご予約はホテルへ、お預かりは当店へ、別々にお願いしています。"}</P><Photo src="/images/doghub-hotel-room-full-01.jpg" alt="DogHub箱根仙石原" /><H2>{"翌日は箱根園ゴルフ場でプレーする、という組み方"}</H2><P>{"ホテルから箱根園ゴルフ場までは、公式の案内で車で約5分。湖の朝を楽しんだあと、その足でラウンドに出かける2日間も組めます。"}</P><div className="overflow-x-auto my-6"><table className="w-full text-[14px] text-[#3C200F] border-collapse"><thead><tr><th className="text-left p-2 bg-[#F8F5F0] border border-[#E5DDD8]">{"日・時刻"}</th><th className="text-left p-2 bg-[#F8F5F0] border border-[#E5DDD8]">{"場所"}</th><th className="text-left p-2 bg-[#F8F5F0] border border-[#E5DDD8]">{"すること"}</th></tr></thead><tbody><tr><td className="p-2 border border-[#E5DDD8] align-top">{"1日目 14時〜17時のあいだ"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"仙石原の当店"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"宿泊のお預かりで愛犬を預ける"}</td></tr><tr><td className="p-2 border border-[#E5DDD8] align-top">{"1日目 15:00〜"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"ザ・プリンス 箱根芦ノ湖"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"チェックイン。夜と朝の湖畔の湯"}</td></tr><tr><td className="p-2 border border-[#E5DDD8] align-top">{"2日目 朝"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"ザ・プリンス 箱根芦ノ湖"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"ご朝食のあとチェックアウト"}</td></tr><tr><td className="p-2 border border-[#E5DDD8] align-top">{"2日目 午前〜"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"箱根園ゴルフ場"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"車で約5分。ラウンド"}</td></tr><tr><td className="p-2 border border-[#E5DDD8] align-top">{"2日目 〜17:00"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"仙石原の当店"}</td><td className="p-2 border border-[#E5DDD8] align-top">{"ラウンドのあとにお迎え"}</td></tr></tbody></table></div><P>{"当店のほうは、宿泊のお預かりに、チェックアウト後の「1日お預かり（8時間）」を続ける形です。1日の分は17時までで¥5,500（1頭あたり・税込）。ご予約フォームで「チェックアウト後のご希望」に1日を選んでいただくと、スタッフが空きを確かめてから確定のご連絡をします。お迎えが17時を過ぎそうなときは、1時間¥1,100（1頭あたり）で延長できます。"}</P><P>{"前の日から愛犬を預かっているので、スタートが早い朝でも当店に寄る必要がありません。ホテルからゴルフ場へまっすぐ向かえるのが、この組み方のいちばんの利点です。"}</P><Photo src="/images/hakoneen-golf-course.jpg" alt="ザ・プリンス 箱根芦ノ湖" caption="写真：ザ・プリンス 箱根芦ノ湖 公式サイトより（仮）" /><H2>{"仙石原から湖へ、11.7kmの道"}</H2><P>{"当店からホテルまでは、車で約20分、11.7kmほどです。"}</P><P>{"御殿場ICから乙女峠を越えてくると、仙石原は芦ノ湖へ下りていく途中にあたります。寄り道というより、通り道の一か所に立ち寄る感覚です。小田原から箱根新道で来られる場合は少し遠回りになるので、時間に余裕を見てくださいね。送迎はしていないので、お車の旅の方に向いた方法です。"}</P><P>{"愛犬が泊まるのは、木の壁で仕切った個室です。ケージではなく、一頭ずつのお部屋。夜は宿直のスタッフが同じ建物に泊まり、寝る前に見回ったあとはカメラで見守っています。看板犬でいちばん年上のぱんち（マルプー）も、にぎやかな場所より、自分のお部屋で静かにしている時間が好きな子です。"}</P><Photo src="/images/doghub-exterior-flowers-01.jpg" alt="DogHub箱根仙石原" /><H2>{"湖の朝のあとで"}</H2><P>{"お迎えのあとは、今度は愛犬と一緒に芦ノ湖のほとりを歩いてみてください。朝の湖を一人で眺めたあとに、同じ景色を愛犬と見るのも、この泊まり方のいいところです。犬と歩ける湖畔の道は、WanWalk の"}<a href="https://wanwalk.jp/hakone" className="underline" target="_blank" rel="noopener noreferrer">{"箱根のさんぽマップ"}</a>{"で駐車場と一緒に探せます。"}</P>
          <div className="mt-12 p-6 bg-[#F8F5F0] border-l-4 border-[#B87942]">
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "15px", lineHeight: 1.9 }}>{"ホテルから車で約21分。宿泊のお預かりは1泊¥7,700（1頭あたり・税込）です。"}</p>
            <Link href="/partner/the-prince-hakone" className="inline-block bg-[#B87942] text-white px-6 py-3 rounded" style={{ fontSize: "15px" }}>ザ・プリンス 箱根芦ノ湖のお客様へのご案内とご予約</Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
