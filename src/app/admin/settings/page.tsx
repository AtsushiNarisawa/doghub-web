"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

interface Settings {
  booking_window_days: number;
  closed_weekdays: number[];
}

const DEFAULT_SETTINGS: Settings = {
  booking_window_days: 180,
  closed_weekdays: [3, 4],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("key, value");
    if (data) {
      const map: Record<string, string> = {};
      for (const row of data) map[row.key] = row.value;

      setSettings({
        booking_window_days: map.booking_window_days
          ? parseInt(map.booking_window_days)
          : DEFAULT_SETTINGS.booking_window_days,
        closed_weekdays: map.closed_weekdays
          ? map.closed_weekdays.split(",").map(Number).filter((n) => !isNaN(n))
          : DEFAULT_SETTINGS.closed_weekdays,
      });
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    const updates = [
      {
        key: "booking_window_days",
        value: String(settings.booking_window_days),
        updated_at: new Date().toISOString(),
      },
      {
        key: "closed_weekdays",
        value: settings.closed_weekdays.join(","),
        updated_at: new Date().toISOString(),
      },
    ];

    await supabase.from("site_settings").upsert(updates);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleWeekday = (day: number) => {
    setSettings((prev) => ({
      ...prev,
      closed_weekdays: prev.closed_weekdays.includes(day)
        ? prev.closed_weekdays.filter((d) => d !== day)
        : [...prev.closed_weekdays, day].sort(),
    }));
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-gray-500">予約・営業設定</h2>

      {/* 受付期間 */}
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
      </div>

      {/* 定休日 */}
      <div className="bg-white rounded-xl p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">定休日（曜日）</h3>
          <p className="text-xs text-gray-400">
            毎週休業する曜日。臨時休業は容量設定ページで個別に設定できます
          </p>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAY_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => toggleWeekday(i)}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                settings.closed_weekdays.includes(i)
                  ? "bg-red-100 text-red-600 ring-2 ring-red-300 ring-offset-1"
                  : i === 0
                  ? "bg-red-50 text-red-400 active:bg-red-100"
                  : i === 6
                  ? "bg-blue-50 text-blue-400 active:bg-blue-100"
                  : "bg-gray-100 text-gray-500 active:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {settings.closed_weekdays.length === 0 ? (
          <p className="text-xs text-gray-400">定休日なし（年中無休）</p>
        ) : (
          <p className="text-xs text-gray-500">
            定休日:{" "}
            {settings.closed_weekdays.map((d) => WEEKDAY_LABELS[d]).join("・")}曜日
          </p>
        )}
      </div>

      {/* 臨時休業のガイド */}
      <div className="bg-orange-50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-orange-700 mb-1">臨時休業・臨時営業</h3>
        <p className="text-xs text-orange-600">
          特定日だけ休業または定休日に営業する場合は、
          <strong>容量設定</strong>ページで日付を選んで「臨時休業にする」にチェックを入れてください。
        </p>
      </div>

      {/* 保存ボタン */}
      <button
        onClick={saveSettings}
        disabled={saving}
        className={`w-full py-4 rounded-xl text-sm font-medium transition-all ${
          saved
            ? "bg-green-500 text-white"
            : "bg-[#B87942] text-white active:bg-[#A06830] disabled:opacity-50"
        }`}
      >
        {saved ? "保存しました ✓" : saving ? "保存中..." : "設定を保存"}
      </button>
    </div>
  );
}
