import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_JP, DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ScrollToTop } from "@/components/scroll-to-top";
import { JsonLd } from "@/components/json-ld";

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
  title: "DogHub（ドッグハブ）| 箱根仙石原のプレミアムドッグホテル",
  description:
    "箱根仙石原のプレミアムドッグホテル。ゴルフ、温泉旅館、ユネッサンなど、愛犬を預けて心置きなく箱根を楽しめます。広いドッグランでワンちゃんも大満足。半日¥3,300〜、宿泊¥7,700〜。",
  metadataBase: new URL("https://dog-hub.shop"),
  icons: {
    icon: "https://static.wixstatic.com/media/a21f47_81c40c3955fe4490bf251cb04d7e4737~mv2.png/v1/fill/w_32,h_32,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a21f47_81c40c3955fe4490bf251cb04d7e4737~mv2.png",
    apple: "https://static.wixstatic.com/media/a21f47_81c40c3955fe4490bf251cb04d7e4737~mv2.png/v1/fill/w_180,h_180,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a21f47_81c40c3955fe4490bf251cb04d7e4737~mv2.png",
  },
  openGraph: {
    title: "DogHub（ドッグハブ）| 箱根仙石原のプレミアムドッグホテル",
    description: "箱根仙石原のプレミアムドッグホテル。愛犬を預けて心置きなく箱根を楽しめます。半日¥3,300〜、宿泊¥7,700〜。",
    url: "https://dog-hub.shop",
    siteName: "DogHub箱根仙石原",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://static.wixstatic.com/media/a21f47_01966bb1dd164cfa83b63d4e1e3a3cd0~mv2.jpg/v1/fill/w_1200,h_630,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/image.jpg",
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
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
