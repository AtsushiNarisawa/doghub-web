import { Metadata } from "next";
import { PartnerStayGuide, type PartnerGuide } from "@/components/partner/stay-guide";

// エクシブ箱根離宮様のお客様専用のご案内ページ（先方公式サイト「周辺ペットホテルのご案内」からのリンク先）。
// 検索には出さない（noindex）。先方に確認いただく前提で公開（10-14 CEO判断）。サイト内からのリンクは先方の了解後。
// ホテル側の時刻（IN 15:00／OUT 11:00）＝先方公式サイトのアクセスページ（2026-10-14 確認）。
// 所要時間「約13分」＝先方の掲載ページの記載に合わせた。
// 🔴「提携」と書かない（エクシブ様は掲載いただいている関係）

const GUIDE: PartnerGuide = {
  slug: "exiv-hakone",
  hotel: "エクシブ箱根離宮",
  drive: "約13分",
  routeOrigin: "エクシブ箱根離宮 神奈川県足柄下郡箱根町宮ノ下112-2",
  routeSteps: [
    "ホテルを出て、宮ノ下から国道138号に入り仙石原方面へ",
    "宮城野を過ぎて、そのまま国道138号で仙石原へ",
    "仙石原に入ったら、当店の案内看板を目印に到着",
  ],
  flow: [
    { day: "1日目", time: "14:00〜17:00", place: "DogHub", text: "ワンちゃんをお預け（受付・持ち物の確認で10分ほど）" },
    { day: "", time: "15:00〜", place: "ホテル", text: "お車で約13分。そのままチェックイン" },
    { day: "2日目", time: "〜11:00", place: "ホテル", text: "ご朝食のあと、チェックアウト" },
    { day: "", time: "〜12:00", place: "DogHub", text: "お迎え。ここから愛犬と仙石原の散策へ" },
  ],
  pickupNote:
    "ホテルのチェックアウト（11:00）ちょうどにご出発の場合は、ご予約フォームの「お迎えの延長」で 12:00 をお選びください。10:40ごろにご出発なら、延長なしで間に合います",
};

export const metadata: Metadata = {
  title: `${GUIDE.hotel} にご宿泊のお客様へ｜愛犬のお預かり｜DogHub箱根仙石原`,
  description: `${GUIDE.hotel} からお車で${GUIDE.drive}。ご滞在中の愛犬のお預かり（ご宿泊・日帰り）のご案内です。`,
  robots: { index: false, follow: false },
};

export default function ExivHakonePartnerPage() {
  return <PartnerStayGuide guide={GUIDE} />;
}
