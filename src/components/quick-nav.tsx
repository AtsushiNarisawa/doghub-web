import Link from "next/link";

const cards = [
  {
    label: "FOR BEGINNER",
    ja: "初めての方へ",
    href: "/guide",
    img: "/images/img-038.jpg",
  },
  {
    label: "ABOUT/ACCESS",
    ja: "店舗情報",
    href: "/access",
    img: "/images/img-074.jpg",
  },
  {
    label: "RECCOMEND SPOT",
    ja: "箱根周辺おすすめスポット",
    href: "/spots",
    img: "/images/img-013.jpg",
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
