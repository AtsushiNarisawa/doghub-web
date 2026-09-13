"use client";

import { useSyncExternalStore } from "react";
import { getJstToday } from "@/lib/datetime";

// /cafe ページ冒頭の期間限定のお知らせ（2026-10-30 臨時休業・10-31 カフェ休み）。
// 予約システム側は 10/30=closed、10/31=afternoon_only（午後から営業・宿泊のみ）で設定済み。
// 表示は JST の START〜END（両端含む）。期間を過ぎると自動で出なくなる（コードの削除は後日でよい）。
//
// /cafe は静的に生成されるページなので、日付の判定はビルド時ではなくブラウザで行う。
// サーバー側のスナップショットは "" ＝何も出さない（ハイドレーションの食い違いを起こさない）。
const START = "2026-10-17";
const END = "2026-10-31";

const subscribe = () => () => {};

export function CafeClosureNotice() {
  const today = useSyncExternalStore(subscribe, getJstToday, () => "");
  if (!today || today < START || today > END) return null;

  return (
    <section className="px-6 pt-10 bg-white">
      <div className="max-w-7xl mx-auto border border-[#B87942] bg-[#FFF8F3] p-5 md:p-6">
        <p className="text-[#B87942] mb-1" style={{ fontSize: "14px", fontWeight: 400, letterSpacing: "0.5px" }}>
          営業日のお知らせ
        </p>
        <p className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "1.9" }}>
          10月30日（金）は臨時休業、10月31日（土）はカフェ（おむすび＆スープ）とカフェご利用時のドッグランをお休みいたします。11月1日（日）からは通常どおり営業いたします。
        </p>
      </div>
    </section>
  );
}
