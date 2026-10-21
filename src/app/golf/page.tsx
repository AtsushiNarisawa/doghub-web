import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";
import { PLANS, EXTRA_HOUR_FEE } from "@/types/booking";

// 「箱根のゴルフ場 × DogHub」まとめページ（/hotels と同じ考え方・10-21 CEO）。
// ゴルフ場は「コース名＋犬」で検索されない（GSC 10-21）＝ゴルフの予定が先に決まり、預け先を探す流れ。
// そこで「場面（日帰り／ゴルフ旅行／ハーフ・午後）」と「コースまでの時間」で引けるようにする。
// 犬の同伴の可否は書かない（全コース不可・CEO 10-21）。コース名の掲載は CEO 了承済み（13コース）。
// 料金・時間は types/booking.ts の PLANS が正本。共通の説明はこのページに1回だけ。

const plan = (id: string) => PLANS.find((p) => p.id === id)!;
const stay = plan("stay");
const half = plan("4h");
const day = plan("8h");
const yen = (n: number) => `¥${n.toLocaleString()}`;

const title = "箱根ゴルフ × ペットホテル｜愛犬を預けてプレーを満喫｜DogHub箱根仙石原";
const description = `箱根でゴルフを楽しむ間、愛犬をDogHubにお預け。朝7時からお預かり。近くの13コースまでの時間と、日帰り・ゴルフ旅行・ハーフの預け方をまとめました。1日8時間${yen(day.basePrice)}。`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, url: "https://dog-hub.shop/golf", type: "website" },
  alternates: { canonical: "/golf" },
};

// コースまでの時間（DogHub から車）。既存の掲載値。
type Course = { name: string; minutes: number; note?: string; href?: string };
const courses: Course[] = [
  { name: "大箱根カントリークラブ", minutes: 5, note: "DogHub提携コース", href: "/news/hakone-daihakone-cc-dog-guide" },
  { name: "富士屋ホテル仙石ゴルフコース", minutes: 5 },
  { name: "箱根カントリー倶楽部", minutes: 5 },
  { name: "箱根湖畔ゴルフコース", minutes: 10 },
  { name: "箱根園ゴルフ場", minutes: 15 },
  { name: "富士カントリークラブ", minutes: 20 },
  { name: "箱根湯の花ゴルフ場", minutes: 25 },
  { name: "PGM御殿場カントリークラブ", minutes: 25 },
  { name: "箱根くらかけゴルフ場", minutes: 25 },
  { name: "芦の湖カントリークラブ", minutes: 30 },
  { name: "御殿場ゴルフ倶楽部", minutes: 35 },
  { name: "太平洋クラブ 御殿場コース", minutes: 35 },
  { name: "東名富士カントリークラブ", minutes: 35 },
];
const bands = [
  { label: "車で約5分", max: 5 },
  { label: "車で約10〜20分", max: 20 },
  { label: "車で約25〜35分", max: 35 },
];

const faqs = [
  {
    q: "朝は何時から預けられますか？",
    a: `1日のお預かり（8時間・${yen(day.basePrice)}）は、${day.checkinRange.start}〜${day.checkinRange.end}にお預けいただけます。スタートが早い日でも、ゴルフ場へ向かう前に立ち寄っていただけます。`,
  },
  {
    q: "ラウンドが長引いてお迎えが遅れそうです。",
    a: `お預けから8時間を過ぎる場合は、1時間${yen(EXTRA_HOUR_FEE)}（ワンちゃん1頭あたり）で延長できます。お迎えは17:00までにお願いしております。`,
  },
  {
    q: "前の日から箱根に泊まってゴルフをします。",
    a: `前日の${stay.checkinRange.start}〜${stay.checkinRange.end}から宿泊でお預かりできます（1泊${yen(stay.basePrice)}〜）。翌朝はそのままゴルフ場へ向かい、ラウンド後にお迎えに来ていただけます。`,
  },
  {
    q: "どんな犬を預けられますか？",
    a: "体重15kgまでのワンちゃんをお預かりしています。ワクチンなど、ご予約前にご確認いただきたいことはご利用ガイドにまとめています。",
  },
  {
    q: "定休日はありますか？",
    a: "水曜・木曜が定休日です。ゴルフ場は営業していても、当店ではお預かりできませんのでご注意ください。",
  },
];

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "clamp(22px, 3vw, 26px)", fontWeight: 400, lineHeight: 1.5 }}>{children}</h2>
);

