"use client";

import { useEffect, useState, useCallback } from "react";
import type { BookingFormData } from "@/types/booking";
import { PLANS } from "@/types/booking";
import { supabase } from "@/lib/supabase";
import { fetchSiteSettings } from "@/lib/site-settings";
import { WEB_ROOM_LIMIT, LOW_STOCK_REMAINING } from "@/lib/capacity";
import { getJstToday, addDaysJst } from "@/lib/datetime";
import { isLateBooking as isLateBookingDate, lastCheckoutDate } from "@/lib/booking-rules";
import { DEFAULT_CLOSED_WEEKDAYS, getJstWeekday } from "@/lib/business-days";
import { BookingCalendar, type CalendarDayState } from "./booking-calendar";

interface Props {
  form: BookingFormData;
  onChange: (form: BookingFormData) => void;
  onNext: () => void;
}

interface CapacityInfo {
  total_remaining: number;
  closed: boolean;
}

export function Step1Plan({ form, onChange, onNext }: Props) {
  const [capacity, setCapacity] = useState<CapacityInfo | null>(null);
  const [loadingCapacity, setLoadingCapacity] = useState(false);
  const [bookingWindowDays, setBookingWindowDays] = useState(180);
  const [closedWeekdays, setClosedWeekdays] = useState<number[]>(DEFAULT_CLOSED_WEEKDAYS);
  const [showOtherInput, setShowOtherInput] = useState(false);

  // 設定を取得
  useEffect(() => {
    fetchSiteSettings().then((s) => {
      setBookingWindowDays(s.bookingWindowDays);
      setClosedWeekdays(s.closedWeekdays);
    });
    // 臨時休業/臨時営業 + 各日の空き室数をまとめて取得（カレンダーの空き表示に使う）
    supabase
      .from("daily_capacity")
      .select("date, closed, web_closed, day_booked, stay_booked")
      .gte("date", new Date().toISOString().split("T")[0])
      .then(({ data, error }) => {
        if (error) {
          console.error("[booking] daily_capacity fetch error:", error);
          // フェイルセーフ: 空のマップで継続（closed=曜日判定、空き=満室扱いせず通常表示）
          setClosedOverrides({});
          setRemainingMap({});
          return;
        }
        if (data) {
          const closedMap: Record<string, boolean> = {};
          const remMap: Record<string, number> = {};
          data.forEach((r) => {
            closedMap[r.date] = r.closed;
            // web_closed=true の日は「Web受付停止」＝残0扱いにして × 満席（お問い合わせ）へ倒す。
            // 店を閉める closed とは別物で、スタッフは管理画面から引き続き受け付けられる。
            remMap[r.date] = r.web_closed
              ? 0
              : WEB_ROOM_LIMIT - ((r.day_booked || 0) + (r.stay_booked || 0));
          });
          setClosedOverrides(closedMap);
          setRemainingMap(remMap);
        }
      });
  }, []);

  // 受付期限: 当日予約不可（翌日以降）。17時以降の翌日予約は仮予約として受付。
  // 当日/翌日の基準はサーバー(route.ts)と同じ JST で判定する。端末ローカルTZ依存だと
  // 海外端末やTZ誤設定でサーバー判定とズレ、選べた日が当日扱いで弾かれる/翌日が隠れる。
  const getMinDate = () => addDaysJst(getJstToday(), 1);

  // 前日17時以降の翌日予約かどうか判定。判定式は lib/booking-rules.ts の1箇所だけに置く
  // （この画面・確認画面・完了画面・サーバーが同じ関数を呼ぶ。総点検 #27）。
  const isLateBooking = (dateStr: string) => isLateBookingDate(dateStr);

  // 受付上限日（JST基準）
  const getMaxDate = () => addDaysJst(getJstToday(), bookingWindowDays);

  // 定休日チェック（設定から取得）
  // 容量データからclosed状態を取得（カレンダー表示で使用）
  const [closedOverrides, setClosedOverrides] = useState<Record<string, boolean>>({});
  // 各日の空き室数（カレンダーの ○/△/× 表示で使用）。レコードがない日は満室でない＝空きありとみなす。
  const [remainingMap, setRemainingMap] = useState<Record<string, number>>({});

  // カレンダー1マスの空き状況（レコードなし=WEB_ROOM_LIMIT=空きあり）
  const getDayRemaining = (dateStr: string): number =>
    dateStr in remainingMap ? remainingMap[dateStr] : WEB_ROOM_LIMIT;

  const isClosedDay = (dateStr: string) => {
    // daily_capacityにオーバーライドがあればそちらを優先
    if (dateStr in closedOverrides) return closedOverrides[dateStr];
    return closedWeekdays.includes(getJstWeekday(dateStr));
  };

  // 定休日の曜日名を表示用に変換
  const closedWeekdayNames = () => {
    const labels = ["日", "月", "火", "水", "木", "金", "土"];
    return closedWeekdays.map((d) => labels[d]).join("・");
  };

  // ── カレンダー各マスの状態（チェックイン日／チェックアウト日で共通の部品を使う）──
  // 「選べるか」「○△×のどれか」の判断はこの2つの関数だけが持つ。

  /** チェックイン日：定休日・受付範囲外・満室は選べない */
  const getCheckinDayState = (dateStr: string): CalendarDayState => {
    const closed = isClosedDay(dateStr);
    const outOfRange = dateStr < getMinDate() || dateStr > getMaxDate();
    if (closed || outOfRange) return { disabled: true, mark: null, closed };
    const remaining = getDayRemaining(dateStr);
    if (remaining <= 0) return { disabled: true, mark: "full", closed: false };
    return {
      disabled: false,
      mark: remaining <= LOW_STOCK_REMAINING ? "low" : "ok",
      closed: false,
    };
  };

  /** その晩が泊まれない（定休日 or 満室）か */
  const isNightUnavailable = (dateStr: string) =>
    isClosedDay(dateStr) || getDayRemaining(dateStr) <= 0;

  /**
   * チェックアウト日として選べる最終日。判定式は lib/booking-rules.ts に置いてある
   * （ここで選べる日は「いま赤字エラーにならない日」とちょうど同じ範囲）。
   */
  const lastCheckoutFor = (checkin: string): string =>
    lastCheckoutDate(checkin, isNightUnavailable);

  /** チェックアウト日：チェックイン翌日〜上限日のみ。定休日でもお引き取りは承れる */
  const getCheckoutDayState = (dateStr: string): CalendarDayState => {
    if (!form.date) return { disabled: true, mark: null, closed: false };
    const min = addDaysJst(form.date, 1);
    const max = lastCheckoutFor(form.date);
    return { disabled: dateStr < min || dateStr > max, mark: null, closed: false };
  };

  /** チェックイン日を選んだとき。新しい日程でありえないチェックアウト日は外す */
  const handleSelectCheckinDate = (dateStr: string) => {
    let checkout = form.checkout_date;
    if (form.plan === "stay" && checkout) {
      const min = addDaysJst(dateStr, 1);
      const max = lastCheckoutFor(dateStr);
      if (checkout < min || checkout > max) checkout = "";
    }
    onChange({ ...form, date: dateStr, checkout_date: checkout });
  };

  // 宿泊期間中に定休日が含まれるかチェック
  // CI日〜CO前日を確認。CO日は除外（チェックアウトのみ対応可能）
  // daily_capacityで臨時営業に設定されている日は定休日でもOK
  const [stayClosedDates, setStayClosedDates] = useState<string[]>([]);

  const checkClosedDaysInStay = useCallback(async (checkin: string, checkout: string) => {
    const start = new Date(checkin);
    const end = new Date(checkout);
    const allDates: string[] = [];
    const d = new Date(start);
    while (d < end) { // CO日を除外
      allDates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
      d.setDate(d.getDate() + 1);
    }

    if (allDates.length === 0) {
      setStayClosedDates([]);
      return;
    }

    try {
      // daily_capacityから全日のclosed状態を取得
      const { data, error } = await supabase
        .from("daily_capacity")
        .select("date, closed")
        .in("date", allDates);
      if (error) throw error;

      const actualClosed = allDates.filter((date) => {
        const cap = data?.find((r) => r.date === date);
        const regularClosed = closedWeekdays.includes(getJstWeekday(date));
        // daily_capacityにレコードがあればそのclosed値、なければ曜日で判定
        return cap ? cap.closed : regularClosed;
      });

      setStayClosedDates(actualClosed);
    } catch (e) {
      // フェイルセーフ: 曜日ベースの判定にフォールバック
      console.error("[booking] checkClosedDaysInStay fetch error:", e);
      const fallback = allDates.filter((date) => closedWeekdays.includes(getJstWeekday(date)));
      setStayClosedDates(fallback);
    }
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
      try {
        if (form.plan === "stay" && form.checkout_date) {
          // 宿泊：CI日〜CO前日まで毎日の合計使用部屋数をチェックし、最も埋まっている日に合わせる
          const dates: string[] = [];
          const d = new Date(form.date);
          const end = new Date(form.checkout_date);
          while (d < end) {
            dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
            d.setDate(d.getDate() + 1);
          }

          const { data: rows, error } = await supabase
            .from("daily_capacity")
            .select("date, day_booked, stay_booked, closed, web_closed")
            .in("date", dates);
          if (error) throw error;

          let minRemaining = WEB_ROOM_LIMIT;
          let closed = false;
          for (const date of dates) {
            const row = rows?.find((r) => r.date === date);
            if (row?.closed) { closed = true; break; }
            // 滞在期間に1日でもWeb受付停止日が含まれるなら、その滞在はWebで取らない
            if (row?.web_closed) { minRemaining = 0; break; }
            const occupied = (row?.day_booked || 0) + (row?.stay_booked || 0);
            minRemaining = Math.min(minRemaining, WEB_ROOM_LIMIT - occupied);
          }

          setCapacity({ total_remaining: minRemaining, closed });
        } else {
          // 日帰り or 宿泊でCO日未選択：CI日のみチェック
          const { data, error } = await supabase
            .from("daily_capacity")
            .select("day_booked, stay_booked, closed, web_closed")
            .eq("date", form.date)
            .maybeSingle();
          if (error) throw error;

          if (data) {
            const occupied = (data.day_booked || 0) + (data.stay_booked || 0);
            setCapacity({
              total_remaining: data.web_closed ? 0 : WEB_ROOM_LIMIT - occupied,
              closed: data.closed,
            });
          } else {
            setCapacity({ total_remaining: WEB_ROOM_LIMIT, closed: false });
          }
        }
      } catch (e) {
        // Supabase 一時障害・ネットワーク不安定時のフェイルセーフ
        // フォールバック: 通常容量で続行（ユーザーが「次へ」進めなくなるのを防ぐ）
        console.error("[booking] capacity fetch error:", e);
        setCapacity({ total_remaining: WEB_ROOM_LIMIT, closed: false });
      } finally {
        setLoadingCapacity(false);
      }
    };
    fetchCapacity();
  }, [form.date, form.plan, form.checkout_date]);

  const selectedPlan = PLANS.find((p) => p.id === form.plan);

  // チェックイン時間の選択肢を生成
  const getTimeOptions = () => {
    if (!selectedPlan) return [];
    const startHour = parseInt(selectedPlan.checkinRange.start);
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
    !isClosedDay(form.date) &&
    capacity &&
    !capacity.closed &&
    capacity.total_remaining > 0 &&
    (form.plan === "stay"
      ? form.checkout_date &&
        stayClosedDates.length === 0 &&
        (!form.checkin_extension || form.checkin_extension_from) &&
        (!form.checkout_extension || form.checkout_extension_until)
      : true);

  // 「次へ」が押せないとき、何をすれば進めるかを具体的に伝える。
  // 離脱の大半がこのステップで起きており、無言のグレーボタンが主因のため。
  const proceedHint: string | null = (() => {
    if (canProceed) return null;
    if (!form.plan) return "まずはプランをお選びください";
    if (!form.date) return "カレンダーから日付をお選びください";
    if (isClosedDay(form.date)) return "選んだ日は定休日です。別の日をお選びください";
    if (capacity?.closed) return "選んだ日は臨時休業です。別の日をお選びください";
    if (capacity && capacity.total_remaining <= 0) return "選んだ日は満席です。お問い合わせください（TEL 0460-80-0290）";
    if (form.plan === "stay" && form.checkout_date && stayClosedDates.length > 0)
      return "お預かり期間に休業日が含まれています。日程をご確認ください";
    const need: string[] = [];
    if (!form.checkin_time) need.push(form.plan === "stay" ? "到着予定時間" : "チェックイン時間");
    if (form.plan === "stay" && !form.checkout_date) need.push("チェックアウト日");
    if (form.plan === "stay" && form.checkin_extension && !form.checkin_extension_from)
      need.push("早預かりの開始時間");
    if (form.plan === "stay" && form.checkout_extension && !form.checkout_extension_until)
      need.push("延長のお迎え時間");
    if (need.length > 0) return `あと「${need.join("」「")}」をお選びください`;
    return null;
  })();

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
                  // お散歩オプションは宿泊のみ。プランを切り替えたら選択を外す
                  // （宿泊で選択→日帰りに戻した時の取りこぼし防止）
                  walk_option: false,
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
      {form.plan && (
        <div>
          <h2 className="text-lg font-medium mb-3">日程を選択</h2>
          <BookingCalendar
            value={form.date}
            onSelect={handleSelectCheckinDate}
            getDayState={getCheckinDayState}
            todayStr={getJstToday()}
            legend={
              <>
                <span className="text-green-600">○ 空きあり</span>
                <span className="text-orange-500">△ 混み合っています</span>
                <span className="text-red-500">× 満席（お問い合わせ）</span>
                <span>グレー: 定休日</span>
                <span className="text-orange-400">数字オレンジ: 祝日</span>
              </>
            }
          />

          {/* 選択日の情報 */}
          {form.date && !isClosedDay(form.date) && (
            <div className="mt-2">
              {loadingCapacity ? (
                <p className="text-[#888] text-sm">空き状況を確認中...</p>
              ) : capacity && !capacity.closed ? (
                <div className="flex gap-3">
                  {capacity.total_remaining <= 0
                    ? <span className="text-red-500 text-sm font-medium">× 満席です。お問い合わせください（TEL 0460-80-0290）</span>
                    : capacity.total_remaining <= LOW_STOCK_REMAINING
                      ? <span className="text-orange-500 text-sm">△ 混み合っています</span>
                      : <span className="text-green-600 text-sm">○ 空きあり</span>
                  }
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
      )}

      {/* チェックイン時間 */}
      {form.plan && form.date && !isClosedDay(form.date) && capacity && !capacity.closed && (
        <div>
          <h2 className="text-lg font-medium mb-3">
            {form.plan === "stay" ? "到着予定時間（目安）" : "チェックイン時間"}
          </h2>
          {form.plan === "stay" ? (
            <p className="text-[13px] text-[#888] mb-2">
              14:00〜17:00の間でお選びください。<span className="text-[#B87942]">当日の変更もOKです</span>
            </p>
          ) : (
            <p className="text-[13px] text-[#888] mb-2">
              {selectedPlan?.checkinRange.start}〜{selectedPlan?.checkinRange.end}の間でお選びください
            </p>
          )}
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
          ) : null}
          <p className="text-[13px] text-[#888] mt-2">
            お引き取り最終: 17:00（超過: ¥1,100/時間）
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
          <BookingCalendar
            key={form.date}
            value={form.checkout_date}
            onSelect={(dateStr) => onChange({ ...form, checkout_date: dateStr })}
            getDayState={getCheckoutDayState}
            todayStr={getJstToday()}
            initialMonthDate={form.date}
            legend={
              <>
                <span>お帰りの日をお選びください</span>
                <span>グレー: お選びいただけない日</span>
              </>
            }
          />
          <p className="text-[12px] text-[#888] mt-2">
            チェックアウト日は{closedWeekdayNames()}曜日（定休日）でもお引き取りいただけます。
          </p>
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

      {/* 仮予約案内（前日17時以降の翌日予約） */}
      {form.date && isLateBooking(form.date) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <p className="font-medium text-amber-800 mb-1">仮予約としてお受けします</p>
          <p className="text-amber-700 text-[13px] leading-relaxed">
            前日17時以降のご予約のため、仮予約として受け付けます。翌朝9時までにスタッフが確認のうえ、メールにて確定のご連絡をいたします。空き状況によりお受けできない場合もございますので、ご了承ください。
          </p>
        </div>
      )}

      {/* 「次へ」が押せない理由の案内（離脱が最も多いステップのため明示する） */}
      {proceedHint && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-800">{proceedHint}</p>
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
