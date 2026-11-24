import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  openGraph: {
    title: "箱根 犬連れ観光ガイド｜犬と箱根を楽しむおすすめスポット｜DogHub",
    description: "犬と箱根を満喫！犬連れOKのスポットとペット不可施設での預け方をまとめて紹介。ポーラ美術館・ガラスの森・すすき草原など仙石原エリア中心に厳選。観光中のお預かりはDogHubへ。",
    url: "https://dog-hub.shop/spots",
    type: "website",
  },
  title: "箱根 犬連れ観光ガイド｜犬と箱根を楽しむおすすめスポット｜DogHub",
  description: "犬と箱根を満喫！犬連れOKのスポットとペット不可施設での預け方をまとめて紹介。ポーラ美術館・ガラスの森・すすき草原など仙石原エリア中心に厳選。観光中のお預かりはDogHubへ。",
  alternates: { canonical: "/spots" },
};

type Status = "ok" | "cond" | "ng";
type Area = "仙石原" | "強羅" | "芦ノ湖" | "大涌谷・小涌谷";

type Spot = {
  name: string;
  area: Area;
  status: Status; // ◯ / △ / ✕
  condition: string; // 条件・注意（30字以内）
  note: string; // 一言（困ること＋お預かりでの解決）
  distance: string;
  article?: string;
  hp?: string;
  gmaps: string;
  img?: string;
  credit?: string;
};

const STATUS: Record<Status, { mark: string; label: string; aria: string }> = {
  ok: { mark: "◯", label: "OK", aria: "犬と入れる" },
  cond: { mark: "△", label: "条件つき", aria: "条件つきで犬と入れる" },
  ng: { mark: "✕", label: "不可", aria: "犬は入れない" },
};

const AREAS: Area[] = ["仙石原", "強羅", "芦ノ湖", "大涌谷・小涌谷"];

