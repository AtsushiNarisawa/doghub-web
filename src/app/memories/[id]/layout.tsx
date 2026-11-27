import type { Metadata } from "next";

// 記念ショート動画の受け取りページ（お客様ご本人だけ・検索に出さない）
export const metadata: Metadata = {
  title: "思い出の動画・写真｜DogHub箱根仙石原",
  robots: { index: false, follow: false },
};

export default function MemoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
