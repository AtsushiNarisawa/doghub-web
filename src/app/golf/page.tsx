import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "箱根ゴルフ × ペットホテル｜愛犬を預けてプレーを満喫｜DogHub箱根仙石原",
  description: "箱根でゴルフを楽しむ間、愛犬をDogHubにお預け。早朝7時からお預かり対応。大箱根カントリークラブ提携。1日8時間¥5,500。24時間スタッフ常駐・完全個室・ドッグラン併設。",
};

const courses = [
  {
    name: "大箱根カントリークラブ",
    distance: "車で約10分",
    note: "DogHub提携コース",
  },
  {
    name: "箱根湖畔ゴルフコース",
    distance: "車で約15分",
    note: "",
  },
  {
    name: "富士屋ホテル仙石ゴルフコース",
    distance: "車で約5分",
    note: "",
  },
  {
    name: "箱根園ゴルフ場",
    distance: "車で約20分",
    note: "",
  },
];

export default function GolfPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"箱根ゴルフ × ペットホテル",href:"/golf"}]} />
        {/* Hero */}
        <div className="relative">
          <img
            src="/images/img-007.jpg"
            alt="箱根ゴルフ × ペットホテル"
            className="w-full object-cover"
            style={{ height: "clamp(180px, 30vw, 424px)" }}
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
            <p className="text-sm mb-2 opacity-80">/ ゴルフ × ペットホテル</p>
            <h1 style={{ fontSize: "clamp(24px, 5vw, 44px)", fontWeight: 400 }}>
              愛犬を預けて箱根ゴルフを満喫
            </h1>
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

        {/* Main content */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>GOLF × DOG HOTEL</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "26px", fontWeight: 400, lineHeight: "1.6" }}>
                  早朝7時からお預かり。<br />ゴルフの朝イチスタートに対応
                </h3>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  箱根にはゴルフ好きにはたまらない名門コースがたくさん。
                  でも「愛犬をどうしよう？」と悩んで、旅行自体を諦めていませんか？
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  DogHub箱根仙石原なら、早朝7時からお預かり対応。
                  朝イチのスタートに合わせて愛犬を預けて、ラウンド後にお迎えに来ていただければOKです。
                  大箱根カントリークラブとも提携しており、ゴルフ前にお預けになるお客様に多くご利用いただいています。
                </p>

                <div className="bg-[#F7F7F7] p-8 mb-8">
                  <h4 className="text-[#3C200F] mb-4" style={{ fontSize: "20px", fontWeight: 400 }}>おすすめプラン</h4>
                  <div className="space-y-4 text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                    <div className="pb-3 border-b border-[#E5DDD8]">
                      <p className="text-[#B87942]" style={{ fontSize: "14px" }}>1日お預かり（8時間）</p>
                      <p style={{ fontSize: "24px" }}>¥5,500</p>
                      <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>通常 9時〜17時 ／ 早朝 7時〜15時</p>
                    </div>
                    <div>
                      <p className="text-[#B87942]" style={{ fontSize: "14px" }}>宿泊プラン（ゴルフ旅行に）</p>
                      <p style={{ fontSize: "24px" }}>¥7,700〜</p>
                      <p className="text-[#8F7B65]" style={{ fontSize: "14px" }}>チェックイン 14時〜 ／ チェックアウト 〜11時</p>
                    </div>
                  </div>
                  <p className="text-[#8F7B65] mt-3" style={{ fontSize: "13px" }}>※表示料金はすべて税込です。</p>
                </div>

                <a
                  href="https://airrsv.net/doghubhakone/calendar" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-10 py-4 hover:opacity-90 transition-opacity"
                  style={{ fontSize: "18px", fontWeight: 400 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                  ご予約はこちら
                </a>
              </div>

              <div>
                <img
                  src="/images/img-012.jpg"
                  alt="DogHub箱根仙石原 ドッグラン"
                  className="w-full h-auto"
                />
                <img
                  src="/images/img-021.jpg"
                  alt="DogHub箱根仙石原 ドッグランで遊ぶ犬"
                  className="w-full h-auto mt-4"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Model case */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>ゴルフ × DogHubのモデルケース</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-[#E5DDD8] p-8">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>日帰りゴルフプラン</h3>
                <p className="text-[#B87942] mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>1日お預かり（8時間）¥5,500</p>
                <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                  <p>7:00 DogHubにお預け（早朝プラン）</p>
                  <p>7:30 ゴルフ場到着・スタート</p>
                  <p>12:00 ラウンド終了・ランチ</p>
                  <p>14:00 DogHubでお迎え</p>
                  <p>14:30 愛犬と仙石原を散策</p>
                </div>
              </div>
              <div className="bg-white border border-[#E5DDD8] p-8">
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>1泊2日ゴルフ旅行プラン</h3>
                <p className="text-[#B87942] mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>宿泊 + 1日お預かり</p>
                <div className="space-y-3 text-[#3C200F]" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                  <p>【1日目】14:00 DogHubにチェックイン</p>
                  <p>15:00 温泉旅館でゆっくり</p>
                  <p>【2日目】7:00 ゴルフ場へ出発</p>
                  <p>12:00 ラウンド終了</p>
                  <p>13:00 DogHubでお迎え・帰宅</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby golf courses */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>DogHubから近いゴルフ場</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {courses.map((c) => (
                <div key={c.name} className="border border-[#E5DDD8] p-6">
                  <h3 className="text-[#3C200F] mb-1" style={{ fontSize: "18px", fontWeight: 400 }}>{c.name}</h3>
                  <p className="text-[#B87942]" style={{ fontSize: "14px", fontWeight: 400 }}>{c.distance}</p>
                  {c.note && <p className="text-[#8F7B65] mt-1" style={{ fontSize: "13px", fontWeight: 400 }}>{c.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why DogHub */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>ゴルファーに選ばれる理由</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { title: "早朝7時からお預かり", body: "ゴルフの朝イチスタートに対応。早朝プランなら7時〜15時でお預かりします。" },
                { title: "大箱根CC提携", body: "大箱根カントリークラブと提携。ゴルフ前にお預けになるお客様が多数ご利用中。" },
                { title: "24時間スタッフ常駐", body: "プレー中も安心。完全個室とドッグランで、愛犬もリラックスして過ごせます。" },
              ].map((item) => (
                <div key={item.title} className="bg-white p-6">
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "18px", fontWeight: 400 }}>{item.title}</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other plans */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>お預かりプラン</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/4h" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "14px", fontWeight: 400 }}>半日お預かり</p>
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>¥3,300 / 4時間</h3>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/8h" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "14px", fontWeight: 400 }}>1日お預かり</p>
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>¥5,500 / 8時間</h3>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
              <Link href="/stay" className="block border border-[#E5DDD8] p-6 hover:bg-[#F7F7F7] transition-colors group">
                <p className="text-[#B87942] mb-1" style={{ fontSize: "14px", fontWeight: 400 }}>宿泊プラン</p>
                <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "20px", fontWeight: 400 }}>¥7,700〜 / 1泊</h3>
                <span className="text-[#3C200F] mt-3 inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#3C200F] py-10 px-6">
          <div className="max-w-7xl mx-auto text-center text-white">
            <p className="mb-4" style={{ fontSize: "14px", fontWeight: 400 }}>はじめてご利用の方はご予約前に必ずこちらをご覧ください</p>
            <Link href="/guide" className="inline-flex items-center gap-2 border border-white text-white px-8 py-3 hover:bg-white hover:text-[#3C200F] transition-colors" style={{ fontSize: "16px", fontWeight: 400 }}>
              ご利用ガイド・注意事項はこちら →
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