// 犬の可否は各施設記事と公式の案内に合わせる（1か所直したら記事・/museum なども同時に直す）。
// 所要時間は当店からの車の実測値。原稿＝marketing/reports/site_restructure_prep_2026-10/spots_table_draft.md
const spots: Spot[] = [
  // ── 仙石原 ──
  {
    name: "箱根ラリック美術館",
    area: "仙石原",
    status: "ng",
    condition: "館内は不可。庭園・カフェは美術館に要確認",
    note: "館内はペットのご利用をご遠慮いただいています。庭園やカフェの扱いは公式に記載がないため、気になる方は来館前に美術館へご確認ください。館内をご覧になる間は、車で2分の当店でお預かりできます。",
    distance: "車で2分",
    hp: "https://www.lalique-museum.com/",
    gmaps: "https://maps.google.com/?q=箱根ラリック美術館",
    img: "/images/img-075.jpg",
  },
  {
    name: "仙石原すすき草原",
    area: "仙石原",
    status: "ok",
    condition: "リードをつけて遊歩道を散策",
    note: "遊歩道は舗装されていて、小型犬でも歩きやすい道です。見頃の秋の週末は人出が多く、すれ違いが続くのでリードは短めに。近くの美術館へ回る間は、当店でお預かりできます。",
    distance: "車で2分",
    article: "/news/spring-walk-guide",
    hp: "https://www.hakone.or.jp/",
    gmaps: "https://maps.google.com/?q=仙石原すすき草原",
    img: "/images/img-051.png",
  },
  {
    name: "箱根ガラスの森美術館",
    area: "仙石原",
    status: "ng",
    condition: "館内・屋外の庭園・レストランすべて不可",
    note: "館内だけでなく、屋外の庭園やレストランにも犬は入れません。庭園の散策も含めて一緒には回れないため、ご覧になる間は車で3分の当店へ。混む時期は、当店に車を置いて歩いて向かう方もいます。",
    distance: "車で3分",
    article: "/news/hakone-glass-forest-museum-dog-guide",
    hp: "https://www.hakone-garasunomori.jp/",
    gmaps: "https://maps.google.com/?q=箱根ガラスの森美術館",
    img: "/images/img-054.png",
  },
  {
    name: "箱根湿生花園",
    area: "仙石原",
    status: "cond",
    condition: "園内は抱っこかカート。リードで歩くのは不可",
    note: "園内は木道と砂利道が多く、抱っこのまま回ると腕が疲れます。カートの貸し出しはないので、持参が必要です。開園は3月14日〜11月30日。カートがない日は、園内を回る間だけ当店でお預かりできます。",
    distance: "車で3分",
    article: "/news/spring-walk-guide",
    hp: "https://hakone-shisseikaen.com/",
    gmaps: "https://maps.google.com/?q=箱根湿生花園",
    img: "/images/img-065.png",
  },
  {
    name: "ポーラ美術館",
    area: "仙石原",
    status: "cond",
    condition: "館内は不可。森の遊歩道はリードで歩ける",
    note: "展示室・レストラン・ショップには入れませんが、森の遊歩道（約1km）はリードで歩けます。展示を見る間は当店でお預かりし、お迎えのあとに遊歩道を一緒に歩く、という順番もできます。",
    distance: "車で4分",
    article: "/news/hakone-pola-museum-dog-guide",
    hp: "https://www.polamuseum.or.jp/",
    gmaps: "https://maps.google.com/?q=ポーラ美術館",
    img: "/images/img-005.png",
  },
  {
    name: "金時山",
    area: "仙石原",
    status: "cond",
    condition: "ふもとの林道向き。山頂までは険しい道",
    note: "山頂までの登山道は、犬連れには負担が大きめです。ふもとの林道を少し歩くだけでも十分に気分が変わります。未舗装の区間があり、足が汚れやすい点はご注意を。山頂まで登る日は、当店でお預かりできます。",
    distance: "車で約7分（公時神社の登山口）",
    article: "/news/spring-walk-guide",
    gmaps: "https://maps.google.com/?q=金時山 公時神社登山口",
  },
  // ── 強羅 ──
  {
    name: "ニコライ バーグマン 箱根 ガーデンズ",
    area: "強羅",
    status: "ok",
    condition: "園内はリードで散策可。カフェ内のみ不可（テラスは可）",
    note: "花と緑の庭園を、リードをつけた愛犬と一緒にゆっくり歩けます。カフェの中だけは入れないので、お茶はテラスで。強羅の美術館とあわせて回る日は、美術館の間だけ当店でお預かりもできます。",
    distance: "車で8分",
    hp: "https://hakonegardens.jp/",
    gmaps: "https://maps.google.com/?q=ニコライ バーグマン 箱根 ガーデンズ",
    img: "/images/nicolai-bergmann-hakone-gardens.jpg",
    credit: "写真提供：ニコライ バーグマン 箱根 ガーデンズ",
  },
  {
    name: "箱根強羅公園",
    area: "強羅",
    status: "cond",
    condition: "庭園はリードで可。屋内施設・茶苑は不可",
    note: "庭園はリードで歩けますが、温室・クラフトハウス・おみやげショップ・白雲洞茶苑には入れません。飲食はテラス席のみ。坂と階段が多く、カートは押しにくい園です。体験工房に入る間だけ当店へ、という使い方もあります。",
    distance: "車で12分",
    article: "/news/hakone-gora-park-dog-guide",
    hp: "https://www.hakonenavi.jp/gorapark/",
    gmaps: "https://maps.google.com/?q=箱根強羅公園",
    img: "/images/img-025.png",
  },
  {
    name: "彫刻の森美術館",
    area: "強羅",
    status: "ng",
    condition: "屋外も含め全エリア不可。キャリーでも不可",
    note: "屋外展示が中心の美術館ですが、屋外も含めて全エリアでペットは入れません。キャリーやカートに入れていても不可です（補助犬を除く）。広い敷地をゆっくり回る間は、当店でお預かりできます。",
    distance: "車で13分",
    article: "/news/hakone-chokoku-no-mori-dog-guide",
    hp: "https://www.hakone-oam.or.jp/",
    gmaps: "https://maps.google.com/?q=彫刻の森美術館",
    img: "/images/img-060.png",
  },
  // ── 芦ノ湖 ──
  {
    name: "箱根海賊船",
    area: "芦ノ湖",
    status: "cond",
    condition: "港・船内・デッキとも全身が入るケージに",
    note: "港の中も船内もデッキも、全身が入るケージかキャリーに入れたままです。ケージを抱えての乗り降りや、桟橋での待ち時間が大変な日は、乗船する間だけ当店でお預かりできます。",
    distance: "車で約10分（桃源台港）",
    article: "/news/hakone-ropeway-pirate-ship-dog-guide",
    hp: "https://www.hakonenavi.jp/hakone-kankosen/",
    gmaps: "https://maps.google.com/?q=箱根海賊船 桃源台港",
  },
  {
    name: "芦ノ湖遊覧船",
    area: "芦ノ湖",
    status: "cond",
    condition: "30kg以下。3・4階デッキはリードで歩ける",
    note: "30kg以下の犬が乗船でき、乗り降りはキャリーかバギー、3・4階のデッキではリードで歩けます。船によっては客室に入れないため、乗る船を確かめてからどうぞ。大型の子は当店でお預かりできます。",
    distance: "車で約20分（箱根園港）",
    article: "/news/hakone-ashinoko-dog-guide",
    hp: "https://www.hakone-yuransen.jp/",
    gmaps: "https://maps.google.com/?q=芦ノ湖遊覧船 箱根園港",
  },
  {
    name: "箱根園水族館",
    area: "芦ノ湖",
    status: "cond",
    condition: "ふたの閉まるケージ・カート・バッグで入館。顔出し不可",
    note: "ふたやチャックの閉まるケージ・カート・バッグに入れれば入館できます。館内では顔を出すのも歩かせるのも不可です。7kgまでなら手持ちのクレートを借りられますが、数に限りがあります。アザラシ広場とふれあい動物園には犬は入れません。動物のエリアを見る間だけ、当店でお預かりする方法もあります。",
    distance: "車で約20分",
    article: "/news/hakone-en-dog-guide",
    hp: "https://www.princehotels.co.jp/amuse/hakone-en/suizokukan/",
    gmaps: "https://maps.google.com/?q=箱根園水族館",
  },
  {
    name: "箱根 駒ヶ岳ロープウェー",
    area: "芦ノ湖",
    status: "cond",
    condition: "車内はキャリー。山頂はリードで歩ける",
    note: "車内はキャリーに入れて床に置き、抱っこ紐では乗れません。山頂ではリードをつけてキャリーから出せます。無料の小型犬用キャリーは数が限られるので、持参が確実です。ワクチン接種が乗車の条件です。",
    distance: "車で約20分",
    article: "/news/hakone-en-dog-guide",
    hp: "https://www.princehotels.co.jp/amuse/hakone-en/ropeway/",
    gmaps: "https://maps.google.com/?q=箱根 駒ヶ岳ロープウェー",
  },
  {
    name: "箱根神社",
    area: "芦ノ湖",
    status: "cond",
    condition: "参道・境内はリード。本殿は抱っこかキャリー",
    note: "参道と境内はリードで歩けますが、本殿のまわりは抱っこかキャリーです。正参道は90段の階段があり、抱っこで上がるのは大変です。参拝のあとに美術館や温泉へ回る日は、当店でお預かりできます。",
    distance: "車で約20分",
    article: "/news/hakone-jinja-dog-guide",
    hp: "https://hakonejinja.or.jp/",
    gmaps: "https://maps.google.com/?q=箱根神社",
  },
  {
    name: "恩賜箱根公園",
    area: "芦ノ湖",
    status: "ok",
    condition: "リードをつけて園内を散策",
    note: "リードで園内を歩け、木陰が多いので夏も歩きやすい公園です。展望館など建物の中の扱いは確かめられていないため、入る前に管理事務所へご確認ください。",
    distance: "車で約20分",
    article: "/news/hakone-ashinoko-dog-guide",
    hp: "https://www.pref.kanagawa.jp/docs/tu5/cnt/f6599/p19701.html",
    gmaps: "https://maps.google.com/?q=恩賜箱根公園",
  },
  {
    name: "成川美術館",
    area: "芦ノ湖",
    status: "cond",
    condition: "小型犬のみ。抱っこ・カートで足を床につけない",
    note: "小型犬のみ、抱っこ・カート・ケージで足を床につけず、吠えないことが条件です。ティーラウンジは利用できません。条件に合わない子は、芦ノ湖へ向かう前に当店でお預かりできます。",
    distance: "車で約20分",
    article: "/news/hakone-museum-dog-guide",
    hp: "http://www.narukawamuseum.co.jp/",
    gmaps: "https://maps.google.com/?q=成川美術館",
  },
  // ── 大涌谷・小涌谷 ──
  {
    name: "箱根ロープウェイ",
    area: "大涌谷・小涌谷",
    status: "cond",
    condition: "頭まで隠れるケージ・ふた付きキャリーが必要",
    note: "頭まで隠れるケージか、ふたの閉まるキャリーが必要で、抱っこやスリングでは乗れません。各駅にケージの有料貸し出しがありますが数に限りがあります。ケージなしで身軽に乗りたい日は、当店へ。",
    distance: "車で約10分（桃源台駅）",
    article: "/news/hakone-ropeway-pirate-ship-dog-guide",
    hp: "https://www.hakonenavi.jp/hakone-ropeway/",
    gmaps: "https://maps.google.com/?q=箱根ロープウェイ 桃源台駅",
  },
  {
    name: "大涌谷",
    area: "大涌谷・小涌谷",
    status: "ok",
    condition: "屋外はリードで可。火山ガスに注意",
    note: "屋外はリードで散策できますが、火山ガスが出ている場所です。体の小さい子や呼吸が弱い子には負担になることがあり、ガスの濃い日は立入規制もあります。心配な日は、当店でお預かりしてから向かえます。",
    distance: "車で約20分",
    article: "/news/hakone-owakudani-dog-guide",
    hp: "https://www.hakonenavi.jp/owakudani/",
    gmaps: "https://maps.google.com/?q=大涌谷",
  },
  {
    name: "岡田美術館",
    area: "大涌谷・小涌谷",
    status: "ng",
    condition: "館内は不可",
    note: "犬は入館できません。展示をじっくり見ると時間がかかる美術館なので、半日のお預かりが合います。小涌谷は当店から車で15分ほどです。",
    distance: "車で15分",
    article: "/news/hakone-museum-dog-guide",
    hp: "https://www.okada-museum.com/",
    gmaps: "https://maps.google.com/?q=岡田美術館",
  },
  {
    name: "箱根小涌園ユネッサン",
    area: "大涌谷・小涌谷",
    status: "ng",
    condition: "敷地内すべて不可",
    note: "敷地内に犬を連れて入ることはできません。水着のエリアと森の湯の両方を回ると一日がかりになるので、1日（8時間）のお預かりが合います。",
    distance: "車で約15分",
    article: "/news/hakone-yunessun-pet-guide",
    hp: "https://www.yunessun.com/",
    gmaps: "https://maps.google.com/?q=箱根小涌園ユネッサン",
  },
];

