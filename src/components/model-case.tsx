type Step = {
  time: string;
  place: string;
  icon: "dog" | "hub" | "spot" | "hotel" | "golf" | "car";
  withDog?: boolean;
  plan?: string;
};

type Plan = {
  tag: string;
  description: string;
  img: string;
  imgAlt: string;
  days: { label: string; steps: Step[] }[];
};

const plans: Plan[] = [
  {
    tag: "プレミアムホテルでゆったり宿泊 & 愛犬と箱根満喫プラン",
    description: "宿泊プラン＆半日お預かりコースを併用し、1泊2日で愛犬との旅行もゴルフも楽しめる",
    img: "/images/img-028.png",
    imgAlt: "おすすめプラン タイムライン",
    days: [
      {
        label: "DAY 1",
        steps: [
          { time: "9:30", place: "強羅公園散策", icon: "dog", withDog: true },
          { time: "10:30", place: "大涌谷散策", icon: "dog", withDog: true },
          { time: "13:00", place: "箱根ロープウェイ", icon: "spot" },
          { time: "15:00", place: "箱根神社", icon: "spot" },
          { time: "17:00", place: "DogHubへ預泊", icon: "hub", plan: "宿泊プラン" },
          { time: "18:00", place: "プレミアムホテル宿泊", icon: "hotel" },
        ],
      },
      {
        label: "DAY 2",
        steps: [
          { time: "8:00", place: "ゴルフ", icon: "golf" },
          { time: "11:00", place: "DogHubお預かり開始", icon: "hub", plan: "半日プラン" },
          { time: "15:00", place: "DogHubお迎え", icon: "hub" },
          { time: "15:30", place: "箱根湿生花園", icon: "dog", withDog: true },
          { time: "17:00", place: "帰宅", icon: "car" },
        ],
      },
    ],
  },
  {
    tag: "1泊2日｜箱根小涌園ユネッサン & 美術館満喫プラン",
    description: "1日預かり＆半日預かりプランを併用し、愛犬との時間をホテルでゆっくり楽しむことも",
    img: "/images/img-043.png",
    imgAlt: "箱根ユネッサン プラン タイムライン",
    days: [
      {
        label: "DAY 1",
        steps: [
          { time: "9:30", place: "DogHubお預かり", icon: "hub", plan: "1日預かりプラン" },
          { time: "10:30", place: "箱根小涌園ユネッサン", icon: "spot" },
          { time: "16:00", place: "DogHubお迎え", icon: "hub" },
          { time: "17:00", place: "レジーナリゾート箱根仙石原", icon: "hotel" },
        ],
      },
      {
        label: "DAY 2",
        steps: [
          { time: "9:30", place: "チェックアウト", icon: "hotel" },
          { time: "10:00", place: "DogHubお預かり", icon: "hub", plan: "半日プラン" },
          { time: "10:30", place: "箱根ガラスの森美術館", icon: "spot" },
          { time: "12:00", place: "ポーラ美術館", icon: "spot" },
          { time: "14:00", place: "DogHubお迎え", icon: "hub" },
          { time: "16:00", place: "ススキの原散策", icon: "dog", withDog: true },
        ],
      },
    ],
  },
  {
    tag: "温泉もグルメもショッピングもそして愛犬も満足プラン",
    description: "温泉の間だけちょこっとお預かり。日帰り旅行も満喫できる",
    img: "/images/img-040.png",
    imgAlt: "日帰り温泉プラン タイムライン",
    days: [
      {
        label: "日帰り",
        steps: [
          { time: "9:30", place: "芦ノ湖畔散策", icon: "dog", withDog: true },
          { time: "10:30", place: "箱根海賊船", icon: "dog", withDog: true },
          { time: "11:00", place: "DogHubお預かり", icon: "hub", plan: "半日プラン" },
          { time: "12:00", place: "ススキの原の湯 & グルメ", icon: "spot" },
          { time: "15:00", place: "DogHubお迎え", icon: "hub" },
          { time: "16:00", place: "御殿場プレミアムアウトレット", icon: "dog", withDog: true },
        ],
      },
    ],
  },
];

