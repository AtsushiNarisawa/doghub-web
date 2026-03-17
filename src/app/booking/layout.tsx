import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "オンライン予約｜DogHub箱根仙石原 ペットホテル",
  description:
    "DogHub箱根仙石原のオンライン予約。24時間受付・前日17時まで予約可能。半日¥3,300〜、宿泊¥7,700〜。リピーター情報自動入力で簡単予約。",
  alternates: { canonical: "/booking" },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
