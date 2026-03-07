import Link from "next/link";

export function Pricing() {
  return (
    <section className="py-12 md:py-20 px-6 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-5">
          {/* TEMPORARY SERVICE */}
          <div className="bg-white px-6 md:px-12 py-10 text-center flex flex-col">
            <h3 className="text-[#311908] mb-3" style={{ fontSize: "clamp(24px, 3vw, 38.4px)", fontWeight: 400, letterSpacing: "2.7px" }}>
              TEMPORARY SERVICE
            </h3>
            <h4 className="text-[#311908] mb-3" style={{ fontSize: "24px", fontWeight: 400 }}>
              一時お預かり
            </h4>
            <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "1.8" }}>
              旅行プランの中に組み合わせて、<br />
              箱根旅行をもっと自由に。
            </p>

            <p className="text-[#3C200F] mb-8" style={{ fontSize: "18px", fontWeight: 400, lineHeight: "2" }}>
              1日：¥5,500/8時間<br />
              半日：¥3,300/4時間<br />
              スポット：¥1,100/1時間
            </p>

            <div className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              <p>通常プランのお預かり時間：9時-17時</p>
              <p>早朝プランのお預かり時間：7時-15時</p>
              <p>お預かり最終受付：15時</p>
              <p>お引き取り最終：17時</p>
              <p className="mt-2">※早朝プランは事前にご連絡お願いします。</p>
            </div>

            <div className="mt-auto">
              <a
                href="https://airrsv.net/doghubhakone/calendar" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full border border-[#C2C2C2] bg-white text-[#3C200F] py-4 hover:bg-[#F7F7F7] transition-colors rounded-[2px]"
                style={{ fontSize: "18px", fontWeight: 400 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                <span>このプランで予約する</span>
              </a>
              <div className="flex items-center justify-center gap-4 mt-4">
                <Link href="/4h" className="text-[#3C200F] hover:text-[#B87942] transition-colors group" style={{ fontSize: "14px", fontWeight: 400 }}>
                  半日プラン詳細 <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link href="/8h" className="text-[#3C200F] hover:text-[#B87942] transition-colors group" style={{ fontSize: "14px", fontWeight: 400 }}>
                  1日プラン詳細 <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* PET HOTEL */}
          <div className="bg-white px-6 md:px-12 py-10 text-center flex flex-col">
            <h3 className="text-[#311908] mb-3" style={{ fontSize: "clamp(24px, 3vw, 38.4px)", fontWeight: 400, letterSpacing: "2.7px" }}>
              PET HOTEL
            </h3>
            <h4 className="text-[#311908] mb-3" style={{ fontSize: "24px", fontWeight: 400 }}>
              宿泊プラン
            </h4>
            <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "1.8" }}>
              愛犬と泊まれる宿に空きがない。<br />
              宿泊する宿は愛犬と泊まれない<br />
              そんな時に。
            </p>

            <p className="text-[#3C200F] mb-8" style={{ fontSize: "18px", fontWeight: 400, lineHeight: "2" }}>
              1泊：¥7,700-<br />
              追加1時間あたり：¥1,100-
            </p>

            <div className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              <p>チェックイン：14時〜17時</p>
              <p>チェックアウト：9時〜11時</p>
              <p className="mt-2">
                営業時間外のお預かり/受け取りに関しては、別途時間料金を頂戴いたします。
                箱根町に在住する方々に関しては、利用料金が¥5,500-となります。
              </p>
            </div>

            <div className="mt-auto">
              <a
                href="https://airrsv.net/doghubhakone/calendar" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#3C200F] border border-[#C2C2C2] text-white py-4 hover:opacity-90 transition-opacity rounded-[2px]"
                style={{ fontSize: "18px", fontWeight: 400 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                <span>このプランで予約する</span>
              </a>
              <div className="mt-4">
                <Link href="/stay" className="text-[#3C200F] hover:text-[#B87942] transition-colors group" style={{ fontSize: "14px", fontWeight: 400 }}>
                  宿泊プラン詳細 <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
