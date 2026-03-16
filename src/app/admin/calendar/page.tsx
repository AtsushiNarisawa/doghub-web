"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchSiteSettings } from "@/lib/site-settings";

interface DayData {
  date: string;
  day_booked: number;
  stay_booked: number;
  day_limit: number;
  stay_limit: number;
  closed: boolean;
}

export default function CalendarPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [dayMap, setDayMap] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);
  const [closedWeekdays, setClosedWeekdays] = useState<number[]>([3, 4]);

  useEffect(() => {
    fetchSiteSettings().then((s) => setClosedWeekdays(s.closedWeekdays));
  }, []);

  useEffect(() => {
    fetchMonth();
  }, [year, month]);

  const fetchMonth = async () => {
    setLoading(true);
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    const { data } = await supabase
      .from("daily_capacity")
      .select("*")
      .gte("date", start)
      .lte("date", end);

    const map: Record<string, DayData> = {};
    if (data) {
      for (const row of data) {
        map[row.date] = row;
      }
    }
    setDayMap(map);
    setLoading(false);
  };

  const changeMonth = (offset: number) => {
    const d = new Date(year, month + offset, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  // カレンダーグリッド生成
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getDayColor = (dateStr: string, dayOfWeek: number) => {
    if (closedWeekdays.includes(dayOfWeek)) return "bg-gray-100 text-gray-500"; // 定休日
    const d = dayMap[dateStr];
    if (!d) return "bg-white";
    if (d.closed) return "bg-gray-100 text-gray-500";
    const totalBooked = d.day_booked + d.stay_booked;
    const totalLimit = d.day_limit + d.stay_limit;
    const ratio = totalBooked / totalLimit;
    if (ratio >= 1) return "bg-red-50 border-red-200";
    if (ratio >= 0.7) return "bg-orange-50 border-orange-200";
    return "bg-green-50 border-green-200";
  };

  return (
    <div className="space-y-4">
      {/* 月ナビ */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3">
        <button onClick={() => changeMonth(-1)} className="p-3 rounded-lg active:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="font-medium">{year}年{month + 1}月</p>
        <button onClick={() => changeMonth(1)} className="p-3 rounded-lg active:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 凡例 */}
      <div className="flex flex-wrap gap-2 text-sm text-gray-500 px-1">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200" />空きあり</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-200" />残りわずか</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200" />満室</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200" />休業</span>
      </div>

      {/* カレンダー */}
      <div className="bg-white rounded-xl p-3">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 mb-2">
          {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
            <div key={d} className={`text-center text-sm font-medium py-1 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-500"
            }`}>
              {d}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const dateStr = getDateStr(day);
              const dayOfWeek = new Date(year, month, day).getDay();
              const isToday = dateStr === today;
              const d = dayMap[dateStr];
              const isClosed = closedWeekdays.includes(dayOfWeek) || d?.closed;

              return (
                <Link
                  key={i}
                  href={`/admin?date=${dateStr}`}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center text-sm transition-all active:opacity-70 ${getDayColor(dateStr, dayOfWeek)} ${isToday ? "ring-2 ring-[#B87942]" : ""}`}
                >
                  <span className={`font-medium ${
                    dayOfWeek === 0 ? "text-red-500" : dayOfWeek === 6 ? "text-blue-500" : ""
                  }`}>
                    {day}
                  </span>
                  {!isClosed && d && (
                    <span className="text-xs text-gray-500 mt-0.5">
                      {d.day_booked + d.stay_booked}
                    </span>
                  )}
                  {isClosed && (
                    <span className="text-xs text-gray-500">休</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
