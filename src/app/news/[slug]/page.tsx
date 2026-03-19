import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { getArticles, getArticle } from "@/lib/cms";

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
    text: "箱根旅行をもっと自由に楽しむ",
    subtext: "温泉・美術館・ユネッサンなどペット不可スポットも、DogHubにお預けで安心。半日¥3,300〜。",
    href: "/beginner",
    btnLabel: "はじめての方はこちら（利用の流れ）",
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
  "pet-hotel-first-time-tips": {
    text: "初めてのペットホテルはDogHubで",
    subtext: "完全個室で安心。まずは1時間¥1,100〜のスポット利用から始められます。",
    href: "/guide",
    btnLabel: "ご利用ガイドを見る",
  },
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

  // 関連記事を取得（同カテゴリ優先、最大3件）
  const allArticles = await getArticles();
  const relatedArticles = allArticles
    .filter((a) => a.slug !== slug)
    .sort((a, b) => (a.category === article.category ? -1 : 1) - (b.category === article.category ? -1 : 1))
    .slice(0, 3);

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
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full object-cover"
            style={{ height: "clamp(140px, 18vw, 249px)" }}
          />
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
              <span className="text-[#8F7B65]" style={{ fontSize: "14px" }}>{article.date}</span>
              <span className="text-[#B87942] border border-[#B87942] px-2 py-0.5" style={{ fontSize: "12px" }}>
                {article.category}
              </span>
            </div>

            <div
              className="prose-doghub"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* 記事末CTA */}
            <div className="article-cta">
              <p className="cta-main-text" style={{ fontSize: "17px", fontWeight: 500, color: "#1A1A1A", marginBottom: "0.4em" }}>{cta.text}</p>
              <p style={{ marginBottom: "1.2em" }}>{cta.subtext}</p>
              <a href={cta.href}>{cta.btnLabel}</a>
            </div>
          </div>
        </section>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="px-6 py-12 bg-[#F7F7F7] border-t border-[#E5DDD8]">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-[#3C200F] mb-6" style={{ fontSize: "22px", fontWeight: 400 }}>あわせて読みたい</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {relatedArticles.map((ra) => (
                  <Link key={ra.slug} href={`/news/${ra.slug}`} className="block bg-white border border-[#E5DDD8] hover:border-[#B87942] transition-colors group">
                    <img src={ra.thumbnail} alt={ra.title} className="w-full h-32 object-cover" />
                    <div className="p-4">
                      <p className="text-[#8F7B65] mb-1" style={{ fontSize: "12px" }}>{ra.date}</p>
                      <h3 className="text-[#3C200F] group-hover:text-[#B87942] transition-colors" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.6" }}>{ra.title}</h3>
                    </div>
                  </Link>
                ))}
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
      </main>
      <Footer />
    </>
  );
}
