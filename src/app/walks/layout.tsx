import type { ReactNode } from "react";

/**
 * WanWalk (/walks/*) 用レイアウトスコープ。
 * DogHub本体のデザイントークンを保ったまま、WanWalk配下だけ
 * Wildboundsトーンのデザインシステム（深緑/明朝/Inter）を適用する。
 * トークン定義: src/app/globals.css (--color-ww-*, --font-ww-*)
 * 仕様書: /Users/atsushinarisawa/projects/wanwalk/DESIGN_TOKENS.md
 */
export default function WalksLayout({ children }: { children: ReactNode }) {
  return <div className="walks-root">{children}</div>;
}
