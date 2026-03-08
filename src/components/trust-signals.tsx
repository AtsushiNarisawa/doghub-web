export function TrustSignals() {
  return (
    <section className="py-10 px-6 bg-[#3C200F]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center text-white">
          <div>
            <p style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400 }}>4.8<span className="text-[#B87942]">★</span></p>
            <p className="mt-1 text-white/70" style={{ fontSize: "13px", fontWeight: 400 }}>Google レビュー</p>
          </div>
          <div>
            <p style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400 }}>700<span style={{ fontSize: "16px" }}>件+</span></p>
            <p className="mt-1 text-white/70" style={{ fontSize: "13px", fontWeight: 400 }}>累計予約実績</p>
          </div>
          <div>
            <p style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400 }}>24<span style={{ fontSize: "16px" }}>時間</span></p>
            <p className="mt-1 text-white/70" style={{ fontSize: "13px", fontWeight: 400 }}>スタッフ常駐</p>
          </div>
          <div>
            <p style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400 }}>唯一</p>
            <p className="mt-1 text-white/70" style={{ fontSize: "13px", fontWeight: 400 }}>箱根町のドッグホテル</p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-white/60" style={{ fontSize: "12px", fontWeight: 400 }}>
          <span>大箱根カントリークラブ 提携</span>
          <span>リロクラブ 加盟</span>
          <span>箱根町観光協会 掲載</span>
        </div>
      </div>
    </section>
  );
}
