import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reservation } from "@/components/reservation";
import { QuickNav } from "@/components/quick-nav";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { getArticles, getArticle } from "@/lib/cms";

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
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getArticle(slug);
  if (!result) notFound();

  const { article, html } = result;

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
            <p className="text-sm mb-2 opacity-80">/ {article.category}</p>
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
