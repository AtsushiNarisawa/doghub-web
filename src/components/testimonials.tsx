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

export function Testimonials() {
  return (
    <section className="py-12 md:py-20 px-6 bg-white border-t border-[#E5DDD8]">
      <div className="max-w-7xl mx-auto">
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
      </div>
    </section>
  );
}
