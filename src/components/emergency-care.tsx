// お預かり中に体調を崩したときの体制。
// 2026-08-09 アニマルクリニック仙石原との提携開始にあわせて新設。
// ⚠️ 文言の注意: 提携で取り決めたのは「お預かり中の急病時に診てもらえる」ことのみ。
//    クリニックは24時間対応ではないため、「診療時間内であれば」を必ず添える。
//    先方の診療時間・電話番号はこちらに転記しない（変更に追随できず古い情報を出す事故になる）。
//    同じ趣旨の文言が /faq・/guide/pet-hotel-tips・/beginner・lib/line-faq.ts にもあるため、
//    修正時は「アニマルクリニック仙石原」で grep して全面を揃えること。

const STEPS = [
  {
    num: "01",
    title: "24時間常駐のスタッフが気づく",
    body: "夜間も宿直スタッフがおり、ライブカメラとあわせて随時見守っています。食欲や様子の変化にも気を配ります。",
  },
  {
    num: "02",
    title: "飼い主様へご連絡します",
    body: "異変を確認した時点で、飼い主様にお電話でご連絡します。ご旅行中でも、状況を共有しながら対応を決めさせていただきます。",
  },
  {
    num: "03",
    title: "診療時間内であれば提携クリニックへ",
    body: "アニマルクリニック仙石原と提携しています。クリニックの診療時間内であれば、ご相談・受診いたします。",
  },
];

export function EmergencyCare({ bg = "white" }: { bg?: "white" | "gray" }) {
  return (
    <section className={`py-16 px-6 ${bg === "gray" ? "bg-[#F7F7F7]" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[#3C200F] mb-4" style={{ fontSize: "26px", fontWeight: 400 }}>
          万が一、体調を崩したときは
        </h2>
        <p className="text-[#3C200F] mb-8" style={{ fontSize: "15px", fontWeight: 400, lineHeight: "1.9" }}>
          知らない土地に愛犬を預けるとき、いちばん気がかりなのは「何かあったらどうなるのか」だと思います。
          DogHub箱根仙石原は、車で4分の場所にあるアニマルクリニック仙石原と提携しています。
        </p>

        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          {STEPS.map((step) => (
            <div key={step.num} className="border border-[#E5DDD8] bg-white p-6">
              <span className="text-[#B87942] block mb-2" style={{ fontSize: "24px", fontWeight: 400 }}>
                {step.num}
              </span>
              <h3 className="text-[#3C200F] mb-3" style={{ fontSize: "17px", fontWeight: 400 }}>
                {step.title}
              </h3>
              <p className="text-[#8F7B65]" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <div className="border border-[#E5DDD8] bg-white p-6">
          <p className="text-[#B87942] mb-2" style={{ fontSize: "12px", fontWeight: 400, letterSpacing: "1px" }}>
            提携動物病院
          </p>
          <h3 className="text-[#3C200F] mb-2" style={{ fontSize: "18px", fontWeight: 400 }}>
            アニマルクリニック仙石原
          </h3>
          <p className="text-[#8F7B65] mb-4" style={{ fontSize: "14px", fontWeight: 400, lineHeight: "1.8" }}>
            神奈川県足柄下郡箱根町仙石原／DogHubから車で4分。同じ仙石原エリアにある動物病院です。
            診療時間・休診日は、クリニックの公式サイトをご確認ください。
          </p>
          <a
            href="https://ac-sengokuhara.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-[#3C200F] text-[#3C200F] px-6 py-2 hover:bg-[#3C200F] hover:text-white transition-colors"
            style={{ fontSize: "14px", fontWeight: 400 }}
          >
            アニマルクリニック仙石原 公式サイト
          </a>
        </div>

        <p className="text-[#8F7B65] mt-6" style={{ fontSize: "13px", fontWeight: 400, lineHeight: "1.8" }}>
          ※クリニックは24時間対応ではありません。夜間や診療時間外は、24時間常駐のスタッフが見守りながら、
          飼い主様と連絡を取り合って対応いたします。いつでも受診できる体制ではない点は、あらかじめご了承ください。
        </p>
      </div>
    </section>
  );
}
