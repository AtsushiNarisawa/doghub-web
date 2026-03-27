import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { getArticles, getArticle } from "@/lib/cms";
import { ArticleFloatingBar } from "@/components/article-floating-bar";
import { InstagramFollowFull } from "@/components/instagram-follow";
import Image from "next/image";

// 記事スラッグ別CTA設定
const ARTICLE_CTA: Record<string, { text: string; subtext: string; href: string; btnLabel: string }> = {
  "hakone-golf-pet-guide": {
    text: "ゴルフ前に愛犬を安心してお預け",
    subtext: "早朝7時からお預かり。大箱根CCへのアクセスも便利な仙石原にあります。",
    href: "/golf",
    btnLabel: "ゴルフ×お預かりプランを見る",
  },
  "hakone-yunessun-pet-guide": {
    text: "ユネッサンを愛犬なしで楽しむために",
    subtext: "DogHubは日帰り4時間プランあり。ユネッサンまで車で約10分の立地です。",
    href: "/yunessun",
    btnLabel: "日帰りお預かりプランを見る",
  },
  "hakone-museum-dog-guide": {
    text: "美術館めぐりの間、愛犬をお預け",
    subtext: "ポーラ美術館まで車4分。2時間¥2,200〜のスポット利用で気軽にお預けできます。",
    href: "/museum",
    btnLabel: "美術館×お預かりのモデルコースを見る",
  },
  "hakone-pet-hotel-comparison": {
    text: "箱根で選ばれているドッグホテル",
    subtext: "広いドッグランで自由に遊べる。ゲージに入れっぱなしにしない環境です。",
    href: "/service",
    btnLabel: "DogHubのサービス・料金を見る",
  },
  "hakone-dog-friendly-hotels": {
    text: "ペット可の宿でも、日中のお預かりに",
    subtext: "チェックイン前やチェックアウト後の観光中、愛犬をDogHubにお預け。近隣施設からのご案内多数。",
    href: "/pethotel",
    btnLabel: "ペット可ホテル×日中預かりプランを見る",
  },
  "hakone-dog-trip-guide": {
    text: "箱根観光中の愛犬のお預かり",
    subtext: "温泉・美術館・ユネッサンなど、ペット不可スポットも安心。半日¥3,300〜、1日¥5,500〜。",
    href: "/service",
    btnLabel: "お預かりプラン・料金を見る",
  },
  "spring-walk-guide": {
    text: "お散歩のついでに立ち寄れます",
    subtext: "仙石原すすき草原から徒歩圏内。愛犬同伴OKのカフェでおむすび＆スープはいかがですか？",
    href: "/cafe",
    btnLabel: "カフェメニュー・アクセスを見る",
  },
  "hakone-dog-hotel-guide": {
    text: "箱根の犬のホテルならDogHub箱根仙石原",
    subtext: "24時間スタッフ常駐・完全個室・ドッグラン併設。宿泊¥7,700〜、半日預かり¥3,300〜。",
    href: "/stay",
    btnLabel: "宿泊・預かりプランを見る",
  },
  "hakone-dog-lunch-guide": {
    text: "箱根で犬連れランチならDogHubのカフェへ",
    subtext: "室内で犬と一緒に食事OK。予約不要・頭数制限なし。ドッグラン併設で食後も遊べます。",
    href: "/cafe",
    btnLabel: "カフェメニューを見る",
  },
  "hakone-dog-travel-model-course": {
    text: "箱根旅行の拠点にDogHub箱根仙石原",
    subtext: "預かり・カフェ・ドッグランが一か所に。箱根観光の自由度が格段に上がります。",
    href: "/service",
    btnLabel: "料金・サービスを見る",
  },
  "hakone-dog-rainy-day": {
    text: "雨の日でも安心。屋根付きドッグラン併設",
    subtext: "天候を気にせず愛犬を遊ばせられます。カフェで室内ランチもOK。",
    href: "/dogrun",
    btnLabel: "ドッグラン詳細を見る",
  },
  "hakone-pet-hotel-area-guide": {
    text: "仙石原の中心にあるペットホテル",
    subtext: "強羅から車10分、芦ノ湖から車20分。箱根のどこからでもアクセスしやすい立地です。",
    href: "/service",
    btnLabel: "料金・サービスを見る",
  },
  "hakone-ashinoko-dog-guide": {
    text: "芦ノ湖観光の前後にお預け",
    subtext: "桃源台から車10分、元箱根から車20分。半日預かり¥3,300〜。",
    href: "/service",
    btnLabel: "お預かりプランを見る",
  },
  "hakone-dog-cafe-guide": {
    text: "箱根で室内犬連れOKのカフェ",
    subtext: "DogHubのOMUSUBI & SOUP CAFE。予約不要・頭数制限なし・ドッグラン併設。",
    href: "/cafe",
    btnLabel: "カフェの詳細を見る",
  },
  "hakone-owakudani-dog-guide": {
    text: "大涌谷観光中の愛犬はDogHubへ",
    subtext: "大涌谷から車約15分。硫黄ガスの心配なく、愛犬を安心してお預けください。",
    href: "/4h",
    btnLabel: "半日お預かりプランを見る",
  },
  "hakone-dog-spot-sengokuhara": {
    text: "仙石原の犬連れ旅行の拠点に",
    subtext: "ペットホテル・カフェ・ドッグランが仙石原の中心にあります。",
    href: "/service",
    btnLabel: "DogHubのサービスを見る",
  },
  "hakone-dog-hotel-cost-comparison": {
    text: "1泊¥7,700〜で愛犬を安心してお預け",
    subtext: "24時間スタッフ常駐・個室・ドッグラン併設。飼い主さんは憧れの旅館を満喫できます。",
    href: "/stay",
    btnLabel: "宿泊プランを見る",
  },
  "hakone-chokoku-no-mori-dog-guide": {
    text: "彫刻の森美術館の間、愛犬をお預け",
    subtext: "美術館まで車15分。半日¥3,300〜で、ピカソ館までゆっくり鑑賞できます。",
    href: "/museum",
    btnLabel: "美術館×お預かりプランを見る",
  },
  "hakone-pola-museum-dog-guide": {
    text: "ポーラ美術館の間、愛犬をお預け",
    subtext: "DogHubから車たった4分。半日¥3,300〜で名画をゆっくり楽しめます。",
    href: "/museum",
    btnLabel: "美術館×お預かりプランを見る",
  },
  "hakone-jinja-dog-guide": {
    text: "箱根神社の前後に立ち寄れます",
    subtext: "芦ノ湖から車20分。参拝後にカフェでおむすび＆スープはいかが？",
    href: "/cafe",
    btnLabel: "カフェ・アクセスを見る",
  },
  "hakone-ropeway-pirate-ship-dog-guide": {
    text: "ゴールデンコースの前後にお預け",
    subtext: "ケージなしで身軽に楽しみたいなら、半日¥3,300〜でお預かり。",
    href: "/service",
    btnLabel: "お預かりプラン・料金を見る",
  },
  "hakone-en-dog-guide": {
    text: "箱根園の前後にDogHubへ",
    subtext: "芦ノ湖エリアから車25分。ふれあい動物園の間だけお預かりも。",
    href: "/service",
    btnLabel: "お預かりプラン・料金を見る",
  },
  "hakone-gora-park-dog-guide": {
    text: "強羅エリアのお出かけ拠点に",
    subtext: "強羅から車10分。クラフト体験の間だけ預けて、庭園は犬と一緒に。",
    href: "/service",
    btnLabel: "お預かりプラン・料金を見る",
  },
  "hakone-gw-spring-dog-guide": {
    text: "GWの箱根旅行、愛犬のお預かり",
    subtext: "GW期間は混み合います。宿泊・半日プランともに早めのご予約がおすすめです。",
    href: "/service",
    btnLabel: "プラン・料金を見る",
  },
  "hakone-dog-day-trip": {
    text: "日帰り箱根の拠点にDogHub",
    subtext: "半日¥3,300〜。仙石原を拠点に美術館も温泉も効率よく。",
    href: "/service",
    btnLabel: "日帰りプラン・料金を見る",
  },
  "pet-hotel-first-time-tips": {
    text: "初めてのペットホテルはDogHubで",
    subtext: "完全個室で安心。まずは1時間¥1,100〜のスポット利用から始められます。",
    href: "/guide",
    btnLabel: "ご利用ガイドを見る",
  },
};

