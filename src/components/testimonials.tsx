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
    <section className="py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8">
          <div>
            <p className="font-dm text-[#2A5C45] text-xs tracking-[0.4em] uppercase mb-6">
              REVIEWS
            </p>
            <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-[#1A1A1A]">
              お客様の声
            </h2>
          </div>
          <div className="flex items-center gap-5">
            <span className="font-playfair text-6xl font-bold text-[#1A1A1A] leading-none">
              4.8
            </span>
            <div>
              <div className="text-[#C49A3C] tracking-[0.2em] text-lg mb-1">★★★★★</div>
              <p className="text-[#6B6B6B] text-xs">Google レビュー 32件</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div key={i} className="border border-[#DDD8D0] p-10 flex flex-col">
              <div className="text-[#C49A3C] text-xs tracking-[0.3em] mb-6">★★★★★</div>
              <p className="text-[#1A1A1A] text-sm leading-[2] flex-grow mb-8">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="border-t border-[#DDD8D0] pt-6 flex items-end justify-between">
                <div>
                  <p className="text-[#1A1A1A] text-sm font-medium">{review.name}</p>
                  <p className="text-[#6B6B6B] text-xs mt-0.5">{review.location}</p>
                </div>
                <span className="font-dm text-[#2A5C45] text-xs uppercase tracking-wider">
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
