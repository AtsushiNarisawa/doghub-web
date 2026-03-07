const features = [
  {
    num: "01",
    title: "広大なドッグラン",
    desc: "箱根の自然に囲まれた広々としたスペース。思いっきり走り回れます。",
  },
  {
    num: "02",
    title: "最大19部屋",
    desc: "快適な個室タイプ。宿泊・日帰りに応じて柔軟に部屋数を調整します。",
  },
  {
    num: "03",
    title: "スタッフ常駐",
    desc: "愛犬好きのスタッフが終日そばで見守り、たっぷり遊んでもらえます。",
  },
  {
    num: "04",
    title: "体重15kgまで対応",
    desc: "小型・中型犬をお受け入れ。15kg超の場合は事前にご相談ください。",
  },
];

export function Facility() {
  return (
    <section className="py-32 px-6 bg-[#2A5C45]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          {/* Kennels photo */}
          <div className="relative order-2 md:order-1">
            <div className="overflow-hidden">
              <img
                src="/images/img-036.jpg"
                alt="DogHub 個室お部屋"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 w-32 h-32 border border-[#C49A3C]/20" />
          </div>

          <div className="order-1 md:order-2">
            <p className="font-dm text-[#C49A3C] text-xs tracking-[0.4em] uppercase mb-8">
              FACILITY
            </p>
            <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-white leading-[1.1] mb-14">
              箱根の自然の中で、<br />
              <em className="not-italic text-[#C49A3C]">のびのびと。</em>
            </h2>

            <div className="space-y-9">
              {features.map((f) => (
                <div key={f.num} className="flex gap-6">
                  <span className="font-dm text-[#C49A3C]/40 text-sm mt-0.5 flex-shrink-0 w-6">
                    {f.num}
                  </span>
                  <div>
                    <h3 className="text-white font-medium mb-1.5">{f.title}</h3>
                    <p className="text-white/50 text-sm leading-[1.9]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
