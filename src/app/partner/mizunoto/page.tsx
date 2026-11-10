import { Metadata } from "next";
import { PartnerGuidePage, EARLY_DROP_NOTE, type PartnerGuide } from "@/components/partner/guide";

// 箱根小涌谷温泉 水の音 様のお客様専用のご案内ページ（11-10 面談で野口様が快諾）。
// 検索には出さない（noindex）。先方に確認いただいてから、先方の案内にリンクしていただく。サイト内からのリンクは先方の了解後。
// ホテル側の時刻（IN 15:00／OUT 11:00）＝先方公式サイトの館内案内（2026-11-07 確認）。
// 所要時間・距離＝Googleマップ実測（2026-11-10・水の音→当店）＝国道138号経由 17分・7.8km／県道733号経由 18分・7.6km（ポーラ美術館前・強羅の温泉街を通る・CEO 指示で両方載せる）。
// 🔴「提携」と書かない。

const GUIDE: PartnerGuide = {
  slug: "mizunoto",
  hotel: "箱根小涌谷温泉 水の音",
  drive: "約18分",
  distance: "約7.6km",
  routeOrigin: "水の音 神奈川県足柄下郡箱根町小涌谷492-23",
  routeSteps: [
    "国道138号を通る道（約17分・7.8km）：ホテルを出て県道723号を木賀方面へ。木賀で国道138号に入り（御殿場・仙石原の表示）、仙石原へ",
    "県道733号を通る道（約18分・7.6km）：県道723号で強羅へ。強羅の温泉街を抜けて県道733号に入り、ポーラ美術館の前を通って仙石原へ",
    "どちらの道も、仙石原に入ったら当店の案内看板を目印に到着",
  ],
  kind: "stay",
  flow: [
    { day: "1日目", time: "14:00〜17:00", place: "DogHub", text: "ワンちゃんをお預け（受付・持ち物の確認で10分ほど）" },
    { day: "", time: "15:00〜", place: "ホテル", text: "お車で約18分。そのままチェックイン" },
    { day: "2日目", time: "〜11:00", place: "ホテル", text: "ご朝食のあと、チェックアウト" },
    { day: "", time: "〜12:00", place: "DogHub", text: "お迎え。ここから愛犬と仙石原の散策へ" },
  ],
  notes: [
    {
      title: "お迎えの時刻について",
      body: "当店の通常のお迎えは 9:00〜11:00 です。ホテルのチェックアウト（11:00）ちょうどにご出発の場合は、ご予約フォームの「お迎えの延長」で 12:00 をお選びください。10:40ごろにご出発なら、延長なしで間に合います。延長は{fee}／1時間・ワンちゃん1頭あたりです。",
    },
    EARLY_DROP_NOTE,
  ],
};

export const metadata: Metadata = {
  title: `${GUIDE.hotel} にご宿泊のお客様へ｜愛犬のお預かり｜DogHub箱根仙石原`,
  description: `${GUIDE.hotel} からお車で${GUIDE.drive}。ご滞在中の愛犬のお預かり（ご宿泊・日帰り）のご案内です。`,
  robots: { index: false, follow: false },
};

export default function MizunotoPartnerPage() {
  return <PartnerGuidePage guide={GUIDE} />;
}
