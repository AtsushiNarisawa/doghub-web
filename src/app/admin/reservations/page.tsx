"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ReservationRow {
  id: string;
  customer_id: string;
  plan: string;
  date: string;
  checkin_time: string;
  checkout_date: string | null;
  status: string;
  source: string;
  notes: string | null;
  dog_count: number;
  customers: { last_name: string; first_name: string; phone: string };
  reservation_dogs: { dogs: { name: string; breed: string; weight: number; allergies: string | null } | null }[];
}

const PLAN_LABELS: Record<string, string> = {
  spot: "スポット", "4h": "半日", "8h": "1日", stay: "宿泊",
};
const PLAN_COLORS: Record<string, string> = {
  "4h": "bg-sky-100 text-sky-700",
  "8h": "bg-amber-100 text-amber-700",
  stay: "bg-purple-100 text-purple-700",
  spot: "bg-gray-100 text-gray-600",
};
const STATUS_STYLES: Record<string, { label: string; bg: string }> = {
  confirmed: { label: "確定", bg: "bg-green-100 text-green-700" },
  pending: { label: "確認待ち", bg: "bg-orange-100 text-orange-700" },
  cancelled: { label: "キャンセル", bg: "bg-gray-100 text-gray-500" },
  completed: { label: "完了", bg: "bg-blue-100 text-blue-700" },
};
const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

type ViewMode = "week" | "month" | "list";

function formatDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatDisplay(d: string) {
  const date = new Date(d + "T00:00:00");
  return `${date.getMonth() + 1}/${date.getDate()}（${WEEKDAY_LABELS[date.getDay()]}）`;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [baseDate, setBaseDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<string>(formatDateKey(new Date()));
  const [search, setSearch] = useState("");
  const [capacityMap, setCapacityMap] = useState<Record<string, { day_booked: number; day_limit: number; stay_booked: number; stay_limit: number; closed: boolean }>>({});
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});

  // カレンダーの表示範囲を計算
  const getDateRange = useCallback(() => {
    if (viewMode === "week") {
      const start = new Date(baseDate);
      start.setDate(start.getDate() - start.getDay()); // 週の日曜
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start, end };
    } else if (viewMode === "month") {
      const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      start.setDate(start.getDate() - start.getDay()); // 月初の週の日曜
      const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0);
      end.setDate(end.getDate() + (6 - end.getDay())); // 月末の週の土曜
      return { start, end };
    }
    return { start: new Date(), end: new Date() };
  }, [baseDate, viewMode]);

  // カレンダー用の日付配列
  const getCalendarDays = useCallback(() => {
    const { start, end } = getDateRange();
    const days: Date[] = [];
    const d = new Date(start);
    while (d <= end) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [getDateRange]);

  // データ取得
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    const { start, end } = getDateRange();
    const startStr = formatDateKey(start);
    const endStr = formatDateKey(end);

    let q = supabase
      .from("reservations")
      .select(`
        id, customer_id, plan, date, checkin_time, checkout_date, status, source, notes, dog_count,
        customers!inner(last_name, first_name, phone),
        reservation_dogs(dogs(name, breed, weight, allergies))
      `)
      .gte("date", startStr)
      .lte("date", endStr)
      .neq("status", "cancelled")
      .order("date", { ascending: true })
      .order("checkin_time", { ascending: true });

    if (viewMode === "list") {
      q = supabase
        .from("reservations")
        .select(`
          id, customer_id, plan, date, checkin_time, checkout_date, status, source, notes, dog_count,
          customers!inner(last_name, first_name, phone),
          reservation_dogs(dogs(name, breed, weight, allergies))
        `)
        .order("date", { ascending: false })
        .order("checkin_time", { ascending: true })
        .limit(50);
    }

    const { data } = await q;
    const rows = (data as unknown as ReservationRow[]) || [];
    setReservations(rows);

    // 顧客ごとの利用回数を取得
    const customerIds = [...new Set(rows.map(r => r.customer_id).filter(Boolean))];
    if (customerIds.length > 0) {
      const { data: allRes } = await supabase
        .from("reservations")
        .select("customer_id, status")
        .in("customer_id", customerIds)
        .in("status", ["confirmed", "completed"]);
      const counts: Record<string, number> = {};
      if (allRes) {
        for (const r of allRes) {
          counts[r.customer_id] = (counts[r.customer_id] || 0) + 1;
        }
      }
      setVisitCounts(counts);
    }

    // カレンダーモード：容量データも取得
    if (viewMode !== "list") {
      const { start, end } = getDateRange();
      const { data: capData } = await supabase
        .from("daily_capacity")
        .select("date, day_booked, day_limit, stay_booked, stay_limit, closed")
        .gte("date", formatDateKey(start))
        .lte("date", formatDateKey(end));
      const map: typeof capacityMap = {};
      if (capData) {
        for (const row of capData) {
          map[row.date] = row;
        }
      }
      setCapacityMap(map);
    }

    setLoading(false);
  }, [getDateRange, viewMode]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // 前後移動
  const navigate = (direction: number) => {
    setBaseDate((prev) => {
      const d = new Date(prev);
      if (viewMode === "week") d.setDate(d.getDate() + direction * 7);
      else d.setMonth(d.getMonth() + direction);
      return d;
    });
  };

  const goToday = () => {
    setBaseDate(new Date());
    setSelectedDate(formatDateKey(new Date()));
  };

  // 日付ごとの予約数
  const countByDate = (dateStr: string) =>
    reservations.filter((r) => r.date === dateStr && r.status !== "cancelled").length;

  // 選択日の予約
  const selectedReservations = viewMode !== "list"
    ? reservations.filter((r) => r.date === selectedDate)
    : search
      ? reservations.filter((r) => {
          const q = search.toLowerCase();
          const name = `${r.customers.last_name}${r.customers.first_name}`.toLowerCase();
          return name.includes(q) || r.customers.phone.includes(q) ||
            r.reservation_dogs.some((rd) => rd.dogs?.name?.toLowerCase().includes(q));
        })
      : reservations;

  const confirmReservation = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    await fetch("/api/admin/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservation_id: id, status: "confirmed" }),
    });
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "confirmed" } : r))
    );
  };

  const todayStr = formatDateKey(new Date());
  const calendarDays = getCalendarDays();

  // ヘッダーの表示テキスト
  const headerLabel = viewMode === "week"
    ? (() => {
        const { start, end } = getDateRange();
        return `${start.getMonth() + 1}/${start.getDate()} 〜 ${end.getMonth() + 1}/${end.getDate()}`;
      })()
    : viewMode === "month"
      ? `${baseDate.getFullYear()}年${baseDate.getMonth() + 1}月`
      : "予約一覧";

  return (
    <div className="space-y-3">
      {/* 表示切替 */}
      <div className="flex bg-gray-100 rounded-lg p-0.5">
        {([["week", "週"], ["month", "月"], ["list", "リスト"]] as [ViewMode, string][]).map(([mode, label]) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex-1 py-3 text-sm font-medium rounded-md transition-all ${
              viewMode === mode ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* カレンダーヘッダー */}
      {viewMode !== "list" && (
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-500 active:text-gray-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <span className="text-base font-medium text-gray-800">{headerLabel}</span>
            <button onClick={goToday} className="ml-2 text-sm text-[#B87942] font-medium">
              今日
            </button>
          </div>
          <button onClick={() => navigate(1)} className="p-2 text-gray-500 active:text-gray-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* カレンダー本体 */}
      {viewMode !== "list" && (
        <div className="bg-white rounded-xl p-3">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS.map((label, i) => (
              <div key={i} className={`text-center text-xs font-medium py-1 ${
                i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
              }`}>
                {label}
              </div>
            ))}
          </div>
          {/* 日付 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date) => {
              const dateStr = formatDateKey(date);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const count = countByDate(dateStr);
              const isCurrentMonth = date.getMonth() === baseDate.getMonth();
              const isClosed = [3, 4].includes(date.getDay());
              const cap = capacityMap[dateStr];
              const dayBooked = cap?.day_booked ?? 0;
              const dayLimit = cap?.day_limit ?? 9;
              const stayBooked = cap?.stay_booked ?? 0;
              const stayLimit = cap?.stay_limit ?? 10;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative rounded-lg transition-all ${
                    viewMode === "week" ? "py-2" : "py-1.5"
                  } ${
                    isSelected
                      ? "bg-[#B87942] text-white"
                      : isToday
                        ? "bg-[#B87942]/10 text-[#B87942]"
                        : isClosed
                          ? "bg-gray-50 text-gray-500"
                          : "text-gray-700 active:bg-gray-100"
                  } ${viewMode === "month" && !isCurrentMonth ? "opacity-30" : ""}`}
                >
                  <span className={`text-sm block ${isToday && !isSelected ? "font-bold" : ""}`}>
                    {date.getDate()}
                  </span>
                  {viewMode === "week" && !isClosed ? (
                    <div className="mt-1 space-y-0.5">
                      <p className={`text-xs leading-none ${
                        isSelected ? "text-white/80" : dayBooked >= dayLimit ? "text-red-500 font-medium" : "text-gray-500"
                      }`}>
                        日{dayBooked}/{dayLimit}
                      </p>
                      <p className={`text-xs leading-none ${
                        isSelected ? "text-white/80" : stayBooked >= stayLimit ? "text-red-500 font-medium" : "text-gray-500"
                      }`}>
                        泊{stayBooked}/{stayLimit}
                      </p>
                    </div>
                  ) : !isClosed && count > 0 ? (
                    <div className="flex justify-center mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-[#B87942]"
                      }`} />
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* リストモード：検索 */}
      {viewMode === "list" && (
        <div className="relative">
          <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="名前・電話番号・犬の名前"
            className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:border-[#B87942] focus:outline-none"
          />
        </div>
      )}

      {/* 選択日ヘッダー（カレンダーモード） */}
      {viewMode !== "list" && (() => {
        const cap = capacityMap[selectedDate];
        const dayB = cap?.day_booked ?? 0;
        const dayL = cap?.day_limit ?? 9;
        const stayB = cap?.stay_booked ?? 0;
        const stayL = cap?.stay_limit ?? 10;
        const isClosed = [3, 4].includes(new Date(selectedDate + "T00:00:00").getDay());
        return (
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">
                {formatDisplay(selectedDate)}
              </h3>
              <span className="text-sm text-gray-500">
                {selectedReservations.filter((r) => r.status !== "cancelled").length}件
              </span>
            </div>
            {!isClosed && (
              <div className="flex gap-3 mt-1">
                <span className={`text-sm ${dayB >= dayL ? "text-red-500 font-medium" : "text-gray-500"}`}>
                  日中 {dayB}/{dayL}
                </span>
                <span className={`text-sm ${stayB >= stayL ? "text-red-500 font-medium" : "text-gray-500"}`}>
                  宿泊 {stayB}/{stayL}
                </span>
              </div>
            )}
            {isClosed && <p className="text-sm text-gray-500 mt-1">定休日</p>}
          </div>
        );
      })()}

      {/* 予約リスト */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
        </div>
      ) : selectedReservations.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-sm text-gray-500">
          {viewMode !== "list" ? "この日の予約はありません" : "予約が見つかりません"}
        </div>
      ) : (
        <div className="space-y-2">
          {selectedReservations.flatMap((r) => {
            const st = STATUS_STYLES[r.status] || STATUS_STYLES.confirmed;
            const planColor = PLAN_COLORS[r.plan] || PLAN_COLORS.spot;
            const dogs = r.reservation_dogs.map((rd) => rd.dogs).filter(Boolean);
            const dogCards = dogs.length > 1 ? dogs : [dogs[0] || null];

            return dogCards.map((dog, di) => (
              <Link
                key={`${r.id}-${di}`}
                href={`/admin/reservations/${r.id}`}
                className="block bg-white rounded-xl p-4 active:bg-gray-50"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {viewMode === "list" && (
                      <span className="text-base font-medium text-gray-800">
                        {formatDisplay(r.date)}
                      </span>
                    )}
                    <span className="text-sm text-gray-600">
                      {r.checkin_time.slice(0, 5)}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${planColor}`}>
                      {PLAN_LABELS[r.plan] || r.plan}
                    </span>
                    {r.plan === "stay" && r.checkout_date && (
                      <span className="text-xs text-gray-500">
                        〜{new Date(r.checkout_date + "T00:00:00").getDate()}日
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {dog?.allergies && <span className="text-sm text-red-500">⚠️</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.bg}`}>
                      {st.label}
                    </span>
                  </div>
                </div>
                <p className="text-base font-medium flex items-center flex-wrap gap-1">
                  <span>{r.customers.last_name} {r.customers.first_name} 様</span>
                  {di === 0 && visitCounts[r.customer_id] && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      visitCounts[r.customer_id] === 1
                        ? "bg-green-50 text-green-600 border border-green-200"
                        : "bg-orange-50 text-orange-600 border border-orange-200"
                    }`}>
                      {visitCounts[r.customer_id] === 1 ? "初回" : `${visitCounts[r.customer_id]}回目`}
                    </span>
                  )}
                  {dog && (
                    <span className="text-sm text-gray-500">
                      {dog.name}
                    </span>
                  )}
                  {dogs.length > 1 && (
                    <span className="text-xs text-gray-500">
                      ({di + 1}/{dogs.length})
                    </span>
                  )}
                </p>
                {r.status === "pending" && di === 0 && (
                  <button
                    onClick={(e) => confirmReservation(r.id, e)}
                    className="mt-2 text-sm bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200 active:bg-green-100"
                  >
                    予約を確定する
                  </button>
                )}
              </Link>
            ));
          })}
        </div>
      )}
    </div>
  );
}
