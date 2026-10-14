import { Metadata } from "next";
import { PartnerGuidePage, EARLY_DROP_NOTE, type PartnerGuide } from "@/components/partner/guide";

// 箱根仙石原プリンスホテル様のお客様専用のご案内ページ。検索には出さない（noindex）・サイト内からのリンクは先方の了解後。
// IN 15:00＝先方公式「よくある質問」、ペット同伴不可＝同（補助犬のみ可）、OUT 11:00＝予約サイト各社の掲載値（2026-10-14 確認）。
// 所要時間＝Googleマップで4分（2026-10-14）→ 既存の丸め（車で約5分）に合わせた。
// 🔴 過去のセットプランには戻さない＝ご予約・ワンちゃんの確認は当店が直接（memory feedback_partner_referral_keep_intake_inhouse）

const GUIDE: PartnerGuide = {
  slug: "sengokuhara-prince",
  hotel: "箱根仙石原プリンスホテル",
  drive: "約5分",
  routeOrigin: "箱根仙石原プリンスホテル",
  routeSteps: [
    "ホテルを出て、仙石原の中心部方面へ",
    "お車で5分ほど。当店の案内看板を目印に到着",
  ],
  kind: "stay",
  flow: [
    { day: "1日目", time: "14:00〜17:00", place: "DogHub", text: "ワンちゃんをお預け（受付・持ち物の確認で10分ほど）" },
    { day: "", time: "15:00〜", place: "ホテル", text: "お車で約5分。そのままチェックイン" },
    { day: "2日目", time: "10:50ごろ", place: "ホテル", text: "ご朝食のあと、チェックアウトしてご出発" },
    { day: "", time: "〜11:00", place: "DogHub", text: "お迎え。ここから愛犬と仙石原の散策へ" },
  ],
  notes: [
    {
      title: "お迎えの時刻について",
      body: "当店の通常のお迎えは 9:00〜11:00 です。ホテルから当店まではお車で5分ほどですので、10:50ごろにご出発なら延長なしで間に合います。チェックアウト（11:00）ちょうどにご出発の場合は、ご予約フォームの「お迎えの延長」で 12:00 をお選びください。延長は{fee}／1時間・ワンちゃん1頭あたりです。",
    },
    EARLY_DROP_NOTE,
  ],
};

export const metadata: Metadata = {
  title: `${GUIDE.hotel} にご宿泊のお客様へ｜愛犬のお預かり｜DogHub箱根仙石原`,
  description: `${GUIDE.hotel} からお車で${GUIDE.drive}。ご滞在中の愛犬のお預かり（ご宿泊・日帰り）のご案内です。`,
  robots: { index: false, follow: false },
};

export default function SengokuharaPrincePartnerPage() {
  return <PartnerGuidePage guide={GUIDE} />;
}
