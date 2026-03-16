"use client";

import { useEffect, useState } from "react";
import type { BookingFormData } from "@/types/booking";
import { PLANS, DAY_DESTINATIONS, DAY_DESTINATIONS_4H, STAY_DESTINATIONS } from "@/types/booking";
import { supabase } from "@/lib/supabase";
import { fetchSiteSettings } from "@/lib/site-settings";

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

  // 設定を取得
  useEffect(() => {
    fetchSiteSettings().then((s) => {
      setBookingWindowDays(s.bookingWindowDays);
      setClosedWeekdays(s.closedWeekdays);
    });
  }, []);

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

  // 受付上限日
  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + bookingWindowDays);
    return d.toISOString().split("T")[0];
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
  const hasClosedDayInStay = (checkin: string, checkout: string) => {
    const start = new Date(checkin);
    const end = new Date(checkout);
    const d = new Date(start);
    while (d <= end) {
      if (closedWeekdays.includes(d.getDay())) return true;
      d.setDate(d.getDate() + 1);
    }
    return false;
  };

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
          dates.push(d.toISOString().split("T")[0]);
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
          closed: closed || coDay.closed,
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
    for (let h = startHour; h <= actualEnd; h++) {
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
        !hasClosedDayInStay(form.date, form.checkout_date) &&
        (!form.checkin_extension || form.checkin_extension_from) &&
        (!form.checkout_extension || form.checkout_extension_until)
      : true) &&
    (form.plan !== "stay" ? capacity.day_remaining > 0 : true);

  return (
    <div className="space-y-6">
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

      {/* 日付選択 */}
      {form.plan && (
        <div>
          <h2 className="text-lg font-medium mb-3">日程を選択</h2>
          <input
            type="date"
            value={form.date}
            min={getMinDate()}
            max={getMaxDate()}
            onChange={(e) => onChange({ ...form, date: e.target.value })}
            className="w-full p-4 rounded-xl border-2 border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
          />
          {form.date && isClosedDay(form.date) && (
            <p className="text-red-500 text-sm mt-2">
              {closedWeekdayNames()}曜日は定休日です。別の日程をお選びください。
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

      {/* 行き先（チェックイン時間選択後） */}
      {form.plan && form.checkin_time && (() => {
        const destinations =
          form.plan === "stay" ? STAY_DESTINATIONS :
          form.plan === "4h" ? DAY_DESTINATIONS_4H : DAY_DESTINATIONS;
        const isOther = form.destination === "その他（自由記入）" ||
          (form.destination !== "" && !(destinations as readonly string[]).includes(form.destination));
        const selectValue = isOther ? "その他（自由記入）" : form.destination;
        return (
          <div>
            <h2 className="text-lg font-medium mb-2">お預かり中の行き先</h2>
            <p className="text-[12px] text-[#888] mb-3">
              具体的な施設名がわかると助かります
            </p>
            <select
              value={selectValue}
              onChange={(e) => {
                if (e.target.value === "その他（自由記入）") {
                  onChange({ ...form, destination: "" });
                } else {
                  onChange({ ...form, destination: e.target.value });
                }
              }}
              className="w-full p-4 rounded-xl border-2 border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
            >
              <option value="">選択してください</option>
              {destinations.map((dest) => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
            {(selectValue === "その他（自由記入）" || isOther) && (
              <input
                type="text"
                value={isOther && form.destination !== "その他（自由記入）" ? form.destination : ""}
                onChange={(e) => onChange({ ...form, destination: e.target.value })}
                placeholder="行き先を入力してください"
                className="mt-2 w-full p-4 rounded-xl border-2 border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
              />
            )}
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
              return d.toISOString().split("T")[0];
            })()}
            onChange={(e) => onChange({ ...form, checkout_date: e.target.value })}
            className="w-full p-4 rounded-xl border-2 border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
          />
          {form.checkout_date && hasClosedDayInStay(form.date, form.checkout_date) && (
            <p className="text-red-500 text-sm mt-2">
              お預かり期間中に定休日（{closedWeekdayNames()}曜日）が含まれています。定休日をまたがない日程をお選びください。
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
