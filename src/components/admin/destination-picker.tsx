"use client";

import { useId } from "react";
import {
  DAY_DESTINATIONS,
  DAY_DESTINATIONS_4H,
  STAY_DESTINATIONS,
  DESTINATION_SUGGESTIONS,
} from "@/types/booking";

interface Props {
  /** プラン（"4h" | "8h" | "stay" | "spot" | ""）。候補チップの出し分けに使う */
  plan: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * 行き先入力UI（チップ＋datalist自動補完つきフリーテキスト）。
 * お客様フォーム step3-customer.tsx の方式を管理画面向けに流用したもの。
 * お客様フォーム側はこのコンポーネントを使わず現状維持（指示）。
 * datalist の id は同一ページで複数描画されても衝突しないよう useId で生成する。
 */
export function DestinationPicker({ plan, value, onChange }: Props) {
  const listId = useId();

  const quickButtons =
    plan === "stay"
      ? STAY_DESTINATIONS.filter((d) => d !== "未定" && d !== "その他（自由記入）")
      : plan === "4h"
        ? DAY_DESTINATIONS_4H.filter((d) => d !== "その他")
        : DAY_DESTINATIONS.filter((d) => d !== "その他");

  const allSuggestions = [
    ...DESTINATION_SUGGESTIONS,
    ...(plan === "stay"
      ? STAY_DESTINATIONS.filter((d) => d !== "未定" && d !== "その他（自由記入）")
      : []),
  ];

  return (
    <div>
      <input
        type="text"
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="施設名を入力（候補が表示されます）"
        className="w-full px-3 py-2.5 text-base border border-gray-200 rounded-xl bg-white focus:border-[#B87942] focus:outline-none"
      />
      <datalist id={listId}>
        {allSuggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <div className="flex flex-wrap gap-2 mt-3">
        {quickButtons.map((dest) => (
          <button
            key={dest}
            type="button"
            onClick={() => onChange(value === dest ? "" : dest)}
            className={`px-3 py-1.5 rounded-full text-[13px] border transition-all ${
              value === dest
                ? "bg-[#B87942] text-white border-[#B87942]"
                : "bg-white text-[#3C200F] border-gray-200 active:border-[#B87942]"
            }`}
          >
            {dest}
          </button>
        ))}
      </div>
    </div>
  );
}
