import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PLANS, EXTRA_HOUR_FEE } from "@/types/booking";
import { PartnerMemory } from "@/components/partner-memory";

// HOTEL THE MITSUI HAKONE 様のお客様専用のご案内ページ。
// 先方のサイト（よくあるご質問・LP）に URL を貼っていただく前提で、検索には出さない（noindex）。
// 🔴 先方の了解前に本番へ出さない（memory project_partner_lead_hotel_the_mitsui_hakone）
// ホテル側の時刻（IN 15:00／OUT 12:00）は開業前の販売サイト掲載値＝開業後に変わったらここを直す。

const HOTEL = "HOTEL THE MITSUI HAKONE";
const BOOKING_HREF = "/booking?partner=mitsui-hakone";
const ROUTE_URL =
  "https://www.google.com/maps/dir/?api=1&origin=" +
  encodeURIComponent("神奈川県足柄下郡箱根町小涌谷 HOTEL THE MITSUI HAKONE") +
  "&destination=35.265472,139.011744&travelmode=driving";

export const metadata: Metadata = {
  title: `${HOTEL} にご宿泊のお客様へ｜愛犬のお預かり｜DogHub箱根仙石原`,
  description: `${HOTEL} からお車で約15分。ご滞在中の愛犬のお預かり（ご宿泊・日帰り）のご案内です。`,
  robots: { index: false, follow: false },
};

const yen = (n: number) => `¥${n.toLocaleString()}`;
const stay = PLANS.find((p) => p.id === "stay")!;
const day = PLANS.find((p) => p.id === "8h")!;
const half = PLANS.find((p) => p.id === "4h")!;

const FLOW = [
  { day: "1日目", time: "14:00〜17:00", place: "DogHub", text: "ワンちゃんをお預け（受付・持ち物の確認で10分ほど）" },
  { day: "", time: "15:00〜", place: "ホテル", text: "お車で約15分。そのままチェックイン" },
  { day: "2日目", time: "〜12:00", place: "ホテル", text: "ゆっくりご朝食・ご出発" },
  { day: "", time: "〜13:00", place: "DogHub", text: "お迎え。ここから愛犬と仙石原の散策へ" },
];

const WEEK = [
  { d: "金", start: true, pick: true },
  { d: "土", start: true, pick: true },
  { d: "日", start: true, pick: true },
  { d: "月", start: true, pick: true },
  { d: "火", start: true, pick: true },
  { d: "水", start: false, pick: "火曜ご宿泊の方のみ" },
  { d: "木", start: false, pick: false },
];

const sectionTitle = "text-[#3C200F] mb-6";
const body = "text-[#3C200F]";

