import Link from "next/link";

const cards = [
  {
    label: "FOR BEGINNER",
    ja: "初めての方へ",
    href: "/guide",
    img: "https://static.wixstatic.com/media/a21f47_588d384e8c654684b4056e8329fbd34b~mv2.jpg/v1/fill/w_960,h_720,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg",
  },
  {
    label: "ABOUT/ACCESS",
    ja: "店舗情報",
    href: "/access",
    img: "https://static.wixstatic.com/media/a21f47_f101ae93ae104f47b3e2a12a24d9c8f6~mv2.jpg/v1/fill/w_960,h_720,fp_0.50_0.57,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg",
  },
  {
    label: "RECCOMEND SPOT",
    ja: "箱根周辺おすすめスポット",
    href: "/spots",
    img: "https://static.wixstatic.com/media/a21f47_1265d1bf2e6241239bb3e1a9fde80253~mv2.jpg/v1/fill/w_960,h_720,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg",
  },
];

export function QuickNav() {
  return (
    <section className="grid md:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="relative h-56 md:h-72 overflow-hidden group"
        >
          <img
            src={card.img}
            alt={card.ja}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/45 group-hover:bg-black/55 transition-colors" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4 text-center">
            <p className="mb-2" style={{ fontSize: "clamp(20px, 3vw, 38.4px)", fontWeight: 400, letterSpacing: "2.7px" }}>{card.label}</p>
            <p style={{ fontSize: "clamp(13px, 1.5vw, 20px)", fontWeight: 400 }}>{card.ja}</p>
          </div>
        </Link>
      ))}
    </section>
  );
}
