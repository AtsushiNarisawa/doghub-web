import Link from "next/link";

export function CafeGoods() {
  return (
    <section className="bg-white border-t border-[#E5DDD8]">
      <div className="grid md:grid-cols-2">
        {/* OMUSUBI & SOUP CAFE */}
        <div>
          <img
            src="/images/img-070.jpg"
            alt="OMUSUBI & SOUP CAFE"
            className="w-full h-auto block"
          />
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
          <img
            src="/images/img-068.jpg"
            alt="GOODS"
            className="w-full h-auto block"
          />
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
