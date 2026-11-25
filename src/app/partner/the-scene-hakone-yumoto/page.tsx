import { Metadata } from "next";
import { PartnerGuidePage, type PartnerGuide } from "@/components/partner/guide";

// THE SCENE hakone yumoto 様のお客様専用のご案内ページ（2026-11-25 販売促進マネージャー 大槻様のメールで掲載のご了承）。
// 検索には出さない（noindex）・サイト内からリンクしない＝先方がお客様にご案内する用。
// 愛犬と泊まれる宿（全館 愛犬同伴）＝使い方は「犬が入れない場所へ出かける間」の半日・1日。宿泊のお預かりは前面に出さない（10-28 CEO＝宿の売上と競わない形）。
// 行きに寄る／帰りに寄るの2通り（10-29 CEO＝御殿場ICから来て、行きか帰りのどちらかで仙石原へ）。
// ホテルの客室の使用時間 15:00〜翌11:00＝公式サイト 宿泊約款 第9条（2026-11-25 確認）。
// 所要時間・距離＝Googleマップ実測（2026-11-25 19時ごろ・ホテル→当店）＝県道732号経由 31分・16.0km（おすすめ）／湯場滝通り経由 25分・13.1km。
// 🔴「提携」と書かない。

const GUIDE: PartnerGuide = {
  slug: "the-scene-hakone-yumoto",
  hotel: "THE SCENE hakone yumoto",
  drive: "約30分",
  distance: "約16km",
  routeOrigin: "THE SCENE hakone yumoto 神奈川県足柄下郡箱根町湯本茶屋184-5",
  routeSteps: [
    "旧東海道（県道732号）を通る道（約31分・16km）：ホテルから旧東海道で箱根湯本の三枚橋へ下り、国道1号で宮ノ下へ。宮ノ下から国道138号に入り、仙石原へ",
    "湯場滝通りを通る道（約25分・13km）：湯場滝通りで箱根湯本の国道1号へ下り、宮ノ下から国道138号で仙石原へ",
    "どちらの道も、仙石原に入ったら当店の案内看板を目印に到着",
    "御殿場ICから当店までも、お車で約30分です",
  ],
  kind: "daytrip",
  flow: [
    { day: "行きに寄る日（1日目）", time: "10:00", place: "DogHub", text: "半日のお預かり（4時間）でワンちゃんをお預け（受付・持ち物の確認で10分ほど）" },
    { day: "", time: "お預けの後", place: "観光", text: "ポーラ美術館など、犬が入れない場所へ（当店から車で数分）" },
    { day: "", time: "14:00", place: "DogHub", text: "お迎え" },
    { day: "", time: "15:00〜", place: "ホテル", text: "お車で約30分。そのままチェックイン" },
    { day: "帰りに寄る日（2日目）", time: "〜11:00", place: "ホテル", text: "チェックアウトのあと、お車で約30分" },
    { day: "", time: "11:30", place: "DogHub", text: "半日のお預かり（4時間）でワンちゃんをお預け" },
    { day: "", time: "15:30", place: "DogHub", text: "お迎え。御殿場ICまでお車で約30分" },
  ],
  notes: [
    {
      title: "行きか帰りの、どちらか一度で",
      body: "当店に寄るのは、行きか帰りのどちらか一度で十分です。水曜・木曜は当店の定休日ですので、どちらかが水曜・木曜にあたる場合は、もう片方の日にお寄りください。",
    },
    {
      title: "4時間を過ぎそうなとき",
      body: "半日のお預かりは、お預けから4時間です。過ぎる場合は{fee}／1時間・ワンちゃん1頭あたりで延長でき、お迎えは17:00までにお願いしております。朝早く箱根に着かれる日は、7:00〜9:00にお預けいただく1日のお預かり（8時間）もございます。",
    },
  ],
};

export const metadata: Metadata = {
  title: `${GUIDE.hotel} にご宿泊のお客様へ｜愛犬のお預かり｜DogHub箱根仙石原`,
  description: `${GUIDE.hotel} からお車で${GUIDE.drive}。犬が入れない場所へお出かけになる間の、愛犬のお預かり（半日・1日）のご案内です。`,
  robots: { index: false, follow: false },
};

export default function TheSceneHakoneYumotoPartnerPage() {
  return <PartnerGuidePage guide={GUIDE} />;
}
