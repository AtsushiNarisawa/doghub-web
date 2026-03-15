import Link from "next/link";
import { getNewsItems } from "@/lib/cms";

export async function News() {
  const newsItems = await getNewsItems();

  return (
    <section className="py-16 px-6 bg-white border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[160px_1fr] gap-8">
          {/* Left label */}
          <div>
            <h2 className="text-text mb-1" style={{ fontSize: "32px", fontWeight: 400, letterSpacing: "1.6px" }}>NEWS</h2>
            <p className="text-[#8F7B65]" style={{ fontSize: "20px", fontWeight: 400 }}>お知らせ</p>
          </div>

          {/* News list */}
          <div>
            {newsItems.map((item, i) => (
              <div key={i} className="border-b border-border py-5">
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>{item.date}</p>
                  <span className="text-accent border border-accent px-2 py-0.5" style={{ fontSize: "14px", fontWeight: 400 }}>
                    {item.category}
                  </span>
                </div>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-text hover:text-accent transition-colors"
                    style={{ fontSize: "18px", fontWeight: 400 }}
                  >
                    {item.title}
                  </Link>
                ) : (
                  <p className="text-text" style={{ fontSize: "18px", fontWeight: 400 }}>
                    {item.title}
                  </p>
                )}
              </div>
            ))}

            <div className="mt-6 flex justify-end">
              <Link
                href="/news"
                className="flex items-center gap-2 text-text hover:text-accent transition-colors group border-b border-text pb-1"
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
