import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getArticles } from "@/lib/cms";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import Image from "next/image";

export const metadata: Metadata = {
  title: "お知らせ | DogHub箱根仙石原",
  description: "DogHub箱根仙石原からのお知らせ・ブログ記事一覧。",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const articles = await getArticles();

  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <BreadcrumbJsonLd items={[{name:"ホーム",href:"/"},{name:"お知らせ",href:"/news"}]} />
        {/* Hero */}
        <div className="relative">
          <Image src="/images/img-056.jpg" alt="お知らせ" className="w-full object-cover" width={700} height={400} priority style={{ height: "clamp(140px, 18vw, 249px)" }} />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400 }}>お知らせ</h1>
          </div>
        </div>

        {/* Posts */}
        <section className="py-16 px-6 bg-white min-h-[400px]">
          <div className="max-w-7xl mx-auto">
            {articles.length === 0 ? (
              <p className="text-[#8F7B65] text-center py-20" style={{ fontSize: "18px", fontWeight: 400 }}>
                現在投稿はありません。
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {articles.map((post) => (
                  <Link key={post.slug} href={`/news/${post.slug}`} className="group block">
                    <div className="overflow-hidden mb-4">
                      <Image src={post.thumbnail} alt="" className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105" width={700} height={400} />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[#8F7B65]" style={{ fontSize: "13px", fontWeight: 400 }}>{post.date}</span>
                      <span className="text-[#B87942] border border-[#B87942] px-2 py-0.5" style={{ fontSize: "12px", fontWeight: 400 }}>
                        {post.category}
                      </span>
                    </div>
                    <h2
                      className="text-[#3C200F] group-hover:text-[#B87942] transition-colors"
                      style={{ fontSize: "16px", fontWeight: 400, lineHeight: "1.6" }}
                    >
                      {post.title}
                    </h2>
                    <p className="text-[#8F7B65] mt-2" style={{ fontSize: "13px", fontWeight: 400 }}>{post.summary}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
