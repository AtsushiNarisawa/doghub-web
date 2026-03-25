import Link from "next/link";
import Image from "next/image";

export function DogHotel() {
  return (
    <section className="py-12 md:py-20 px-6 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
          <div>
            <p className="text-[#311908] mb-3" style={{ fontSize: "20px", fontWeight: 400 }}>Service 01</p>
            <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 400, letterSpacing: "1.6px" }}>DOG HOTEL</h2>
            <h3 className="text-[#311908] mb-6" style={{ fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 400, lineHeight: "1.6" }}>
              一時預かりも、宿泊も対応できるドッグホテル
            </h3>
            <p className="text-[#8F7B65] mb-4" style={{ fontSize: "16px", fontWeight: 400 }}>箱根町で唯一のドッグホテルとなります。</p>
            <p className="text-[#3C200F] mb-4" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              ケージにずっと入れておくのではなく、完全個室とドッグランで
              わんちゃんにもリゾート気分を味わってもらう滞在を。
              愛犬が楽しく過ごしている間、飼い主様はお好きな旅館やホテルへ。
              「愛犬と泊まれる宿」に限定せず、箱根を自由に楽しめます。
            </p>
            <p className="text-[#3C200F] mb-8" style={{ fontSize: "16px", fontWeight: 400, lineHeight: "2" }}>
              例えば、一時預かりで温泉と、愛犬と散策をしたり、
              宿泊プランで愛犬との旅行中にゴルフなどを楽しんだり。
              当ホテルを活用して愛犬と箱根で充実した時間をお過ごしいただければと思います。
            </p>
            <div className="flex flex-col gap-4">
              <Link href="/service" className="flex items-center gap-2 text-black hover:text-[#B87942] transition-colors group" style={{ fontSize: "18px", fontWeight: 400, textAlign: "justify" }}>
                <span>詳しくはこちら</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/#model-case" className="flex items-center gap-2 text-black hover:text-[#B87942] transition-colors group" style={{ fontSize: "18px", fontWeight: 400, textAlign: "justify" }}>
                <span>モデルコースを見る</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          {/* Room photo */}
          <div>
            <Image src="/images/img-035.png" alt="箱根ペットホテル DogHub箱根仙石原の完全個室 犬がリラックスして過ごせる空間" className="w-full h-auto" width={600} height={400} style={{ maxWidth: "621px" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
