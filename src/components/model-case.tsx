const plans = [
  {
    tag: "プレミアムホテルでゆったり宿泊 & 愛犬と箱根満喫プラン",
    description: "宿泊プラン＆半日お預かりコースを併用し、1泊2日で愛犬との旅行もゴルフも楽しめる",
    img: "/images/img-028.png",
    imgAlt: "おすすめプラン タイムライン",
  },
  {
    tag: "1泊2日｜箱根小涌園ユネッサン & 美術館満喫プラン",
    description: "1日預かり＆半日預かりプランを併用し、愛犬との時間をホテルでゆっくり楽しむことも",
    img: "/images/img-043.png",
    imgAlt: "箱根ユネッサン プラン タイムライン",
  },
  {
    tag: "温泉もグルメもショッピングもそして愛犬も満足プラン",
    description: "温泉の間だけちょこっとお預かり。日帰り旅行も満喫できる",
    img: "/images/img-040.png",
    imgAlt: "日帰り温泉プラン タイムライン",
  },
];

export function ModelCase() {
  return (
    <section className="py-12 md:py-20 px-6 bg-white border-t border-[#E5DDD8]">
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
                <img
                  src={plan.img}
                  alt={plan.imgAlt}
                  className="w-full h-auto"
                />
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
