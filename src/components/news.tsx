import Link from "next/link";

const newsItems = [
  {
    date: "2025年9月12日",
    category: "お知らせ",
    title: "ホームページをリニューアルいたしました",
    href: "/news",
  },
];

export function News() {
  return (
    <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[160px_1fr] gap-8">
          {/* Left label */}
          <div>
            <h2 className="text-[#3C200F] mb-1" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>NEWS</h2>
            <p className="text-[#8F7B65]" style={{ fontSize: "20px", fontWeight: 400 }}>お知らせ</p>
          </div>

          {/* News list */}
          <div>
            {newsItems.map((item, i) => (
              <div key={i} className="border-b border-[#E5DDD8] py-5">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>{item.date}</p>
                  <span className="text-[#B87942] border border-[#B87942] px-2 py-0.5" style={{ fontSize: "14px", fontWeight: 400 }}>
                    {item.category}
                  </span>
                </div>
                <Link
                  href={item.href}
                  className="text-[#3C200F] hover:text-[#B87942] transition-colors"
                  style={{ fontSize: "18px", fontWeight: 400 }}
                >
                  {item.title}
                </Link>
              </div>
            ))}

            <div className="mt-6 flex justify-end">
              <Link
                href="/news"
                className="flex items-center gap-2 text-[#3C200F] hover:text-[#B87942] transition-colors group border-b border-[#3C200F] pb-1"
                style={{ fontSize: "18px", fontWeight: 400 }}
              >
                <span>もっと見る</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
