import Link from "next/link";
import Image from "next/image";

export function CafeGoods() {
  return (
    <section className="bg-white border-t border-[#E5DDD8]">
      <div className="grid md:grid-cols-2">
        {/* OMUSUBI & SOUP CAFE */}
        <div>
          <Image src="/images/img-070.jpg" alt="箱根 犬連れランチ DogHubのOMUSUBI & SOUP CAFE 愛犬と一緒に食事できる店内" className="w-full h-auto block" width={600} height={400} />
          <div className="p-6 md:p-10">
            <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 400, letterSpacing: "1.8px" }}>OMUSUBI & SOUP CAFE</h3>
            <h4 className="text-[#311908] mb-4" style={{ fontSize: "clamp(16px, 2vw, 24px)", fontWeight: 400 }}>愛犬との時間を楽しむほっとした空間</h4>
            <Link
              href="/cafe"
              className="flex items-center gap-2 text-black hover:text-[#B87942] transition-colors group"
              style={{ fontSize: "18px", fontWeight: 400, textAlign: "justify" }}
            >
              <span>詳しくはこちら</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {/* GOODS */}
        <div>
          <Image src="/images/img-068.jpg" alt="DogHub箱根仙石原 愛犬グッズ・犬用雑貨セレクトショップ 厳選アイテムの販売コーナー" className="w-full h-auto block" width={600} height={400} />
          <div className="p-6 md:p-10">
            <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 400, letterSpacing: "1.6px" }}>GOODS</h3>
            <h4 className="text-[#311908] mb-4" style={{ fontSize: "clamp(16px, 2vw, 24px)", fontWeight: 400 }}>愛犬グッズやオーナー厳選の雑貨を販売</h4>
            <Link
              href="/cafe"
              className="flex items-center gap-2 text-black hover:text-[#B87942] transition-colors group"
              style={{ fontSize: "18px", fontWeight: 400, textAlign: "justify" }}
            >
              <span>詳しくはこちら</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
