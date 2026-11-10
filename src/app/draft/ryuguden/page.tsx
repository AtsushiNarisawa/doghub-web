import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// 龍宮殿 の記事（下書き・先方確認用）。原稿＝ryuguden_article_rough_2026-11-09.md（marketing/scripts/draft_page_from_rough.py で生成）。
// 🔴 先方の確認が取れるまで非公開＝noindex・サイトマップ外・サイト内リンクなし。URL を知っている人だけが見られる。
// 写真＝公式サイトから仮に使用。差し替える場合は先方からいただく。確認が取れたら帯を外し /news の記事（CMS）として公開し直す。

export const metadata: Metadata = {
  title: "龍宮殿本館の日帰り温泉へ。愛犬は仙石原で半日お預かり｜DogHub箱根仙石原",
  description: "龍宮殿本館の日帰り温泉は、浜名湖から移された建物のお風呂。湯につかる4時間、愛犬は車で19分の仙石原でお預かりします。",
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

export default function RyugudenDraftPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20 bg-white">
        <div className="bg-[#FFF8DC] border-b border-[#E8D9A0] px-6 py-4">
          <div className="max-w-3xl mx-auto text-[#5A4A1E]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
            <p className="font-medium">ご確認用の下書きです（公開前）</p>
            <p>このページは検索結果に表示されず、当店のホームページからもリンクしておりません。龍宮殿様の写真は、公式サイトから仮にお借りしています。差し替える場合は、お写真をご提供いただけますと幸いです。直すべき点がございましたら、お知らせください。</p>
          </div>
        </div>
        <article className="max-w-3xl mx-auto px-6 py-10 md:py-12">
          <p className="text-[#8F7B65] mb-3" style={{ fontSize: "13px" }}>宿泊施設・日帰り温泉 ／ 箱根・芦ノ湖</p>
          <h1 className="text-[#3C200F] mb-10" style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 400, lineHeight: 1.5 }}>{"龍宮殿本館の日帰り温泉へ。愛犬は仙石原で半日お預かり"}</h1>
          <Photo src="/images/ryuguden-exterior.jpg" alt="龍宮殿" caption="写真：龍宮殿 公式サイトより（仮）" /><P>{"龍宮殿本館の建物は、もともと箱根のものではありませんでした。"}</P><P>{"1938年、静岡の浜名湖に浮かぶ弁天島で、ホテルとして開業した建物です。戦後に解体されて芦ノ湖のほとりまで運ばれ、職人さんたちの手で組み直されました。1957年に旅館として開業し、いまは国の登録有形文化財になっています。湖から湖へ、建物ごと旅をしてきたわけです。"}</P><P>{"その本館が、いまは日帰りで入れる温泉になっています。愛犬との箱根旅の途中、数時間だけこのお湯に寄りたい。仙石原の私たちの店には、そんな日に半日、愛犬を預けていかれるお客さまがいらっしゃいます。"}</P><H2>{"鳳凰堂を思わせる屋根の下の、二つのお風呂"}</H2><P>{"本館は、平等院鳳凰堂をモチーフにした建物です。お風呂は女性が「胡蝶」、男性が「夢殿」。「胡蝶」の露天風呂では、芦ノ湖と富士山を一度に見渡せます。"}</P><P>{"営業は、平日が朝9時から、土休日が朝8時から、どちらも夜8時まで（最終受付は夜7時）です。湯上がりには、お休み処「聚楽」で横になったり、冷たいものを飲んだりしながら、ぼんやり湖を眺めて過ごせます。お風呂だけで帰るより、この休憩まで含めて一つの時間だと考えておくと、ちょうどいいと思います。"}</P><Photo src="/images/ryuguden-onsen.jpg" alt="龍宮殿" caption="写真：龍宮殿 公式サイトより（仮）" /><H2>{"お湯と休憩で、ちょうど4時間"}</H2><P>{"本館のお湯を楽しむ日には、「半日お預かり（4時間）」がよく合います。朝9時から13時のあいだにお預けいただき、そこから4時間です。"}</P><P>{"たとえば10時に仙石原で愛犬を預けると、本館へは車で19分ほど。10時半ごろからお風呂に入り、聚楽で休んで13時半ごろに本館を出れば、14時のお迎えに間に合います。お湯のあとに湖畔を少し歩きたくなったら、1時間¥1,100（1頭あたり）で延ばせます。九頭龍の森まで足をのばす日や、神社をめぐる日は、半日より1日お預かりのほうが気持ちに余裕が出ます。"}</P><P>{"半日のあいだ、愛犬は木で区切った一頭ずつのお部屋で休みながら、スタッフと一緒にドッグランで外の空気も吸って過ごします。料金の一覧や当日お持ちいただくものは、"}<a href="/partner/ryuguden" className="underline">{"龍宮殿へお出かけの方へのご案内"}</a>{"でご覧いただけます。"}</P><Photo src="/images/doghub-hotel-room-plant-side.jpg" alt="DogHub箱根仙石原" /><H2>{"仙石原は、芦ノ湖へ下りる手前"}</H2><P>{"当店から本館までは、車で19分ほど、11.3kmです。"}</P><P>{"御殿場ICから乙女峠を越えてくる道なら、仙石原は芦ノ湖の手前にあります。先に愛犬を預けて、身軽になってから湖へ下りていく順番が自然です。小田原方面から来られる場合は遠回りになるので、ご注意ください。当店は送迎をしていないため、お車で来られる方向けのお話です。"}</P><Photo src="/images/doghub-exterior-entrance-02.jpg" alt="DogHub箱根仙石原" /><H2>{"別館に泊まるなら、朝6時のお湯まで"}</H2><P>{"泊まりがけで来られるなら、宿は本館の隣の別館です。全室から芦ノ湖と富士山を望む和風の宿で、別館にお泊まりの方は、朝6時から本館のお風呂にも無料で入れます。日帰りでは出会えない、湖が明るくなっていく時間のお湯です。"}</P><P>{"基本の宿泊プランのご案内では、チェックインは15時、チェックアウトは11時。当店の宿泊のお預かりは14時から17時のあいだにお連れいただくので、14時台に愛犬を預けて別館へ向かえます。翌日、11時ちょうどに別館を出られるなら、お迎えは12時にしておくと道中が慌ただしくなりません（11時からの1時間は延長¥1,100・1頭あたり）。一晩のお預かりは¥7,700（1頭あたり・税込）です。"}</P><Photo src="/images/ryuguden-room-view.jpg" alt="龍宮殿" caption="写真：龍宮殿 公式サイトより（仮）" /><H2>{"湯上がりの午後は、愛犬と"}</H2><P>{"お迎えのあとの午後は、愛犬との時間です。土日祝なら、当店のカフェが11時から17時まで開いていて、おむすびとスープを愛犬と一緒に店内で召し上がれます。カフェをご利用の方は、ドッグランもお使いいただけます。金・月・火の平日は、お飲み物をテイクアウトでお出しするだけになり、店内とドッグランはお使いいただけません。"}</P><P>{"浜名湖から芦ノ湖へ渡ってきた建物のお湯で温まったあとは、仙石原の風が少しひんやりと感じられるかもしれません。秋から冬は、愛犬にも一枚羽織るものを持ってきてあげてくださいね。"}</P>
          <div className="mt-12 p-6 bg-[#F8F5F0] border-l-4 border-[#B87942]">
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "15px", lineHeight: 1.9 }}>{"龍宮殿から車で約20分。半日のお預かりは¥3,300、宿泊のお預かりは1泊¥7,700（1頭あたり・税込）です。"}</p>
            <Link href="/partner/ryuguden" className="inline-block bg-[#B87942] text-white px-6 py-3 rounded" style={{ fontSize: "15px" }}>龍宮殿のお客様へのご案内とご予約</Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
