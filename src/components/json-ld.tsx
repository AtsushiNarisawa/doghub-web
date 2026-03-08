export function JsonLd() {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "PetBoarding",
    name: "DogHub箱根仙石原",
    alternateName: "ドッグハブ箱根仙石原",
    description:
      "箱根仙石原のプレミアムドッグホテル。24時間スタッフ常駐・完全個室・ドッグラン併設。半日¥3,300〜、宿泊¥7,700〜。",
    url: "https://dog-hub.shop",
    telephone: "0460-80-0290",
    email: "info@dog-hub.shop",
    address: {
      "@type": "PostalAddress",
      streetAddress: "仙石原928-15",
      addressLocality: "箱根町",
      addressRegion: "神奈川県",
      postalCode: "250-0631",
      addressCountry: "JP",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.265472,
      longitude: 139.011744,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday", "Saturday", "Sunday", "Monday", "Tuesday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    priceRange: "¥1,100〜¥7,700",
    image: "https://dog-hub.shop/images/img-002.jpg",
    sameAs: [
      "https://www.instagram.com/doghub.hakone__/",
      "https://www.facebook.com/profile.php?id=61580635661602",
    ],
    hasMap: "https://maps.google.com/?cid=11065780530432656629",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
    />
  );
}