const LINK = "text-sm text-[#3C200F] border-b border-[#3C200F] hover:text-[#B87942] hover:border-[#B87942] py-1";

export default function SpotsPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"おすすめスポット",href:"/spots"}]} />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-006.jpg" alt="おすすめスポット" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(140px, 18vw, 249px)" }} />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 400 }}>おすすめスポット</h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>おすすめスポット</span>
          </p>
        </div>

        {/* Intro */}
        <section className="py-10 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-3" style={{ fontSize: "28px", fontWeight: 400 }}>DogHubおすすめ周辺観光施設</h2>
            <p className="text-[#3C200F]" style={{ fontSize: "16px", lineHeight: "1.9" }}>
              箱根の観光スポットを、犬と一緒に入れるかどうかで一覧にしました。条件はスポットごとに違います。詳しい楽しみ方は各記事をご覧ください。
            </p>
            {/* 凡例 */}
            <ul className="flex flex-col gap-1 mt-4 text-[#3C200F]" style={{ fontSize: "14px", lineHeight: "1.8" }}>
              <li><span className="font-medium">◯ OK</span>＝リードをつけて一緒に歩けます</li>
              <li><span className="font-medium">△ 条件つき</span>＝抱っこ・キャリー・カートが必要、または一部の場所だけ入れます</li>
              <li><span className="font-medium">✕ 不可</span>＝施設の中に犬は入れません（補助犬を除く）</li>
            </ul>
            <p className="text-[#8F7B65] mt-3" style={{ fontSize: "12px", lineHeight: "1.8" }}>
              犬の可否は2026年10月時点で当店が確かめた内容です。変わることがあるため、お出かけ前に各施設の公式サイトでもご確認ください。所要時間は当店（箱根仙石原）からの車の目安です。
            </p>
          </div>
        </section>

        {/* Spots table（エリア別の犬OK・NG一覧） */}
        <section className="pb-12 px-6 bg-white">
          <div className="max-w-7xl mx-auto space-y-12">
            {AREAS.map((area) => (
              <div key={area}>
                <h3 className="text-[#311908] border-t border-[#E5DDD8] pt-8 mb-4" style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 400 }}>
                  {area}エリア
                </h3>
                <table className="w-full border-collapse text-[#3C200F]">
                  <thead className="hidden md:table-header-group">
                    <tr className="text-left text-[#8F7B65] border-b border-[#E5DDD8]" style={{ fontSize: "13px" }}>
                      <th scope="col" className="py-2 pr-4 font-normal">スポット</th>
                      <th scope="col" className="py-2 pr-4 font-normal whitespace-nowrap">犬と</th>
                      <th scope="col" className="py-2 pr-4 font-normal">条件・注意</th>
                      <th scope="col" className="py-2 font-normal whitespace-nowrap">当店から</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spots.filter((spot) => spot.area === area).map((spot) => {
                      const st = STATUS[spot.status];
                      return (
                        <tr key={spot.name} className="block md:table-row border-b border-[#E5DDD8] py-5 md:py-0 align-top">
                          <th scope="row" className="block md:table-cell md:w-[26%] md:py-5 md:pr-4 text-left font-normal align-top">
                            {spot.img && (
                              <div className="mb-2 max-w-[220px]">
                                <Image src={spot.img} alt="" className="w-full h-auto object-cover" width={440} height={250} />
                                {spot.credit && (
                                  <p className="text-[#97826F] mt-1" style={{ fontSize: "11px" }}>{spot.credit}</p>
                                )}
                              </div>
                            )}
                            <span className="block text-[#311908]" style={{ fontSize: "18px" }}>{spot.name}</span>
                          </th>
                          <td className="block md:table-cell md:py-5 md:pr-4 mt-2 md:mt-0 align-top whitespace-nowrap">
                            <span aria-label={st.aria} className="inline-block border border-[#311908] text-[#311908] px-3 py-0.5" style={{ fontSize: "14px" }}>
                              {st.mark} {st.label}
                            </span>
                          </td>
                          <td className="block md:table-cell md:py-5 md:pr-4 mt-2 md:mt-0 align-top">
                            <p className="font-medium" style={{ fontSize: "16px", lineHeight: "1.7" }}>{spot.condition}</p>
                            <p className="mt-1" style={{ fontSize: "14px", lineHeight: "1.9" }}>{spot.note}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                              {spot.article && (
                                <Link href={spot.article} className={LINK}>詳しい記事</Link>
                              )}
                              <a href={spot.gmaps} data-directions="spots" target="_blank" rel="noopener noreferrer" className={LINK}>
                                Google maps
                              </a>
                              {spot.hp && (
                                <a href={spot.hp} target="_blank" rel="noopener noreferrer" className={LINK}>公式サイト</a>
                              )}
                            </div>
                          </td>
                          <td className="block md:table-cell md:py-5 mt-2 md:mt-0 align-top md:whitespace-nowrap" style={{ fontSize: "15px" }}>
                            {spot.distance}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
            <p className="text-[#3C200F]" style={{ fontSize: "16px", lineHeight: "1.9" }}>
              一緒に入れない施設の間は、当店で1時間からお預かりできます。1時間のご利用はお電話で承ります。
            </p>
          </div>
        </section>

        <section className="px-6 py-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto text-center">
            <Link href="/news/hakone-dog-trip-guide" className="text-[#B87942] hover:underline" style={{ fontSize: "15px" }}>
              箱根 犬連れ旅行ガイド トップへ →
            </Link>
          </div>
        </section>

        {/* 関連記事 */}
        <section className="px-6 py-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="p-6 bg-[#F8F5F0] rounded-xl">
              <p className="text-[#3C200F] font-medium mb-2" style={{ fontSize: "16px" }}>あわせて読みたい</p>
              <div className="space-y-2">
                <Link href="/news/hakone-dog-trip-guide" className="block text-[#B87942] hover:underline" style={{ fontSize: "14px" }}>
                  → 箱根 犬連れ旅行ガイド｜地元スタッフおすすめの1泊2日プラン
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ペット不可スポットの解決策 */}
        <section className="px-6 py-12 bg-[#F8F5F0] border-t border-[#E5DDD8]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[#3C200F] mb-3" style={{ fontSize: "20px", fontWeight: 400 }}>ペット不可のスポットに行きたい時は</h2>
            <p className="text-[#8F7B65] mb-6" style={{ fontSize: "14px" }}>
              箱根のメインスポットの多くは犬NG。でも諦める必要はありません。DogHubに預けて、自由に箱根を楽しめます。
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { href: "/museum", label: "美術館 × 預かり", desc: "ポーラ・彫刻の森へ" },
                { href: "/yunessun", label: "ユネッサン × 預かり", desc: "温泉プールを満喫" },
                { href: "/onsen", label: "温泉 × 預かり", desc: "日帰り温泉を堪能" },
                { href: "/golf", label: "ゴルフ × 預かり", desc: "早朝7時から対応" },
                { href: "/ryokan", label: "旅館 × 預かり", desc: "憧れの宿に泊まる" },
                { href: "/service", label: "料金・プラン一覧", desc: "半日¥3,300" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="block bg-white border border-[#E5DDD8] hover:border-[#B87942] transition-colors p-4">
                  <p className="text-[#3C200F]" style={{ fontSize: "14px", fontWeight: 500 }}>{item.label}</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "12px", marginTop: "2px" }}>{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Reservation />
        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
