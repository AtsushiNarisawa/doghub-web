import Image from "next/image";
const photos = [
  { src: "/images/img-010.jpg", alt: "DogHub箱根仙石原のわんちゃんたち" },
  { src: "/images/img-061.jpg", alt: "DogHub箱根仙石原のグッズ" },
  { src: "/images/img-055.jpg", alt: "DogHub箱根仙石原のグッズ" },
  { src: "/images/img-018.jpg", alt: "DogHub箱根仙石原の受付" },
  { src: "/images/img-056.jpg", alt: "DogHub箱根仙石原の外観" },
  { src: "/images/img-004.jpg", alt: "DogHub箱根仙石原のカフェ" },
  { src: "/images/img-042.jpg", alt: "DogHub箱根仙石原のおにぎり" },
  { src: "/images/img-067.jpg", alt: "DogHub箱根仙石原のグッズ" },
  { src: "/images/img-058.jpg", alt: "DogHub箱根仙石原のグッズ" },
  { src: "/images/img-041.jpg", alt: "DogHub箱根仙石原のおあずかりスペース" },
  { src: "/images/img-029.jpg", alt: "DogHub箱根仙石原の店内" },
  { src: "/images/img-073.jpg", alt: "DogHub箱根仙石原の外観" },
  { src: "/images/img-059.jpg", alt: "DogHub箱根仙石原のグッズ" },
  { src: "/images/img-023.jpg", alt: "DogHub箱根仙石原の外観" },
  { src: "/images/img-062.jpg", alt: "DogHub箱根仙石原" },
  { src: "/images/img-039.jpg", alt: "DogHub箱根仙石原" },
  { src: "/images/img-069.jpg", alt: "DogHub箱根仙石原のカフェの商品" },
  { src: "/images/img-034.png", alt: "DogHub箱根仙石原の愛犬預かりの様子" },
  { src: "/images/img-037.jpg", alt: "DogHub箱根仙石原のお預かりスペース" },
  { src: "/images/img-076.jpg", alt: "DogHub箱根仙石原マップ" },
];

export function PhotoGallery() {
  // Duplicate for seamless infinite scroll
  const allPhotos = [...photos, ...photos];

  return (
    <section className="bg-white overflow-hidden py-0">
      <style>{`
        @keyframes scroll-gallery {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${photos.length * 378}px); }
        }
        .gallery-track {
          display: flex;
          gap: 10px;
          animation: scroll-gallery ${photos.length * 2}s linear infinite;
          width: max-content;
        }
      `}</style>
      <div className="gallery-track">
        {allPhotos.map((photo, i) => (
          <Image key={i} src={photo.src} alt="" className="flex-shrink-0 object-cover" width={700} height={400} priority style={{ width: "368px", height: "276px" }} />
        ))}
      </div>
    </section>
  );
}
