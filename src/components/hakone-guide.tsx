import Link from "next/link";

const guides = [
  {
    href: "/news/hakone-dog-trip-guide",
    title: "犬連れ旅行ガイド",
    desc: "1泊2日モデルコース付き",
  },
  {
    href: "/news/hakone-dog-friendly-hotels",
    title: "犬と泊まれる宿",
    desc: "ペット可の宿＆ペット不可の宿を楽しむ方法",
  },
  {
    href: "/news/hakone-dog-lunch-guide",
    title: "犬連れランチ",
    desc: "室内OKのお店と楽しむコツ",
  },
  {
    href: "/news/hakone-dog-travel-model-course",
    title: "モデルコース",
    desc: "日帰り＆1泊2日プラン",
  },
];

export function HakoneGuide() {
  return (
    <section className="py-16 px-6 bg-white border-t border-border">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-text text-center mb-2" style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 400 }}>
          箱根 × 犬 過ごし方ガイド
        </h2>
        <p className="text-center text-[#8F7B65] mb-8" style={{ fontSize: "14px" }}>
          犬連れで箱根を楽しむためのヒントをまとめました
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guides.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="block p-5 border border-border rounded-xl hover:border-accent transition-colors group"
            >
              <h3 className="text-text group-hover:text-accent transition-colors mb-1" style={{ fontSize: "16px", fontWeight: 500 }}>
                {g.title}
              </h3>
              <p className="text-[#8F7B65]" style={{ fontSize: "13px" }}>{g.desc}</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link
            href="/news"
            className="text-accent hover:underline"
            style={{ fontSize: "14px" }}
          >
            すべての記事を見る →
          </Link>
        </div>
      </div>
    </section>
  );
}
