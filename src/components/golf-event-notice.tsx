"use client";

// 大箱根カントリークラブでの女子プロゴルフ大会（2026-08-21〜23）の告知ブロック。
// /golf ページ冒頭に差し込む。会期後（2026-08-24）に自動で非表示になる。
// ※大会名・ロゴ・「公式/協賛」は使わず、公開情報である会場名と「女子プロゴルフの大会」という
//   一般表現に留める（便乗ではなく観戦客の受け皿という立て付け）。
export function GolfEventNotice() {
  const now = new Date();
  const start = new Date("2026-07-15");
  const end = new Date("2026-08-24");
  if (now < start || now >= end) return null;

  return (
    <section className="px-6 py-8 bg-[#FFF8F3] border-b border-[#E5DDD8]">
      <div className="max-w-7xl mx-auto border border-[#B87942] bg-white p-6 md:p-8">
        <p
          className="text-[#B87942] mb-2"
          style={{ fontSize: "14px", fontWeight: 400, letterSpacing: "0.5px" }}
        >
          2026年8月21日(金)〜23日(日)
        </p>
        <h2
          className="text-[#3C200F] mb-4"
          style={{ fontSize: "22px", fontWeight: 400, lineHeight: "1.6" }}
        >
          大箱根カントリークラブで女子プロゴルフの大会が開催されます
        </h2>
        <p
          className="text-[#3C200F] mb-6"
          style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}
        >
          会場は当店から車で約5分。ゴルフ場にワンちゃんは入場できません。観戦やご旅行の時間だけ、DogHubで愛犬を安心してお預かりします。
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#F7F7F7] p-5">
            <p className="text-[#B87942] mb-1" style={{ fontSize: "14px" }}>
              日帰りで観戦される方
            </p>
            <p
              className="text-[#3C200F]"
              style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.9" }}
            >
              1日お預かり（8時間）¥5,500／半日（4時間）¥3,300
              <br />
              1日お預かりは早朝7時から受付。朝イチの移動にも間に合います。
            </p>
          </div>
          <div className="bg-[#F7F7F7] p-5">
            <p className="text-[#B87942] mb-1" style={{ fontSize: "14px" }}>
              遠方から前泊・連泊される方
            </p>
            <p
              className="text-[#3C200F]"
              style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.9" }}
            >
              宿泊 1泊 ¥7,700〜
              <br />
              チェックイン14〜17時／チェックアウト9〜11時
            </p>
          </div>
        </div>
        <p
          className="text-[#8F7B65] mb-6"
          style={{ fontSize: "13px", fontWeight: 400, lineHeight: "1.8" }}
        >
          ※会場周辺は駐車場に限りがあり、当日は大変混雑が予想されます。お預かりは事前予約制・枠に限りがありますので、お早めにご予約ください。
        </p>
        <a
          href="/booking"
          className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-8 py-3 hover:opacity-90 transition-opacity"
          style={{ fontSize: "16px", fontWeight: 400 }}
        >
          この日程でご予約はこちら →
        </a>
      </div>
    </section>
  );
}
