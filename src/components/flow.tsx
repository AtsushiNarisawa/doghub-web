const steps = [
  {
    step: "01",
    title: "プランを選ぶ",
    desc: "半日・1日・宿泊の3プランからお選びください。スポット利用は当日来店のみ。",
  },
  {
    step: "02",
    title: "フォームで予約",
    desc: "前日17時までにオンラインフォームよりご予約。ワンちゃんの情報を入力してください。",
  },
  {
    step: "03",
    title: "来店・お預け",
    desc: "施設到着後、スタッフにワンちゃんをお預けください。ワクチン証明書をご持参ください。",
  },
  {
    step: "04",
    title: "箱根を満喫",
    desc: "ゴルフ、温泉、観光を心置きなくお楽しみください。スタッフが見守ります。",
  },
  {
    step: "05",
    title: "お迎え・お会計",
    desc: "お戻りの際にお迎え。元気に遊んだワンちゃんをお返しします。",
  },
];

export function Flow() {
  return (
    <section className="py-32 px-6 bg-[#F7F5F0]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="font-dm text-[#2A5C45] text-xs tracking-[0.4em] uppercase mb-6">
            HOW TO USE
          </p>
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-[#1A1A1A]">
            ご利用の流れ
          </h2>
        </div>

        {/* Desktop: horizontal */}
        <div className="hidden md:grid md:grid-cols-5 gap-0 relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-[10%] right-[10%] h-px bg-[#DDD8D0]" />

          {steps.map((s) => (
            <div key={s.step} className="text-center px-4 relative">
              <div className="w-16 h-16 rounded-full bg-white border border-[#DDD8D0] flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="font-dm text-[#2A5C45] text-xs font-medium tracking-wider">
                  {s.step}
                </span>
              </div>
              <h3 className="font-medium text-[#1A1A1A] text-sm mb-2">{s.title}</h3>
              <p className="text-[#6B6B6B] text-xs leading-[1.9]">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile: vertical */}
        <div className="md:hidden space-y-0">
          {steps.map((s, i) => (
            <div key={s.step} className="flex gap-6 pb-10 relative">
              {i < steps.length - 1 && (
                <div className="absolute left-7 top-16 bottom-0 w-px bg-[#DDD8D0]" />
              )}
              <div className="w-14 h-14 rounded-full bg-white border border-[#DDD8D0] flex items-center justify-center flex-shrink-0 relative z-10">
                <span className="font-dm text-[#2A5C45] text-xs font-medium">{s.step}</span>
              </div>
              <div className="pt-3">
                <h3 className="font-medium text-[#1A1A1A] mb-1">{s.title}</h3>
                <p className="text-[#6B6B6B] text-sm leading-[1.9]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[#6B6B6B] text-sm mt-16 pt-12 border-t border-[#DDD8D0]">
          スポット利用（¥1,100/時間）は予約不要・当日来店のみ
        </p>
      </div>
    </section>
  );
}
