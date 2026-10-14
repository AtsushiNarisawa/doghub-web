"use client";

import { useEffect } from "react";
import { PARTNER_STORAGE_KEY } from "@/lib/partners";

// 提携先専用ページを開いたことを、そのタブのあいだ覚えておく。
// ヘッダー・フッターなど ?partner= の付かない予約ボタンから進んでも、
// 予約フォームが提携先の行き先ときっかけを埋められるようにするため。
export function PartnerMemory({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      sessionStorage.setItem(PARTNER_STORAGE_KEY, slug);
    } catch {
      /* sessionStorage 利用不可時は無視（?partner= 付きのボタンは引き続き効く） */
    }
  }, [slug]);
  return null;
}
