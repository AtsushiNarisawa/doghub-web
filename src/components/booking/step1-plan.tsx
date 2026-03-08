"use client";

import { useEffect, useState } from "react";
import type { BookingFormData } from "@/types/booking";
import { PLANS, DESTINATIONS } from "@/types/booking";
import { supabase } from "@/lib/supabase";

interface Props {
  form: BookingFormData;
  onChange: (form: BookingFormData) => void;
  onNext: () => void;
}

interface CapacityInfo {
  stay_remaining: number;
  day_remaining: number;
  closed: boolean;
}

export function Step1Plan({ form, onChange, onNext }: Props) {
  const [capacity, setCapacity] = useState<CapacityInfo | null>(null);
  const [loadingCapacity, setLoadingCapacity] = useState(false);

  // 受付期限チェック: 前日17時まで
  const getMinDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (now.getHours() >= 17) {
      today.setDate(today.getDate() + 2);
    } else {
      today.setDate(today.getDate() + 1);
    }
    return today.toISOString().split("T")[0];
  };

  // 定休日チェック（水曜・木曜）
  const isClosedDay = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    return day === 3 || day === 4;
  };

  useEffect(() => {
    if (!form.date) {
      setCapacity(null);
      return;
    }
    const fetchCapacity = async () => {
      setLoadingCapacity(true);
      const { data } = await supabase
        .from("daily_capacity")
        .select("*")
        .eq("date", form.date)
        .maybeSingle();

      if (data) {
        setCapacity({
          stay_remaining: data.stay_limit - data.stay_booked,
          day_remaining: data.day_limit - data.day_booked,
          closed: data.closed,
        });
      } else {
        setCapacity({ stay_remaining: 10, day_remaining: 9, closed: false });
      }
      setLoadingCapacity(false);
    };
    fetchCapacity();
  }, [form.date]);

  const selectedPlan = PLANS.find((p) => p.id === form.plan);

  // チェックイン時間の選択肢を生成
  const getTimeOptions = () => {
    if (!selectedPlan) return [];
    const isEarly = form.early_morning && selectedPlan.earlyMorning;
    const startHour = isEarly ? 7 : parseInt(selectedPlan.checkinRange.start);
    const endHour = parseInt(selectedPlan.checkinRange.end);
    // 8hプランの通常 start=09, end=09 → 1枠のみ
    const actualEnd = endHour < startHour ? startHour : endHour;

    const options: string[] = [];
    for (let h = startHour; h <= actualEnd; h++) {
      options.push(`${String(h).padStart(2, "0")}:00`);
      if (h < actualEnd) options.push(`${String(h).padStart(2, "0")}:30`);
    }
    return options;
  };

  const canProceed =
    form.plan &&
    form.date &&
    form.checkin_time &&
    form.destination &&
    !isClosedDay(form.date) &&
    capacity &&
    !capacity.closed &&
    (form.plan === "stay" ? capacity.stay_remaining > 0 && form.checkout_date : true) &&
    (form.plan !== "stay" ? capacity.day_remaining > 0 : true);

  return (
    <div className="space-y-6">
      {/* プラン選択 */}
      <div>
        <h2 className="text-lg font-medium mb-3">プランを選択</h2>
        <div className="space-y-3">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() =>
                onChange({
                  ...form,
                  plan: plan.id,
                  checkin_time: "",
                  checkout_date: "",
                  early_morning: false,
                })
              }
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                form.plan === plan.id
                  ? "border-[#B87942] bg-[#B87942]/5"
                  : "border-[#E5DDD8] bg-white active:bg-[#F8F5F0]"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-[15px]">{plan.name}</p>
                  <p className="text-[13px] text-[#888] mt-1">{plan.description}</p>
                  {plan.checkoutInfo && (
                    <p className="text-[12px] text-[#B87942] mt-1">{plan.checkoutInfo}</p>
                  )}
                </div>
                <p className="text-[#B87942] font-medium whitespace-nowrap ml-3">
                  ¥{plan.basePrice.toLocaleString()}{plan.priceUnit || ""}〜
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 行き先（マーケティング用） */}
      {form.plan && (
        <div>
          <h2 className="text-lg font-medium mb-2">お預かり中の行き先</h2>
          <p className="text-[12px] text-[#888] mb-3">
            おすすめ情報のご案内に活用させていただきます
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DESTINATIONS.map((dest) => (
              <button
                key={dest}
                type="button"
                onClick={() => onChange({ ...form, destination: dest })}
                className={`py-2.5 px-3 rounded-lg text-[13px] transition-all text-left ${
                  form.destination === dest
                    ? "bg-[#B87942] text-white"
                    : "bg-[#F8F5F0] text-[#3C200F] active:bg-[#E5DDD8]"
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 日付選択 */}
      {form.plan && form.destination && (
        <div>
          <h2 className="text-lg font-medium mb-3">日程を選択</h2>
          <input
            type="date"
            value={form.date}
            min={getMinDate()}
            onChange={(e) => onChange({ ...form, date: e.target.value })}
            className="w-full p-4 rounded-xl border-2 border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
          />
          {form.date && isClosedDay(form.date) && (
            <p className="text-red-500 text-sm mt-2">
              水曜・木曜は定休日です。別の日程をお選びください。
            </p>
          )}
          {capacity?.closed && (
            <p className="text-red-500 text-sm mt-2">
              この日は臨時休業です。別の日程をお選びください。
            </p>
          )}
          {capacity && !capacity.closed && form.date && !isClosedDay(form.date) && (
            <div className="flex gap-3 mt-2">
              <span className={`text-sm ${
                capacity.day_remaining <= 2 ? "text-orange-500" : "text-[#888]"
              }`}>
                日帰り: 残り{capacity.day_remaining}枠
              </span>
              <span className={`text-sm ${
                capacity.stay_remaining <= 2 ? "text-orange-500" : "text-[#888]"
              }`}>
                宿泊: 残り{capacity.stay_remaining}枠
              </span>
            </div>
          )}
          {loadingCapacity && (
            <p className="text-[#888] text-sm mt-2">空き状況を確認中...</p>
          )}
        </div>
      )}

      {/* 早朝プラン（日帰りプランのみ） */}
      {selectedPlan?.earlyMorning && form.date && !isClosedDay(form.date) && capacity && !capacity.closed && (
        <label className="flex items-center gap-3 p-4 rounded-xl bg-[#F8F5F0]">
          <input
            type="checkbox"
            checked={form.early_morning}
            onChange={(e) => onChange({ ...form, early_morning: e.target.checked, checkin_time: "" })}
            className="w-5 h-5 rounded accent-[#B87942]"
          />
          <div>
            <span className="text-sm font-medium">早朝プラン（7:00〜）</span>
            <p className="text-[12px] text-[#888] mt-0.5">
              ゴルフの朝など、7:00からお預かりします
            </p>
          </div>
        </label>
      )}

      {/* チェックイン時間 */}
      {form.plan && form.date && !isClosedDay(form.date) && capacity && !capacity.closed && (
        <div>
          <h2 className="text-lg font-medium mb-3">チェックイン時間</h2>
          <p className="text-[13px] text-[#888] mb-2">
            {form.early_morning && selectedPlan?.earlyMorning
              ? "7:00"
              : selectedPlan?.checkinRange.start
            }
            〜{selectedPlan?.checkinRange.end}の間でお選びください
          </p>
          <div className="grid grid-cols-4 gap-2">
            {getTimeOptions().map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onChange({ ...form, checkin_time: time })}
                className={`py-3 rounded-lg text-sm font-medium transition-all ${
                  form.checkin_time === time
                    ? "bg-[#B87942] text-white"
                    : "bg-[#F8F5F0] text-[#3C200F] active:bg-[#E5DDD8]"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          <p className="text-[13px] text-[#888] mt-2">
            お引き取り最終: 17:00 / 超過料金: ¥1,100/時間
          </p>
        </div>
      )}

      {/* チェックアウト日（宿泊のみ） */}
      {form.plan === "stay" && form.date && form.checkin_time && (
        <div>
          <h2 className="text-lg font-medium mb-3">チェックアウト日</h2>
          <p className="text-[13px] text-[#888] mb-2">
            チェックアウト時間: 9:00〜11:00
          </p>
          <input
            type="date"
            value={form.checkout_date}
            min={(() => {
              const d = new Date(form.date);
              d.setDate(d.getDate() + 1);
              return d.toISOString().split("T")[0];
            })()}
            onChange={(e) => onChange({ ...form, checkout_date: e.target.value })}
            className="w-full p-4 rounded-xl border-2 border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
          />
        </div>
      )}

      {/* 次へボタン */}
      <button
        type="button"
        disabled={!canProceed}
        onClick={onNext}
        className={`w-full py-4 rounded-xl text-base font-medium transition-all ${
          canProceed
            ? "bg-[#B87942] text-white active:bg-[#A06830]"
            : "bg-[#E5DDD8] text-[#888] cursor-not-allowed"
        }`}
      >
        次へ：ワンちゃん情報
      </button>
    </div>
  );
}
