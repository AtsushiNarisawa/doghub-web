const items = [
  "大箱根カントリークラブ 提携",
  "★ 4.8 Googleレビュー",
  "ユネッサン 預かり 検索1位",
  "早朝7:00〜お預かり対応",
  "リロクラブ会員 10% OFF",
  "前日17:00まで予約受付",
  "広大なドッグランで終日遊べる",
  "最大19部屋・宿泊対応",
];

export function Ticker() {
  const doubled = [...items, ...items];
  return (
    <div className="bg-[#2A5C45] py-3 overflow-hidden select-none">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 text-white/80 text-xs tracking-[0.25em] uppercase font-dm px-8"
          >
            {item}
            <span className="text-[#C49A3C] text-[10px]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
