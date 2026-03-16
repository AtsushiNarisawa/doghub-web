"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

// 日本の祝日（2025〜2027年）
const HOLIDAYS: Record<string, string> = {
  // 2025
  "2025-01-01": "元日", "2025-01-13": "成人の日", "2025-02-11": "建国記念の日",
  "2025-02-23": "天皇誕生日", "2025-02-24": "振替休日", "2025-03-20": "春分の日",
  "2025-04-29": "昭和の日", "2025-05-03": "憲法記念日", "2025-05-04": "みどりの日",
  "2025-05-05": "こどもの日", "2025-05-06": "振替休日",
  "2025-07-21": "海の日", "2025-08-11": "山の日",
  "2025-09-15": "敬老の日", "2025-09-23": "秋分の日",
  "2025-10-13": "スポーツの日", "2025-11-03": "文化の日",
  "2025-11-23": "勤労感謝の日", "2025-11-24": "振替休日",
  // 2026
  "2026-01-01": "元日", "2026-01-12": "成人の日", "2026-02-11": "建国記念の日",
  "2026-02-23": "天皇誕生日", "2026-03-20": "春分の日",
  "2026-04-29": "昭和の日", "2026-05-03": "憲法記念日", "2026-05-04": "みどりの日",
  "2026-05-05": "こどもの日", "2026-05-06": "振替休日",
  "2026-07-20": "海の日", "2026-08-11": "山の日",
  "2026-09-21": "敬老の日", "2026-09-22": "国民の休日", "2026-09-23": "秋分の日",
  "2026-10-12": "スポーツの日", "2026-11-03": "文化の日",
  "2026-11-23": "勤労感謝の日",
  // 2027
  "2027-01-01": "元日", "2027-01-11": "成人の日", "2027-02-11": "建国記念の日",
  "2027-02-23": "天皇誕生日", "2027-03-21": "春分の日", "2027-03-22": "振替休日",
  "2027-04-29": "昭和の日", "2027-05-03": "憲法記念日", "2027-05-04": "みどりの日",
  "2027-05-05": "こどもの日",
  "2027-07-19": "海の日", "2027-08-11": "山の日",
  "2027-09-20": "敬老の日", "2027-09-23": "秋分の日",
  "2027-10-11": "スポーツの日", "2027-11-03": "文化の日",
  "2027-11-23": "勤労感謝の日",
};

interface Settings {
  booking_window_days: number;
  closed_weekdays: number[];
}

interface DayOverride {
  date: string;
  closed: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  booking_window_days: 180,
  closed_weekdays: [3, 4],
};

