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
      latitude: 35.2667,
      longitude: 139.0253,
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
    image:
      "/images/img-002.jpg",
    sameAs: [
      "https://www.instagram.com/doghub_hakone/",
      "https://www.facebook.com/doghubhakone",
    ],
    hasMap: "https://maps.google.com/?cid=11065780530432656629",
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "予約は必要ですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい、事前予約制です。前日17時までにオンラインまたはお電話（0460-80-0290）でご予約ください。",
        },
      },
      {
        "@type": "Question",
        name: "大型犬も預けられますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "体重15kg未満のわんちゃんは即時確定でお預かり可能です。15kg以上の場合はスタッフ確認の上、仮予約として対応させていただきます。",
        },
      },
      {
        "@type": "Question",
        name: "料金プランを教えてください",
        acceptedAnswer: {
          "@type": "Answer",
          text: "半日お預かり（4時間）¥3,300、1日お預かり（8時間）¥5,500、宿泊（1泊）¥7,700〜、スポット利用（1時間）¥1,100です。",
        },
      },
      {
        "@type": "Question",
        name: "駐車場はありますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい、店舗前に無料駐車場をご用意しています。",
        },
      },
      {
        "@type": "Question",
        name: "定休日はいつですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "水曜・木曜が定休日です。ドッグホテルの営業時間は午前9時〜午後5時、カフェは午前11時〜午後5時です。",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}
