export function Concept() {
  return (
    <section className="py-12 md:py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div>
            <h2
              className="text-[#3C200F] mb-4 md:mb-6"
              style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 400, letterSpacing: "1.6px" }}
            >
              Concept
            </h2>
            <h3
              className="text-[#3C200F] mb-6 md:mb-10"
              style={{ fontSize: "clamp(20px, 2.5vw, 28.3px)", fontWeight: 400, lineHeight: "1.65" }}
            >
              わんちゃんといる幸せも、<br />
              箱根を満喫したいきもちも、<br />
              同時に叶えたい。
            </h3>
            <div className="space-y-6 text-[#311908]" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              <p>
                豊かな自然の恵みによる温泉、魅力的なホテルや旅館、美術館、
                飲食店といった施設が多くの観光客を惹きつける箱根。
                わんちゃんとともに訪れ、幸せな時間を過ごしたい愛犬家の方も
                多いのではないでしょうか。
              </p>
              <p>
                ところが、箱根ではすべての施設にわんちゃんが入れるわけではありません。
                利用したいホテルや飲食店が愛犬と入れない時、愛犬と泊まれる施設に
                空きがない時、箱根の楽しみをすこしでも我慢しなくてはいけなくなるのは、
                もったいない。かと言って、わんちゃんを屋外のリードにつないだり、
                車の中で待機させたりするなんて、考えられない。
              </p>
              <p>
                DogHub箱根仙石原は、<br />
                そんな愛犬家のみなさんが心ゆくまで箱根を満喫するための、<br />
                ハブとなるDOG HOTEL。
              </p>
            </div>
          </div>

          {/* Watercolor map */}
          <div>
            <img
              src="https://static.wixstatic.com/media/a21f47_f8d661d249284d19a6f0264043ed4b52~mv2.jpg/v1/fill/w_636,h_408,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/DogHubmap.jpg"
              alt="箱根仙石原エリアマップ"
              width={636}
              height={408}
              className="w-full h-auto"
              style={{ maxWidth: "636px" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
