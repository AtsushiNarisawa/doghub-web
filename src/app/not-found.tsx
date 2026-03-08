import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <section className="py-32 px-6 bg-white text-center">
          <div className="max-w-2xl mx-auto">
            <p className="text-[#B87942] mb-4" style={{ fontSize: "64px", fontWeight: 400 }}>404</p>
            <h1 className="text-[#3C200F] mb-6" style={{ fontSize: "24px", fontWeight: 400 }}>
              ページが見つかりませんでした
            </h1>
            <p className="text-[#8F7B65] mb-10" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              お探しのページは移動または削除された可能性があります。<br />
              URLをお確かめの上、再度お試しください。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-[#3C200F] text-white px-8 py-3 hover:opacity-90 transition-opacity"
                style={{ fontSize: "16px", fontWeight: 400 }}
              >
                トップページへ戻る
              </Link>
              <a
                href="https://airrsv.net/doghubhakone/calendar" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-3 hover:bg-[#3C200F] hover:text-white transition-colors"
                style={{ fontSize: "16px", fontWeight: 400 }}
              >
                ご予約はこちら
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
