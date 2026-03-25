import Image from "next/image";
const stats = [
  { num: "4.8", label: "Googleレビュー評価" },
  { num: "19", label: "最大お部屋数" },
  { num: "7:00", label: "早朝受付開始" },
];

export function About() {
  return (
    <section className="py-32 px-6 bg-[#F7F5F0]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 lg:gap-32 items-center">
          <div>
            <p className="font-dm text-[#2A5C45] text-xs tracking-[0.4em] uppercase mb-8">
              CONCEPT
            </p>
            <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-[#1A1A1A] leading-[1.1] mb-8">
              わんちゃんといる幸せも、<br />
              <em className="not-italic text-[#2A5C45]">箱根を満喫したい</em><br />
              きもちも、同時に叶えたい。
            </h2>
            <div className="space-y-5 text-[#6B6B6B] text-base leading-[1.9]">
              <p>
                温泉、旅館、美術館——すべての施設にわんちゃんが入れるわけではない箱根で、
                箱根の楽しみをすこしでも我慢しなくてはいけなくなるのは、もったいない。
              </p>
              <p>
                DogHub箱根仙石原は、そんな愛犬家のみなさんが心ゆくまで
                箱根を満喫するための、ハブとなるDOG HOTEL。
                愛犬と一緒に箱根旅を、もっと自由に。
              </p>
            </div>

            <div className="mt-12 pt-12 border-t border-[#DDD8D0] grid grid-cols-3 gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-playfair font-dm text-3xl font-bold text-[#2A5C45] mb-1">
                    {stat.num}
                  </p>
                  <p className="text-[#6B6B6B] text-xs leading-relaxed">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Watercolor map illustration */}
          <div className="relative">
            <div className="overflow-hidden relative bg-[#faf8f4]">
              <Image src="/images/img-077.jpg" alt="箱根仙石原エリアマップ" className="w-full h-auto object-cover" width={700} height={400} priority />
            </div>
            <div className="absolute -bottom-6 -left-6 w-40 h-40 border border-[#C49A3C]/20 -z-10" />
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#2A5C45]/5 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
