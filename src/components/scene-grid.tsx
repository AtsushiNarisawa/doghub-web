import Link from "next/link";

const scenes = [
  {
    href: "/onsen",
    title: "温泉 × お預かり",
    desc: "日帰り温泉の間、愛犬をDogHubへ",
  },
  {
    href: "/yunessun",
    title: "ユネッサン × お預かり",
    desc: "犬NGの温泉プールを満喫",
  },
  {
    href: "/museum",
    title: "美術館 × お預かり",
    desc: "ポーラ・ガラスの森など仙石原の美術館",
  },
  {
    href: "/golf",
    title: "ゴルフ × お預かり",
    desc: "早朝7時からお預かり。大箱根CC提携",
  },
  {
    href: "/pethotel",
    title: "ペット可ホテル × 日中預かり",
    desc: "チェックイン前・アウト後の観光に",
  },
  {
    href: "/ryokan",
    title: "高級旅館 × ペットホテル",
    desc: "憧れの旅館に泊まりながら愛犬は安心",
  },
];

export function SceneGrid() {
  return (
    <section className="py-12 lg:py-16 px-6 bg-[#F7F5F0] border-t border-border">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-text text-center mb-2" style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 400 }}>
          箱根旅行のシーン別 × 愛犬お預かり
        </h2>
        <p className="text-center text-[#8F7B65] mb-8" style={{ fontSize: "14px", lineHeight: 1.8 }}>
          犬と入れない場所こそ、DogHubの出番。<br className="sm:hidden" />
          行きたい場所から選べます。
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenes.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="block p-5 bg-white border border-border rounded-xl hover:border-accent transition-colors group"
            >
              <h3 className="text-text group-hover:text-accent transition-colors mb-1" style={{ fontSize: "16px", fontWeight: 500 }}>
                {s.title}
              </h3>
              <p className="text-[#8F7B65]" style={{ fontSize: "13px", lineHeight: 1.6 }}>{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