// 記事別シーンページブリッジ（記事本文内に表示する具体的な導線）
const ARTICLE_SCENE_BRIDGES: Record<string, { label: string; href: string; description: string }[]> = {
  "hakone-dog-trip-guide": [
    { label: "ユネッサンに行くなら", href: "/yunessun", description: "1日お預かりでユネッサンをたっぷり満喫" },
    { label: "ゴルフに行くなら", href: "/golf", description: "早朝7時からお預かり。大箱根CC提携" },
    { label: "美術館に行くなら", href: "/museum", description: "ポーラ美術館まで車4分" },
    { label: "温泉に行くなら", href: "/onsen", description: "仙石原周辺の温泉13施設" },
    { label: "ペット可の宿に泊まるなら", href: "/pethotel", description: "チェックイン前・アウト後のお預かり" },
  ],
  "hakone-museum-dog-guide": [
    { label: "美術館×お預かりプラン", href: "/museum", description: "半日で美術館1館＋ランチ" },
    { label: "温泉も楽しみたいなら", href: "/onsen", description: "美術館のあとに温泉も" },
    { label: "半日プランの料金", href: "/4h", description: "¥3,300〜で美術館1〜2館分の時間" },
  ],
  "hakone-dog-rainy-day": [
    { label: "温泉で過ごすなら", href: "/onsen", description: "雨の日の温泉は格別" },
    { label: "ユネッサンで1日遊ぶなら", href: "/yunessun", description: "屋内温泉プールで天候を気にせず" },
    { label: "美術館巡りなら", href: "/museum", description: "雨の日こそ美術館日和" },
  ],
  "hakone-dog-friendly-hotels": [
    { label: "ペット可ホテル×日中預かり", href: "/pethotel", description: "チェックイン前・チェックアウト後の観光に" },
    { label: "高級旅館×お預かり", href: "/ryokan", description: "ペット不可の旅館に泊まりたい時の選択肢" },
    { label: "宿泊プランを見る", href: "/stay", description: "1泊¥7,700〜 24時間スタッフ常駐" },
  ],
  "hakone-dog-travel-model-course": [
    { label: "ゴルフプラン", href: "/golf", description: "早朝7時〜のお預かりでラウンド" },
    { label: "ユネッサンプラン", href: "/yunessun", description: "1日お預かりでたっぷり温泉" },
    { label: "美術館プラン", href: "/museum", description: "半日で美術館1館＋ランチ" },
  ],
  "hakone-ashinoko-dog-guide": [
    { label: "芦ノ湖観光中のお預かり", href: "/service", description: "桃源台から車10分。半日¥3,300〜" },
    { label: "海賊船＋遊覧の間に預ける", href: "/4h", description: "半日プランで芦ノ湖をたっぷり満喫" },
    { label: "カフェでランチ", href: "/cafe", description: "お迎え前後におむすび＆スープ" },
  ],
  "hakone-owakudani-dog-guide": [
    { label: "大涌谷観光中のお預かり", href: "/4h", description: "半日プラン¥3,300〜" },
    { label: "ロープウェイ＋芦ノ湖も行くなら", href: "/service", description: "1日プラン¥5,500〜で大涌谷→芦ノ湖コース" },
    { label: "カフェで一休み", href: "/cafe", description: "お迎え前に仙石原でおむすびランチ" },
  ],
  "hakone-dog-lunch-guide": [
    { label: "カフェのメニューを見る", href: "/cafe", description: "室内犬連れOK。おむすび＆スープ" },
    { label: "ランチ後に観光するなら", href: "/service", description: "食後にお預けして温泉・美術館へ" },
  ],
  "hakone-dog-cafe-guide": [
    { label: "カフェの詳細", href: "/cafe", description: "メニュー・営業時間・アクセス" },
  ],
  "hakone-dog-spot-sengokuhara": [
    { label: "美術館×お預かり", href: "/museum", description: "ポーラ美術館まで車4分" },
    { label: "カフェでランチ", href: "/cafe", description: "室内犬連れOK" },
  ],
  "hakone-dog-hotel-guide": [
    { label: "宿泊プラン", href: "/stay", description: "1泊¥7,700〜" },
    { label: "半日プラン", href: "/4h", description: "¥3,300〜" },
  ],
  "hakone-pet-hotel-comparison": [
    { label: "料金・サービス詳細", href: "/service", description: "プラン・料金・設備のご案内" },
  ],
  "hakone-dog-hotel-cost-comparison": [
    { label: "宿泊プラン詳細", href: "/stay", description: "1泊¥7,700〜 個室・24時間常駐" },
    { label: "高級旅館×お預かり", href: "/ryokan", description: "憧れの旅館も犬連れで" },
  ],
  "hakone-chokoku-no-mori-dog-guide": [
    { label: "美術館×お預かりプラン", href: "/museum", description: "半日で彫刻の森＋ランチ" },
    { label: "ポーラ美術館も行くなら", href: "/4h", description: "1日プラン¥5,500〜で2館回れる" },
    { label: "お迎え後にカフェ", href: "/cafe", description: "おむすび＆スープで一休み" },
  ],
  "hakone-pola-museum-dog-guide": [
    { label: "美術館×お預かりプラン", href: "/museum", description: "ポーラ美術館まで車4分" },
    { label: "彫刻の森もセットで", href: "/8h", description: "1日プラン¥5,500〜" },
    { label: "お迎え後にカフェ", href: "/cafe", description: "おむすび＆スープで一休み" },
  ],
  "hakone-jinja-dog-guide": [
    { label: "温泉も楽しみたいなら", href: "/onsen", description: "参拝後に温泉。犬はDogHubで預かり" },
    { label: "カフェで休憩", href: "/cafe", description: "仙石原でおむすび＆スープ" },
    { label: "料金・プラン", href: "/service", description: "半日¥3,300〜" },
  ],
  "hakone-ropeway-pirate-ship-dog-guide": [
    { label: "大涌谷観光中のお預かり", href: "/4h", description: "半日プラン¥3,300〜" },
    { label: "温泉も行くなら", href: "/onsen", description: "仙石原周辺の温泉13施設" },
    { label: "カフェで休憩", href: "/cafe", description: "お迎え前後に" },
  ],
  "hakone-en-dog-guide": [
    { label: "芦ノ湖観光のお預かり", href: "/service", description: "半日¥3,300〜" },
    { label: "箱根神社もセットで", href: "/service", description: "芦ノ湖エリアを満喫" },
    { label: "カフェで休憩", href: "/cafe", description: "仙石原でおむすび＆スープ" },
  ],
  "hakone-gora-park-dog-guide": [
    { label: "クラフト体験中のお預かり", href: "/4h", description: "半日プラン¥3,300〜" },
    { label: "温泉も行くなら", href: "/onsen", description: "強羅エリアの温泉" },
    { label: "カフェでランチ", href: "/cafe", description: "DogHubのおむすび＆スープ" },
  ],
  "hakone-gw-spring-dog-guide": [
    { label: "ユネッサンに行くなら", href: "/yunessun", description: "1日お預かりで温泉プール満喫" },
    { label: "美術館に行くなら", href: "/museum", description: "ポーラ美術館まで車4分" },
    { label: "宿泊プラン", href: "/stay", description: "1泊¥7,700〜" },
  ],
  "hakone-dog-day-trip": [
    { label: "半日お預かり", href: "/4h", description: "¥3,300〜 美術館1館＋温泉に" },
    { label: "1日お預かり", href: "/8h", description: "¥5,500〜 芦ノ湖方面まで" },
    { label: "カフェで休憩", href: "/cafe", description: "おむすび＆スープ" },
  ],
  "spring-walk-guide": [
    { label: "お散歩後にカフェ", href: "/cafe", description: "おむすび＆スープで一休み" },
    { label: "ドッグランで遊ぶ", href: "/dogrun", description: "お散歩のあとに自由に走り回れる" },
  ],
  "pet-hotel-first-time-tips": [
    { label: "ご利用ガイド", href: "/guide", description: "初めての方向けのご案内" },
    { label: "料金プラン", href: "/service", description: "スポット1時間¥1,100〜" },
  ],
};

