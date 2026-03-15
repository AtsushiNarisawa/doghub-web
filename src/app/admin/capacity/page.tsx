"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchSiteSettings } from "@/lib/site-settings";

interface CapacityRow {
  date: string;
  stay_limit: number;
  day_limit: number;
  stay_booked: number;
  day_booked: number;
  closed: boolean;
  note: string | null;
}

export default function CapacityPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [dayMap, setDayMap] = useState<Record<string, CapacityRow>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ stay_limit: 10, day_limit: 9, closed: false, note: "" });
  const [saving, setSaving] = useState(false);
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
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDate = new Date(year, month + 1, 0);
    const end = endDate.toISOString().split("T")[0];

    const { data } = await supabase
      .from("daily_capacity")
      .select("*")
      .gte("date", start)
      .lte("date", end);

    const map: Record<string, CapacityRow> = {};
    if (data) {
      for (const row of data) {
        map[row.date] = row;
      }
    }
    setDayMap(map);
    setLoading(false);
  };

  const selectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const existing = dayMap[dateStr];
    setEditForm({
      stay_limit: existing?.stay_limit ?? 10,
      day_limit: existing?.day_limit ?? 9,
      closed: existing?.closed ?? false,
      note: existing?.note ?? "",
    });
  };

  const saveCapacity = async () => {
    if (!selectedDate) return;
    setSaving(true);

    const existing = dayMap[selectedDate];
    if (existing) {
      await supabase
        .from("daily_capacity")
        .update({
          stay_limit: editForm.stay_limit,
          day_limit: editForm.day_limit,
          closed: editForm.closed,
          note: editForm.note || null,
        })
        .eq("date", selectedDate);
    } else {
      await supabase.from("daily_capacity").insert({
        date: selectedDate,
        stay_limit: editForm.stay_limit,
        day_limit: editForm.day_limit,
        closed: editForm.closed,
        note: editForm.note || null,
      });
    }

    await fetchMonth();
    setSaving(false);
    setSelectedDate(null);
  };

  const changeMonth = (offset: number) => {
    const d = new Date(year, month + offset, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}（${"日月火水木金土"[date.getDay()]}）`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-gray-500">
        日をタップして容量を設定
      </h2>

      {/* 月ナビ */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg active:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="font-medium">{year}年{month + 1}月</p>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-lg active:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* カレンダー */}
      <div className="bg-white rounded-xl p-3">
        <div className="grid grid-cols-7 mb-2">
          {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
            <div key={d} className={`text-center text-xs font-medium py-1 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
            }`}>{d}</div>
          ))}
        </div>
        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const dateStr = getDateStr(day);
              const d = dayMap[dateStr];
              const dayOfWeek = new Date(year, month, day).getDay();
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={i}
                  onClick={() => selectDate(dateStr)}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center text-xs transition-all ${
                    isSelected
                      ? "ring-2 ring-[#B87942] bg-[#B87942]/5"
                      : d?.closed || closedWeekdays.includes(dayOfWeek)
                        ? "bg-gray-50 text-gray-300"
                        : "bg-white active:bg-gray-50"
                  }`}
                >
                  <span className={
                    dayOfWeek === 0 ? "text-red-500" : dayOfWeek === 6 ? "text-blue-500" : ""
                  }>{day}</span>
                  {d && !d.closed && (
                    <span className="text-[10px] text-gray-400">
                      {d.day_limit}/{d.stay_limit}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 編集パネル */}
      {selectedDate && (
        <div className="bg-white rounded-xl p-4 space-y-4 border-2 border-[#B87942]/20">
          <h3 className="font-medium">{formatDate(selectedDate)} の設定</h3>

          <label className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <input
              type="checkbox"
              checked={editForm.closed}
              onChange={(e) => setEditForm({ ...editForm, closed: e.target.checked })}
              className="w-5 h-5 rounded accent-red-500"
            />
            <span className="text-sm">臨時休業にする</span>
          </label>

          {!editForm.closed && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">日帰り上限</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditForm({ ...editForm, day_limit: Math.max(0, editForm.day_limit - 1) })}
                      className="w-10 h-10 rounded-lg bg-gray-100 text-lg active:bg-gray-200"
                    >-</button>
                    <span className="text-xl font-medium font-dm w-8 text-center">{editForm.day_limit}</span>
                    <button
                      onClick={() => setEditForm({ ...editForm, day_limit: editForm.day_limit + 1 })}
                      className="w-10 h-10 rounded-lg bg-gray-100 text-lg active:bg-gray-200"
                    >+</button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">宿泊上限</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditForm({ ...editForm, stay_limit: Math.max(0, editForm.stay_limit - 1) })}
                      className="w-10 h-10 rounded-lg bg-gray-100 text-lg active:bg-gray-200"
                    >-</button>
                    <span className="text-xl font-medium font-dm w-8 text-center">{editForm.stay_limit}</span>
                    <button
                      onClick={() => setEditForm({ ...editForm, stay_limit: editForm.stay_limit + 1 })}
                      className="w-10 h-10 rounded-lg bg-gray-100 text-lg active:bg-gray-200"
                    >+</button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 block mb-1">メモ</label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  placeholder="例: イベントのため制限"
                  className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:border-[#B87942] focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDate(null)}
              className="flex-1 py-3 rounded-lg border border-gray-200 text-sm text-gray-600 active:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={saveCapacity}
              disabled={saving}
              className="flex-1 py-3 rounded-lg bg-[#B87942] text-white text-sm font-medium active:bg-[#A06830] disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
