import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5DDD8]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-[1fr_auto] gap-12">
          {/* Left: Brand + Info */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <img
                src="/images/img-046.png"
                alt="DogHub箱根仙石原"
                className="h-[50px] w-auto"
              />
            </Link>

            <p className="text-[#3C200F] mb-6" style={{ fontSize: "18px", fontWeight: 400 }}>
              DogHub箱根仙石原<br />ペットホテル ／ おむすび＆スープカフェ
            </p>

            <address className="not-italic space-y-1" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "2" }}>
              <a href="tel:0460800290" className="block text-[#8F7B65] hover:text-[#3C200F] transition-colors">
                0460-80-0290
              </a>
              <a href="mailto:info@dog-hub.shop" className="block text-[#8F7B65] hover:text-[#3C200F] transition-colors">
                info@dog-hub.shop
              </a>
              <p className="text-[#8F7B65]">神奈川県足柄下郡箱根町仙石原928-15</p>
              <p className="text-[#8F7B65]">
                ドッグホテル営業時間：午前9時〜午後5時<br />
                カフェ営業時間：午前11時〜午後5時<br />
                定休日：水曜・木曜
              </p>
            </address>

            {/* SNS */}
            <div className="flex gap-2 mt-6">
              <a
                href="https://www.instagram.com/doghub.hakone__/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8F7B65] hover:text-[#3C200F] transition-colors min-w-11 min-h-11 flex items-center justify-center"
                aria-label="Instagram"
              >
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61580635661602"
                className="text-[#8F7B65] hover:text-[#3C200F] transition-colors min-w-11 min-h-11 flex items-center justify-center"
                aria-label="Facebook"
              >
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Center: Site Navigation */}
          <div className="md:col-span-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-6 sm:gap-y-1">
              <div>
                <p className="text-[#3C200F] mb-3" style={{ fontSize: "14px", fontWeight: 400 }}>サービス</p>
                <nav className="flex flex-col gap-2">
                  <Link href="/service" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>お預かりサービス</Link>
                  <Link href="/4h" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>半日お預かり</Link>
                  <Link href="/8h" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>1日お預かり</Link>
                  <Link href="/stay" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>宿泊プラン</Link>
                  <Link href="/cafe" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>カフェ・グッズ販売</Link>
                  <Link href="/dogrun" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>ドッグラン</Link>
                </nav>
              </div>
              <div>
                <p className="text-[#3C200F] mb-3" style={{ fontSize: "14px", fontWeight: 400 }}>シーン別ガイド</p>
                <nav className="flex flex-col gap-2">
                  <Link href="/golf" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>ゴルフ × ペットホテル</Link>
                  <Link href="/yunessun" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>ユネッサン × ペット預かり</Link>
                  <Link href="/onsen" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>温泉 × ペット預かり</Link>
                  <Link href="/museum" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>美術館 × ペット預かり</Link>
                  <Link href="/ryokan" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>高級旅館 × ペットホテル</Link>
                </nav>
              </div>
              <div>
                <p className="text-[#3C200F] mb-3" style={{ fontSize: "14px", fontWeight: 400 }}>ご利用案内</p>
                <nav className="flex flex-col gap-2">
                  <Link href="/guide" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>はじめてガイド</Link>
                  <Link href="/guide/hakone-dog" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>箱根犬連れガイド</Link>
                  <Link href="/faq" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>よくある質問</Link>
                  <Link href="/spots" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>おすすめスポット</Link>
                  <Link href="/access" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>店舗情報</Link>
                  <Link href="/news" className="text-[#8F7B65] hover:text-[#3C200F] transition-colors" style={{ fontSize: "13px" }}>お知らせ</Link>
                </nav>
              </div>
            </div>
            <div className="mt-6">
              <a
                href="/booking"
                className="inline-flex items-center gap-2 border border-[#3C200F] text-[#3C200F] px-8 py-4 min-h-11 hover:bg-[#3C200F] hover:text-white transition-colors"
                style={{ fontSize: "16px", fontWeight: 400 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>ご予約はこちら</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E5DDD8] py-5 px-6">
        <p className="text-center text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400 }}>
          Copyright © 2026 DogHub箱根仙石原
        </p>
      </div>
    </footer>
  );
}

export default Footer;
