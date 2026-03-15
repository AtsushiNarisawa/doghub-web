const reviews = [
  {
    text: "ゴルフの間、安心して預けられました。帰ってきた時の愛犬が本当に嬉しそうで、また利用したいと思います。",
    name: "Y.T様",
    location: "東京都",
    plan: "1日プラン",
  },
  {
    text: "温泉旅館に泊まりたくてDogHubさんを利用しました。ドッグランで遊んでもらえると聞いて安心できました。",
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
            <p className="text-[#3C200F]" style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400 }}>4.8<span className="text-[#B87942]">★</span></p>
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
              4.8
            </span>
            <div>
              <div className="text-[#B87942] tracking-[0.2em] text-lg mb-1">★★★★★</div>
              <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>Google レビュー 32件</p>
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
            MEDIA & PARTNERS
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 mb-6">
            {media.map((m) => (
              <div key={m.name} className="text-center py-3 px-2 border border-[#E5DDD8] bg-[#FAFAFA]">
                <p className="text-[#3C200F]" style={{ fontSize: "clamp(11px, 1.5vw, 14px)", fontWeight: 400, lineHeight: "1.4" }}>{m.name}</p>
                <p className="text-[#8F7B65] mt-0.5" style={{ fontSize: "10px", fontWeight: 400 }}>{m.sub}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[#8F7B65]" style={{ fontSize: "12px", fontWeight: 400 }}>
            <span>大箱根カントリークラブ 提携</span>
            <span>リロクラブ 加盟</span>
          </div>
        </div>
      </div>
    </section>
  );
}