const iconMap: Record<Step["icon"], string> = {
  dog: "🐕",
  hub: "🏠",
  spot: "📍",
  hotel: "🏨",
  golf: "⛳",
  car: "🚗",
};

function MobileTimeline({ days }: { days: Plan["days"] }) {
  return (
    <div className="md:hidden space-y-6">
      {days.map((day, di) => (
        <div key={di}>
          <p className="text-[#B87942] mb-3" style={{ fontSize: "13px", fontWeight: 400, letterSpacing: "1px" }}>
            {day.label}
          </p>
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#E5DDD8]" />
            <div className="space-y-4">
              {day.steps.map((step, si) => (
                <div key={si} className="relative flex items-start gap-3">
                  {/* Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                      step.icon === "hub"
                        ? "border-[#B87942] bg-[#B87942]"
                        : "border-[#E5DDD8] bg-white"
                    }`}
                  >
                    {step.icon === "hub" && (
                      <span className="text-white" style={{ fontSize: "8px", lineHeight: 1 }}>D</span>
                    )}
                  </div>
                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#8F7B65] flex-shrink-0" style={{ fontSize: "12px", fontWeight: 400 }}>
                        {step.time}
                      </span>
                      <span className="text-[#3C200F]" style={{ fontSize: "14px", fontWeight: 400 }}>
                        {step.place}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {step.plan && (
                        <span className="text-[#B87942] bg-[#FFF8F3] px-2 py-0.5" style={{ fontSize: "11px", fontWeight: 400 }}>
                          {step.plan}
                        </span>
                      )}
                      {step.withDog && (
                        <span className="text-[#8F7B65]" style={{ fontSize: "11px", fontWeight: 400 }}>
                          愛犬OK
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-[#E5DDD8]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-[#B87942] bg-[#B87942]" />
          <span className="text-[#8F7B65]" style={{ fontSize: "11px" }}>DogHub</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#8F7B65]" style={{ fontSize: "11px" }}>愛犬OK = 愛犬と一緒に行動</span>
        </div>
      </div>
    </div>
  );
}

export function ModelCase() {
  return (
    <section id="model-case" className="py-12 md:py-20 px-6 bg-white border-t border-[#E5DDD8]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 400, letterSpacing: "1.6px" }}>MODEL CASE</h2>
        <h3 className="text-[#311908] mb-8 md:mb-10 max-w-2xl" style={{ fontSize: "clamp(16px, 2vw, 24px)", fontWeight: 400, lineHeight: "1.6" }}>
          お預かりプランを活用してより自由自在に。あなたの旅がもっと楽しくなるDogHub箱根仙石原の使い方
        </h3>

        <div className="space-y-8 md:space-y-12">
          {plans.map((plan, i) => (
            <div key={i} className="border border-[#E5DDD8]">
              {/* Tag header */}
              <div className="bg-[#3C200F] px-5 md:px-8 py-3">
                <p className="text-white" style={{ fontSize: "clamp(13px, 1.5vw, 16px)", fontWeight: 400 }}>{plan.tag}</p>
              </div>

              <div className="p-5 md:p-8">
                <h4 className="text-[#3C200F] mb-4 md:mb-6" style={{ fontSize: "clamp(15px, 1.8vw, 24px)", fontWeight: 400, lineHeight: "1.6" }}>
                  {plan.description}
                </h4>
                {/* Desktop: original image */}
                <img
                  src={plan.img}
                  alt={plan.imgAlt}
                  className="hidden md:block w-full h-auto"
                />
                {/* Mobile: vertical timeline */}
                <MobileTimeline days={plan.days} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-16">
          <p className="text-[#3C200F] text-center" style={{ fontSize: "clamp(16px, 2vw, 24px)", fontWeight: 400, lineHeight: "1.8" }}>
            組み合わせは自由自在で、あなたと愛犬の旅が何倍にも楽しくなる。<br />
            わんちゃんと入れる場所と入れない場所をつなぐ、<br />
            愛犬家のためのハブとなるDOG HOTELです。
          </p>
        </div>
      </div>
    </section>
  );
}
