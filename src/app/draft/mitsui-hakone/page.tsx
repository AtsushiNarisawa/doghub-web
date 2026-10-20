import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import { PLANS, EXTRA_HOUR_FEE } from "@/types/booking";

// HOTEL THE MITSUI HAKONE × DogHub の記事（下書き・先方確認用）。型はエクシブ箱根離宮の記事に合わせる。
// 🔴 先方の掲載許可が出るまで「非公開」＝noindex・サイトマップ外・サイト内リンクなし。URL を知っている人だけが見られる。
// 写真＝ホテル公式サイト（hotelthemitsui.com/ja/hakone/）の開業前イメージを仮に使用（2026-10-20 取得）。
//   差し替えが要る場合は先方から素材をいただく（CEO 方針 10-20）。公開前に先方の了解を必ず得る。
// ホテルの事実＝公式サイト（2026-10-20 確認）。IN 15:00／OUT 12:00 は開業前の販売サイト掲載値。
// ペット同伴不可＝CEO 決定事項（10-20）。書かないこと:「提携」「公式」「おすすめ」・ホテルのロゴ。
// 許可が出たら: ご確認バナーを外し、/news の記事（CMS）として出し直すか、ここを index にして /hotels からつなぐ。

const HOTEL = "HOTEL THE MITSUI HAKONE";
const stay = PLANS.find((p) => p.id === "stay")!;
const half = PLANS.find((p) => p.id === "4h")!;
const day = PLANS.find((p) => p.id === "8h")!;
const yen = (n: number) => `¥${n.toLocaleString()}`;
const BOOKING_HREF = "/booking?partner=mitsui-hakone";

export const metadata: Metadata = {
  title: `${HOTEL}は犬と泊まれる？客室は不可・愛犬は近くで預けて｜DogHub箱根仙石原`,
  description: `${HOTEL}（箱根・小涌谷）にご宿泊の日の愛犬の過ごし方。お車で約15分の仙石原で、1泊${yen(stay.basePrice)}〜お預かりします。`,
  robots: { index: false, follow: false },
};

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[#3C200F] mt-14 mb-5 pb-2 border-b border-[#E5DDD8]" style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 400, lineHeight: 1.5 }}>
    {children}
  </h2>
);
const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[#3C200F] mt-8 mb-3" style={{ fontSize: "18px", fontWeight: 500, lineHeight: 1.6 }}>{children}</h3>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[#3C200F] mb-5" style={{ fontSize: "16px", lineHeight: "2" }}>{children}</p>
);
function Photo({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-7">
      <Image src={src} alt={alt} width={1400} height={700} className="w-full h-auto" sizes="(max-width: 768px) 100vw, 720px" />
      {caption && <figcaption className="text-[#8F7B65] mt-2" style={{ fontSize: "12px" }}>{caption}</figcaption>}
    </figure>
  );
}
const HOTEL_CREDIT = `写真：${HOTEL} 公式サイトより（開業前のイメージ）`;

export default function MitsuiHakoneDraftPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20 bg-white">
        {/* ご確認用バナー（公開時に外す） */}
        <div className="bg-[#FFF8DC] border-b border-[#E8D9A0] px-6 py-4">
          <div className="max-w-3xl mx-auto text-[#5A4A1E]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
            <p className="font-medium">ご確認用の下書きです（公開前）</p>
            <p>
              このページは検索結果に表示されず、当店のホームページからもリンクしておりません。
              写真は御社の公式サイトから仮にお借りしています。差し替えや直すべき点がございましたら、お知らせください。
            </p>
          </div>
        </div>

        {/* Hero */}
        <div className="relative">
          <Image src="/images/mitsui-hakone-entrance.jpg" alt={`${HOTEL} のエントランス（開業前のイメージ）`} className="w-full object-cover" width={1400} height={700} priority style={{ height: "clamp(200px, 32vw, 420px)" }} />
          <div className="absolute inset-0 bg-black/35 flex items-end">
            <div className="max-w-3xl mx-auto w-full px-6 pb-6 text-white">
              <p className="opacity-90 mb-2" style={{ fontSize: "13px" }}>宿泊施設 ／ 箱根・小涌谷</p>
              <h1 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 400, lineHeight: 1.5 }}>
                {HOTEL}は犬と泊まれる？<br />
                <span style={{ fontSize: "0.8em" }}>客室は不可・愛犬は近くで預けて</span>
              </h1>
            </div>
          </div>
        </div>

        <article className="max-w-3xl mx-auto px-6 py-10 md:py-12">
          <p className="text-[#8F7B65] mb-8" style={{ fontSize: "12px" }}>{HOTEL_CREDIT}</p>

          <P>「{HOTEL}さんに泊まるのですが、うちには犬がいて…」</P>
          <P>
            2026年12月15日、箱根・小涌谷に{HOTEL}さんが開業します。
            愛犬のいるご家族にとっては、「その日、犬はどうしよう」が最初の悩みかもしれません。
            この記事では、{HOTEL}さんにご滞在の日の、愛犬の過ごし方をご案内します。
          </P>

          {/* 目次 */}
          <nav className="bg-[#F8F5F0] p-5 mb-4" aria-label="この記事の内容">
            <p className="text-[#3C200F] mb-2" style={{ fontSize: "15px" }}>この記事の内容</p>
            <ol className="space-y-1 text-[#B87942]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
              {[
                ["about", `${HOTEL}さんでの犬連れ事情`],
                ["route", "DogHubまでの距離と、旅の動線"],
                ["time", "チェックイン・チェックアウトとお預かりの時刻"],
                ["ways", "お客さまの過ごし方いろいろ"],
                ["closed", "DogHubの定休日（水曜・木曜）について"],
                ["doghub", "お預かりのお部屋と、夜のこと"],
                ["booking", "ご予約とご相談"],
              ].map(([id, label]) => (
                <li key={id}><a href={`#${id}`} className="hover:underline">{label}</a></li>
              ))}
            </ol>
          </nav>

          <div id="about" className="scroll-mt-24" />
          <H2>{HOTEL}さんでの犬連れ事情</H2>
          <P>はじめに事実をお伝えすると、{HOTEL}さんの客室には、愛犬とご一緒にお泊まりいただくことはできません。</P>
          <P>
            {HOTEL}さんは、富士箱根伊豆国立公園の中、かつて三井家の別荘が点在していた約13.5ヘクタールの敷地に建つホテルです。
            客室のバルコニーからは浅間山を望み、敷地内に湧く天然温泉を全室の専用風呂に引いています。
          </P>
          <Photo src="/images/mitsui-hakone-aerial.jpg" alt={`森に囲まれた ${HOTEL} の全景（開業前のイメージ）`} caption={HOTEL_CREDIT} />
          <P>
            客室でご一緒に、は難しくても、箱根の旅をあきらめる必要はありません。
            ここでご紹介したいのが、飼い主さまはホテルでゆっくり過ごし、愛犬は近くの預け先で過ごす「宿泊分離型」という旅のかたちです。
          </P>

          <div id="route" className="scroll-mt-24" />
          <H2>DogHubまでの距離と、旅の動線</H2>
          <P>
            DogHub箱根仙石原は、{HOTEL}さんからお車で約15分（約7km）の仙石原にあります。
            ホテルを出て国道1号を宮ノ下方面へ、宮ノ下の交差点から国道138号に入って仙石原方面へ向かう道のりです。
          </P>
          <P>この距離感であれば、お客さまの動線は自然に次のような形になります。</P>
          <ul className="mb-5 space-y-3 text-[#3C200F]" style={{ fontSize: "16px", lineHeight: "2" }}>
            <li><span className="text-[#B87942]">到着日：</span>仙石原の観光のついでにDogHubへ愛犬をお預けいただき、そのまま{HOTEL}さんへチェックイン。</li>
            <li><span className="text-[#B87942]">翌日：</span>ホテルでゆっくりご朝食をとられてからチェックアウト。DogHubで愛犬をお迎えに来て、ご一緒に仙石原を散策しながら帰路へ。</li>
          </ul>
          <a href={BOOKING_HREF} data-cta-id="draft_mitsui_inline_booking" className="flex items-center justify-between border border-[#3C200F] px-5 py-4 my-6 hover:bg-[#F7F7F7] transition-colors">
            <span className="text-[#3C200F]" style={{ fontSize: "15px" }}>宿泊お預かりを予約する<br /><span className="text-[#8F7B65]" style={{ fontSize: "13px" }}>1泊{yen(stay.basePrice)}〜 壁に囲まれたお部屋・夜もスタッフ常駐</span></span>
            <span className="text-[#3C200F]">→</span>
          </a>

          <div id="time" className="scroll-mt-24" />
          <H2>チェックイン・チェックアウトとお預かりの時刻</H2>
          <P>
            {HOTEL}さんのチェックインは15:00、チェックアウトは12:00です。
            DogHubの宿泊お預かりは、お預けが{stay.checkinRange.start}〜{stay.checkinRange.end}、翌朝のお迎えが9:00〜11:00。
            ホテルでチェックアウトの時刻までゆっくり過ごされる場合は、お迎えの時刻を延長いただけます。
          </P>
          <div className="bg-[#F7F7F7] p-5 mb-3">
            <p className="text-[#3C200F] mb-3" style={{ fontSize: "16px" }}>1泊2日の流れ（例）</p>
            <table className="w-full text-[#3C200F]" style={{ fontSize: "14px", lineHeight: "1.7" }}>
              <tbody>
                {[
                  ["1日目 14:00〜", "DogHubで愛犬をお預け（受付・持ち物の確認で10分ほど）"],
                  ["1日目 15:00〜", "お車で約15分。ホテルにチェックイン"],
                  ["2日目 〜12:00", "ご朝食・温泉のあと、ホテルをご出発"],
                  ["2日目 〜13:00", "DogHubでお迎え。愛犬と仙石原の散策へ"],
                ].map(([t, x]) => (
                  <tr key={t} className="border-b border-[#E5DDD8] last:border-b-0 align-top">
                    <td className="py-2 pr-3 whitespace-nowrap text-[#B87942]">{t}</td>
                    <td className="py-2">{x}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[#8F7B65] mb-5" style={{ fontSize: "14px", lineHeight: "1.8" }}>
            宿泊お預かりは1泊{yen(stay.basePrice)}〜。11:00を過ぎるお迎えは、1時間{yen(EXTRA_HOUR_FEE)}（ワンちゃん1頭あたり）の延長になります。
            お昼前に箱根へ着かれる場合は、9:00から先にお預けいただくこともできます（同じく1時間{yen(EXTRA_HOUR_FEE)}・1頭あたり）。
          </p>

          <div id="ways" className="scroll-mt-24" />
          <H2>お客さまの過ごし方いろいろ</H2>
          <H3>ホテルの中でゆっくり過ごしたい方</H3>
          <Photo src="/images/mitsui-hakone-room.jpg" alt={`${HOTEL} の客室（開業前のイメージ）`} caption={HOTEL_CREDIT} />
          <P>
            全室に天然温泉の専用風呂があり、会席・鮨・鉄板焼の「三渓」、ダイニング「リヴァライン」、「バーランベント」もそろうホテルです。
            遠方から運転されてきた方は、到着日の午後にDogHubへ愛犬をお預けしてからチェックイン。夜は館内でゆっくり、翌日はチェックアウト後にDogHubへ、という使い方ができます。
          </P>
          <Photo src="/images/mitsui-hakone-dining.jpg" alt={`${HOTEL} のダイニング（開業前のイメージ）`} caption={HOTEL_CREDIT} />

          <H3>温泉とスパで、ととのえる方</H3>
          <Photo src="/images/mitsui-hakone-spa.jpg" alt={`${HOTEL} のサーマルスプリング SPA（開業前のイメージ）`} caption={HOTEL_CREDIT} />
          <P>
            浅間山を眼前に、蛇骨川のせせらぎを聞きながら過ごす「サーマルスプリング」や、スパトリートメントもあります。
            愛犬を預けて、時間を気にせず過ごせるのも宿泊分離型のよいところです。
          </P>

          <H3>美術館や大涌谷をめぐる方</H3>
          <P>
            ホテルから彫刻の森美術館まではタクシーで約5分、大涌谷のロープウェイ駅まで約15分（ホテル公式サイトより）。
            美術館やロープウェイは、愛犬と一緒には入れない場所も多いので、身軽にまわりたい日は、到着日の日中から1日（8時間・{yen(day.basePrice)}）や半日（4時間・{yen(half.basePrice)}）でお預けいただくこともできます。
          </P>

          <div id="closed" className="scroll-mt-24" />
          <H2>DogHubの定休日（水曜・木曜）について</H2>
          <P>
            DogHubは水曜・木曜が定休日です。水曜・木曜にお預けいただくことはできません。
            火曜日にお預けいただき、水曜日の朝にお迎えに来ていただくことはできます。
            ご予定が決まりましたら、ホテルとDogHubを同じ頃にご予約いただくと安心です。
          </P>

          <div id="doghub" className="scroll-mt-24" />
          <H2>お預かりのお部屋と、夜のこと</H2>
          <Photo src="/images/img-048.jpg" alt="DogHub箱根仙石原のお預かりのお部屋" />
          <P>
            ケージではなく、壁に囲まれたお部屋でお預かりします。夜もスタッフが常駐し、お預かり中はスタッフがドッグランに出します。
            体重15kgまでのワンちゃんをお預かりしています。
          </P>
          <Photo src="/images/img-006.jpg" alt="DogHub箱根仙石原で遊ぶワンちゃん" />
          <P>
            お預かり中にワンちゃんの具合が悪くなったときは、近くのアニマルクリニック仙石原（お車で約4分）で、診療時間内であれば診ていただける体制をとっています。
          </P>
          <div className="bg-[#F7F7F7] p-5 mb-5">
            <p className="text-[#3C200F] mb-2" style={{ fontSize: "15px" }}>お預けに必要なもの</p>
            <ul className="text-[#3C200F] space-y-1" style={{ fontSize: "14px", lineHeight: "1.8" }}>
              <li>・ワクチンの証明書（詳しくはご利用ガイドをご覧ください）</li>
              <li>・普段のご飯（1泊なら少し多めに）</li>
              <li>・お気に入りのタオルやおもちゃ（あれば）</li>
            </ul>
          </div>

          <div id="booking" className="scroll-mt-24" />
          <H2>ご予約とご相談</H2>
          <P>
            {HOTEL}さんのご予約はホテルへ、DogHubでのお預かりは別にDogHubへのご予約が必要です。
            下のボタンからご予約いただくと、お預かり中の行き先に{HOTEL}さんのお名前が入った状態で始まります。
          </P>
          <P>日程が決まっていなくても、「こういう流れで使えますか？」というご相談だけでも大丈夫です。</P>

          <div className="flex flex-col sm:flex-row gap-3 my-8">
            <a href={BOOKING_HREF} data-cta-id="draft_mitsui_booking" className="inline-flex items-center justify-center bg-[#3C200F] text-white px-8 py-4 hover:opacity-90 transition-opacity" style={{ fontSize: "17px" }}>
              宿泊お預かりを予約する
            </a>
            <a href="tel:0460-80-0290" className="inline-flex items-center justify-center border border-[#3C200F] text-[#3C200F] px-8 py-4 hover:bg-[#F7F7F7] transition-colors" style={{ fontSize: "16px" }}>
              電話で相談する（0460-80-0290）
            </a>
          </div>

          <H2>さいごに</H2>
          <P>
            箱根の静かな宿での滞在と、愛犬が安心して過ごせる預け先。両方がひとつの旅のなかで叶うように、仙石原でお待ちしています。
          </P>

          <div className="p-5 bg-[#F8F5F0] mt-8">
            <p className="text-[#3C200F] mb-3" style={{ fontSize: "16px" }}>あわせて読みたい</p>
            <ul className="space-y-2" style={{ fontSize: "14px", lineHeight: "1.7" }}>
              <li><Link href="/hotels" className="text-[#B87942] hover:underline">→ 箱根の宿に泊まる日の、愛犬の預け方（料金・預け方の流れ）</Link></li>
              <li><Link href="/news/hakone-dog-overnight-stay-guide" className="text-[#B87942] hover:underline">→ 愛犬を1泊預けて箱根に泊まる｜当日の流れと夜の過ごし方</Link></li>
              <li><Link href="/news/hakone-chokoku-no-mori-dog-guide" className="text-[#B87942] hover:underline">→ 彫刻の森美術館は犬NG — 愛犬と箱根の美術館を楽しむ方法</Link></li>
              <li><Link href="/guide" className="text-[#B87942] hover:underline">→ ご利用ガイド・注意事項（ワクチン・持ち物）</Link></li>
            </ul>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
