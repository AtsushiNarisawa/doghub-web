import { Metadata } from "next";
import { PartnerGuidePage, EARLY_DROP_NOTE, type PartnerGuide } from "@/components/partner/guide";

// 箱根湯の花プリンスホテル様のお客様専用のご案内ページ。検索には出さない（noindex）・サイト内からのリンクは先方の了解後。
// IN 15:00／OUT 11:00・ペット不可＝予約サイト各社の掲載値（公式サイトでは確認できず＝先方確認の際に伺う・2026-10-14）。
// 所要時間・距離・経路＝Googleマップ（25分・13.0km・国道1号と県道733号経由・2026-10-14）。

const GUIDE: PartnerGuide = {
  slug: "yunohana-prince",
  hotel: "箱根湯の花プリンスホテル",
  drive: "約25分",
  distance: "約13km",
  routeOrigin: "箱根湯の花プリンスホテル",
  routeSteps: [
    "ホテルを出て、国道1号へ",
    "県道733号を経由して、仙石原方面へ",
    "仙石原に入ったら、当店の案内看板を目印に到着",
  ],
  kind: "stay",
  flow: [
    { day: "1日目", time: "14:00〜17:00", place: "DogHub", text: "ワンちゃんをお預け（受付・持ち物の確認で10分ほど）" },
    { day: "", time: "15:00〜", place: "ホテル", text: "お車で約25分。そのままチェックイン" },
    { day: "2日目", time: "〜11:00", place: "ホテル", text: "ご朝食のあと、チェックアウト" },
    { day: "", time: "〜12:00", place: "DogHub", text: "お迎え。ここから愛犬と仙石原の散策へ" },
  ],
  notes: [
    {
      title: "お迎えの時刻について",
      body: "当店の通常のお迎えは 9:00〜11:00 です。ホテルから当店まではお車で25分ほどかかりますので、チェックアウト（11:00）のあとにお迎えの場合は、ご予約フォームの「お迎えの延長」で 12:00 をお選びください。10:30ごろにご出発なら、延長なしで間に合います。延長は{fee}／1時間・ワンちゃん1頭あたりです。",
    },
    {
      title: "チェックインの前に",
      body: "ホテルのチェックイン（15:00）に間に合わせるには、当店へは14:20ごろまでにお越しいただくと安心です。",
    },
    EARLY_DROP_NOTE,
  ],
};

export const metadata: Metadata = {
  title: `${GUIDE.hotel} にご宿泊のお客様へ｜愛犬のお預かり｜DogHub箱根仙石原`,
  description: `${GUIDE.hotel} からお車で${GUIDE.drive}。ご滞在中の愛犬のお預かり（ご宿泊・日帰り）のご案内です。`,
  robots: { index: false, follow: false },
};

export default function YunohanaPrincePartnerPage() {
  return <PartnerGuidePage guide={GUIDE} />;
}
