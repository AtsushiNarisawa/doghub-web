const photos = [
  { src: "https://static.wixstatic.com/media/a21f47_1265d1bf2e6241239bb3e1a9fde80253~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原のわんちゃんたち" },
  { src: "https://static.wixstatic.com/media/a21f47_ab7635bb755e43628221af0ee82c0a2a~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原のグッズ" },
  { src: "https://static.wixstatic.com/media/a21f47_a01f23ce17024a6aa0c003ad11d46fec~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原のグッズ" },
  { src: "https://static.wixstatic.com/media/a21f47_24dc2a93f2e54993ba1e3281d6e8a030~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原の受付" },
  { src: "https://static.wixstatic.com/media/a21f47_a357387cbb9843319939bdec9ca895d1~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原の外観" },
  { src: "https://static.wixstatic.com/media/a21f47_01966bb1dd164cfa83b63d4e1e3a3cd0~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原のカフェ" },
  { src: "https://static.wixstatic.com/media/a21f47_61ce9f01e12a439db42eae4513b3f763~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原のおにぎり" },
  { src: "https://static.wixstatic.com/media/a21f47_daa029874bc6459ba1d444e83599bb60~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原のグッズ" },
  { src: "https://static.wixstatic.com/media/a21f47_a4040d8f3f8d47c8ae08475c7917b51a~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原のグッズ" },
  { src: "https://static.wixstatic.com/media/a21f47_6075240ed77f4ab1ad6c406ae3c7833d~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原のおあずかりスペース" },
  { src: "https://static.wixstatic.com/media/a21f47_4750d26572c244a9af6d9a226718e1a0~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原の店内" },
  { src: "https://static.wixstatic.com/media/a21f47_f101ae93ae104f47b3e2a12a24d9c8f6~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原の外観" },
  { src: "https://static.wixstatic.com/media/a21f47_a6fb8037fb0f4ba197f970800f3c7a81~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原のグッズ" },
  { src: "https://static.wixstatic.com/media/a21f47_2e12dda0e5564cd0b5849f80ca0e2750~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原の外観" },
  { src: "https://static.wixstatic.com/media/a21f47_bfe92fc124bb452c9a620c70042907d8~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原" },
  { src: "https://static.wixstatic.com/media/a21f47_58d7d5d2d40a4c95a8d23b362e4ad694~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原" },
  { src: "https://static.wixstatic.com/media/a21f47_eec4c70f358e4e06acee9df0e83fd96a~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原のカフェの商品" },
  { src: "https://static.wixstatic.com/media/a21f47_57b05fba0d8d434b92c073193341c680~mv2.png/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.png", alt: "DogHub箱根仙石原の愛犬預かりの様子" },
  { src: "https://static.wixstatic.com/media/a21f47_588d384e8c654684b4056e8329fbd34b~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原のお預かりスペース" },
  { src: "https://static.wixstatic.com/media/a21f47_f8d661d249284d19a6f0264043ed4b52~mv2.jpg/v1/fill/w_368,h_276,q_90,enc_avif,quality_auto/image.jpg", alt: "DogHub箱根仙石原マップ" },
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
          <img
            key={i}
            src={photo.src}
            alt={photo.alt}
            width={368}
            height={276}
            className="flex-shrink-0 object-cover"
            style={{ width: "368px", height: "276px" }}
          />
        ))}
      </div>
    </section>
  );
}