function Timeline({ rows }: { rows: [string, string][] }) {
  return (
    <ol className="space-y-2 text-[#3C200F]" style={{ fontSize: "15px", lineHeight: "1.8" }}>
      {rows.map(([t, x]) => (
        <li key={t + x} className="flex gap-3">
          <span className="text-[#B87942] whitespace-nowrap" style={{ minWidth: "6.5em" }}>{t}</span>
          <span>{x}</span>
        </li>
      ))}
    </ol>
  );
}

export default function GolfPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{ name: "ホーム", href: "/" }, { name: "箱根ゴルフ × ペットホテル", href: "/golf" }]} />
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
          <Image src="/images/img-007.jpg" alt="箱根ゴルフ 愛犬を預けてプレーを満喫 DogHub箱根仙石原のペットホテル" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(180px, 30vw, 424px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 style={{ fontSize: "clamp(24px, 5vw, 44px)", fontWeight: 400, lineHeight: 1.4 }}>愛犬を預けて箱根ゴルフを満喫</h1>
            <p className="mt-3 opacity-90" style={{ fontSize: "clamp(13px, 2vw, 16px)", fontWeight: 400 }}>朝7時からお預かり。近くの13コースへ。</p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>ゴルフ × ペットホテル</span>
          </p>
        </div>

        {/* Intro + 場面の目次 */}
        <section className="py-12 md:py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", lineHeight: "2" }}>
              箱根でのゴルフが決まったら、愛犬はDogHub箱根仙石原へ。朝7時からお預かりしているので、早いスタートの日も、ゴルフ場へ向かう前に立ち寄っていただけます。
              日帰りか、泊まりがけか、ハーフや午後からかで、預け方を選んでください。
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { id: "day", price: `1日（8時間）${yen(day.basePrice)}`, label: "日帰りでゴルフ", sub: `朝${day.checkinRange.start}〜${day.checkinRange.end}にお預け` },
                { id: "trip", price: `宿泊 ${yen(stay.basePrice)}〜/泊`, label: "泊まりがけのゴルフ旅行", sub: "前の日から預けて、翌朝そのままゴルフ場へ" },
                { id: "half", price: `半日（4時間）${yen(half.basePrice)}`, label: "ハーフ・午後スタート", sub: `${half.checkinRange.start}〜${half.checkinRange.end}にお預け` },
              ].map((c) => (
                <a key={c.id} href={`#${c.id}`} data-cta-id={`golf_toc_${c.id}`} className="block border border-[#3C200F] p-5 hover:bg-[#F7F7F7] transition-colors">
                  <p className="text-[#B87942] mb-1" style={{ fontSize: "13px" }}>{c.price}</p>
                  <p className="text-[#3C200F]" style={{ fontSize: "18px" }}>{c.label} ↓</p>
                  <p className="text-[#8F7B65] mt-1" style={{ fontSize: "14px", lineHeight: "1.7" }}>{c.sub}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 場面1: 日帰り */}
        <section id="day" className="py-12 md:py-16 px-6 bg-[#F7F7F7] scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#B87942] mb-2" style={{ fontSize: "14px" }}>1日お預かり（8時間）{yen(day.basePrice)}</p>
            <H2>日帰りでゴルフをする日</H2>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", lineHeight: "2" }}>
                  朝、ゴルフ場へ向かう途中にDogHubへ。お預けから8時間なので、ラウンドと昼食を終えてからゆっくりお迎えに来ていただけます。
                </p>
                <div className="bg-white p-6">
                  <p className="text-[#3C200F] mb-3" style={{ fontSize: "16px" }}>1日の流れ（例）</p>
                  <Timeline
                    rows={[
                      ["7:00", "DogHubにお預け"],
                      ["7:30ごろ", "ゴルフ場に到着・スタート"],
                      ["昼すぎ", "ラウンド終了・昼食"],
                      ["〜15:00", "DogHubでお迎え（7:00にお預けの場合）"],
                    ]}
                  />
                  <p className="text-[#8F7B65] mt-4" style={{ fontSize: "14px", lineHeight: "1.8" }}>
                    8時間を過ぎる場合は、1時間{yen(EXTRA_HOUR_FEE)}（ワンちゃん1頭あたり）で延長できます。お迎えは17:00までです。
                  </p>
                </div>
              </div>
              <Image src="/images/img-012.jpg" alt="DogHub箱根仙石原のドッグラン ゴルフ中も愛犬がのびのび" className="w-full h-auto" width={600} height={400} />
            </div>
          </div>
        </section>

        {/* 場面2: ゴルフ旅行 */}
        <section id="trip" className="py-12 md:py-16 px-6 bg-white scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#B87942] mb-2" style={{ fontSize: "14px" }}>宿泊プラン {yen(stay.basePrice)}〜/泊</p>
            <H2>泊まりがけのゴルフ旅行</H2>
            <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", lineHeight: "2" }}>
              前の日に箱根へ入る場合は、宿へ向かう前にDogHubへ。ワンちゃんはDogHubに泊まり、翌朝はそのままゴルフ場へ向かっていただけます。
            </p>
            <div className="bg-[#F7F7F7] p-6 mb-6">
              <p className="text-[#3C200F] mb-3" style={{ fontSize: "16px" }}>1泊2日の流れ（例）</p>
              <Timeline
                rows={[
                  [`1日目 ${stay.checkinRange.start}〜`, "DogHubにお預け（宿泊）"],
                  ["1日目 夕方", "宿にチェックイン・温泉"],
                  ["2日目 朝", "宿からゴルフ場へ。スタート"],
                  ["2日目 〜15:00", "ラウンド後、DogHubでお迎え"],
                ]}
              />
              <p className="text-[#8F7B65] mt-4" style={{ fontSize: "14px", lineHeight: "1.8" }}>
                宿泊のお迎えは翌9:00〜11:00です。ラウンド後のお迎え（〜15:00）にする場合は、宿泊に半日（4時間・{yen(half.basePrice)}）を足していただく形になります（合計 {yen(stay.basePrice + half.basePrice)}〜）。
              </p>
            </div>
            <p className="text-[#3C200F]" style={{ fontSize: "15px", lineHeight: "1.9" }}>
              泊まる宿がまだ決まっていない方は、<Link href="/hotels" className="text-[#B87942] underline">箱根の宿に泊まる日の、愛犬の預け方</Link>もご覧ください。
            </p>
          </div>
        </section>

        {/* 場面3: ハーフ・午後 */}
        <section id="half" className="py-12 md:py-16 px-6 bg-[#F7F7F7] scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <p className="text-[#B87942] mb-2" style={{ fontSize: "14px" }}>半日お預かり（4時間）{yen(half.basePrice)}</p>
            <H2>ハーフ・午後からのスタート</H2>
            <p className="text-[#3C200F]" style={{ fontSize: "16px", lineHeight: "2" }}>
              ハーフや午後からのラウンドなら、{half.checkinRange.start}〜{half.checkinRange.end}にお預けいただく半日のお預かり（4時間）がございます。
              ラウンドが4時間を超えそうなときは、1日のお預かり（8時間）のほうが安心です。
            </p>
          </div>
        </section>

        {/* コースまでの時間 */}
        <section id="courses" className="py-12 md:py-16 px-6 bg-white scroll-mt-20">
          <div className="max-w-4xl mx-auto">
            <H2>DogHubから近いゴルフ場（13コース）</H2>
            <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", lineHeight: "2" }}>
              DogHubからコースまでのお車での時間です。スタートの時刻から逆算して、お預けの時刻を決めてください。
              たとえば車で約35分のコースで8:30スタートなら、7:00にお預けいただくと、受付を済ませても7:45ごろにはコースに着けます。
            </p>
            {bands.map((b, i) => {
              const min = i === 0 ? 0 : bands[i - 1].max + 1;
              const list = courses.filter((c) => c.minutes >= min && c.minutes <= b.max);
              return (
                <div key={b.label} className="mb-8">
                  <p className="text-[#B87942] mb-3" style={{ fontSize: "15px" }}>{b.label}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {list.map((c) => (
                      <div key={c.name} className="border border-[#E5DDD8] p-4">
                        <h3 className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400 }}>{c.name}</h3>
                        <p className="text-[#8F7B65] mt-1" style={{ fontSize: "13px" }}>
                          車で約{c.minutes}分{c.note ? `・${c.note}` : ""}
                        </p>
                        {c.href && (
                          <Link href={c.href} className="text-[#B87942] hover:underline mt-2 inline-block" style={{ fontSize: "13px" }}>
                            詳しくはこちら →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 共通: DogHubについて・料金 */}
        <section className="py-12 md:py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-4xl mx-auto">
            <H2>DogHub箱根仙石原について</H2>
            <div className="grid md:grid-cols-2 gap-8 items-start mb-8">
              <ul className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", lineHeight: "1.9" }}>
                <li>・箱根町仙石原のワンちゃんのお預かり施設です。カフェとドッグランを併設しています。</li>
                <li>・ケージではなく、壁に囲まれたお部屋でお預かりします。夜もスタッフが常駐しています。</li>
                <li>・お預かり中は、スタッフがドッグランに出します。</li>
                <li>・体重15kgまでのワンちゃんをお預かりしています。</li>
                <li>・定休日は水曜・木曜です。</li>
              </ul>
              <Image src="/images/img-021.jpg" alt="DogHub箱根仙石原で遊ぶワンちゃん" className="w-full h-auto" width={600} height={400} />
            </div>

            <h3 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>料金（税込）</h3>
            <div className="bg-white mb-4">
              {[
                { name: "1日（8時間）", price: yen(day.basePrice), time: `お預け ${day.checkinRange.start}〜${day.checkinRange.end}`, href: "/8h" },
                { name: "半日（4時間）", price: yen(half.basePrice), time: `お預け ${half.checkinRange.start}〜${half.checkinRange.end}`, href: "/4h" },
                { name: "宿泊", price: `${yen(stay.basePrice)}〜/泊`, time: `お預け ${stay.checkinRange.start}〜${stay.checkinRange.end}／お迎え 翌9:00〜11:00`, href: "/stay" },
              ].map((r) => (
                <Link key={r.name} href={r.href} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-4 border-b border-[#E5DDD8] last:border-b-0 hover:bg-[#FAFAFA]">
                  <span className="text-[#3C200F]" style={{ fontSize: "16px" }}>{r.name}</span>
                  <span className="text-[#B87942]" style={{ fontSize: "18px" }}>{r.price}</span>
                  <span className="w-full text-[#8F7B65]" style={{ fontSize: "13px" }}>{r.time}</span>
                </Link>
              ))}
            </div>
            <p className="text-[#8F7B65] mb-8" style={{ fontSize: "13px", lineHeight: "1.8" }}>
              ※ お時間の延長は1頭につき1時間{yen(EXTRA_HOUR_FEE)}です。箱根町にお住まいの方の宿泊は{yen(5500)}〜です。
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/booking" data-cta-id="golf_booking" className="inline-flex items-center justify-center bg-[#3C200F] text-white px-8 py-4 hover:opacity-90 transition-opacity" style={{ fontSize: "17px" }}>
                ご予約はこちら
              </a>
              <Link href="/guide" className="inline-flex items-center justify-center border border-[#3C200F] text-[#3C200F] px-8 py-4 hover:bg-white transition-colors" style={{ fontSize: "16px" }}>
                ご利用ガイド・注意事項
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 md:py-16 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <H2>よくある質問</H2>
            <div className="space-y-6">
              {faqs.map((f) => (
                <div key={f.q} className="border-b border-[#E5DDD8] pb-5">
                  <p className="text-[#3C200F] mb-2" style={{ fontSize: "16px", lineHeight: "1.7" }}>Q. {f.q}</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "15px", lineHeight: "1.9" }}>{f.a}</p>
                </div>
              ))}
            </div>

            <div className="p-5 bg-[#F8F5F0] mt-10">
              <p className="text-[#3C200F] mb-3" style={{ fontSize: "16px" }}>あわせて読みたい</p>
              <ul className="space-y-2" style={{ fontSize: "14px", lineHeight: "1.7" }}>
                <li><Link href="/news/hakone-golf-pet-guide" className="text-[#B87942] hover:underline">→ 箱根ゴルフと愛犬の過ごし方｜プレー中のペット預かりガイド</Link></li>
                <li><Link href="/news/hakone-daihakone-cc-dog-guide" className="text-[#B87942] hover:underline">→ 大箱根カントリークラブ × DogHub</Link></li>
                <li><Link href="/hotels" className="text-[#B87942] hover:underline">→ 箱根の宿に泊まる日の、愛犬の預け方</Link></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="px-6 py-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/news/hakone-dog-trip-guide" className="text-[#B87942] hover:underline" style={{ fontSize: "15px" }}>
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
