import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { QuickNav } from "@/components/quick-nav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";

export const metadata: Metadata = {
  title: "箱根 犬連れランチ＆ドッグカフェ OMUSUBI & SOUP CAFE｜DogHub箱根仙石原",
  description: "箱根で犬連れランチならDogHubのドッグカフェへ。5つ星お米マイスター厳選のおむすびとスープを愛犬と一緒に。イートイン・テイクアウトOK、ドッグラン併設。営業11時〜17時、予約不要。",
  alternates: { canonical: "/cafe" },
};

const menuItems = {
  omusubi: [
    { name: "しらすヤンギン", price: "300円" },
    { name: "たらこヤンギン", price: "330円" },
    { name: "しゃけ", price: "330円" },
    { name: "鶏そぼろ卵", price: "310円" },
    { name: "塩むすび", price: "280円" },
  ],
  soup: [
    { name: "牛カルビスープ", price: "500円" },
    { name: "+クッパ用白ごはん", price: "100円" },
    { name: "鶏スープ", price: "400円" },
    { name: "本日のお味噌汁", price: "200円" },
  ],
  daily: [
    { name: "ポッサム", price: "500円" },
    { name: "韓国風チャーシュー", price: "500円" },
    { name: "その他", price: "500円" },
    { name: "日替わりナムル", price: "300円" },
    { name: "卵焼きとおしんこ", price: "300円" },
  ],
  drinks: [
    { name: "お茶（アイス）", price: "200円" },
    { name: "ホットコーヒー", price: "400円" },
    { name: "アイスコーヒー", price: "400円" },
    { name: "エスプレッソカフェラテ", price: "500円" },
    { name: "スパークリングウォーター", price: "400円" },
    { name: "ノンアルコールビール", price: "500円" },
    { name: "アルコール各種", price: "600円" },
  ],
};

