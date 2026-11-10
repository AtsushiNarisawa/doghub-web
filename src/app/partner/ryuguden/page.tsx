import { Metadata } from "next";
import { PartnerGuidePage, EARLY_DROP_NOTE, type PartnerGuide } from "@/components/partner/guide";

// 龍宮殿 様（宿泊・本館の日帰り温泉）のお客様専用のご案内ページ（担当＝賀川様）。
// 検索には出さない（noindex）。サイト内からのリンクは先方の了解後。🔴「提携」と書かない。犬の可否は公式に記載なし＝書かない。
// ホテル側の時刻＝チェックイン 15:00／チェックアウト 11:00（公式の基本の宿泊プランの案内・11-09 確認）。
// 所要時間・距離＝Googleマップ実測（2026-11-10・龍宮殿本館→当店 20分・11.3km・県道75号）。

const GUIDE: PartnerGuide = {
  slug: "ryuguden",
  hotel: "龍宮殿",
  drive: "約20分",
  distance: "約11.3km",
  routeOrigin: "龍宮殿本館 神奈川県足柄下郡箱根町元箱根139",
  routeSteps: [
    "龍宮殿を出て、箱根園入口の交差点から県道75号へ",
    "県道75号で芦ノ湖の東側を、湖尻・仙石原方面へ（湿原通りを通る道もあります）",
    "仙石原の「すすき通り」に入ったら、当店の案内看板を目印に到着",
  ],
  kind: "stay",
  flow: [
    { day: "1日目", time: "14:00〜17:00", place: "DogHub", text: "ワンちゃんをお預け（受付・持ち物の確認で10分ほど）" },
    { day: "", time: "15:00〜", place: "龍宮殿", text: "お車で約20分。そのままチェックイン" },
    { day: "2日目", time: "〜11:00", place: "龍宮殿", text: "朝のお風呂とご朝食のあと、チェックアウト" },
    { day: "", time: "〜12:00", place: "DogHub", text: "お迎え。ここから愛犬と仙石原の散策へ" },
  ],
  notes: [
    {
      title: "お迎えの時刻について",
      body: "当店の通常のお迎えは 9:00〜11:00 です。チェックアウト（11:00）ちょうどにご出発の場合は、ご予約フォームの「お迎えの延長」で 12:00 をお選びください。延長は{fee}／1時間・ワンちゃん1頭あたりです。",
    },
    {
      title: "本館の日帰り温泉だけの日",
      body: "9:00〜13:00 にお預けいただく半日のお預かり（4時間）が合います。お湯のあとに芦ノ湖のまわりも歩く日は、1日のお預かり（8時間）もございます。",
    },
    EARLY_DROP_NOTE,
  ],
};

export const metadata: Metadata = {
  title: `${GUIDE.hotel} をご利用のお客様へ｜愛犬のお預かり｜DogHub箱根仙石原`,
  description: `${GUIDE.hotel} からお車で${GUIDE.drive}。ご宿泊・日帰り温泉の間の愛犬のお預かりのご案内です。`,
  robots: { index: false, follow: false },
};

export default function RyugudenPartnerPage() {
  return <PartnerGuidePage guide={GUIDE} />;
}
