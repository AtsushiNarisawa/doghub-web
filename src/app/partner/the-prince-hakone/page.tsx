import { Metadata } from "next";
import { PartnerGuidePage, EARLY_DROP_NOTE, type PartnerGuide } from "@/components/partner/guide";

// ザ・プリンス 箱根芦ノ湖 様のお客様専用のご案内ページ（11-06 面談・賀川様ご担当）。
// 検索には出さない（noindex）。サイト内からのリンクは先方の了解後。🔴「提携」と書かない。
// ホテル側の時刻＝チェックイン 15:00（公式 FAQ）。チェックアウト時刻は公式で未確認＝時刻を書かない。
// 所要時間・距離＝Googleマップ実測（2026-11-10・ホテル→当店 21分・11.7km・県道75号）。

const GUIDE: PartnerGuide = {
  slug: "the-prince-hakone",
  hotel: "ザ・プリンス 箱根芦ノ湖",
  drive: "約21分",
  distance: "約11.7km",
  routeOrigin: "ザ・プリンス 箱根芦ノ湖 神奈川県足柄下郡箱根町元箱根144",
  routeSteps: [
    "ホテルを出て、箱根園入口の交差点から県道75号へ",
    "県道75号で芦ノ湖の東側を、湖尻・仙石原方面へ（湿原通りを通る道もあります）",
    "仙石原の「すすき通り」に入ったら、当店の案内看板を目印に到着",
  ],
  kind: "stay",
  flow: [
    { day: "1日目", time: "14:00〜17:00", place: "DogHub", text: "ワンちゃんをお預け（受付・持ち物の確認で10分ほど）" },
    { day: "", time: "15:00〜", place: "ホテル", text: "お車で約21分。そのままチェックイン" },
    { day: "2日目", time: "ご朝食のあと", place: "ホテル", text: "チェックアウト" },
    { day: "", time: "9:00〜11:00", place: "DogHub", text: "お迎え。ここから愛犬と仙石原の散策へ" },
  ],
  notes: [
    {
      title: "お迎えの時刻について",
      body: "当店の通常のお迎えは 9:00〜11:00 です。ホテルでゆっくり過ごされてから出発される場合は、ご予約フォームの「お迎えの延長」で時刻をお選びください。延長は{fee}／1時間・ワンちゃん1頭あたりです。",
    },
    EARLY_DROP_NOTE,
  ],
};

export const metadata: Metadata = {
  title: `${GUIDE.hotel} にご宿泊のお客様へ｜愛犬のお預かり｜DogHub箱根仙石原`,
  description: `${GUIDE.hotel} からお車で${GUIDE.drive}。ご滞在中の愛犬のお預かり（ご宿泊・日帰り）のご案内です。`,
  robots: { index: false, follow: false },
};

export default function ThePrinceHakonePartnerPage() {
  return <PartnerGuidePage guide={GUIDE} />;
}
