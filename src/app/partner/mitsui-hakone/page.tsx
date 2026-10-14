import { Metadata } from "next";
import { PartnerStayGuide, type PartnerGuide } from "@/components/partner/stay-guide";

// HOTEL THE MITSUI HAKONE 様のお客様専用のご案内ページ（先方LP・よくあるご質問からのリンク先）。
// 検索には出さない（noindex）。サイト内からのリンクは先方の了解後（memory project_partner_lead_hotel_the_mitsui_hakone）。
// ホテル側の時刻（IN 15:00／OUT 12:00）は開業前の販売サイト掲載値＝開業後に変わったらここを直す。

const GUIDE: PartnerGuide = {
  slug: "mitsui-hakone",
  hotel: "HOTEL THE MITSUI HAKONE",
  drive: "約15分",
  distance: "約7km",
  routeOrigin: "神奈川県足柄下郡箱根町小涌谷 HOTEL THE MITSUI HAKONE",
  routeSteps: [
    "ホテルを出て国道1号を宮ノ下方面へ",
    "宮ノ下の交差点から国道138号に入り、仙石原方面へ",
    "仙石原に入ったら、当店の案内看板を目印に到着",
  ],
  flow: [
    { day: "1日目", time: "14:00〜17:00", place: "DogHub", text: "ワンちゃんをお預け（受付・持ち物の確認で10分ほど）" },
    { day: "", time: "15:00〜", place: "ホテル", text: "お車で約15分。そのままチェックイン" },
    { day: "2日目", time: "〜12:00", place: "ホテル", text: "ゆっくりご朝食・ご出発" },
    { day: "", time: "〜13:00", place: "DogHub", text: "お迎え。ここから愛犬と仙石原の散策へ" },
  ],
  pickupNote:
    "ホテルのチェックアウト（12:00）までゆっくり過ごされる場合は、ご予約フォームの「お迎えの延長」で 12:00〜17:00 の間からお選びいただけます",
};

export const metadata: Metadata = {
  title: `${GUIDE.hotel} にご宿泊のお客様へ｜愛犬のお預かり｜DogHub箱根仙石原`,
  description: `${GUIDE.hotel} からお車で${GUIDE.drive}。ご滞在中の愛犬のお預かり（ご宿泊・日帰り）のご案内です。`,
  robots: { index: false, follow: false },
};

export default function MitsuiHakonePartnerPage() {
  return <PartnerStayGuide guide={GUIDE} />;
}
