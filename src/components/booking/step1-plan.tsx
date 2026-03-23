"use client";

import { useEffect, useState, useCallback } from "react";
import type { BookingFormData } from "@/types/booking";
import { PLANS, DAY_DESTINATIONS, DAY_DESTINATIONS_4H, STAY_DESTINATIONS, DESTINATION_SUGGESTIONS } from "@/types/booking";
import { supabase } from "@/lib/supabase";
import { fetchSiteSettings } from "@/lib/site-settings";
import { HOLIDAYS } from "@/lib/holidays";

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
  const [bookingWindowDays, setBookingWindowDays] = useState(180);
  const [closedWeekdays, setClosedWeekdays] = useState<number[]>([3, 4]);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // 設定を取得
  useEffect(() => {
    fetchSiteSettings().then((s) => {
      setBookingWindowDays(s.bookingWindowDays);
      setClosedWeekdays(s.closedWeekdays);
    });
  }, []);

  // 受付期限チェック: 当日予約OK（早朝は前日まで）
  const getMinDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // 営業時間（17時）を過ぎたら翌日から
    if (now.getHours() >= 17) {
      today.setDate(today.getDate() + 1);
    }
    return `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  };

  // 当日かどうか判定
  const isToday = (dateStr: string) => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    return dateStr === todayStr;
  };

  // 受付上限日
  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + bookingWindowDays);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };

  // 定休日チェック（設定から取得）
  const isClosedDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return closedWeekdays.includes(d.getDay());
  };

  // 定休日の曜日名を表示用に変換
  const closedWeekdayNames = () => {
    const labels = ["日", "月", "火", "水", "木", "金", "土"];
    return closedWeekdays.map((d) => labels[d]).join("・");
  };

  // 宿泊期間中に定休日が含まれるかチェック
  // CI日〜CO前日を確認。CO日は除外（チェックアウトのみ対応可能）
  // daily_capacityで臨時営業に設定されている日は定休日でもOK
  const [stayClosedDates, setStayClosedDates] = useState<string[]>([]);

  const checkClosedDaysInStay = useCallback(async (checkin: string, checkout: string) => {
    const start = new Date(checkin);
    const end = new Date(checkout); // CO日は除外するので end 未満
    const datesToCheck: string[] = [];
    const d = new Date(start);
    while (d < end) { // CO日を除外
      if (closedWeekdays.includes(d.getDay())) {
        datesToCheck.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
      }
      d.setDate(d.getDate() + 1);
    }

    if (datesToCheck.length === 0) {
      setStayClosedDates([]);
      return;
    }

    // 臨時営業オーバーライドを確認
    const { data } = await supabase
      .from("daily_capacity")
      .select("date, closed")
      .in("date", datesToCheck);

    const actualClosed = datesToCheck.filter((date) => {
      const override = data?.find((r) => r.date === date);
      // override で closed=false なら臨時営業 → OK
      if (override && !override.closed) return false;
      return true; // デフォルト定休日のまま → NG
    });

    setStayClosedDates(actualClosed);
  }, [closedWeekdays]);

  useEffect(() => {
    if (form.plan === "stay" && form.date && form.checkout_date) {
      checkClosedDaysInStay(form.date, form.checkout_date);
    } else {
      setStayClosedDates([]);
    }
  }, [form.plan, form.date, form.checkout_date, checkClosedDaysInStay]);

  useEffect(() => {
    if (!form.date) {
      setCapacity(null);
      return;
    }
    const fetchCapacity = async () => {
      setLoadingCapacity(true);

      if (form.plan === "stay" && form.checkout_date) {
        // 宿泊：全泊日(CI〜CO前日)のstay枠 + CO日のday枠をチェック
        const dates: string[] = [];
        const d = new Date(form.date);
        const end = new Date(form.checkout_date);
        while (d < end) {
          dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
          d.setDate(d.getDate() + 1);
        }

        const { data: rows } = await supabase
          .from("daily_capacity")
          .select("*")
          .in("date", [...dates, form.checkout_date]);

        let minStayRemaining = 10;
        let closed = false;
        let coDay = { day_remaining: 9, closed: false };

        for (const date of dates) {
          const row = rows?.find((r) => r.date === date);
          if (row) {
            if (row.closed) { closed = true; break; }
            minStayRemaining = Math.min(minStayRemaining, row.stay_limit - row.stay_booked);
          }
        }

        const coRow = rows?.find((r) => r.date === form.checkout_date);
        if (coRow) {
          coDay = { day_remaining: coRow.day_limit - coRow.day_booked, closed: coRow.closed };
        }

        setCapacity({
          stay_remaining: minStayRemaining,
          day_remaining: coDay.day_remaining,
          closed, // CO日のclosedは除外（CO日は定休日でもチェックアウト可能）
        });
      } else {
        // 日帰り or 宿泊でCO日未選択：CI日のみチェック
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
      }
      setLoadingCapacity(false);
    };
    fetchCapacity();
  }, [form.date, form.plan, form.checkout_date]);

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
    const now = new Date();
    const currentHour = now.getHours();
    const isTodayBooking = form.date && isToday(form.date);

    for (let h = startHour; h <= actualEnd; h++) {
      // 当日予約: 過ぎた時間はスキップ（1時間のバッファ）
      if (isTodayBooking && h <= currentHour) continue;
      // 当日予約: 早朝（9時前）は前日までの予約が必要
      if (isTodayBooking && h < 9) continue;
      options.push(`${String(h).padStart(2, "0")}:00`);
    }
    return options;
  };

  // 延長時間から料金を計算
  const calcExtension = (fromTime: string, toTime: string) => {
    const [fh] = fromTime.split(":").map(Number);
    const [th] = toTime.split(":").map(Number);
    const hours = Math.max(0, th - fh);
    const fee = hours * 1100;
    return { hours, fee };
  };

  const canProceed =
    form.plan &&
    form.date &&
    form.checkin_time &&
    form.destination &&
    !isClosedDay(form.date) &&
    capacity &&
    !capacity.closed &&
    (form.plan === "stay"
      ? capacity.stay_remaining > 0 &&
        form.checkout_date &&
        stayClosedDates.length === 0 &&
        (!form.checkin_extension || form.checkin_extension_from) &&
        (!form.checkout_extension || form.checkout_extension_until)
      : true) &&
    (form.plan !== "stay" ? capacity.day_remaining > 0 : true);

  return (
    <div className="space-y-6">
      {/* 施設情報（HPを見ずに来た方向け） */}
      <div className="p-4 rounded-xl bg-white border border-[#E5DDD8] space-y-2">
        <p className="text-sm font-medium text-[#3C200F]">DogHub箱根仙石原</p>
        <div className="text-[13px] text-[#666] space-y-1">
          <p>箱根・仙石原にある犬のお預かり専門施設です。ドッグラン併設・完全個室・スタッフ常駐で安心してお預けいただけます。</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[12px]">
            <span>営業: 金〜火 9:00-17:00</span>
            <span>定休: {closedWeekdayNames()}曜日</span>
            <span>体重: 15kgまで（超える場合は要相談）</span>
          </div>
        </div>
      </div>

      {/* プラン選択 */}
      <div>
        <h2 className="text-lg font-medium mb-3">プランを選択</h2>
        <div className="space-y-3">
          {PLANS.filter((p) => p.id !== "spot").map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() =>
                onChange({
                  ...form,
                  plan: plan.id,
                  checkin_time: "",
                  checkout_date: "",
                  checkin_extension: false,
                  checkin_extension_from: "",
                  checkout_extension: false,
                  checkout_extension_until: "",
                  early_morning: false,
                  destination: "",
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

      {/* 日付選択（カレンダー） */}
      {form.plan && (() => {
        const WDAYS = ["日","月","火","水","木","金","土"];
        const minDate = getMinDate();
        const maxDate = getMaxDate();
        const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();

        // カレンダー日付生成
        const first = new Date(calMonth.year, calMonth.month, 1);
        const startDay = new Date(first); startDay.setDate(1 - first.getDay());
        const last = new Date(calMonth.year, calMonth.month + 1, 0);
        const endDay = new Date(last); endDay.setDate(last.getDate() + (6 - last.getDay()));
        const days: Date[] = [];
        const d = new Date(startDay);
        while (d <= endDay) { days.push(new Date(d)); d.setDate(d.getDate() + 1); }

        const fmtD = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;

        return (
          <div>
            <h2 className="text-lg font-medium mb-3">日程を選択</h2>
            <div className="bg-white rounded-xl border-2 border-[#E5DDD8] p-3">
              {/* 月ナビ */}
              <div className="flex items-center justify-between mb-2">
                <button type="button" onClick={() => setCalMonth((p) => { let m = p.month - 1, y = p.year; if (m < 0) { m = 11; y--; } return { year: y, month: m }; })} className="p-1.5 text-[#888] active:text-[#3C200F]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-sm font-medium">{calMonth.year}年{calMonth.month + 1}月</span>
                <button type="button" onClick={() => setCalMonth((p) => { let m = p.month + 1, y = p.year; if (m > 11) { m = 0; y++; } return { year: y, month: m }; })} className="p-1.5 text-[#888] active:text-[#3C200F]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {WDAYS.map((w, i) => (
                  <div key={i} className={`text-center text-[11px] font-medium py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-[#888]"}`}>{w}</div>
                ))}
              </div>
              {/* 日付グリッド */}
              <div className="grid grid-cols-7 gap-0.5">
                {days.map((date) => {
                  const dateStr = fmtD(date);
                  const isThisMonth = date.getMonth() === calMonth.month;
                  const isClosed = closedWeekdays.includes(date.getDay());
                  const holiday = HOLIDAYS[dateStr];
                  const isOutOfRange = dateStr < minDate || dateStr > maxDate;
                  const isDisabled = !isThisMonth || isClosed || isOutOfRange;
                  const isSelected = dateStr === form.date;
                  const isToday = dateStr === todayStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => onChange({ ...form, date: dateStr })}
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
                      {date.getDate()}
                      {holiday && isThisMonth && !isSelected && (
                        <span className="text-[7px] text-orange-400 leading-none">{holiday.length > 2 ? holiday.slice(0, 2) : holiday}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* 凡例 */}
              <div className="flex gap-3 mt-2 text-[10px] text-[#888]">
                <span>グレー: 定休日</span>
                <span className="text-orange-400">オレンジ: 祝日</span>
              </div>
            </div>

            {/* 選択日の情報 */}
            {form.date && !isClosedDay(form.date) && (
              <div className="mt-2">
                {loadingCapacity ? (
                  <p className="text-[#888] text-sm">空き状況を確認中...</p>
                ) : capacity && !capacity.closed ? (
                  <div className="flex gap-3">
                    {form.plan === "stay" ? (
                      capacity.stay_remaining <= 0
                        ? <span className="text-red-500 text-sm font-medium">× 満室（別の日程をお選びください）</span>
                        : capacity.stay_remaining < 5
                          ? <span className="text-orange-500 text-sm">△ 残りわずか</span>
                          : <span className="text-green-600 text-sm">○ 空きあり</span>
                    ) : (
                      capacity.day_remaining <= 0
                        ? <span className="text-red-500 text-sm font-medium">× 満室（別の日程をお選びください）</span>
                        : capacity.day_remaining < 5
                          ? <span className="text-orange-500 text-sm">△ 残りわずか</span>
                          : <span className="text-green-600 text-sm">○ 空きあり</span>
                    )}
                  </div>
                ) : capacity?.closed ? (
                  <p className="text-red-500 text-sm">この日は臨時休業です。別の日程をお選びください。</p>
                ) : null}
              </div>
            )}
            {form.date && isClosedDay(form.date) && (
              <p className="text-red-500 text-sm mt-2">{closedWeekdayNames()}曜日は定休日です。別の日程をお選びください。</p>
            )}
          </div>
        );
      })()}

      {/* 早朝プラン（日帰りプランのみ、当日予約では非表示） */}
      {selectedPlan?.earlyMorning && form.date && !isClosedDay(form.date) && !isToday(form.date) && capacity && !capacity.closed && (
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
          {getTimeOptions().length > 0 ? (
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
          ) : form.date && isToday(form.date) ? (
            <p className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
              本日の受付可能時間が過ぎています。明日以降の日程をお選びいただくか、お電話（<a href="tel:0460800290" className="underline font-medium">0460-80-0290</a>）でご相談ください。
            </p>
          ) : null}
          <p className="text-[13px] text-[#888] mt-2">
            お引き取り最終: 17:00（超過: ¥1,100/時間）
          </p>
          {form.date && isToday(form.date) ? (
            <p className="text-[12px] text-[#B87942] mt-1">
              ※ 当日予約のため、早朝（9時前）のお預かりはお電話でご相談ください
            </p>
          ) : (
            <p className="text-[12px] text-[#888] mt-1">
              ※ 早朝（7:00〜）のお預かりは前日までのご予約が必要です
            </p>
          )}
        </div>
      )}

      {/* 行き先（チェックイン時間選択後） */}
      {form.plan && form.checkin_time && (() => {
        const quickButtons =
          form.plan === "stay" ? STAY_DESTINATIONS.filter(d => d !== "未定" && d !== "その他（自由記入）") :
          form.plan === "4h" ? DAY_DESTINATIONS_4H.filter(d => d !== "その他") :
          DAY_DESTINATIONS.filter(d => d !== "その他");

        const allSuggestions = [
          ...DESTINATION_SUGGESTIONS,
          ...(form.plan === "stay" ? STAY_DESTINATIONS.filter(d => d !== "未定" && d !== "その他（自由記入）") : []),
        ];

        return (
          <div>
            <h2 className="text-lg font-medium mb-2">お預かり中の行き先</h2>
            <p className="text-[12px] text-[#888] mb-3">
              入力するか、下のボタンから選べます
            </p>
            <input
              type="text"
              list="destination-suggestions"
              value={form.destination}
              onChange={(e) => onChange({ ...form, destination: e.target.value })}
              placeholder="施設名を入力（候補が表示されます）"
              className="w-full p-4 rounded-xl border-2 border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
            />
            <datalist id="destination-suggestions">
              {allSuggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            <div className="flex flex-wrap gap-2 mt-3">
              {quickButtons.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => onChange({ ...form, destination: dest })}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    form.destination === dest
                      ? "bg-[#B87942] text-white border-[#B87942]"
                      : "bg-white text-[#3C200F] border-[#E5DDD8] hover:border-[#B87942]"
                  }`}
                >
                  {dest}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onChange({ ...form, destination: "未定" })}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  form.destination === "未定"
                    ? "bg-[#B87942] text-white border-[#B87942]"
                    : "bg-white text-[#888] border-[#E5DDD8] hover:border-[#B87942]"
                }`}
              >
                未定
              </button>
            </div>
          </div>
        );
      })()}

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
              return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
            })()}
            onChange={(e) => onChange({ ...form, checkout_date: e.target.value })}
            className="w-full px-4 py-5 rounded-xl border-2 border-[#E5DDD8] text-lg bg-white focus:border-[#B87942] focus:outline-none"
          />
          {form.checkout_date && stayClosedDates.length > 0 && (
            <p className="text-red-500 text-sm mt-2">
              お預かり期間中に定休日が含まれています（チェックアウト日は定休日でもOKです）。日程をご確認ください。
            </p>
          )}
        </div>
      )}

      {/* チェックイン前の早預かり（宿泊のみ） */}
      {form.plan === "stay" && form.checkout_date && (
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 rounded-xl bg-[#F8F5F0]">
            <input
              type="checkbox"
              checked={form.checkin_extension}
              onChange={(e) =>
                onChange({
                  ...form,
                  checkin_extension: e.target.checked,
                  checkin_extension_from: "",
                })
              }
              className="w-5 h-5 rounded accent-[#B87942] mt-0.5"
            />
            <div>
              <span className="text-sm font-medium">チェックイン（14:00）前から預ける</span>
              <p className="text-[12px] text-[#888] mt-0.5">
                午前中に箱根へ到着し、そのまま観光を楽しみたい方に（¥1,100/時間）
              </p>
            </div>
          </label>

          {form.checkin_extension && (
            <div>
              <h2 className="text-lg font-medium mb-2">何時頃お預けしますか？</h2>
              <div className="grid grid-cols-4 gap-2">
                {["09:00", "10:00", "11:00", "12:00", "13:00"].map((time) => {
                  const ext = calcExtension(time, "14:00");
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => onChange({ ...form, checkin_extension_from: time })}
                      className={`py-3 rounded-lg text-sm font-medium transition-all ${
                        form.checkin_extension_from === time
                          ? "bg-[#B87942] text-white"
                          : "bg-[#F8F5F0] text-[#3C200F] active:bg-[#E5DDD8]"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
              {form.checkin_extension_from && (() => {
                const ext = calcExtension(form.checkin_extension_from, "14:00");
                return (
                  <p className="mt-2 text-[13px] text-[#888]">
                    早預かり料金目安: {ext.hours}時間 × ¥1,100 ＝ ¥{ext.fee.toLocaleString()}
                  </p>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* チェックアウト後の延長預かり（宿泊のみ） */}
      {form.plan === "stay" && form.checkout_date && (
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 rounded-xl bg-[#F8F5F0]">
            <input
              type="checkbox"
              checked={form.checkout_extension}
              onChange={(e) =>
                onChange({
                  ...form,
                  checkout_extension: e.target.checked,
                  checkout_extension_until: "",
                })
              }
              className="w-5 h-5 rounded accent-[#B87942] mt-0.5"
            />
            <div>
              <span className="text-sm font-medium">チェックアウト後もそのまま預かりを延長する</span>
              <p className="text-[12px] text-[#888] mt-0.5">
                帰る前にランチや温泉をゆっくり楽しんでから迎えに来たい方に（¥1,100/時間）
              </p>
            </div>
          </label>

          {form.checkout_extension && (
            <div>
              <h2 className="text-lg font-medium mb-2">何時頃お迎えに来ますか？</h2>
              <div className="grid grid-cols-4 gap-2">
                {["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onChange({ ...form, checkout_extension_until: time })}
                    className={`py-3 rounded-lg text-sm font-medium transition-all ${
                      form.checkout_extension_until === time
                        ? "bg-[#B87942] text-white"
                        : "bg-[#F8F5F0] text-[#3C200F] active:bg-[#E5DDD8]"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              {form.checkout_extension_until && (() => {
                const ext = calcExtension("11:00", form.checkout_extension_until);
                return (
                  <p className="mt-2 text-[13px] text-[#888]">
                    延長料金目安: {ext.hours}時間 × ¥1,100 ＝ ¥{ext.fee.toLocaleString()}
                  </p>
                );
              })()}
            </div>
          )}
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