export default function MitsuiHakonePartnerPage() {
  return (
    <>
      <Header />
      <PartnerMemory slug="mitsui-hakone" />
      <main className="pt-15 lg:pt-20">
        {/* Hero */}
        <div className="relative">
          <Image
            src="/images/img-071.jpg"
            alt="DogHub箱根仙石原"
            className="w-full object-cover"
            width={700}
            height={400}
            priority
            style={{ height: "clamp(200px, 30vw, 400px)" }}
          />
          <div className="absolute inset-0 bg-black/45 flex flex-col items-center justify-center text-white px-6 text-center">
            <p className="mb-3" style={{ fontSize: "clamp(12px, 1.6vw, 15px)", letterSpacing: "2px" }}>
              {HOTEL}
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> </span>にご宿泊のお客様へ
            </p>
            <h1 style={{ fontSize: "clamp(22px, 4.2vw, 38px)", fontWeight: 400, lineHeight: 1.5 }}>
              ご滞在のあいだ、
              <br className="sm:hidden" />
              愛犬は私たちがお預かりします
            </h1>
          </div>
        </div>

        {/* Intro */}
        <section className="py-14 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <p className={body} style={{ fontSize: "16px", lineHeight: 2 }}>
              DogHub箱根仙石原は、{HOTEL} からお車で約15分の仙石原にある犬のホテルです。
              ケージではなくお部屋でのお預かりで、ドッグランもございます。
              このページでは、ホテルでのご滞在に合わせた預け方・お迎えの流れをご案内します。
            </p>
            <p className="text-[#888] mt-4" style={{ fontSize: "14px", lineHeight: 1.8 }}>
              ご予約・ワンちゃんについてのご相談は、ホテルではなく当店が直接承ります。
            </p>
          </div>
        </section>

        {/* 1. ご滞在の流れ */}
        <section className="py-14 px-6 bg-[#F7F5F0]">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#B87942] mb-2" style={{ fontSize: "13px", letterSpacing: "2px" }}>01</p>
            <h2 className={sectionTitle} style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 400 }}>
              1泊2日のご滞在の流れ（例）
            </h2>
            <ol className="space-y-0 border-l-2 border-[#B87942] ml-2">
              {FLOW.map((f, i) => (
                <li key={i} className="pl-5 pb-6 relative">
                  <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#B87942]" />
                  {f.day && (
                    <p className="text-[#B87942] mb-1" style={{ fontSize: "13px", fontWeight: 500 }}>{f.day}</p>
                  )}
                  <p className={body} style={{ fontSize: "16px" }}>
                    <span className="font-medium">{f.time}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full border border-[#E5DDD8] bg-white">{f.place}</span>
                  </p>
                  <p className="text-[#3C200F] mt-1" style={{ fontSize: "15px", lineHeight: 1.8 }}>{f.text}</p>
                </li>
              ))}
            </ol>
            <div className="bg-white border border-[#E5DDD8] rounded-lg p-5 mt-2 space-y-3" style={{ fontSize: "14px", lineHeight: 1.9 }}>
              <p className={body}>
                <span className="font-medium">お迎えの時刻について</span>
                <br />
                当店の通常のお迎えは <span className="font-medium">9:00〜11:00</span> です。
                ホテルのチェックアウト（12:00）までゆっくり過ごされる場合は、
                ご予約フォームの「お迎えの延長」で 12:00〜17:00 の間からお選びいただけます
                （{yen(EXTRA_HOUR_FEE)}／1時間・ワンちゃん1頭あたり）。
              </p>
              <p className={body}>
                <span className="font-medium">お昼前に箱根へ着かれる場合</span>
                <br />
                9:00 から先にお預けいただくこともできます（同じく{yen(EXTRA_HOUR_FEE)}／1時間・1頭あたり）。
                身軽に観光されてから、ホテルへ向かわれる方もいらっしゃいます。
              </p>
            </div>
            <p className="text-[#888] mt-3" style={{ fontSize: "12px" }}>
              ※ ホテルのチェックイン・チェックアウトの時刻は、ご予約時のホテルのご案内をご確認ください。
            </p>
          </div>
        </section>

        {/* 2. 移動 */}
        <section className="py-14 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#B87942] mb-2" style={{ fontSize: "13px", letterSpacing: "2px" }}>02</p>
            <h2 className={sectionTitle} style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 400 }}>
              ホテルから当店までの行き方
            </h2>
            <div className="grid sm:grid-cols-3 gap-3 mb-6">
              {[
                { k: "所要時間", v: "お車で約15分" },
                { k: "距離", v: "約7km" },
                { k: "駐車場", v: "無料・3台" },
              ].map((x) => (
                <div key={x.k} className="border border-[#E5DDD8] rounded-lg p-4 text-center">
                  <p className="text-[#888]" style={{ fontSize: "12px" }}>{x.k}</p>
                  <p className={body} style={{ fontSize: "18px" }}>{x.v}</p>
                </div>
              ))}
            </div>
            <ol className="space-y-3 mb-6" style={{ fontSize: "15px", lineHeight: 1.8 }}>
              <li className={body}>
                <span className="text-[#B87942] mr-2">1</span>
                ホテルを出て国道1号を宮ノ下方面へ
              </li>
              <li className={body}>
                <span className="text-[#B87942] mr-2">2</span>
                宮ノ下の交差点から国道138号に入り、仙石原方面へ
              </li>
              <li className={body}>
                <span className="text-[#B87942] mr-2">3</span>
                仙石原に入ったら、当店の案内看板を目印に到着
              </li>
            </ol>
            <a
              href={ROUTE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-[#3C200F] px-6 py-3 text-[#3C200F] hover:bg-[#F7F5F0] transition-colors"
              style={{ fontSize: "15px" }}
            >
              Googleマップでルートを開く →
            </a>
            <div className="mt-6 text-[#3C200F] space-y-1" style={{ fontSize: "14px", lineHeight: 1.9 }}>
              <p>〒250-0631 神奈川県足柄下郡箱根町仙石原928-15</p>
              <p>
                駐車場は店舗横に2台、その手前に1台です。
                <span className="text-[#B87942]">店舗前の駐車場は当店のものではございません</span>のでご注意ください。
              </p>
              <p>
                くわしい地図は <Link href="/access" className="underline">アクセスのページ</Link> をご覧ください。
              </p>
            </div>
          </div>
        </section>

        {/* 3. 曜日 */}
        <section className="py-14 px-6 bg-[#F7F5F0]">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#B87942] mb-2" style={{ fontSize: "13px", letterSpacing: "2px" }}>03</p>
            <h2 className={sectionTitle} style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 400 }}>
              ご予約の前に、曜日のご確認を
            </h2>
            <p className={`${body} mb-6`} style={{ fontSize: "15px", lineHeight: 1.9 }}>
              ホテルは毎日営業していますが、当店は<span className="font-medium">水曜・木曜が定休日</span>です。
              ご旅行の日程を決める前に、下の表でご確認ください。
            </p>
            <div className="overflow-x-auto">
              <table className="w-full bg-white border border-[#E5DDD8] text-center" style={{ fontSize: "14px" }}>
                <thead>
                  <tr className="bg-[#3C200F] text-white">
                    <th className="py-2 px-2 font-normal text-left">曜日</th>
                    <th className="py-2 px-2 font-normal">お預け</th>
                    <th className="py-2 px-2 font-normal">お迎え</th>
                  </tr>
                </thead>
                <tbody>
                  {WEEK.map((w) => (
                    <tr key={w.d} className="border-t border-[#E5DDD8]">
                      <td className="py-2 px-3 text-left text-[#3C200F]">{w.d}</td>
                      <td className={`py-2 px-2 ${w.start ? "text-[#3C200F]" : "text-[#888]"}`}>{w.start ? "○" : "×"}</td>
                      <td className={`py-2 px-2 ${w.pick === true ? "text-[#3C200F]" : w.pick ? "text-[#B87942]" : "text-[#888]"}`}>
                        {w.pick === true ? "○" : w.pick ? w.pick : "×"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-4 space-y-1 text-[#3C200F]" style={{ fontSize: "13px", lineHeight: 1.9 }}>
              <li>・火曜日にご宿泊の場合に限り、水曜日の朝のお迎えを承ります。</li>
              <li>・祝日・年末年始・臨時の休業は、ご予約フォームのカレンダーでご確認いただけます。</li>
              <li>・Webでのご予約は翌日以降です。当日のご相談はお電話（0460-80-0290）でどうぞ。</li>
            </ul>
          </div>
        </section>

        {/* 料金 */}
        <section className="py-14 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className={sectionTitle} style={{ fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 400 }}>
              料金（税込・ワンちゃん1頭あたり）
            </h2>
            <div className="divide-y divide-[#E5DDD8] border-y border-[#E5DDD8]">
              {[
                { name: "ご宿泊のお預かり", time: "お預け 14:00〜17:00／お迎え 翌9:00〜11:00", price: `${yen(stay.basePrice)}〜／1泊` },
                { name: "1日のお預かり（8時間）", time: "お預け 7:00〜9:00", price: yen(day.basePrice) },
                { name: "半日のお預かり（4時間）", time: "お預け 9:00〜13:00", price: yen(half.basePrice) },
              ].map((p) => (
                <div key={p.name} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <p className={body} style={{ fontSize: "16px" }}>{p.name}</p>
                    <p className="text-[#888]" style={{ fontSize: "13px" }}>{p.time}</p>
                  </div>
                  <p className="text-[#3C200F]" style={{ fontSize: "18px" }}>{p.price}</p>
                </div>
              ))}
            </div>
            <p className="text-[#888] mt-3" style={{ fontSize: "13px", lineHeight: 1.8 }}>
              当日は、1年以内の混合ワクチンと狂犬病予防接種の証明書、普段のご飯、リード・首輪をお持ちください。
              くわしくは <Link href="/faq" className="underline">よくあるご質問</Link> をご覧ください。
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 px-6 bg-[#F7F5F0]">
          <div className="max-w-3xl mx-auto text-center">
            <a
              href={BOOKING_HREF}
              className="block w-full bg-[#B87942] hover:bg-[#A06830] text-white py-5 rounded-lg transition-colors"
              style={{ fontSize: "18px", letterSpacing: "1px" }}
            >
              ご予約はこちら
            </a>
            <p className="text-[#888] mt-3" style={{ fontSize: "13px" }}>
              ご予約フォームには、行き先（{HOTEL}）があらかじめ入っています。
            </p>
            <p className={`${body} mt-6`} style={{ fontSize: "14px" }}>
              お電話でのご相談：<a href="tel:0460800290" className="underline">0460-80-0290</a>（金〜火 9:00〜17:00）
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
