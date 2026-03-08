"use client";

import type { BookingStep } from "@/types/booking";

const STEPS = [
  { step: 1 as BookingStep, label: "プラン・日程" },
  { step: 2 as BookingStep, label: "ワンちゃん" },
  { step: 3 as BookingStep, label: "お客様情報" },
  { step: 4 as BookingStep, label: "確認・送信" },
];

export function StepIndicator({ current }: { current: BookingStep }) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      {STEPS.map(({ step, label }, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === current
                  ? "bg-[#B87942] text-white"
                  : step < current
                    ? "bg-[#B87942]/20 text-[#B87942]"
                    : "bg-[#E5DDD8] text-[#888]"
              }`}
            >
              {step < current ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            <span className={`text-[10px] mt-1 whitespace-nowrap ${
              step === current ? "text-[#B87942] font-medium" : "text-[#888]"
            }`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-[2px] mx-2 mt-[-12px] ${
              step < current ? "bg-[#B87942]/30" : "bg-[#E5DDD8]"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
