"use client";

// 予約フォームの日付カレンダー（見た目だけを担当する部品）。
//
// もともとチェックイン日だけがこのカレンダーで、チェックアウト日は素の
// <input type="date"> だった。そのため休業日や満室日も一度は選べてしまい、
// 選んだあとに赤字のエラーが出る、という後出しの案内になっていた（総点検 #19）。
// 部品を1つに揃えて、チェックイン日・チェックアウト日の両方で同じ見た目・
// 同じ操作感にしている。
//
// 「その日を選べるか」「○△×のどれか」といった判断はこの部品では一切持たず、
// 呼び出し元（step1-plan.tsx）が getDayState で渡す。カレンダーの流儀を
// 2つに増やさないための分担。

import { useState } from "react";
import { HOLIDAYS } from "@/lib/holidays";

const WDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export type CalendarDayState = {
  /** 選べないマス（休業日・受付範囲外・満席など） */
  disabled: boolean;
  /** 空き状況マーク。null なら何も出さない */
  mark: "ok" | "low" | "full" | null;
  /** 休業日（グレー表示にする） */
  closed: boolean;
};

interface Props {
  /** 選択中の日付 "YYYY-MM-DD"（未選択は空文字） */
  value: string;
  onSelect: (dateStr: string) => void;
  /** 各マスの状態を返す。呼び出し元が業務ルールを持つ */
  getDayState: (dateStr: string) => CalendarDayState;
  /** JST の今日 "YYYY-MM-DD"（今日のマスを強調するためだけに使う） */
  todayStr: string;
  /** 最初に表示する月の基準日 "YYYY-MM-DD"（省略時は todayStr） */
  initialMonthDate?: string;
  /** カレンダー下の凡例（不要なら省略） */
  legend?: React.ReactNode;
}

/** "YYYY-MM-DD" → その月の1日を指すローカル Date（月送りの基準にのみ使う） */
function monthOf(dateStr: string): { year: number; month: number } {
  const [y, m] = dateStr.split("-").map(Number);
  return { year: y, month: (m || 1) - 1 };
}

export function BookingCalendar({
  value,
  onSelect,
  getDayState,
  todayStr,
  initialMonthDate,
  legend,
}: Props) {
  const [calMonth, setCalMonth] = useState(() =>
    monthOf(value || initialMonthDate || todayStr)
  );

  // 表示中の月のマス（前月・翌月のはみ出し分を含む）
  const first = new Date(calMonth.year, calMonth.month, 1);
  const startDay = new Date(first);
  startDay.setDate(1 - first.getDay());
  const last = new Date(calMonth.year, calMonth.month + 1, 0);
  const endDay = new Date(last);
  endDay.setDate(last.getDate() + (6 - last.getDay()));
  const days: Date[] = [];
  const cursor = new Date(startDay);
  while (cursor <= endDay) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const fmtD = (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;

  return (
    <div className="bg-white rounded-xl border-2 border-[#E5DDD8] p-3">
      {/* 月ナビ */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          aria-label="前の月"
          onClick={() =>
            setCalMonth((p) => {
              let m = p.month - 1;
              let y = p.year;
              if (m < 0) {
                m = 11;
                y--;
              }
              return { year: y, month: m };
            })
          }
          className="p-1.5 text-[#888] active:text-[#3C200F]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium">
          {calMonth.year}年{calMonth.month + 1}月
        </span>
        <button
          type="button"
          aria-label="次の月"
          onClick={() =>
            setCalMonth((p) => {
              let m = p.month + 1;
              let y = p.year;
              if (m > 11) {
                m = 0;
                y++;
              }
              return { year: y, month: m };
            })
          }
          className="p-1.5 text-[#888] active:text-[#3C200F]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WDAYS.map((w, i) => (
          <div
            key={i}
            className={`text-center text-[11px] font-medium py-1 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-[#888]"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((date) => {
          const dateStr = fmtD(date);
          const isThisMonth = date.getMonth() === calMonth.month;
          const state = isThisMonth
            ? getDayState(dateStr)
            : { disabled: true, mark: null, closed: false };
          const holiday = HOLIDAYS[dateStr];
          const isSelected = dateStr === value;
          const isToday = dateStr === todayStr;
          const isDisabled = !isThisMonth || state.disabled;

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(dateStr)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${
                isSelected
                  ? "bg-[#B87942] text-white font-medium"
                  : !isThisMonth
                    ? "text-[#ccc]"
                    : isDisabled
                      ? "text-[#ccc] bg-gray-50"
                      : isToday
                        ? "bg-[#B87942]/10 text-[#B87942] font-bold"
                        : holiday
                          ? "text-orange-500 active:bg-orange-50"
                          : date.getDay() === 0
                            ? "text-red-400 active:bg-red-50"
                            : date.getDay() === 6
                              ? "text-blue-400 active:bg-blue-50"
                              : "text-[#3C200F] active:bg-[#F8F5F0]"
              }`}
            >
              <span className="leading-none">{date.getDate()}</span>
              {/* 空き状況マーク（選択中のマスには出さない） */}
              {state.mark && !isSelected && (
                <span
                  className={`text-[9px] leading-none mt-0.5 ${
                    state.mark === "full"
                      ? "text-red-500"
                      : state.mark === "low"
                        ? "text-orange-500"
                        : "text-green-600"
                  }`}
                >
                  {state.mark === "full" ? "×" : state.mark === "low" ? "△" : "○"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {legend && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-[#888]">{legend}</div>
      )}
    </div>
  );
}
