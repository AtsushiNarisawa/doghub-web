import type { Metadata } from "next";
import { Noto_Sans_JP, DM_Sans } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "DogHub箱根仙石原 | ドッグホテル・愛犬同伴カフェ",
  description:
    "箱根仙石原のドッグホテル。ゴルフ・温泉旅館・ユネッサンなど、愛犬を気にせず箱根を楽しめます。広いドッグランでワンちゃんも大満足。半日¥3,300〜、宿泊¥7,700〜。",
  metadataBase: new URL("https://dog-hub.shop"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
