import Link from "next/link";

const plans = [
  {
    label: "半日お預かり",
    en: "HALF DAY",
    price: "¥3,300",
    unit: "/ 4時間",
    description: "温泉やユネッサンの間にちょこっとお預け",
    href: "/4h",
  },
  {
    label: "1日お預かり",
    en: "FULL DAY",
    price: "¥5,500",
    unit: "/ 8時間",
    description: "ゴルフや1日観光の間に愛犬を安心してお預け",
    href: "/8h",
  },
  {
    label: "宿泊プラン",
    en: "PET HOTEL",
    price: "¥7,700〜",
    unit: "/ 1泊",
    description: "愛犬と泊まれない宿でも箱根旅行をあきらめない",
    href: "/stay",
  },
];

export function Pricing() {
  return (
    <section className="py-12 md:py-20 px-6 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[#3C200F] mb-2" style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 400, letterSpacing: "1.6px" }}>
          PLAN
        </h2>
        <p className="text-[#311908] mb-8 md:mb-10" style={{ fontSize: "clamp(16px, 2vw, 20px)", fontWeight: 400 }}>
          お預かりプラン
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <Link
              key={plan.href}
              href={plan.href}
              className="bg-white p-6 md:p-8 flex flex-col hover:bg-[#FEFCFA] transition-colors group"
            >
              <p className="text-[#B87942] mb-1" style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "1px" }}>
                {plan.en}
              </p>
              <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>
                {plan.label}
              </h3>
              <p className="text-[#3C200F] mb-4">
                <span style={{ fontSize: "28px", fontWeight: 400 }}>{plan.price}</span>
                <span className="text-[#8F7B65] ml-1" style={{ fontSize: "14px" }}>{plan.unit}</span>
              </p>
              <p className="text-[#8F7B65] mb-6 flex-grow" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.7" }}>
                {plan.description}
              </p>
              <span className="text-[#3C200F] inline-flex items-center gap-1 group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px" }}>
                詳しくはこちら <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/service"
            className="text-[#3C200F] hover:text-[#B87942] transition-colors group border-b border-[#3C200F] pb-1"
            style={{ fontSize: "16px", fontWeight: 400 }}
          >
            料金・サービスの詳細 <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <a
            href="/booking"
            className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-8 py-3 hover:opacity-90 transition-opacity"
            style={{ fontSize: "16px", fontWeight: 400 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            ご予約はこちら
          </a>
        </div>

        <p className="text-center text-[#8F7B65] mt-4" style={{ fontSize: "12px", fontWeight: 400 }}>
          ※表示料金はすべて税込です。
        </p>
      </div>
    </section>
  );
}
