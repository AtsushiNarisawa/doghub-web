import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Noto_Sans_JP, DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ScrollToTop } from "@/components/scroll-to-top";
import { MobileCta } from "@/components/mobile-cta";
import { JsonLd } from "@/components/json-ld";
import { GtmPageView } from "@/components/gtm-page-view";

const GTM_ID = "GTM-NMCHVJ7K";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "箱根で犬の預かり・ホテルならDogHub箱根仙石原｜半日¥3,300〜",
  description:
    "箱根で犬を預けるならDogHub箱根仙石原。犬の一時預かり半日¥3,300〜、宿泊¥7,700〜。ゴルフ・温泉・美術館の間に愛犬をお預け。24時間スタッフ常駐・完全個室。",
  metadataBase: new URL("https://dog-hub.shop"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "箱根で犬の預かり・ホテルならDogHub箱根仙石原｜半日¥3,300〜",
    description: "箱根で犬を預けるならDogHub箱根仙石原。犬の一時預かり半日¥3,300〜、宿泊¥7,700〜。24時間スタッフ常駐・完全個室・ドッグラン併設。",
    url: "https://dog-hub.shop",
    siteName: "DogHub箱根仙石原",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DogHub箱根仙石原 ペットホテル",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      </head>
      <body className={`${notoSansJP.variable} ${dmSans.variable} ${playfairDisplay.variable}`}>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <JsonLd />
        <Suspense fallback={null}>
          <GtmPageView />
        </Suspense>
        {children}
        <MobileCta />
        <ScrollToTop />
      </body>
    </html>
  );
}
