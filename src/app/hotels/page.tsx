import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";
import { PLANS, EXTRA_HOUR_FEE } from "@/types/booking";

// 「箱根の宿 × DogHub」まとめページ（親ページ）。
// 設計の正本＝marketing/reports/hotel_pet_ng_pages_design_2026-10-20.md
// 区分は検索の問い「そのホテルは犬と泊まれる？」の答えに合わせて3つ（10-20 CEO・カスタマージャーニー）＝
//   「泊まれない」（宿泊プラン）／「一部のお部屋なら泊まれる」（取れなければ宿泊・取れたら日中）／「泊まれる」（半日・1日）。
// 1つのホテルは1つの区分にだけ載せる（同じ中身の節を並べない）。
// DogHub の説明・料金・預け方の流れはこのページに1回だけ書き、ホテル別ページは固有の事実だけにする。

const title = "箱根の宿は犬と泊まれる？答えごとの愛犬の預け方｜DogHub箱根仙石原";
const description =
  "箱根の宿は犬と泊まれる？答えが「泊まれない」なら愛犬は夜DogHubへ（1泊¥7,700〜）。「一部のお部屋だけ」「泊まれる」宿の預け方も。半日¥3,300〜。";

const plan = (id: string) => PLANS.find((p) => p.id === id)!;
const stay = plan("stay");
const half = plan("4h");
const day = plan("8h");
const yen = (n: number) => `¥${n.toLocaleString()}`;

// ホテル別の節。🔴 CEO がホテルに連絡して掲載の許可をいただいたものだけを足す。
// 犬の可否はホテル公式の記載を出典（sourceUrl）と確認日（checkedAt）つきで書く。
// 「提携」「公式」「おすすめ」と書かない。ロゴ・写真は使わない。
// ホテル自体に犬の預かりがある宿（天成園・ハイアット等）はここに入れない。
type HotelEntry = {
  name: string;
  group: "pet-ng" | "pet-partial" | "pet-ok";
  area: string;
  drive: string; // 例「車で約15分」（実測してから書く）
  petPolicy: string; // ホテル公式の記載どおり
  dogRooms?: string; // pet-partial のみ。例「全◯室のうち◯室」（公式に数がなければ「一部の客室のみ」）。「少ない」等の評価は書かない
  sourceUrl: string;
  checkedAt: string; // YYYY-MM-DD
  note?: string;
  articleHref?: string;
};
const hotels: HotelEntry[] = [];

// 既存の記事へのつなぎ（ホテル名入りの4本は 10-20 CEO 了承済み）。
const SHOW_UNAPPROVED = process.env.NODE_ENV === "development";
type ArticleLink = { href: string; label: string };
const petNgLinks: ArticleLink[] = [
  { href: "/stay", label: "宿泊お預かりプランの詳細" },
  { href: "/ryokan", label: "ペット不可の高級旅館に泊まる日" },
  { href: "/news/hakone-dog-overnight-stay-guide", label: "愛犬を1泊預けて箱根に泊まる｜当日の流れと夜の過ごし方" },
  { href: "/news/hakone-pet-not-allowed-stay-guide", label: "保養所や会員制リゾートに泊まる日の愛犬" },
  { href: "/news/hakone-miyanoshita-xiv-dog-guide", label: "エクシブ箱根離宮に泊まる日の愛犬" },
  { href: "/news/hakone-sengokuhara-prince-dog-guide", label: "仙石原プリンスホテルに泊まる日の愛犬" },
];
const petPartialLinks: ArticleLink[] = [
  { href: "/stay", label: "宿泊お預かりプランの詳細" },
  { href: "/pethotel", label: "ペット可の宿 × 日中だけ預ける" },
];
const petOkLinks: ArticleLink[] = [
  { href: "/news/hakone-dog-friendly-hotels", label: "箱根で犬と泊まれる宿｜犬を預けて泊まる、という選び方も" },
  { href: "/pethotel", label: "ペット可の宿 × 日中だけ預ける" },
  { href: "/news/hakone-retona-dog-guide", label: "リトナ箱根に泊まる日の愛犬" },
  { href: "/news/hakone-regina-resort-dog-guide", label: "レジーナリゾート箱根仙石原に泊まる日の愛犬" },
];

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, url: "https://dog-hub.shop/hotels", type: "website" },
  alternates: { canonical: "/hotels" },
};