const DEFAULT_CTA = {
  text: "箱根旅行中の愛犬のお預かりはDogHubへ",
  subtext: "ドッグランで自由に遊べる環境。宿泊・日帰りプランをご用意しています。",
  href: "/service",
  btnLabel: "料金・サービスを確認する",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticle(slug);
  if (!result) return { title: "記事が見つかりません | DogHub箱根仙石原" };

  const baseUrl = "https://dog-hub.shop";
  return {
    title: `${result.article.title} | DogHub箱根仙石原`,
    description: result.article.summary,
    openGraph: {
      title: `${result.article.title} | DogHub箱根仙石原`,
      description: result.article.summary,
      url: `${baseUrl}/news/${slug}`,
      type: "article",
      images: result.article.thumbnail.startsWith("http")
        ? [{ url: result.article.thumbnail }]
        : [{ url: `${baseUrl}${result.article.thumbnail}` }],
    },
    alternates: { canonical: `/news/${slug}` },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getArticle(slug);
  if (!result) notFound();

  const { article, html } = result;
  const cta = ARTICLE_CTA[slug] ?? DEFAULT_CTA;
  const sceneBridges = ARTICLE_SCENE_BRIDGES[slug] || [];

  // 記事本文を中盤で分割し、インラインブリッジを挿入
  const inlineBridge = sceneBridges.length > 0 ? sceneBridges[0] : null;
  let htmlFirstHalf = html;
  let htmlSecondHalf = "";
  if (inlineBridge) {
    const h2Matches = [...html.matchAll(/<h2[\s>]/gi)];
    if (h2Matches.length >= 3) {
      const splitIndex = h2Matches[2].index!;
      htmlFirstHalf = html.slice(0, splitIndex);
      htmlSecondHalf = html.slice(splitIndex);
    }
  }

  // 関連記事を取得（同カテゴリ優先、最大2件）+ 関連サービスページ1つ
  const allArticles = await getArticles();
  const relatedArticles = allArticles
    .filter((a) => a.slug !== slug)
    .sort((a, b) => (a.category === article.category ? -1 : 1) - (b.category === article.category ? -1 : 1))
    .slice(0, 2);

  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[
          { name: "ホーム", href: "/" },
          { name: "お知らせ", href: "/news" },
          { name: article.title, href: `/news/${slug}` },
        ]} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.summary,
            image: article.thumbnail.startsWith("http")
              ? article.thumbnail
              : `https://dog-hub.shop${article.thumbnail}`,
            datePublished: article.date,
            author: {
              "@type": "Organization",
              name: "DogHub箱根仙石原",
              url: "https://dog-hub.shop",
            },
            publisher: {
              "@type": "Organization",
              name: "DogHub箱根仙石原",
              url: "https://dog-hub.shop",
            },
            mainEntityOfPage: `https://dog-hub.shop/news/${slug}`,
          }) }}
        />
        {/* Hero */}
        <div className="relative">
          <Image src={article.thumbnail} alt="" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(140px, 18vw, 249px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center px-4">
            <h1 style={{ fontSize: "clamp(20px, 4vw, 36px)", fontWeight: 400 }}>
              {article.title}
            </h1>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white px-6 py-3 border-b border-[#E5DDD8]">
          <p className="text-black max-w-4xl mx-auto" style={{ fontSize: "16px" }}>
            <Link href="/" className="hover:text-[#3C200F]">/</Link>
            <span className="mx-2"></span>
            <Link href="/news" className="hover:text-[#3C200F]">お知らせ</Link>
            <span className="mx-2"></span>
            <span>{article.title}</span>
          </p>
        </div>

        {/* Article body */}
        <section className="py-12 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-[#8F7B65]" style={{ fontSize: "14px" }}>公開: {article.date}　|　最終更新: 2026-03-20</span>
              <span className="text-[#B87942] border border-[#B87942] px-2 py-0.5" style={{ fontSize: "12px" }}>
                {article.category}
              </span>
            </div>

            <div
              className="prose-doghub"
              dangerouslySetInnerHTML={{ __html: htmlFirstHalf }}
            />

            {/* インラインブリッジ — 記事中盤に自然に挿入 */}
            {inlineBridge && htmlSecondHalf && (
              <Link
                href={inlineBridge.href}
                className="block my-8 px-5 py-4 bg-[#F8F5F0] border-l-4 border-[#B87942] hover:bg-[#F0EBE4] transition-colors"
                style={{ textDecoration: "none" }}
              >
                <span style={{ fontSize: "14px", fontWeight: 500, color: "#3C200F", display: "block" }}>
                  {inlineBridge.label}
                </span>
                <span style={{ fontSize: "13px", color: "#8F7B65", display: "block", marginTop: "2px" }}>
                  {inlineBridge.description} →
                </span>
              </Link>
            )}

            {htmlSecondHalf && (
              <div
                className="prose-doghub"
                dangerouslySetInnerHTML={{ __html: htmlSecondHalf }}
              />
            )}

            {/* シーンページブリッジ — 記事から具体的なプランへ */}
            {sceneBridges.length > 0 && (
              <div style={{ margin: "2em 0", padding: "20px", background: "#F8F5F0", borderRadius: "12px" }}>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#3C200F", marginBottom: "12px" }}>
                  DogHubに預けて箱根を楽しむ
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {sceneBridges.map((bridge) => (
                    <Link
                      key={bridge.href}
                      href={bridge.href}
                      className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-[#E5DDD8] hover:border-[#B87942] transition-colors"
                      style={{ textDecoration: "none" }}
                    >
                      <div>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#3C200F" }}>{bridge.label}</span>
                        <span style={{ fontSize: "12px", color: "#8F7B65", display: "block", marginTop: "2px" }}>{bridge.description}</span>
                      </div>
                      <span style={{ fontSize: "14px", color: "#B87942", fontWeight: 500, flexShrink: 0, marginLeft: "12px" }}>→</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 記事末CTA — スタッフからのひとこと */}
            <div className="article-cta staff-note">
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1em" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#E5DDD8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>🐕</div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "#3C200F", margin: 0 }}>DogHub箱根仙石原 スタッフ</p>
                  <p style={{ fontSize: "12px", color: "#8F7B65", margin: 0 }}>仙石原で犬と暮らしています</p>
                </div>
              </div>
              <p style={{ fontSize: "15px", color: "#3C200F", marginBottom: "1.2em", textAlign: "left" }}>{cta.subtext}</p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a href={cta.href}>{cta.btnLabel}</a>
                <a href="tel:0460-80-0290" className="article-cta-secondary">電話で相談する</a>
              </div>
            </div>
          </div>
        </section>

        {/* Instagram follow */}
        <section className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <InstagramFollowFull />
          </div>
        </section>

        {/* Related articles + service page */}
        {relatedArticles.length > 0 && (
          <section className="px-6 py-12 bg-[#F7F7F7] border-t border-[#E5DDD8]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "22px", fontWeight: 400 }}>あわせて読みたい</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {relatedArticles.map((ra) => (
                  <Link key={ra.slug} href={`/news/${ra.slug}`} className="block bg-white border border-[#E5DDD8] hover:border-[#B87942] transition-colors group">
                    <Image src={ra.thumbnail} alt="" className="w-full h-32 object-cover" width={600} height={300} />
                    <div className="p-4">
                      <p className="text-[#8F7B65] mb-1" style={{ fontSize: "12px" }}>{ra.date}</p>
                      <h3 className="text-[#3C200F] group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.6" }}>{ra.title}</h3>
                    </div>
                  </Link>
                ))}
                {/* 関連サービスページへのブリッジ */}
                <Link href={cta.href} className="block bg-[#F8F5F0] border border-[#E5DDD8] hover:border-[#B87942] transition-colors group">
                  <div className="w-full h-32 bg-[#E5DDD8] flex items-center justify-center">
                    <span style={{ fontSize: "32px" }}>🐕</span>
                  </div>
                  <div className="p-4">
                    <p className="text-[#B87942] mb-1" style={{ fontSize: "12px" }}>DogHub箱根仙石原</p>
                    <h3 className="text-[#3C200F] group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.6" }}>{cta.btnLabel}</h3>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Scene pages */}
        <section className="px-6 py-12 bg-white border-t border-[#E5DDD8]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "22px", fontWeight: 400 }}>シーン別でDogHubを探す</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { href: "/golf", label: "ゴルフ × 預かり" },
                { href: "/onsen", label: "温泉 × 預かり" },
                { href: "/museum", label: "美術館 × 預かり" },
                { href: "/yunessun", label: "ユネッサン × 預かり" },
                { href: "/ryokan", label: "高級旅館 × 預かり" },
                { href: "/pethotel", label: "ペット可ホテル × 預かり" },
                { href: "/spots", label: "箱根の観光スポット" },
                { href: "/service", label: "料金・サービス" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="block border border-[#E5DDD8] px-4 py-3 text-center text-[#3C200F] hover:border-[#B87942] hover:text-[#B87942] transition-colors" style={{ fontSize: "13px", fontWeight: 400 }}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Back to list */}
        <section className="px-6 pb-12 bg-white">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-[#3C200F] hover:text-[#B87942] transition-colors"
              style={{ fontSize: "16px", fontWeight: 400 }}
            >
              ← お知らせ一覧に戻る
            </Link>
          </div>
        </section>

        <Reservation />
        <QuickNav />
        <ArticleFloatingBar href={cta.href} label={cta.btnLabel} />
      </main>
      <Footer />
    </>
  );
}
