"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface DogInfo {
  name: string;
  breed: string;
  weight: number;
  age: number | null;
  sex: string | null;
  allergies: string | null;
  meal_notes: string | null;
  medication_notes: string | null;
}

interface ReservationRow {
  id: string;
  plan: string;
  date: string;
  checkin_time: string;
  checkout_date: string | null;
  status: string;
  source: string;
  walk_option: boolean;
  notes: string | null;
  dog_count: number;
  customers: {
    id: string;
    last_name: string;
    first_name: string;
    phone: string;
    total_visits: number;
    first_visit_date: string | null;
    last_visit_date: string | null;
  };
  reservation_dogs: { dogs: DogInfo | null }[];
}

interface DaySummary {
  date: string;
  total: number;
  checkinCount: number;
  stayOverCount: number;
}

interface CustomerHistory {
  visitCount: number;
  lastVisitDate: string | null;
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
const CLOSED_WEEKDAYS = [3, 4]; // 水・木
const DAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function AdminDashboard() {
  const [todayRes, setTodayRes] = useState<ReservationRow[]>([]);
  const [stayingOver, setStayingOver] = useState<ReservationRow[]>([]);
  const [pendingRes, setPendingRes] = useState<ReservationRow[]>([]);
  const [customerHistories, setCustomerHistories] = useState<Record<string, CustomerHistory>>({});
  const [calSummaries, setCalSummaries] = useState<DaySummary[]>([]);
  const [calView, setCalView] = useState<"week" | "month">("week");
  const [loading, setLoading] = useState(true);

  const fmtDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const realToday = fmtDate(new Date());
  const [selectedDate, setSelectedDate] = useState(realToday);
  const [calOffset, setCalOffset] = useState(0);

  // 週の開始日（月曜）
  const getWeekStart = (offset: number) => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff + offset * 7);
    return d;
  };

  // 月の日付一覧（カレンダー表示用、前後の空白含む）
  const getMonthDates = (offset: number) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + offset);
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=日
    const startPad = firstDay === 0 ? 6 : firstDay - 1; // 月曜始まり
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates: (string | null)[] = [];
    for (let i = 0; i < startPad; i++) dates.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(fmtDate(new Date(year, month, i)));
    }
    return { dates, year, month };
  };

  // カレンダーの日付範囲
  const getCalDates = (): string[] => {
    if (calView === "week") {
      const start = getWeekStart(calOffset);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return fmtDate(d);
      });
    } else {
      const { dates } = getMonthDates(calOffset);
      return dates.filter(Boolean) as string[];
    }
  };

  // カレンダーのタイトル
  const getCalTitle = () => {
    if (calView === "week") {
      const start = getWeekStart(calOffset);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const sm = start.getMonth() + 1;
      const em = end.getMonth() + 1;
      if (sm === em) return `${start.getFullYear()}年${sm}月`;
      return `${sm}月〜${em}月`;
    } else {
      const { year, month } = getMonthDates(calOffset);
      return `${year}年${month + 1}月`;
    }
  };

  useEffect(() => {
    fetchCalSummaries();
  }, [calOffset, calView]);

  useEffect(() => {
    fetchDayData();
  }, [selectedDate]);

  const fetchCalSummaries = async () => {
    const dates = getCalDates();
    if (dates.length === 0) return;
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    const [{ data: res }, { data: stayRes }] = await Promise.all([
      supabase.from("reservations")
        .select("date, plan, dog_count, checkout_date, status")
        .in("status", ["confirmed", "pending"])
        .gte("date", firstDate).lte("date", lastDate),
      supabase.from("reservations")
        .select("date, plan, dog_count, checkout_date, status")
        .eq("plan", "stay").in("status", ["confirmed", "pending"])
        .lt("date", firstDate).gte("checkout_date", firstDate),
    ]);

    const summaries: DaySummary[] = dates.map((date) => {
      // チェックイン = その日が予約日の犬
      const checkinRes = (res || []).filter((r) => r.date === date);
      // 宿泊中 = 予約日 < 当日 && CO日 >= 当日
      const stayOverRes = [...(stayRes || []), ...(res || []).filter((r) => r.plan === "stay" && r.date < date)]
        .filter((r) => r.checkout_date && r.checkout_date >= date && r.date < date);
      let checkinCount = 0, stayOverCount = 0;
      for (const r of checkinRes) { checkinCount += (r.dog_count || 1); }
      for (const r of stayOverRes) { stayOverCount += r.dog_count || 1; }
      return { date, total: checkinCount + stayOverCount, checkinCount, stayOverCount };
    });

    setCalSummaries(summaries);
  };

  const fetchDayData = async () => {
    setLoading(true);

    const selectFields = `
      id, plan, date, checkin_time, checkout_date, status, source, walk_option, notes, dog_count,
      customers!inner(id, last_name, first_name, phone, total_visits, first_visit_date, last_visit_date),
      reservation_dogs(dogs(name, breed, weight, age, sex, allergies, meal_notes, medication_notes))
    `;

    const [{ data: todayData }, { data: stayData }, { data: pendingData }] = await Promise.all([
      supabase.from("reservations").select(selectFields).eq("date", selectedDate).neq("status", "cancelled").order("checkin_time"),
      supabase.from("reservations").select(selectFields).eq("plan", "stay").lt("date", selectedDate).gte("checkout_date", selectedDate).neq("status", "cancelled"),
      supabase.from("reservations").select(selectFields).eq("status", "pending").order("date").order("checkin_time"),
    ]);

    const allData = [...(todayData || []), ...(stayData || []), ...(pendingData || [])] as unknown as ReservationRow[];
    const customerIds = [...new Set(allData.map((r) => r.customers.id))];
    const displayedIds = allData.map((r) => r.id);

    const histories: Record<string, CustomerHistory> = {};
    if (customerIds.length > 0) {
      const { data: pastRes } = await supabase
        .from("reservations")
        .select("id, customer_id, date, status")
        .in("customer_id", customerIds)
        .in("status", ["confirmed", "completed"])
        .lt("date", selectedDate)
        .order("date", { ascending: false });

      for (const cid of customerIds) {
        const visits = (pastRes || []).filter((r) => r.customer_id === cid && !displayedIds.includes(r.id));
        const customer = allData.find((r) => r.customers.id === cid)?.customers;
        const importedVisits = customer?.total_visits || 0;
        const dbVisits = visits.length;
        // インポート済み利用回数 + 新システムの過去予約（重複を避けるため大きい方を採用）
        const totalCount = Math.max(importedVisits, dbVisits);
        const lastDate = visits.length > 0 ? visits[0].date : customer?.last_visit_date || null;
        histories[cid] = { visitCount: totalCount, lastVisitDate: lastDate };
      }
    }

    setCustomerHistories(histories);
    setTodayRes((todayData as unknown as ReservationRow[]) || []);
    setStayingOver((stayData as unknown as ReservationRow[]) || []);
    setPendingRes((pendingData as unknown as ReservationRow[]) || []);
    setLoading(false);
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return `${d.getMonth() + 1}月${d.getDate()}日（${DAYS[d.getDay()]}）`;
  };

  const groupByTime = (reservations: ReservationRow[]) => {
    const groups: Record<string, ReservationRow[]> = {};
    for (const r of reservations) {
      const time = r.checkin_time.slice(0, 5);
      if (!groups[time]) groups[time] = [];
      groups[time].push(r);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  const allReservations = [...stayingOver, ...todayRes];
  const totalDogs = allReservations.reduce((sum, r) => sum + (r.dog_count || r.reservation_dogs.length), 0);
  const isToday = selectedDate === realToday;

  return (
    <div className="space-y-4">
      {/* カレンダー */}
      <div className="bg-white rounded-xl p-3">
        {/* ヘッダー: 月表示 + ナビ + 切替 */}
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setCalOffset((o) => o - 1)} className="p-2 rounded-lg active:bg-gray-100">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => { setCalOffset(0); setSelectedDate(realToday); }} className="text-sm font-medium text-gray-700 active:text-[#B87942]">
              {getCalTitle()}
            </button>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => { setCalView("week"); setCalOffset(0); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${calView === "week" ? "bg-white text-gray-700 shadow-sm" : "text-gray-400"}`}
              >週</button>
              <button
                onClick={() => { setCalView("month"); setCalOffset(0); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${calView === "month" ? "bg-white text-gray-700 shadow-sm" : "text-gray-400"}`}
              >月</button>
            </div>
          </div>
          <button onClick={() => setCalOffset((o) => o + 1)} className="p-2 rounded-lg active:bg-gray-100">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 曜日ヘッダー */}
        {calView === "month" && (
          <div className="grid grid-cols-7 mb-1">
            {DAYS.slice(1).concat(DAYS[0]).map((day) => (
              <div key={day} className="text-center text-[10px] text-gray-400">{day}</div>
            ))}
          </div>
        )}

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-1">
          {calView === "month" ? (
            // 月表示
            (() => {
              const { dates } = getMonthDates(calOffset);
              return dates.map((dateStr, i) => {
                if (!dateStr) return <div key={`pad-${i}`} />;
                const d = new Date(dateStr + "T00:00:00");
                const summary = calSummaries.find((s) => s.date === dateStr);
                const isClosed = CLOSED_WEEKDAYS.includes(d.getDay());
                const isSelected = dateStr === selectedDate;
                const isTodayDate = dateStr === realToday;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex flex-col items-center py-1 rounded-lg text-center transition-colors ${
                      isSelected ? "bg-[#B87942] text-white" :
                      isClosed ? "bg-gray-50 text-gray-300" :
                      "active:bg-gray-100"
                    }`}
                  >
                    <span className={`text-xs font-dm ${isTodayDate && !isSelected ? "text-[#B87942] font-bold" : ""}`}>
                      {d.getDate()}
                    </span>
                    {summary && summary.total > 0 && (
                      <span className={`text-[9px] font-dm ${
                        isSelected ? "text-white/90" :
                        summary.total >= 8 ? "text-red-500 font-bold" :
                        "text-gray-500"
                      }`}>
                        {summary.checkinCount}/({summary.total})
                      </span>
                    )}
                  </button>
                );
              });
            })()
          ) : (
            // 週表示
            calSummaries.map((s) => {
              const d = new Date(s.date + "T00:00:00");
              const isClosed = CLOSED_WEEKDAYS.includes(d.getDay());
              const isSelected = s.date === selectedDate;
              const isTodayDate = s.date === realToday;
              return (
                <button
                  key={s.date}
                  onClick={() => setSelectedDate(s.date)}
                  className={`flex flex-col items-center py-2 rounded-lg text-center transition-colors ${
                    isSelected ? "bg-[#B87942] text-white" :
                    isClosed ? "bg-gray-50 text-gray-300" :
                    "active:bg-gray-100"
                  }`}
                >
                  <span className={`text-[10px] ${isSelected ? "text-white/80" : isClosed ? "text-gray-300" : "text-gray-400"}`}>
                    {DAYS[d.getDay()]}
                  </span>
                  <span className={`text-sm font-medium font-dm ${isTodayDate && !isSelected ? "text-[#B87942]" : ""}`}>
                    {d.getDate()}
                  </span>
                  {s.total > 0 && (
                    <span className={`text-[10px] font-dm mt-0.5 ${
                      isSelected ? "text-white/90" :
                      s.total >= 8 ? "text-red-500 font-bold" :
                      "text-gray-500"
                    }`}>
                      {s.checkinCount}/({s.total})
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 選択日の概要 */}
      <div className="px-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-800">{formatDisplayDate(selectedDate)}</h2>
          <span className="text-lg font-medium font-dm">{totalDogs}頭</span>
        </div>
        {totalDogs > 0 && (() => {
          const dayCount = todayRes.filter((r) => r.plan !== "stay").reduce((s, r) => s + (r.dog_count || r.reservation_dogs.length), 0);
          const stayCount = todayRes.filter((r) => r.plan === "stay").reduce((s, r) => s + (r.dog_count || r.reservation_dogs.length), 0)
            + stayingOver.reduce((s, r) => s + (r.dog_count || r.reservation_dogs.length), 0);
          const parts: string[] = [];
          if (dayCount > 0) parts.push(`日中${dayCount}`);
          if (stayCount > 0) parts.push(`宿泊${stayCount}`);
          return (
            <div className="mt-1 text-xs text-gray-400">
              {parts.join("・")}
            </div>
          );
        })()}
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <>
          {/* 確認待ち予約 */}
          {pendingRes.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-orange-600">確認待ち（{pendingRes.length}件）</h3>
              {pendingRes.map((r) => {
                const dogs = r.reservation_dogs.map((rd) => rd.dogs).filter(Boolean) as DogInfo[];
                const formatD = (dd: string) => {
                  const dt = new Date(dd + "T00:00:00");
                  return `${dt.getMonth() + 1}/${dt.getDate()}（${DAYS[dt.getDay()]}）`;
                };
                return (
                  <Link key={r.id} href={`/admin/reservations/${r.id}`} className="block bg-orange-50 border border-orange-200 rounded-xl p-4 active:bg-orange-100">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-base font-medium text-gray-800">
                          {r.customers.last_name} {r.customers.first_name} 様
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {formatD(r.date)} {r.checkin_time.slice(0, 5)} / {PLAN_LABELS[r.plan]}
                        </p>
                      </div>
                      <span className="text-sm text-orange-600 font-medium">確認待ち</span>
                    </div>
                    {dogs.map((dog, i) => (
                      <DogLine key={i} dog={dog} />
                    ))}
                    <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                      タップして確認・確定
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </p>
                  </Link>
                );
              })}
            </div>
          )}

          {(() => {
            const dayCare = todayRes.filter((r) => r.plan !== "stay");
            const stayCheckin = todayRes.filter((r) => r.plan === "stay");
            const stayCheckoutAll = [...stayingOver].sort((a, b) =>
              (a.checkout_date || "").localeCompare(b.checkout_date || "")
            );
            const renderTimeGroup = (rs: ReservationRow[]) => (
              <div className="space-y-2">
                {groupByTime(rs).map(([time, group]) => (
                  <div key={time}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-medium font-dm text-gray-500">チェックイン {time}</span>
                      <div className="flex-1 h-px bg-[#E5DDD8]" />
                    </div>
                    <div className="space-y-2 ml-1">
                      {group.map((r) => (
                        <ReservationCards key={r.id} r={r} history={customerHistories[r.customers.id]} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
            const hasAny = dayCare.length + stayCheckin.length + stayCheckoutAll.length > 0;

            return (
              <>
                {/* 日中預かり */}
                {dayCare.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-[#B87942]">
                      <h3 className="text-lg font-medium text-[#B87942]">
                        日中預かり
                      </h3>
                      <span className="text-sm text-[#B87942]/70">（{dayCare.length}件）</span>
                    </div>
                    {renderTimeGroup(dayCare)}
                  </div>
                )}

                {/* 宿泊 */}
                {stayCheckin.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-purple-500">
                      <h3 className="text-lg font-medium text-purple-600">
                        宿泊
                      </h3>
                      <span className="text-sm text-purple-600/70">（{stayCheckin.length}件）</span>
                    </div>
                    {renderTimeGroup(stayCheckin)}
                  </div>
                )}

                {/* 宿泊中 → チェックアウト */}
                {stayCheckoutAll.length > 0 && (
                  <div className="opacity-80">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-gray-300">
                      <h3 className="text-lg font-medium text-gray-500">
                        宿泊中 → チェックアウト
                      </h3>
                      <span className="text-sm text-gray-400">（{stayCheckoutAll.length}件）</span>
                    </div>
                    <div className="space-y-2">
                      {stayCheckoutAll.map((r) => (
                        <ReservationCards key={r.id} r={r} isStayOver history={customerHistories[r.customers.id]} />
                      ))}
                    </div>
                  </div>
                )}

                {!hasAny && (
                  <div className="bg-white rounded-xl p-8 text-center text-sm text-gray-500">
                    予約はありません
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}

/** 犬情報1行表示（統一フォーマット） */
function DogLine({ dog }: { dog: DogInfo }) {
  const sexLabel = dog.sex === "male" ? "オス" : dog.sex === "female" ? "メス" : "";
  const details = [dog.breed, sexLabel, dog.age != null ? `${dog.age}歳` : "", `${dog.weight}kg`].filter(Boolean).join(" / ");
  return (
    <p className="text-sm">
      <span className="font-medium text-gray-700">{dog.name}</span>
      <span className="text-gray-400 ml-2">{details}</span>
    </p>
  );
}

/** 1予約=1カード（複数頭は縦並びで表示） */
function ReservationCards({ r, isStayOver, history }: { r: ReservationRow; isStayOver?: boolean; history?: CustomerHistory }) {
  const dogs = r.reservation_dogs.map((rd) => rd.dogs).filter(Boolean) as DogInfo[];
  const totalDogs = dogs.length || r.dog_count || 1;
  const hasDogAlert = dogs.some((d) => d.allergies || d.meal_notes || d.medication_notes);
  const hasNotes = r.notes;
  const planColor = PLAN_COLORS[r.plan] || PLAN_COLORS.spot;
  const isRepeater = history && history.visitCount >= 2;

  return (
    <Link
      href={`/admin/reservations/${r.id}`}
      className="block bg-white rounded-xl p-4 active:bg-gray-50"
    >
      {/* 上段: プランバッジ + バッジ */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2 flex-wrap">
          {isStayOver ? (
            <span className="text-sm text-purple-600 font-medium">
              CO {r.checkout_date ? `${new Date(r.checkout_date + "T00:00:00").getMonth() + 1}/${new Date(r.checkout_date + "T00:00:00").getDate()}` : ""}
            </span>
          ) : (
            <span className={`text-sm px-1.5 py-0.5 rounded font-medium ${planColor}`}>
              {PLAN_LABELS[r.plan]}
            </span>
          )}
          {totalDogs > 1 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{totalDogs}頭</span>
          )}
          {r.source === "line" && (
            <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-700 border border-green-300">LINE</span>
          )}
          {r.source === "web" && (
            <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-100 text-blue-700 border border-blue-300">WEB</span>
          )}
          {r.source === "phone" && (
            <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-600">電話</span>
          )}
          {r.source === "walk_in" && (
            <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-amber-100 text-amber-700 border border-amber-300">来店</span>
          )}
          {isRepeater && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
              {history.visitCount}回利用
            </span>
          )}
          {r.status === "pending" && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">確認待ち</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {hasDogAlert && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">⚠ 注意事項</span>}
          {hasNotes && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">📝 備考</span>}
        </div>
      </div>

      {/* 中段: お客様名 + 電話 */}
      <div className="flex items-center justify-between">
        <p className="text-base font-medium text-gray-800">
          {r.customers.last_name} {r.customers.first_name} 様
        </p>
        <a href={`tel:${r.customers.phone}`} className="text-xs text-[#B87942]" onClick={(e) => e.stopPropagation()}>
          {r.customers.phone}
        </a>
      </div>

      {/* 犬情報（複数頭は縦並び） */}
      {dogs.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {dogs.map((dog, i) => (
            <DogLine key={i} dog={dog} />
          ))}
        </div>
      )}
    </Link>
  );
}
