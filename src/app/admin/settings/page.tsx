"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

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

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [overrides, setOverrides] = useState<DayOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingDate, setSavingDate] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);

    // 設定を取得
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

    // 4週間分のdaily_capacityを取得（臨時休業/臨時営業）
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 28);
    const { data: capData } = await supabase
      .from("daily_capacity")
      .select("date, closed")
      .gte("date", formatDate(today))
      .lte("date", formatDate(endDate));

    if (capData) {
      setOverrides(capData.filter((r) => r.closed !== null).map((r) => ({ date: r.date, closed: r.closed })));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // カレンダー用：4週間分の日付を生成
  const getCalendarDays = () => {
    const today = new Date();
    // 今週の日曜日から開始
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const days: Date[] = [];
    for (let i = 0; i < 35; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  // ある日が営業日かどうか判定
  const isDayClosed = (date: Date) => {
    const dateStr = formatDate(date);
    const override = overrides.find((o) => o.date === dateStr);
    if (override) return override.closed;
    // デフォルトは定休日設定に従う
    return settings.closed_weekdays.includes(date.getDay());
  };

  // ある日が臨時変更されているか
  const isOverridden = (date: Date) => {
    const dateStr = formatDate(date);
    return overrides.some((o) => o.date === dateStr);
  };

  // 日付をタップして臨時休業/臨時営業を切り替え
  const toggleDay = async (date: Date) => {
    const dateStr = formatDate(date);
    const today = formatDate(new Date());
    if (dateStr < today) return; // 過去日は変更不可

    const isRegularClosed = settings.closed_weekdays.includes(date.getDay());
    const currentOverride = overrides.find((o) => o.date === dateStr);
    const currentlyClosed = isDayClosed(date);

    setSavingDate(dateStr);

    if (currentOverride) {
      // オーバーライドが既にある → 削除してデフォルトに戻す
      await supabase.from("daily_capacity").update({ closed: false }).eq("date", dateStr);
      setOverrides((prev) => prev.filter((o) => o.date !== dateStr));
    } else {
      // オーバーライドなし → 反転させる
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
      setOverrides((prev) => [...prev.filter((o) => o.date !== dateStr), { date: dateStr, closed: newClosed }]);
    }

    setSavingDate(null);
  };

  // 予約受付期間の保存
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

  const calendarDays = getCalendarDays();
  const todayStr = formatDate(new Date());

  return (
    <div className="space-y-4">
      {/* 営業日カレンダー */}
      <div className="bg-white rounded-xl p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium mb-1">営業日</h3>
          <p className="text-xs text-gray-400">
            タップで臨時休業・臨時営業を切り替え
          </p>
        </div>

        {/* 凡例 */}
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-white border border-gray-200 inline-block" />
            営業
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-gray-300 inline-block" />
            定休
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-400 inline-block" />
            臨時休業
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-400 inline-block" />
            臨時営業
          </span>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={i}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* カレンダー本体 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date) => {
            const dateStr = formatDate(date);
            const isPast = dateStr < todayStr;
            const isToday = dateStr === todayStr;
            const closed = isDayClosed(date);
            const overridden = isOverridden(date);
            const isRegularClosed = settings.closed_weekdays.includes(date.getDay());
            const isSaving = savingDate === dateStr;

            // 背景色の決定
            let bgClass = "bg-white border border-gray-100";
            if (isPast) {
              bgClass = closed ? "bg-gray-200 opacity-40" : "bg-gray-50 opacity-40";
            } else if (overridden && closed) {
              // 通常営業日 → 臨時休業
              bgClass = "bg-red-100 border-2 border-red-300";
            } else if (overridden && !closed) {
              // 通常定休日 → 臨時営業
              bgClass = "bg-green-100 border-2 border-green-300";
            } else if (isRegularClosed) {
              bgClass = "bg-gray-200";
            }

            return (
              <button
                key={dateStr}
                onClick={() => !isPast && toggleDay(date)}
                disabled={isPast || isSaving}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${bgClass} ${
                  isPast ? "cursor-default" : "active:scale-95"
                }`}
              >
                <span
                  className={`text-sm leading-none ${
                    isToday
                      ? "font-bold text-[#B87942]"
                      : date.getDay() === 0
                      ? "text-red-500"
                      : date.getDay() === 6
                      ? "text-blue-500"
                      : closed && !isPast
                      ? "text-gray-400"
                      : "text-gray-700"
                  }`}
                >
                  {date.getDate()}
                </span>
                {isToday && (
                  <span className="text-[8px] text-[#B87942] font-medium leading-none mt-0.5">今日</span>
                )}
                {isSaving && (
                  <span className="text-[8px] text-gray-400 leading-none mt-0.5">...</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 定休日表示 */}
        <p className="text-xs text-gray-400">
          定休日: {settings.closed_weekdays.map((d) => WEEKDAY_LABELS[d]).join("・")}曜日
        </p>
      </div>

      {/* 予約受付期間 */}
      <div className="bg-white rounded-xl p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">予約受付期間</h3>
          <p className="text-xs text-gray-400">何日先まで予約を受け付けるか</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              setSettings((prev) => ({
                ...prev,
                booking_window_days: Math.max(7, prev.booking_window_days - 30),
              }))
            }
            className="w-11 h-11 rounded-lg bg-gray-100 text-xl font-light active:bg-gray-200 flex items-center justify-center"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <span className="text-3xl font-medium font-dm">
              {settings.booking_window_days}
            </span>
            <span className="text-sm text-gray-400 ml-1">日先まで</span>
          </div>
          <button
            onClick={() =>
              setSettings((prev) => ({
                ...prev,
                booking_window_days: Math.min(365, prev.booking_window_days + 30),
              }))
            }
            className="w-11 h-11 rounded-lg bg-gray-100 text-xl font-light active:bg-gray-200 flex items-center justify-center"
          >
            ＋
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {[30, 60, 90, 180, 365].map((d) => (
            <button
              key={d}
              onClick={() =>
                setSettings((prev) => ({ ...prev, booking_window_days: d }))
              }
              className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                settings.booking_window_days === d
                  ? "bg-[#B87942] text-white"
                  : "bg-gray-100 text-gray-500 active:bg-gray-200"
              }`}
            >
              {d}日
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
          本日から約{Math.round(settings.booking_window_days / 30)}ヶ月先まで受付
        </p>

        <button
          onClick={saveBookingWindow}
          disabled={saving}
          className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
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
