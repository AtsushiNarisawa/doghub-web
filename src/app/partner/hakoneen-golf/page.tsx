import { Metadata } from "next";
import { PartnerGuidePage, type PartnerGuide } from "@/components/partner/guide";

// 箱根園ゴルフ場 様でプレーされるお客様専用のご案内ページ（ゴルフ場の型・担当＝賀川様）。
// 検索には出さない（noindex）。サイト内からのリンクは先方の了解後。🔴「提携」と書かない。ゴルフ場の犬同伴の話は書かない。
// 所要時間・距離＝Googleマップ実測（2026-11-10・ゴルフ場→当店 17分・10.3km・県道75号）。
// 1日のお預かり＝お預け 7:00〜9:00・8時間、半日＝9:00〜13:00・4時間（types/booking.ts の PLANS）。

const GUIDE: PartnerGuide = {
  slug: "hakoneen-golf",
  hotel: "箱根園ゴルフ場",
  drive: "約17分",
  distance: "約10.3km",
  routeOrigin: "箱根園ゴルフ場 神奈川県足柄下郡箱根町元箱根138",
  routeSteps: [
    "当店から県道75号で湖尻を通り、芦ノ湖の東側を箱根園方面へ",
    "箱根園入口の交差点の先で、ゴルフ場に到着",
    "お迎えのときは同じ道を戻り、仙石原の「すすき通り」から当店へ",
  ],
  kind: "golf",
  flow: [
    { day: "", time: "7:00〜9:00", place: "DogHub", text: "1日のお預かり（8時間）でワンちゃんをお預け" },
    { day: "", time: "お預けの後", place: "ゴルフ場", text: "お車で約17分。スタート・ラウンド" },
    { day: "", time: "ラウンド後", place: "DogHub", text: "お迎え（例：7:30にお預けなら15:30まで）。ここから愛犬と仙石原の散策へ" },
  ],
  notes: [
    {
      title: "お迎えの時刻について",
      body: "1日のお預かりは、お預けから8時間です。8時間を過ぎる場合は{fee}／1時間・ワンちゃん1頭あたりで延長できます。",
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

export default function HakoneenGolfPartnerPage() {
  return <PartnerGuidePage guide={GUIDE} />;
}
