export function Access() {
  return (
    <section className="py-32 px-6 bg-[#1A1A1A]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-20 items-start">
          <div>
            <p className="font-dm text-[#C49A3C] text-xs tracking-[0.4em] uppercase mb-8">
              ACCESS
            </p>
            <h2 className="font-playfair text-4xl font-bold text-white mb-14">
              アクセス
            </h2>

            <div className="space-y-10">
              <div>
                <p className="font-dm text-[#6B6B6B] text-xs uppercase tracking-[0.3em] mb-3">
                  住所
                </p>
                <p className="text-[#DDD8D0] text-sm leading-[1.9]">
                  〒250-0631<br />
                  神奈川県足柄下郡箱根町仙石原928-15
                </p>
              </div>

              <div>
                <p className="font-dm text-[#6B6B6B] text-xs uppercase tracking-[0.3em] mb-3">
                  電話 / メール
                </p>
                <a
                  href="tel:0460800290"
                  className="text-[#DDD8D0] text-sm hover:text-white transition-colors block"
                >
                  0460-80-0290
                </a>
                <a
                  href="mailto:info@dog-hub.shop"
                  className="text-[#6B6B6B] text-xs hover:text-white transition-colors mt-1 block"
                >
                  info@dog-hub.shop
                </a>
              </div>

              <div>
                <p className="font-dm text-[#6B6B6B] text-xs uppercase tracking-[0.3em] mb-3">
                  営業時間
                </p>
                <p className="text-[#DDD8D0] text-sm leading-[1.9]">
                  ドッグホテル：9:00〜17:00<br />
                  カフェ：11:00〜17:00
                </p>
                <p className="text-[#6B6B6B] text-xs mt-1">定休日：水曜・木曜</p>
                <p className="text-[#C49A3C] text-xs mt-2">早朝7:00〜お預かり対応（要事前連絡）</p>
              </div>

              <div>
                <p className="font-dm text-[#6B6B6B] text-xs uppercase tracking-[0.3em] mb-3">
                  交通アクセス
                </p>
                <p className="text-[#DDD8D0] text-sm leading-[1.9]">
                  箱根登山バス「仙石原」停より徒歩5分<br />
                  東名高速「御殿場IC」より車で約30分
                </p>
              </div>
            </div>
          </div>

          {/* Building exterior photo */}
          <div className="space-y-4">
            <div className="overflow-hidden">
              <img
                src="/images/img-071.jpg"
                alt="DogHub箱根仙石原 外観"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="aspect-[4/3]">
              <iframe
                src="https://www.google.com/maps?q=DogHub%E7%AE%B1%E6%A0%B9%E4%BB%99%E7%9F%B3%E5%8E%9F&ll=35.265472,139.011744&z=16&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="DogHub箱根仙石原 地図"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
