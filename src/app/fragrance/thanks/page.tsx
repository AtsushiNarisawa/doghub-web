import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThanksContent } from "./ThanksContent";

// 🔴 検索結果に出さない（お客様ごとの決済番号が付く画面のため）。
//    robots.ts は /admin と /api しか除いていないので、ここで個別に指定する。
export const metadata: Metadata = {
  title: "ご注文ありがとうございます｜DogHub箱根仙石原",
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        <section className="bg-[#f7f5f0] min-h-[60vh]">
          <div className="max-w-3xl mx-auto px-6 py-20">
            {/* useSearchParams を使うので Suspense で包む（Next.js の要件） */}
            <Suspense
              fallback={
                <p className="text-center text-sm text-[#3C200F]/60">確認しています…</p>
              }
            >
              <ThanksContent />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
