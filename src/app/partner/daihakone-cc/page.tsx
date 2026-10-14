import { Metadata } from "next";
import { PartnerGuidePage, type PartnerGuide } from "@/components/partner/guide";

// 大箱根カントリークラブ様でプレーされるお客様専用のご案内ページ（ゴルフ場の型）。
// 検索には出さない（noindex）・サイト内からのリンクは先方の了解後。
// 所要時間＝Googleマップで4分（2026-10-14）→ 既存の丸め（車で約5分）に合わせた。
// 1日のお預かり＝お預け 7:00〜9:00・8時間、半日＝9:00〜13:00・4時間（types/booking.ts の PLANS）。

const GUIDE: PartnerGuide = {
  slug: "daihakone-cc",
  hotel: "大箱根カントリークラブ",
  drive: "約5分",
  routeOrigin: "大箱根カントリークラブ",
  routeSteps: [
    "当店はゴルフ場と同じ仙石原にございます",
    "お車で5分ほど。当店の案内看板を目印に到着",
  ],
  kind: "golf",
  flow: [
    { day: "", time: "7:00〜9:00", place: "DogHub", text: "1日のお預かり（8時間）でワンちゃんをお預け" },
    { day: "", time: "お預けの後", place: "ゴルフ場", text: "お車で約5分。スタート・ラウンド" },
    { day: "", time: "ラウンド後", place: "DogHub", text: "お迎え（例：7:30にお預けなら15:30まで）。ここから愛犬と仙石原の散策へ" },
  ],
  notes: [
    {
      title: "お迎えの時刻について",
      body: "1日のお預かりは、お預けから8時間です。8時間を過ぎる場合は{fee}／1時間・ワンちゃん1頭あたりで延長でき、お迎えは17:00までにお願いしております。",
    },
    {
      title: "ハーフや午後スタートの場合",
      body: "9:00〜13:00にお預けいただく半日のお預かり（4時間）もございます。",
    },
  ],
};

export const metadata: Metadata = {
  title: `${GUIDE.hotel} でプレーされるお客様へ｜愛犬のお預かり｜DogHub箱根仙石原`,
  description: `${GUIDE.hotel} からお車で${GUIDE.drive}。ラウンド中の愛犬のお預かりのご案内です。`,
  robots: { index: false, follow: false },
};

export default function DaihakoneCcPartnerPage() {
  return <PartnerGuidePage guide={GUIDE} />;
}