const faqs = [
  {
    q: "泊まる宿が犬と泊まれない宿です。愛犬はどうすればいいですか？",
    a: `DogHubの宿泊お預かり（1泊${yen(stay.basePrice)}〜）をご利用ください。チェックインは14:00〜17:00、翌朝のお迎えは9:00〜11:00です。宿へ向かう前に預けて、翌朝お迎えに来ていただく流れです。`,
  },
  {
    q: "犬と泊まれる宿に泊まります。それでも預ける場面はありますか？",
    a: `犬が入れない日帰り温泉・美術館・ゴルフなどの間や、宿のチェックイン前・チェックアウト後の数時間に、半日（4時間・${yen(half.basePrice)}）や1日（8時間・${yen(day.basePrice)}）でお預かりしています。`,
  },
  {
    q: "「犬と泊まれる」宿なのに、予約したお部屋は犬と泊まれませんでした。",
    a: `犬と泊まれるのは一部のお部屋だけ、という宿は少なくありません。そのお部屋が取れなかったときは、一般のお部屋にお泊まりいただき、ワンちゃんはDogHubの宿泊お預かり（1泊${yen(stay.basePrice)}〜）でお預かりします。`,
  },
  {
    q: "どんな犬を預けられますか？",
    a: "体重15kgまでのワンちゃんをお預かりしています。ワクチンなど、ご予約前にご確認いただきたいことはご利用ガイドにまとめています。",
  },
  {
    q: "定休日はありますか？",
    a: "水曜・木曜が定休日です。定休日をまたぐご宿泊については、ご予約の際にご相談ください。",
  },
];

