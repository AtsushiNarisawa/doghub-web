import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WaitlistForm } from "./WaitlistForm";
import { RestockForm } from "./RestockForm";
import { BuyPanel, type Product } from "./BuyPanel";
import { fdb } from "@/lib/fragrance/db";
import { SALES_OPEN_KEY } from "@/lib/fragrance/config";

// Fragrance の売り場。状態は3つあり、在庫の実数だけで自動的に切り替わる。
//
//   発売前 … 「できたらお知らせします」の登録
//   販売中 … 数量と受取方法を選んで購入
//   完売   … 「入荷したらお知らせします」の登録
//
// 🔴 状態はコードではなくデータで決まる。販売開始も完売も、デプロイなしで切り替わる。
// 🔴 数字はサーバー側で読み、ブラウザには「残数と状態」しか渡さない（注文の情報は渡さない）。

export const metadata: Metadata = {
  title: "犬と暮らす手のためのハンドクリーム｜DogHub箱根仙石原",
  // 🔴 「有害とされる精油は入れていない」とは書かない（処方に柑橘・レモングラス等が入るため反証されうる）。
  // 🔴 「犬の宿で"つくっています"」は製造地の主張に読める（製造は OEM）。出自は「犬の宿から」の形だけで言う。
  description:
    "犬のそばで毎日使うことを前提に精油を選んだハンドクリーム。箱根仙石原の、犬の宿から。",
  alternates: { canonical: "/fragrance" },
};

// 在庫は常に最新を見る（キャッシュに残った「販売中」で売り切れた商品を売らない）
export const dynamic = "force-dynamic";

async function loadProducts(): Promise<Product[]> {
  try {
    const [{ data: setting }, { data: products }, { data: availability }] = await Promise.all([
      fdb.from("site_settings").select("value").eq("key", SALES_OPEN_KEY).maybeSingle(),
      fdb
        .from("fragrance_products")
        .select(
          "id, display_name, series_name, size_label, price_jpy, shipping_jpy, shipping_label, max_qty_per_order, sort_order",
        )
        .eq("active", true)
        .order("sort_order"),
      fdb
        .from("fragrance_lot_availability")
        .select("product_id, status, is_paused, ec_available")
        .in("status", ["on_sale", "sold_out"]),
    ]);

    const salesOpen = setting?.value === "true";

    return (products || []).map((p) => {
      const lots = (availability || []).filter((a) => a.product_id === p.id);
      const onSale = lots.find((l) => l.status === "on_sale" && !l.is_paused);
      const available = onSale ? Math.max(0, Number(onSale.ec_available ?? 0)) : 0;
      const state: Product["state"] = !salesOpen
        ? "before_sale"
        : onSale && available > 0
          ? "on_sale"
          : lots.length
            ? "sold_out"
            : "before_sale";

      return {
        id: p.id,
        name: p.display_name,
        series: p.series_name,
        size: p.size_label,
        price: p.price_jpy,
        shipping: p.shipping_jpy,
        shipping_label: p.shipping_label,
        max_qty: p.max_qty_per_order,
        state,
        available,
      };
    });
  } catch (e) {
    // データベースが読めなくてもページは出す（発売前の顔で表示する）
    console.error("fragrance page: load failed", e);
    return [];
  }
}

export default async function FragrancePage() {
  const products = await loadProducts();
  const primary = products[0];
  const state = primary?.state ?? "before_sale";

  return (
    <>
      <Header />
      <main className="pt-15 lg:pt-20">
        {/* タグライン（世界観 第1層） */}
        <section className="bg-gradient-to-b from-[#f4f4f2] to-white">
          <div className="max-w-3xl mx-auto px-6 py-20 lg:py-28 text-center">
            <p className="text-sm tracking-[0.3em] text-[#3C200F]/50 mb-8">DogHub FRAGRANCE</p>
            <h1 className="text-2xl lg:text-3xl font-medium text-[#3C200F] leading-relaxed tracking-wide">
              その手で、犬にふれるから。
            </h1>
          </div>
        </section>

        {/* 商品説明（世界観 v2 の7行） */}
        <section className="bg-white">
          <div className="max-w-xl mx-auto px-6 pb-16 text-center">
            <div className="text-[#3C200F]/80 space-y-6" style={{ lineHeight: "2.2" }}>
              <p>犬と暮らす手のための、ハンドクリーム。</p>
              <p>
                その手は、いつも犬にふれています。
                <br className="hidden sm:block" />
                犬のそばで毎日使うことを前提に、精油の種類と量を選んでいます。
                <br className="hidden sm:block" />
                入れられるものだけで、香りを立てました。
              </p>
              <p>
                朝、犬と歩く道の木漏れ日のような香りです。
                <br className="hidden sm:block" />
                散歩のあと、手を洗ったら、どうぞ。
              </p>
              {state === "before_sale" && (
                <p>
                  初回は、110本だけです。
                  <br className="hidden sm:block" />
                  できあがったら、先にお知らせします。
                </p>
              )}
            </div>
          </div>
        </section>

        {/* 状態に応じた売り場 */}
        <section className="bg-[#f7f5f0]">
          <div className="max-w-3xl mx-auto px-6 py-14">
            {state === "on_sale" && primary ? (
              <BuyPanel product={primary} />
            ) : state === "sold_out" && primary ? (
              <RestockForm productId={primary.id} />
            ) : (
              <WaitlistForm />
            )}
          </div>
        </section>

        {/* 出自（世界観 第3層） */}
        <section className="bg-white">
          <div className="max-w-3xl mx-auto px-6 py-16 text-center">
            <p className="text-sm tracking-widest text-[#3C200F]/45">
              ―― 箱根仙石原の、犬の宿から。
            </p>
            {state !== "before_sale" && (
              <p className="mt-6 text-xs text-[#3C200F]/45">
                <a href="/fragrance/legal" className="underline">
                  特定商取引法に基づく表記
                </a>
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