function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [overrides, setOverrides] = useState<DayOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // 月のカレンダー日付を生成
  const getMonthDays = useCallback(() => {
    const first = new Date(calMonth.year, calMonth.month, 1);
    const start = new Date(first);
    start.setDate(start.getDate() - start.getDay()); // 月初の週の日曜
    const last = new Date(calMonth.year, calMonth.month + 1, 0);
    const end = new Date(last);
    end.setDate(end.getDate() + (6 - end.getDay())); // 月末の週の土曜
    const days: Date[] = [];
    const d = new Date(start);
    while (d <= end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [calMonth]);

  // データ取得（月ごと）
  const fetchAll = useCallback(async () => {
    setLoading(true);

    const { data: settingsData } = await supabase.from("site_settings").select("key, value");
    if (settingsData) {
      const map: Record<string, string> = {};
      for (const row of settingsData) map[row.key] = row.value;
      setSettings({
        booking_window_days: map.booking_window_days
          ? parseInt(map.booking_window_days)
          : DEFAULT_SETTINGS.booking_window_days,
        closed_weekdays: map.closed_weekdays
          ? map.closed_weekdays.split(",").map(Number).filter((n) => !isNaN(n))
          : DEFAULT_SETTINGS.closed_weekdays,
      });
    }

    // 表示月の前後を含めてcapacityを取得
    const rangeStart = new Date(calMonth.year, calMonth.month - 1, 1);
    const rangeEnd = new Date(calMonth.year, calMonth.month + 2, 0);
    const { data: capData } = await supabase
      .from("daily_capacity")
      .select("date, closed")
      .gte("date", fmtDate(rangeStart))
      .lte("date", fmtDate(rangeEnd));

    if (capData) {
      // closedがtrue（臨時休業）またはfalse（臨時営業＝定休日を営業に変更）のレコードを取得
      // daily_capacityに行がある＝何らかの設定がされている日
      setOverrides(capData.map((r) => ({ date: r.date, closed: r.closed })));
    } else {
      setOverrides([]);
    }

    setLoading(false);
  }, [calMonth]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const isDayClosed = (date: Date) => {
    const dateStr = fmtDate(date);
    const override = overrides.find((o) => o.date === dateStr);
    if (override) return override.closed;
    return settings.closed_weekdays.includes(date.getDay());
  };

  const isOverridden = (date: Date) => {
    const dateStr = fmtDate(date);
    const override = overrides.find((o) => o.date === dateStr);
    if (!override) return false;
    const isRegularClosed = settings.closed_weekdays.includes(date.getDay());
    // 通常営業日にclosed=true（臨時休業）、または定休日にclosed=false（臨時営業）
    return (isRegularClosed && !override.closed) || (!isRegularClosed && override.closed);
  };

  const toggleDay = async (date: Date) => {
    const dateStr = fmtDate(date);
    const todayStr = fmtDate(new Date());
    if (dateStr < todayStr) return;

    const currentOverride = overrides.find((o) => o.date === dateStr);

    setSavingDate(dateStr);

    if (currentOverride) {
      // オーバーライド済み → デフォルトに戻す
      const { data: existing } = await supabase
        .from("daily_capacity")
        .select("date, day_booked, stay_booked")
        .eq("date", dateStr)
        .maybeSingle();

      if (existing && existing.day_booked === 0 && existing.stay_booked === 0) {
        // 予約がなければ行ごと削除
        await supabase.from("daily_capacity").delete().eq("date", dateStr);
      } else {
        await supabase.from("daily_capacity").update({ closed: false }).eq("date", dateStr);
      }
      setOverrides((prev) => prev.filter((o) => o.date !== dateStr));
    } else {
      // オーバーライドなし → 現在の状態を反転
      const currentlyClosed = isDayClosed(date);
      const newClosed = !currentlyClosed;

      const { data: existing } = await supabase
        .from("daily_capacity")
        .select("date")
        .eq("date", dateStr)
        .maybeSingle();

      if (existing) {
        await supabase.from("daily_capacity").update({ closed: newClosed }).eq("date", dateStr);
      } else {
        await supabase.from("daily_capacity").insert({ date: dateStr, closed: newClosed });
      }
      // closed=true（臨時休業）もclosed=false（臨時営業）もオーバーライドとして記録
      setOverrides((prev) => [...prev.filter((o) => o.date !== dateStr), { date: dateStr, closed: newClosed }]);
    }

    setSavingDate(null);
  };

  const navigateMonth = (dir: number) => {
    setCalMonth((prev) => {
      let m = prev.month + dir;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  const goThisMonth = () => {
    const now = new Date();
    setCalMonth({ year: now.getFullYear(), month: now.getMonth() });
  };

  const saveBookingWindow = async () => {
    setSaving(true);
    await supabase.from("site_settings").upsert({
      key: "booking_window_days",
      value: String(settings.booking_window_days),
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  const calendarDays = getMonthDays();
  const todayStr = fmtDate(new Date());
  const isCurrentMonth = calMonth.year === new Date().getFullYear() && calMonth.month === new Date().getMonth();

  return (
    <div className="space-y-4">
      {/* 営業日カレンダー */}
      <div className="bg-white rounded-xl p-4 space-y-3">
        <div>
          <h3 className="text-base font-medium mb-1">営業日</h3>
          <p className="text-sm text-gray-500">タップで臨時休業・臨時営業を切り替え</p>
        </div>

        {/* 月ナビ */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigateMonth(-1)} className="p-2 text-gray-500 active:text-gray-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <span className="text-sm font-medium text-gray-800">
              {calMonth.year}年{calMonth.month + 1}月
            </span>
            {!isCurrentMonth && (
              <button onClick={goThisMonth} className="ml-2 text-xs text-[#B87942] font-medium">
                今月
              </button>
            )}
          </div>
          <button onClick={() => navigateMonth(1)} className="p-2 text-gray-500 active:text-gray-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 凡例 */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-white border border-gray-200 inline-block" />
            営業
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-gray-300 inline-block" />
            定休
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-red-400 inline-block" />
            臨時休業
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-green-400 inline-block" />
            臨時営業
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-orange-300 inline-block" />
            祝日
          </span>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i} className={`text-center text-sm font-medium py-1 ${
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
            }`}>
              {label}
            </div>
          ))}
        </div>

        {/* カレンダー本体 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date) => {
            const dateStr = fmtDate(date);
            const isPast = dateStr < todayStr;
            const isToday = dateStr === todayStr;
            const closed = isDayClosed(date);
            const overridden = isOverridden(date);
            const isRegularClosed = settings.closed_weekdays.includes(date.getDay());
            const isSaving = savingDate === dateStr;
            const isThisMonth = date.getMonth() === calMonth.month;
            const holiday = HOLIDAYS[dateStr];

            let bgClass = "bg-white border border-gray-100";
            if (!isThisMonth) {
              bgClass = "bg-gray-50 opacity-25";
            } else if (isPast) {
              bgClass = closed ? "bg-gray-200 opacity-40" : "bg-gray-50 opacity-40";
            } else if (overridden && closed) {
              bgClass = "bg-red-100 border-2 border-red-300";
            } else if (overridden && !closed) {
              bgClass = "bg-green-100 border-2 border-green-300";
            } else if (isRegularClosed) {
              bgClass = "bg-gray-200";
            } else if (holiday) {
              bgClass = "bg-orange-50 border border-orange-200";
            }

            return (
              <button
                key={dateStr}
                onClick={() => isThisMonth && !isPast && toggleDay(date)}
                disabled={!isThisMonth || isPast || isSaving}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${bgClass} ${
                  !isThisMonth || isPast ? "cursor-default" : "active:scale-95"
                }`}
              >
                <span className={`text-sm leading-none ${
                  isToday
                    ? "font-bold text-[#B87942]"
                    : !isThisMonth
                    ? "text-gray-500"
                    : holiday
                    ? "text-orange-600"
                    : date.getDay() === 0
                    ? "text-red-500"
                    : date.getDay() === 6
                    ? "text-blue-500"
                    : closed && !isPast
                    ? "text-gray-500"
                    : "text-gray-700"
                }`}>
                  {date.getDate()}
                </span>
                {isToday && (
                  <span className="text-xs text-[#B87942] font-medium leading-none mt-0.5">今日</span>
                )}
                {holiday && isThisMonth && !isToday && (
                  <span className="text-xs text-orange-500 leading-none mt-0.5 truncate w-full text-center px-0.5">
                    {holiday.length > 3 ? holiday.slice(0, 3) : holiday}
                  </span>
                )}
                {isSaving && (
                  <span className="text-xs text-gray-500 leading-none mt-0.5">...</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 今月の祝日リスト */}
        {(() => {
          const monthHolidays = Object.entries(HOLIDAYS)
            .filter(([d]) => d.startsWith(`${calMonth.year}-${String(calMonth.month + 1).padStart(2, "0")}`))
            .sort(([a], [b]) => a.localeCompare(b));
          if (monthHolidays.length === 0) return null;
          return (
            <div className="bg-orange-50 rounded-lg px-3 py-2">
              <p className="text-xs text-orange-600 font-medium mb-1">祝日</p>
              {monthHolidays.map(([d, name]) => (
                <p key={d} className="text-sm text-orange-700">
                  {parseInt(d.split("-")[2])}日 {name}
                </p>
              ))}
            </div>
          );
        })()}

        <p className="text-sm text-gray-500">
          定休日: {settings.closed_weekdays.map((d) => WEEKDAY_LABELS[d]).join("・")}曜日
        </p>
      </div>

      {/* 予約受付期間 */}
      <div className="bg-white rounded-xl p-4 space-y-4">
        <div>
          <h3 className="text-base font-medium mb-1">予約受付期間</h3>
          <p className="text-sm text-gray-500">何日先まで予約を受け付けるか</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSettings((prev) => ({ ...prev, booking_window_days: Math.max(7, prev.booking_window_days - 30) }))}
            className="w-11 h-11 rounded-lg bg-gray-100 text-xl font-light active:bg-gray-200 flex items-center justify-center"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <span className="text-3xl font-medium font-dm">{settings.booking_window_days}</span>
            <span className="text-sm text-gray-500 ml-1">日先まで</span>
          </div>
          <button
            onClick={() => setSettings((prev) => ({ ...prev, booking_window_days: Math.min(365, prev.booking_window_days + 30) }))}
            className="w-11 h-11 rounded-lg bg-gray-100 text-xl font-light active:bg-gray-200 flex items-center justify-center"
          >
            ＋
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[30, 60, 90, 180, 365].map((d) => (
            <button
              key={d}
              onClick={() => setSettings((prev) => ({ ...prev, booking_window_days: d }))}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                settings.booking_window_days === d
                  ? "bg-[#B87942] text-white"
                  : "bg-gray-100 text-gray-500 active:bg-gray-200"
              }`}
            >
              {d}日
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          本日から約{Math.round(settings.booking_window_days / 30)}ヶ月先まで受付
        </p>

        <button
          onClick={saveBookingWindow}
          disabled={saving}
          className={`w-full py-3 rounded-xl text-base font-medium transition-all ${
            saved
              ? "bg-green-500 text-white"
              : "bg-[#B87942] text-white active:bg-[#A06830] disabled:opacity-50"
          }`}
        >
          {saved ? "保存しました" : saving ? "保存中..." : "受付期間を保存"}
        </button>
      </div>
    </div>
  );
}