export default function HotelsPage() {
  const ngHotels = hotels.filter((h) => h.group === "pet-ng");
  const partialHotels = hotels.filter((h) => h.group === "pet-partial");
  const okHotels = hotels.filter((h) => h.group === "pet-ok");

  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{ name: "ホーム", href: "/" }, { name: "箱根の宿 × 愛犬の預け方", href: "/hotels" }]} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            }),
          }}
        />

        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-071.jpg" alt="箱根の宿に泊まる日の愛犬の預け方" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 style={{ fontSize: "clamp(22px, 4.5vw, 40px)", fontWeight: 400, lineHeight: 1.4 }}>箱根の宿に泊まる日の、<br />愛犬の預け方</h1>
            <p className="mt-3 opacity-90" style={{ fontSize: "clamp(13px, 2vw, 16px)", fontWeight: 400, lineHeight: 1.7 }}>
              「その宿は犬と泊まれる？」の答えごとに。
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>箱根の宿 × 愛犬の預け方</span>
          </p>
        </div>

        {/* Intro + 3つの区分への目次 */}
        <section className="py-12 md:py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", lineHeight: "2" }}>
              箱根で泊まる宿が決まったら、まず「その宿は犬と泊まれるか」を確かめてください。
              答えは「泊まれない」「一部のお部屋なら泊まれる」「泊まれる」の3つに分かれます。
              DogHub箱根仙石原は、そのどれにも使えるお預かりの施設です。答えごとに、使い方をまとめました。
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <a href="#pet-ng" data-cta-id="hotels_toc_petng" className="block border border-[#3C200F] p-5 hover:bg-[#F7F7F7] transition-colors">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "13px" }}>宿泊プラン {yen(stay.basePrice)}〜/泊</p>
                <p className="text-[#3C200F]" style={{ fontSize: "18px" }}>犬と泊まれない宿に泊まる ↓</p>
                <p className="text-[#8F7B65] mt-1" style={{ fontSize: "14px", lineHeight: "1.7" }}>ワンちゃんは夜DogHubに泊まり、飼い主様はお好きな宿へ</p>
              </a>
              <a href="#pet-partial" data-cta-id="hotels_toc_petpartial" className="block border border-[#3C200F] p-5 hover:bg-[#F7F7F7] transition-colors">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "13px" }}>宿泊プラン／半日・1日</p>
                <p className="text-[#3C200F]" style={{ fontSize: "18px" }}>一部のお部屋だけ犬と泊まれる宿 ↓</p>
                <p className="text-[#8F7B65] mt-1" style={{ fontSize: "14px", lineHeight: "1.7" }}>そのお部屋が取れなかったときも、取れたときも</p>
              </a>
              <a href="#pet-ok" data-cta-id="hotels_toc_petok" className="block border border-[#3C200F] p-5 hover:bg-[#F7F7F7] transition-colors">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "13px" }}>半日 {yen(half.basePrice)}・1日 {yen(day.basePrice)}</p>
                <p className="text-[#3C200F]" style={{ fontSize: "18px" }}>犬と泊まれる宿に泊まる ↓</p>
                <p className="text-[#8F7B65] mt-1" style={{ fontSize: "14px", lineHeight: "1.7" }}>一緒に泊まり、温泉・観光・ゴルフの間だけ預ける</p>
              </a>
            </div>
          </div>
        </section>

        {/* 区分1: 犬と泊まれない宿 */}
        <section id="pet-ng" className="py-12 md:py-16 px-6 bg-[#F7F7F7] scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#B87942] mb-2" style={{ fontSize: "14px" }}>宿泊プラン</p>
            <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "clamp(22px, 3vw, 26px)", fontWeight: 400, lineHeight: 1.5 }}>犬と泊まれない宿に泊まる日</h2>
            <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", lineHeight: "2" }}>
              箱根の旅館・ホテルの多くは、ワンちゃんと一緒には泊まれません。
              その日はワンちゃんだけDogHubに泊まり、飼い主様はお好きな宿でゆっくりお過ごしください。宿へ向かう前に預けて、翌朝お迎えに来ていただく流れです。
            </p>
            <div className="bg-white p-6 mb-6">
              <p className="text-[#3C200F] mb-3" style={{ fontSize: "16px" }}>1泊2日の流れ（例）</p>
              <ol className="space-y-2 text-[#3C200F]" style={{ fontSize: "15px", lineHeight: "1.8" }}>
                <li><span className="text-[#B87942] mr-2">1日目 14:00〜17:00</span>DogHubに預ける</li>
                <li><span className="text-[#B87942] mr-2">1日目 夕方</span>宿にチェックイン</li>
                <li><span className="text-[#B87942] mr-2">2日目 朝</span>宿をチェックアウト</li>
                <li><span className="text-[#B87942] mr-2">2日目 9:00〜11:00</span>DogHubでお迎え</li>
              </ol>
              <p className="text-[#8F7B65] mt-4" style={{ fontSize: "14px", lineHeight: "1.8" }}>
                {yen(stay.basePrice)}〜/泊。連泊もできます。お迎えが11時を過ぎる場合は、1頭につき1時間{yen(EXTRA_HOUR_FEE)}です。
              </p>
            </div>

            {ngHotels.length > 0 ? (
              <div className="space-y-4 mb-8">{ngHotels.map((h) => <HotelSection key={h.name} h={h} />)}</div>
            ) : (
              SHOW_UNAPPROVED && <DevPlaceholder text="（プレビューのみ表示）ここに、掲載の許可をいただいたホテルの節が入ります" />
            )}

            <ArticleList title="犬と泊まれない宿に泊まる日の記事" links={petNgLinks} />
          </div>
        </section>

        {/* 区分2: 一部のお部屋だけ犬と泊まれる宿 */}
        <section id="pet-partial" className="py-12 md:py-16 px-6 bg-white scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#B87942] mb-2" style={{ fontSize: "14px" }}>宿泊プラン／半日・1日お預かり</p>
            <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "clamp(22px, 3vw, 26px)", fontWeight: 400, lineHeight: 1.5 }}>一部のお部屋だけ犬と泊まれる宿に泊まる日</h2>
            <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", lineHeight: "2" }}>
              「犬と泊まれる」宿でも、ワンちゃんと一緒に泊まれるのは一部のお部屋だけ、ということがよくあります。
              そのお部屋が埋まっていたり、ワンちゃんの大きさや頭数の条件が合わなかったりしても、その宿をあきらめる必要はありません。
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="border border-[#E5DDD8] p-5">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "13px" }}>宿泊プラン {yen(stay.basePrice)}〜/泊</p>
                <p className="text-[#3C200F] mb-2" style={{ fontSize: "16px" }}>犬と泊まれるお部屋が取れなかったとき</p>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
                  一般のお部屋にお泊まりいただき、ワンちゃんはDogHubに泊まります。お預けは{stay.checkinRange.start}〜{stay.checkinRange.end}、お迎えは翌9:00〜11:00です。
                </p>
              </div>
              <div className="border border-[#E5DDD8] p-5">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "13px" }}>半日 {yen(half.basePrice)}・1日 {yen(day.basePrice)}</p>
                <p className="text-[#3C200F] mb-2" style={{ fontSize: "16px" }}>犬と泊まれるお部屋に泊まるとき</p>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
                  宿の温泉やレストラン、犬が入れない観光の間だけ、DogHubでお預かりします。
                </p>
              </div>
            </div>

            {partialHotels.length > 0 ? (
              <div className="space-y-4 mb-8">{partialHotels.map((h) => <HotelSection key={h.name} h={h} />)}</div>
            ) : (
              SHOW_UNAPPROVED && <DevPlaceholder text="（プレビューのみ表示）ここに、掲載の許可をいただいたホテルの節が入ります" />
            )}

            <ArticleList title="一部のお部屋だけ犬と泊まれる宿に泊まる日に" links={petPartialLinks} />
          </div>
        </section>

        {/* 区分3: 犬と泊まれる宿 */}
        <section id="pet-ok" className="py-12 md:py-16 px-6 bg-[#F7F7F7] scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#B87942] mb-2" style={{ fontSize: "14px" }}>半日・1日お預かり</p>
            <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "clamp(22px, 3vw, 26px)", fontWeight: 400, lineHeight: 1.5 }}>犬と泊まれる宿に泊まる日</h2>
            <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", lineHeight: "2" }}>
              ワンちゃんと一緒に泊まれる宿でも、日帰り温泉や美術館、ゴルフ場など、犬が入れない場所はたくさんあります。
              その間や、宿のチェックイン前・チェックアウト後の数時間だけDogHubに預けて、箱根を自由にまわれます。
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="border border-[#E5DDD8] p-5">
                <p className="text-[#3C200F] mb-1" style={{ fontSize: "16px" }}>半日（4時間）{yen(half.basePrice)}</p>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
                  お預けは{half.checkinRange.start}〜{half.checkinRange.end}。チェックイン前の観光や、日帰り温泉・美術館の間に。
                </p>
              </div>
              <div className="border border-[#E5DDD8] p-5">
                <p className="text-[#3C200F] mb-1" style={{ fontSize: "16px" }}>1日（8時間）{yen(day.basePrice)}</p>
                <p className="text-[#8F7B65]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
                  お預けは{day.checkinRange.start}〜{day.checkinRange.end}。ゴルフや、ユネッサンなど一日がかりの観光に。
                </p>
              </div>
            </div>
            <p className="text-[#8F7B65] mb-6" style={{ fontSize: "14px", lineHeight: "1.8" }}>
              ※ 宿によっては、宿の中に犬の預かりや犬用の設備がある場合があります。泊まる宿のサービスも合わせてご確認ください。
            </p>

            {okHotels.length > 0 ? (
              <div className="space-y-4 mb-8">{okHotels.map((h) => <HotelSection key={h.name} h={h} />)}</div>
            ) : (
              SHOW_UNAPPROVED && <DevPlaceholder text="（プレビューのみ表示）ここに、掲載の許可をいただいたホテルの節が入ります" />
            )}

            <ArticleList title="犬と泊まれる宿に泊まる日の記事" links={petOkLinks} />
          </div>
        </section>

        {/* 共通: DogHubとは・料金・預け方の流れ（このページに1回だけ） */}
        <section className="py-12 md:py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "clamp(22px, 3vw, 26px)", fontWeight: 400 }}>DogHub箱根仙石原について</h2>
            <ul className="space-y-3 text-[#3C200F] mb-8" style={{ fontSize: "15px", lineHeight: "1.9" }}>
              <li>・箱根町仙石原のワンちゃんのお預かり施設です。カフェとドッグランを併設しています。</li>
              <li>・ケージではなく、壁に囲まれたお部屋でお預かりします。夜もスタッフが常駐しています。</li>
              <li>・お預かり中は、スタッフがドッグランに出します。</li>
              <li>・体重15kgまでのワンちゃんをお預かりしています。</li>
              <li>・定休日は水曜・木曜です。</li>
            </ul>

            <h3 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>料金（税込）</h3>
            <div className="bg-white mb-8">
              {[
                { name: "宿泊", price: `${yen(stay.basePrice)}〜/泊`, time: `お預け ${stay.checkinRange.start}〜${stay.checkinRange.end}／お迎え 翌9:00〜11:00` },
                { name: "1日（8時間）", price: yen(day.basePrice), time: `お預け ${day.checkinRange.start}〜${day.checkinRange.end}` },
                { name: "半日（4時間）", price: yen(half.basePrice), time: `お預け ${half.checkinRange.start}〜${half.checkinRange.end}` },
              ].map((r) => (
                <div key={r.name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4 border-b border-[#E5DDD8] last:border-b-0">
                  <p className="text-[#3C200F]" style={{ fontSize: "16px" }}>{r.name}</p>
                  <p className="text-[#B87942]" style={{ fontSize: "18px" }}>{r.price}</p>
                  <p className="w-full text-[#8F7B65]" style={{ fontSize: "13px" }}>{r.time}</p>
                </div>
              ))}
            </div>
            <p className="text-[#8F7B65] -mt-5 mb-8" style={{ fontSize: "13px", lineHeight: "1.8" }}>
              ※ 箱根町にお住まいの方の宿泊は{yen(5500)}〜です。お時間の延長は1頭につき1時間{yen(EXTRA_HOUR_FEE)}です。
            </p>

            <h3 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>預け方の流れ</h3>
            <ol className="space-y-3 text-[#3C200F] mb-8" style={{ fontSize: "15px", lineHeight: "1.9" }}>
              <li><span className="text-[#B87942] mr-2">1</span>Webでご予約（プラン・日時・ワンちゃんの情報）</li>
              <li><span className="text-[#B87942] mr-2">2</span>当日、DogHubにお越しいただき、受付でお預け</li>
              <li><span className="text-[#B87942] mr-2">3</span>宿や観光へ</li>
              <li><span className="text-[#B87942] mr-2">4</span>お迎えの時間にDogHubへ</li>
            </ol>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/booking" data-cta-id="hotels_booking" className="inline-flex items-center justify-center bg-[#3C200F] text-white px-8 py-4 hover:opacity-90 transition-opacity" style={{ fontSize: "17px" }}>
                ご予約はこちら
              </a>
              <Link href="/guide" className="inline-flex items-center justify-center border border-[#3C200F] text-[#3C200F] px-8 py-4 hover:bg-white transition-colors" style={{ fontSize: "16px" }}>
                ご利用ガイド・注意事項
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "clamp(22px, 3vw, 26px)", fontWeight: 400 }}>よくある質問</h2>
            <div className="space-y-6">
              {faqs.map((f) => (
                <div key={f.q} className="border-b border-[#E5DDD8] pb-5">
                  <p className="text-[#3C200F] mb-2" style={{ fontSize: "16px", lineHeight: "1.7" }}>Q. {f.q}</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "15px", lineHeight: "1.9" }}>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/hakone" className="text-[#B87942] hover:underline" style={{ fontSize: "15px" }}>
              箱根 犬連れ旅行ガイド トップへ →
            </Link>
          </div>
        </section>

        <Reservation />
        <QuickNav />
      </main>
      <Footer />
    </>
  );
}

function HotelSection({ h }: { h: HotelEntry }) {
  return (
    <div className="bg-white border border-[#E5DDD8] p-5">
      <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "18px", fontWeight: 400 }}>{h.name}</h3>
      <p className="text-[#8F7B65] mb-3" style={{ fontSize: "13px" }}>{h.area}・DogHubまで{h.drive}</p>
      <p className="text-[#3C200F]" style={{ fontSize: "15px", lineHeight: "1.8" }}>{h.petPolicy}</p>
      {h.dogRooms && <p className="text-[#3C200F]" style={{ fontSize: "15px", lineHeight: "1.8" }}>犬と泊まれるお部屋：{h.dogRooms}</p>}
      <p className="text-[#8F7B65] mt-1" style={{ fontSize: "12px" }}>
        出典：<a href={h.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">ホテル公式サイト</a>（{h.checkedAt} 確認）
      </p>
      {h.note && <p className="text-[#3C200F] mt-3" style={{ fontSize: "15px", lineHeight: "1.8" }}>{h.note}</p>}
      {h.articleHref && (
        <Link href={h.articleHref} className="text-[#B87942] hover:underline mt-3 inline-block" style={{ fontSize: "14px" }}>
          詳しくはこちら →
        </Link>
      )}
    </div>
  );
}

function ArticleList({ title, links }: { title: string; links: ArticleLink[] }) {
  return (
    <div className="p-5 bg-[#F8F5F0]">
      <p className="text-[#3C200F] mb-3" style={{ fontSize: "16px" }}>{title}</p>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[#B87942] hover:underline" style={{ fontSize: "14px", lineHeight: "1.7" }}>
              → {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DevPlaceholder({ text }: { text: string }) {
  return (
    <div className="border-2 border-dashed border-[#C9B8A8] p-5 mb-8 text-center text-[#8F7B65]" style={{ fontSize: "14px" }}>
      {text}
    </div>
  );
}
