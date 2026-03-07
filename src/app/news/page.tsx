import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "お知らせ | DogHub箱根仙石原",
  description: "DogHub箱根仙石原からのお知らせ・ブログ記事一覧。",
};

const posts = [
  {
    date: "2025年9月12日",
    category: "お知らせ",
    title: "ホームページをリニューアルいたしました",
    href: "/news/homepage-renewal",
    img: "https://static.wixstatic.com/media/a21f47_4c73dadaccf643909f2c59715afee3d4~mv2.png/v1/fill/w_241,h_181,fp_0.50_0.50,q_95,enc_avif,quality_auto/image.png",
    body: "DogHubのホームページをリニューアルいたしました。",
  },
];

const categories = ["All Posts", "お知らせ", "お客様の声", "コラム"];

export default function NewsPage() {
  return (
    <>
      <Header />
      <main className="pt-[80px]">
        {/* Hero */}
        <div className="relative">
          <img
            src="https://static.wixstatic.com/media/a21f47_0c4d1725107f4997b41cfb2104c63821~mv2.jpg/v1/fill/w_1440,h_249,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg"
            alt="お知らせ"
            className="w-full object-cover"
            style={{ height: "clamp(140px, 18vw, 249px)" }}
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
            <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400 }}>お知らせ</h1>
          </div>
        </div>

        {/* Category filter */}
        <div className="bg-white border-b border-[#E5DDD8] px-6">
          <div className="max-w-7xl mx-auto flex overflow-x-auto gap-0">
            {categories.map((cat, i) => (
              <span
                key={cat}
                className={`flex-shrink-0 px-5 py-4 text-sm cursor-pointer whitespace-nowrap border-b-2 ${i === 0 ? "border-[#3C200F] text-[#3C200F]" : "border-transparent text-[#8F7B65] hover:text-[#3C200F]"}`}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Posts */}
        <section className="py-16 px-6 bg-white min-h-[400px]">
          <div className="max-w-7xl mx-auto">
            {posts.length === 0 ? (
              <p className="text-[#8F7B65] text-center py-20" style={{ fontSize: "18px", fontWeight: 400 }}>
                現在投稿はありません。
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link key={post.href} href={post.href} className="group block">
                    <div className="overflow-hidden mb-4">
                      <img
                        src={post.img}
                        alt={post.title}
                        className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                      />
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
                    <p className="text-[#8F7B65] mt-2" style={{ fontSize: "13px", fontWeight: 400 }}>{post.body}</p>
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
