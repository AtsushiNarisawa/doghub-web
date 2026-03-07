const scenes = [
  {
    num: "01",
    title: "ゴルフ",
    en: "Golf",
    desc: "大箱根カントリークラブと提携。早朝7時からお預かり可能。ラウンド中も安心して過ごせます。",
    tag: "大箱根CC 提携",
  },
  {
    num: "02",
    title: "温泉旅館",
    en: "Ryokan",
    desc: "ペット不可の高級旅館に泊まりたい方に。愛犬はDogHubで快適に過ごします。宿泊プランも対応。",
    tag: "宿泊プラン対応",
  },
  {
    num: "03",
    title: "ユネッサン",
    en: "Yunessun",
    desc: "「ユネッサン ペット 預かり」で検索1位。半日プランでご利用いただけます。",
    tag: "検索 No.1",
  },
  {
    num: "04",
    title: "美術館・観光",
    en: "Sightseeing",
    desc: "ポーラ美術館、岡田美術館、大涌谷など。時間を気にせずゆっくり鑑賞・散策できます。",
    tag: "半日〜1日プラン",
  },
];

export function Services() {
  return (
    <section className="py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-xl mb-20">
          <p className="font-dm text-[#2A5C45] text-xs tracking-[0.4em] uppercase mb-6">
            SCENES
          </p>
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-[#1A1A1A] leading-[1.1]">
            箱根の楽しみを、<br />
            我慢しなくていい。
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#F0EDE8]">
          {scenes.map((scene) => (
            <div
              key={scene.num}
              className="bg-white p-10 group hover:bg-[#F7F5F0] transition-colors duration-300"
            >
              <p className="font-dm text-[#2A5C45]/20 text-5xl font-bold mb-8 group-hover:text-[#2A5C45]/30 transition-colors duration-300">
                {scene.num}
              </p>
              <h3 className="font-playfair text-2xl font-bold text-[#1A1A1A] mb-1">
                {scene.title}
              </h3>
              <p className="font-dm text-[#6B6B6B] text-xs uppercase tracking-[0.3em] mb-5">
                {scene.en}
              </p>
              <p className="text-[#6B6B6B] text-sm leading-[1.9] mb-6">
                {scene.desc}
              </p>
              <span className="inline-block text-[#2A5C45] text-xs border border-[#2A5C45]/30 px-3 py-1">
                {scene.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
