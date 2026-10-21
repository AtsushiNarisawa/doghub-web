import Link from "next/link";
const reviews = [
  {
    text: "ゴルフの間、安心して預けられました。帰ってきた時の愛犬が本当に嬉しそうで、また利用したいと思います。",
    name: "Y.T様",
    location: "東京都",
    plan: "1日プラン",
  },
  {
    text: "温泉旅館に泊まりたくてDogHubさんを利用しました。スタッフさんが丁寧にお世話してくれると聞いて安心できました。",
    name: "M.S様",
    location: "神奈川県",
    plan: "宿泊プラン",
  },
  {
    text: "ユネッサンに行く間お願いしました。スタッフさんがとても丁寧で、とても安心して楽しめました。",
    name: "K.W様",
    location: "埼玉県",
    plan: "半日プラン",
  },
];

// 宿・ゴルフ場ごとのご案内（当店の記事）。並び順に優劣はない。
const stayGuides = [
  { name: "エクシブ箱根離宮", href: "/news/hakone-miyanoshita-xiv-dog-guide" },
  { name: "箱根仙石原プリンスホテル", href: "/news/hakone-sengokuhara-prince-dog-guide" },
  { name: "リトナ箱根", href: "/news/hakone-retona-dog-guide" },
  { name: "レジーナリゾート箱根仙石原", href: "/news/hakone-regina-resort-dog-guide" },
  { name: "大箱根カントリークラブ", href: "/news/hakone-daihakone-cc-dog-guide" },
];

const media = [
  { name: "日本経済新聞", sub: "NIKKEI COMPASS" },
  { name: "ゴルフダイジェスト", sub: "みんなのゴルフダイジェスト" },
  { name: "ALBA Net", sub: "ゴルフ総合サイト" },
  { name: "トラベル Watch", sub: "Impress" },
  { name: "PETOKOTO", sub: "ペットメディア" },
  { name: "箱根町観光協会", sub: "公式サイト" },
];

export function Testimonials() {
  return (
    <section className="py-12 md:py-20 px-6 bg-white border-t border-[#E5DDD8]">
      <div className="max-w-7xl mx-auto">
        {/* Trust numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center mb-12 md:mb-16">
          <div>
            <p className="text-[#3C200F]" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400 }}>4.9<span className="text-[#B87942]">★</span></p>
            <p className="mt-1 text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>Google レビュー</p>
          </div>
          <div>
            <p className="text-[#3C200F]" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400 }}>700<span style={{ fontSize: "16px" }}>件+</span></p>
            <p className="mt-1 text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>累計予約実績</p>
          </div>
          <div>
            <p className="text-[#3C200F]" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400 }}>24<span style={{ fontSize: "16px" }}>時間</span></p>
            <p className="mt-1 text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>スタッフ常駐</p>
          </div>
          <div>
            <p className="text-[#3C200F]" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400 }}>唯一</p>
            <p className="mt-1 text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>箱根町のドッグホテル</p>
          </div>
        </div>

        {/* Reviews */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12 gap-6">
          <div>
            <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 400, letterSpacing: "1.6px" }}>
              REVIEWS
            </h2>
            <p className="text-[#311908]" style={{ fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 400 }}>
              お客様の声
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#3C200F] leading-none" style={{ fontSize: "48px", fontWeight: 400 }}>
              4.9
            </span>
            <div>
              <div className="text-[#B87942] tracking-[0.2em] text-lg mb-1">★★★★★</div>
              <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>Google レビュー 61件</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="border border-[#E5DDD8] p-6 md:p-8 flex flex-col">
              <div className="text-[#B87942] text-xs tracking-[0.3em] mb-4">★★★★★</div>
              <p className="text-[#3C200F] flex-grow mb-6" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="border-t border-[#E5DDD8] pt-4 flex items-end justify-between">
                <div>
                  <p className="text-[#3C200F]" style={{ fontSize: "14px", fontWeight: 400 }}>{review.name}</p>
                  <p className="text-[#8F7B65] mt-0.5" style={{ fontSize: "12px", fontWeight: 400 }}>{review.location}</p>
                </div>
                <span className="text-[#B87942]" style={{ fontSize: "12px", fontWeight: 400 }}>
                  {review.plan}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Media & Partners */}
        <div className="mt-12 md:mt-16 pt-10 border-t border-[#E5DDD8]">
          <p className="text-center text-[#8F7B65] mb-6" style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "1px" }}>
            掲載・ご案内
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 mb-6">
            {media.map((m) => (
              <div key={m.name} className="text-center py-3 px-2 border border-[#E5DDD8] bg-[#FAFAFA]">
                <p className="text-[#3C200F]" style={{ fontSize: "clamp(11px, 1.5vw, 14px)", fontWeight: 400, lineHeight: "1.4" }}>{m.name}</p>
                <p className="text-[#8F7B65] mt-0.5" style={{ fontSize: "10px", fontWeight: 400 }}>{m.sub}</p>
              </div>
            ))}
          </div>
          {/* 「提携」は取り決めのあるクリニックだけ。宿・ゴルフ場は並列で「ご案内」として載せる（10-21 CEO）。
              宿・ゴルフ場は施設ごとに掲載の了解をいただいたものだけを足す。 */}
          <div className="text-center text-[#8F7B65]" style={{ fontSize: "12px", fontWeight: 400, lineHeight: 1.8 }}>
            <p>提携：アニマルクリニック仙石原（急な体調不良時の受診）</p>
            <p className="mt-5 mb-2 text-[#3C200F]" style={{ fontSize: "13px" }}>宿・ゴルフ場ごとのご案内</p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {stayGuides.map((g) => (
                <Link key={g.href} href={g.href} className="underline underline-offset-2 hover:text-[#B87942]">{g.name}</Link>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-3">
              <Link href="/hotels" className="text-[#B87942] hover:underline">箱根の宿の預け方 →</Link>
              <Link href="/golf" className="text-[#B87942] hover:underline">近くのゴルフ場13コース →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
