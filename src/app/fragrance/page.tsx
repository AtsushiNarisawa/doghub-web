import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WaitlistForm } from "./WaitlistForm";

export const metadata: Metadata = {
  title: "犬と暮らす手のためのハンドクリーム｜DogHub箱根仙石原",
  description:
    "犬に有害とされる精油を使わずに香りを立てるハンドクリームを、箱根仙石原の犬の宿でつくっています。できあがったら先にお知らせします。",
  alternates: { canonical: "/fragrance" },
};

export default function FragrancePage() {
  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        {/* タグライン（世界観 第1層） */}
        <section className="bg-gradient-to-b from-[#f4f4f2] to-white">
          <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center">
            <p className="text-sm tracking-[0.3em] text-[#3C200F]/50 mb-8">
              DogHub FRAGRANCE
            </p>
            <h1 className="text-2xl lg:text-3xl font-medium text-[#3C200F] leading-relaxed tracking-wide">
              その手で、犬にふれるから。
            </h1>
          </div>
        </section>

        {/* 本文（つくっている途中の共有） */}
        <section className="bg-white">
          <div className="max-w-xl mx-auto px-6 pb-16 text-center">
            <div
              className="text-[#3C200F]/80 space-y-6"
              style={{ lineHeight: "2.2" }}
            >
              <p>DogHub が、ハンドクリームをつくっています。</p>
              <p>
                犬に有害とされる精油を使わずに、
                <br className="hidden sm:block" />
                それでも香りが立つところまで持っていけるか。
                <br className="hidden sm:block" />
                いま、そこを詰めています。
              </p>
              <p>
                初回は、110本だけです。
                <br className="hidden sm:block" />
                できあがったら、先にお知らせします。
              </p>
            </div>
          </div>
        </section>

        {/* ウェイトリスト登録 */}
        <section className="bg-[#f7f5f0]">
          <div className="max-w-3xl mx-auto px-6 py-14">
            <WaitlistForm />
          </div>
        </section>

        {/* 出自（世界観 第3層） */}
        <section className="bg-white">
          <div className="max-w-3xl mx-auto px-6 py-16 text-center">
            <p className="text-sm tracking-widest text-[#3C200F]/45">
              ―― 箱根仙石原の、犬の宿から。
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
