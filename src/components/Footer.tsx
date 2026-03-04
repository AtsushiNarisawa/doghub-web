import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-[#F7F5F0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="font-dm font-bold text-2xl tracking-tight mb-1">
              Dog<span className="text-[#C49A3C]">Hub</span>
            </div>
            <p className="text-[#6B6B6B] text-sm mb-4">箱根仙石原</p>
            <p className="text-sm text-[#6B6B6B] leading-relaxed">
              箱根でワンちゃんと過ごす、<br />
              新しい旅のかたち。
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs text-[#6B6B6B] uppercase tracking-widest mb-4">サービス</h3>
            <ul className="space-y-2">
              {[
                { label: "お預かりサービス", href: "/service" },
                { label: "半日プラン（4時間）", href: "/4h" },
                { label: "1日プラン（8時間）", href: "/8h" },
                { label: "宿泊プラン", href: "/stay" },
                { label: "OMUSUBI & SOUP CAFE", href: "/cafe" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-[#DDD8D0] hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-xs text-[#6B6B6B] uppercase tracking-widest mb-4">施設情報</h3>
            <address className="not-italic text-sm text-[#DDD8D0] space-y-2">
              <p>神奈川県足柄下郡箱根町<br />仙石原817-360</p>
              <p>
                <a href="tel:0460838523" className="hover:text-white transition-colors">
                  0460-83-8523
                </a>
              </p>
              <p>営業時間：9:00〜17:00<br />定休日：水曜・木曜</p>
              <p className="text-[#6B6B6B] text-xs">早朝7:00〜お預かり対応</p>
            </address>
          </div>
        </div>

        <div className="border-t border-[#333] pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#6B6B6B]">
            © 2024 DogHub箱根仙石原. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-[#6B6B6B]">
            <Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-white transition-colors">利用規約</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