export default function CafePage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"カフェ・グッズ",href:"/cafe"}]} />
        {/* Hero */}
        <div className="relative">
          <img
            src="/images/img-044.jpg"
            alt="カフェ・グッズ販売"
            className="w-full object-cover"
            style={{ height: "clamp(160px, 30vw, 423px)" }}
          />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(22px, 3.5vw, 36px)", fontWeight: 400 }}>箱根 犬連れランチ＆カフェ</h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-7xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <span>カフェ・グッズ販売</span>
          </p>
        </div>

        {/* CAFE section */}
        <section className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 400 }}>CAFE</h2>
                <h3 className="text-[#3C200F] mb-4" style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: 400, lineHeight: "1.6" }}>
                  箱根散策のお供にぴったりな<br />テイクアウトメニューをご用意
                </h3>
                <p className="text-[#3C200F] mb-4" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  5つ星のお米マイスターが生産した特別栽培米を使い、こだわりのおむすびで提供しております。
                  テイクアウトメインのお店ですが、わんちゃんと一緒に食べられる室内イートインスペースも完備しております。
                </p>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
                  カフェのご利用は予約制ではございません。わんちゃんの頭数制限もございません。
                  店内ではリードの着用をお願いしておりますが、併設のドッグランでは飼い主様同伴であればリード不要でのびのびとお過ごしいただけます。
                </p>
                <div className="bg-[#F7F7F7] p-6 mb-6">
                  <p className="text-[#3C200F] mb-1" style={{ fontSize: "16px", fontWeight: 400 }}>カフェ営業時間：午前11時〜午後5時</p>
                  <p className="text-[#3C200F] mb-1" style={{ fontSize: "16px", fontWeight: 400 }}>定休日：水曜・木曜</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>
                    テイクアウトメインのお店ですが、<br />
                    一部わんちゃんと入れるイートインスペースを準備しております。<br />
                    ※おにぎりのテイクアウト予約も承っております。<br />
                    ※メニュー内容は予告なく変わることがあります。ご了承ください。
                  </p>
                </div>
                <a
                  href="/booking"
                  className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-6 py-3 hover:bg-[#3C200F] hover:text-white transition-colors"
                  style={{ fontSize: "14px", fontWeight: 400 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> ペットホテル予約
                </a>
              </div>
              <div>
                <img
                  src="/images/img-063.webp"
                  alt="DogHub箱根仙石原のおにぎりと手作りスープ"
                  width={630}
                  height={480}
                  className="w-full h-auto"
                  style={{ maxWidth: "630px" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* MENU */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-10" style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 400 }}>MENU</h2>
            <div className="grid sm:grid-cols-2 gap-8">
              {/* おむすび */}
              <div>
                <h3 className="text-[#3C200F] mb-4 pb-2 border-b border-[#E5DDD8]" style={{ fontSize: "24px", fontWeight: 400 }}>おむすび</h3>
                <div className="space-y-3">
                  {menuItems.omusubi.map((item) => (
                    <div key={item.name} className="flex justify-between">
                      <span className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400 }}>{item.name}</span>
                      <span className="text-[#8F7B65]" style={{ fontSize: "16px", fontWeight: 400 }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* スープ */}
              <div>
                <h3 className="text-[#3C200F] mb-4 pb-2 border-b border-[#E5DDD8]" style={{ fontSize: "24px", fontWeight: 400 }}>スープ</h3>
                <div className="space-y-3">
                  {menuItems.soup.map((item) => (
                    <div key={item.name} className="flex justify-between">
                      <span className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400 }}>{item.name}</span>
                      <span className="text-[#8F7B65]" style={{ fontSize: "16px", fontWeight: 400 }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 日替わりおかず */}
              <div>
                <h3 className="text-[#3C200F] mb-4 pb-2 border-b border-[#E5DDD8]" style={{ fontSize: "24px", fontWeight: 400 }}>日替わりおかず</h3>
                <div className="space-y-3">
                  {menuItems.daily.map((item) => (
                    <div key={item.name} className="flex justify-between">
                      <span className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400 }}>{item.name}</span>
                      <span className="text-[#8F7B65]" style={{ fontSize: "16px", fontWeight: 400 }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 飲み物 */}
              <div>
                <h3 className="text-[#3C200F] mb-4 pb-2 border-b border-[#E5DDD8]" style={{ fontSize: "24px", fontWeight: 400 }}>飲み物</h3>
                <div className="space-y-3">
                  {menuItems.drinks.map((item) => (
                    <div key={item.name} className="flex justify-between">
                      <span className="text-[#3C200F]" style={{ fontSize: "16px", fontWeight: 400 }}>{item.name}</span>
                      <span className="text-[#8F7B65]" style={{ fontSize: "16px", fontWeight: 400 }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RECOMMEND MENU */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-10" style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 400 }}>RECCOMMEND MENU</h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <img
                  src="/images/img-045.jpg"
                  alt="DogHub箱根仙石原のおむすびセット"
                  className="w-full h-auto object-cover"
                  style={{ maxWidth: "524px", aspectRatio: "524/270" }}
                />
                <div className="mt-4">
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "20px", fontWeight: 400 }}>しらすヤンギン</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>
                    しらすのさっぱりとした味わいとヤンギンの香ばしさが絶妙な組み合わせです。お米はおにぎりに最適な山形県庄内産のはえぬき、しらすも地元湘南で取れるものを使用しており、他の素材に関しても厳選しております。
                  </p>
                </div>
              </div>
              <div>
                <img
                  src="/images/img-030.jpg"
                  alt="DogHub箱根仙石原の手作りスープ"
                  className="w-full h-auto object-cover"
                  style={{ maxWidth: "523px", aspectRatio: "523/270" }}
                />
                <div className="mt-4">
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "20px", fontWeight: 400 }}>DogHubこだわりスープ</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>
                    スープは「牛カルビスープ」と「鶏スープ」をご用意しており、カルビスープは韓国唐辛子を使ったピリ辛い味わい、鶏スープは優しい塩味が特徴です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dog-friendly lunch info */}
        <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-[#3C200F] mb-8" style={{ fontSize: "26px", fontWeight: 400 }}>箱根で犬連れランチならDogHub</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "室内で犬と一緒に食事OK", body: "店内にイートインスペースを完備。リード着用で愛犬と一緒にお食事いただけます。テイクアウトも可能なので、ドッグラン横のベンチで食べるのもおすすめです。" },
                { title: "予約不要・頭数制限なし", body: "カフェのご利用に予約は不要です。わんちゃんの頭数制限もございません。お散歩やドライブの途中にお気軽にお立ち寄りください。" },
                { title: "ドッグラン併設で食後も遊べる", body: "併設の専用ドッグランは飼い主様同伴でリードなしOK。ランチの後にわんちゃんを思いっきり遊ばせてあげられます。" },
              ].map((item) => (
                <div key={item.title} className="border border-[#E5DDD8] p-6">
                  <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "18px", fontWeight: 400 }}>{item.title}</h3>
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-[#F7F7F7] p-6">
              <p className="text-[#3C200F] mb-2" style={{ fontSize: "16px", fontWeight: 400 }}>ペットホテルご利用のお客様へ</p>
              <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>
                お預かり中のお迎え前後にカフェをご利用いただくこともできます。ゴルフや観光の帰りにおむすびとスープで一息つきながら、愛犬との再会をお楽しみください。
              </p>
            </div>
          </div>
        </section>

        {/* GOODS */}
        <section className="py-16 px-6 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-start">
              <div>
                <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 400 }}>GOODS</h2>
                <h3 className="text-[#3C200F] mb-6" style={{ fontSize: "20px", fontWeight: 400, lineHeight: "1.6" }}>
                  愛犬家の暮らしをより豊かにする<br />アイテムを厳選して販売しています
                </h3>
                <p className="text-[#3C200F] mb-6" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "2" }}>
                  愛犬家の暮らしをより豊かにするアイテムを集めたセレクトショップです。お出かけに便利な愛犬グッズから、毎日の生活を彩る雑貨まで幅広く取り揃えています。旅の途中で立ち寄っていただければ、思わず手に取りたくなるお気に入りがきっと見つかります。愛犬との時間をさらに快適で楽しいものにしていただけるよう、心を込めてセレクトしています。
                </p>
                <div className="mt-6">
                  <p className="text-[#8F7B65] mb-4" style={{ fontSize: "16px", fontWeight: 400 }}>ITEMS</p>
                  <p className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>販売商品一覧　※一部</p>
                </div>
              </div>
              <div>
                <img
                  src="/images/img-049.jpg"
                  alt="DogHub箱根仙石原のグッズ一覧"
                  width={630}
                  height={480}
                  className="w-full h-auto"
                  style={{ maxWidth: "630px" }}
                />
              </div>
            </div>

            {/* Items photos */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <img
                src="/images/img-014.jpg"
                alt="グッズ商品"
                className="w-full h-auto object-cover"
              />
              <img
                src="/images/img-001.jpg"
                alt="グッズ商品"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        <QuickNav />
      </main>
      <Footer />
    </>
  );
}
