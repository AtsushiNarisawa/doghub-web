"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface DogInfo {
  name: string;
  breed: string;
  weight: number;
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
  walk_option: boolean;
  notes: string | null;
  dog_count: number;
  customers: {
    id: string;
    last_name: string;
    first_name: string;
    phone: string;
  };
  reservation_dogs: { dogs: DogInfo | null }[];
}

interface CapacityRow {
  stay_limit: number;
  day_limit: number;
  stay_booked: number;
  day_booked: number;
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

export default function AdminDashboard() {
  const [todayRes, setTodayRes] = useState<ReservationRow[]>([]);
  const [stayingOver, setStayingOver] = useState<ReservationRow[]>([]);
  const [capacity, setCapacity] = useState<CapacityRow | null>(null);
  const [pendingRes, setPendingRes] = useState<ReservationRow[]>([]);
  const [customerHistories, setCustomerHistories] = useState<Record<string, CustomerHistory>>({});
  const [loading, setLoading] = useState(true);

  const fmtDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const realToday = fmtDate(new Date());
  const [selectedDate, setSelectedDate] = useState(realToday);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);

    // 選択日のチェックイン予約
    const { data: todayData } = await supabase
      .from("reservations")
      .select(`
        id, plan, date, checkin_time, checkout_date, status, walk_option, notes, dog_count,
        customers!inner(id, last_name, first_name, phone),
        reservation_dogs(dogs(name, breed, weight, allergies, meal_notes, medication_notes))
      `)
      .eq("date", selectedDate)
      .neq("status", "cancelled")
      .order("checkin_time");

    // 宿泊中（チェックイン日 < 選択日 && チェックアウト日 >= 選択日）
    const { data: stayData } = await supabase
      .from("reservations")
      .select(`
        id, plan, date, checkin_time, checkout_date, status, walk_option, notes, dog_count,
        customers!inner(id, last_name, first_name, phone),
        reservation_dogs(dogs(name, breed, weight, allergies, meal_notes, medication_notes))
      `)
      .eq("plan", "stay")
      .lt("date", selectedDate)
      .gte("checkout_date", selectedDate)
      .neq("status", "cancelled");

    // 容量
    const { data: capData } = await supabase
      .from("daily_capacity")
      .select("*")
      .eq("date", selectedDate)
      .maybeSingle();

    // 確認待ち予約（全日程）
    const { data: pendingData } = await supabase
      .from("reservations")
      .select(`
        id, plan, date, checkin_time, checkout_date, status, walk_option, notes, dog_count,
        customers!inner(id, last_name, first_name, phone),
        reservation_dogs(dogs(name, breed, weight, allergies, meal_notes, medication_notes))
      `)
      .eq("status", "pending")
      .order("date")
      .order("checkin_time");

    const allData = [...(todayData || []), ...(stayData || []), ...(pendingData || [])] as unknown as ReservationRow[];
    const customerIds = [...new Set(allData.map((r) => r.customers.id))];

    // 各顧客の過去の予約履歴を取得
    const histories: Record<string, CustomerHistory> = {};
    if (customerIds.length > 0) {
      const { data: pastRes } = await supabase
        .from("reservations")
        .select("customer_id, date, status")
        .in("customer_id", customerIds)
        .in("status", ["confirmed", "completed"])
        .lt("date", selectedDate)
        .order("date", { ascending: false });

      for (const cid of customerIds) {
        const visits = (pastRes || []).filter((r) => r.customer_id === cid);
        histories[cid] = {
          visitCount: visits.length,
          lastVisitDate: visits.length > 0 ? visits[0].date : null,
        };
      }
    }

    setCustomerHistories(histories);
    setTodayRes((todayData as unknown as ReservationRow[]) || []);
    setStayingOver((stayData as unknown as ReservationRow[]) || []);
    setCapacity(capData || { stay_limit: 10, day_limit: 9, stay_booked: 0, day_booked: 0 });
    setPendingRes((pendingData as unknown as ReservationRow[]) || []);
    setLoading(false);
  };

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + offset);
    setSelectedDate(fmtDate(d));
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return `${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`;
  };

  const isToday = selectedDate === realToday;

  // 時間帯ごとにグループ化
  const groupByTime = (reservations: ReservationRow[]) => {
    const groups: Record<string, ReservationRow[]> = {};
    for (const r of reservations) {
      const time = r.checkin_time.slice(0, 5);
      if (!groups[time]) groups[time] = [];
      groups[time].push(r);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  };

  // アラートがある犬
  const getAlerts = (dogs: (DogInfo | null)[]) => {
    const alerts: { name: string; type: string; text: string }[] = [];
    for (const d of dogs) {
      if (!d) continue;
      if (d.allergies) alerts.push({ name: d.name, type: "allergy", text: d.allergies });
      if (d.medication_notes) alerts.push({ name: d.name, type: "med", text: d.medication_notes });
      if (d.meal_notes) alerts.push({ name: d.name, type: "meal", text: d.meal_notes });
    }
    return alerts;
  };

  // 全予約からアラートを集める
  const allReservations = [...stayingOver, ...todayRes];
  const allAlerts = allReservations.flatMap((r) =>
    getAlerts(r.reservation_dogs.map((rd) => rd.dogs))
  );

  const totalDogs = allReservations.reduce((sum, r) => sum + (r.dog_count || r.reservation_dogs.length), 0);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 日付ナビ + 概要 */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => changeDate(-1)} className="p-3 -ml-2 rounded-lg active:bg-gray-100">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-800">{formatDisplayDate(selectedDate)}</h2>
            {!isToday && (
              <button onClick={() => setSelectedDate(realToday)} className="text-xs text-[#B87942] font-medium">
                今日に戻る
              </button>
            )}
            {isToday && <p className="text-xs text-[#B87942]">今日</p>}
          </div>
          <button onClick={() => changeDate(1)} className="p-3 -mr-2 rounded-lg active:bg-gray-100">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="text-center">
            <span className="text-2xl font-medium font-dm">{totalDogs}</span>
            <p className="text-xs text-gray-500">頭</p>
          </div>
          <div className="h-10 w-px bg-gray-100" />
          <div className="text-center">
            <span className="text-2xl font-medium font-dm">{todayRes.length}</span>
            <p className="text-xs text-gray-500">本日CI</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-medium font-dm">{stayingOver.length}</span>
            <p className="text-xs text-gray-500">宿泊中</p>
          </div>
          <div className="h-10 w-px bg-gray-100" />
          {capacity && (
            <>
              <div className="text-center">
                <span className={`text-2xl font-medium font-dm ${capacity.day_booked >= capacity.day_limit ? "text-red-500" : ""}`}>
                  {capacity.day_booked}/{capacity.day_limit}
                </span>
                <p className="text-xs text-gray-500">日中枠</p>
              </div>
              <div className="text-center">
                <span className={`text-2xl font-medium font-dm ${capacity.stay_booked >= capacity.stay_limit ? "text-red-500" : ""}`}>
                  {capacity.stay_booked}/{capacity.stay_limit}
                </span>
                <p className="text-xs text-gray-500">宿泊枠</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 確認待ち予約 */}
      {pendingRes.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-orange-600">確認待ち（{pendingRes.length}件）</h3>
          {pendingRes.map((r) => {
            const dogs = r.reservation_dogs.map((rd) => rd.dogs).filter(Boolean) as DogInfo[];
            const formatD = (d: string) => {
              const dt = new Date(d + "T00:00:00");
              return `${dt.getMonth() + 1}/${dt.getDate()}（${"日月火水木金土"[dt.getDay()]}）`;
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
                <div className="flex flex-wrap gap-1 mb-1">
                  {dogs.map((dog, i) => (
                    <span key={i} className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                      {dog.name}（{dog.breed} / {dog.weight}kg）
                    </span>
                  ))}
                </div>
                {r.notes && (
                  <p className="text-xs text-gray-500">{r.notes}</p>
                )}
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

      {/* 注意事項（アレルギー・投薬・食事） */}
      {allAlerts.length > 0 && (
        <div className="bg-white rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-500">本日の注意事項</h3>
          {allAlerts.map((a, i) => (
            <div key={i} className={`px-3 py-2 rounded-lg text-sm ${
              a.type === "allergy" ? "bg-red-50 text-red-700" :
              a.type === "med" ? "bg-purple-50 text-purple-700" :
              "bg-amber-50 text-amber-700"
            }`}>
              <span className="font-medium">
                {a.type === "allergy" ? "⚠️" : a.type === "med" ? "💊" : "🍽️"} {a.name}
              </span>
              ：{a.text}
            </div>
          ))}
        </div>
      )}

      {/* 宿泊中（前日以前からの継続） */}
      {stayingOver.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            宿泊中（{stayingOver.length}件）
          </h3>
          <div className="space-y-2">
            {stayingOver.map((r) => (
              <ReservationCard key={r.id} r={r} isStayOver history={customerHistories[r.customers.id]} />
            ))}
          </div>
        </div>
      )}

      {/* 今日のタイムライン */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          本日のチェックイン（{todayRes.length}件）
        </h3>
        {todayRes.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-sm text-gray-500">
            本日のチェックイン予約はありません
          </div>
        ) : (
          <div className="space-y-2">
            {groupByTime(todayRes).map(([time, rsvs]) => (
              <div key={time}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base font-medium font-dm text-gray-700">{time}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-2 ml-1">
                  {rsvs.map((r) => (
                    <ReservationCard key={r.id} r={r} history={customerHistories[r.customers.id]} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReservationCard({ r, isStayOver, history }: { r: ReservationRow; isStayOver?: boolean; history?: CustomerHistory }) {
  const dogs = r.reservation_dogs.map((rd) => rd.dogs).filter(Boolean) as DogInfo[];
  const hasAlert = dogs.some((d) => d.allergies || d.medication_notes);
  const planColor = PLAN_COLORS[r.plan] || PLAN_COLORS.spot;
  const isRepeater = history && history.visitCount > 0;

  const formatShortDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <Link
      href={`/admin/reservations/${r.id}`}
      className="block bg-white rounded-xl p-4 active:bg-gray-50"
    >
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {isStayOver ? (
            <span className="text-sm text-purple-600 font-medium">
              CO {r.checkout_date ? `${new Date(r.checkout_date + "T00:00:00").getMonth() + 1}/${new Date(r.checkout_date + "T00:00:00").getDate()}` : ""}
            </span>
          ) : (
            <span className={`text-sm px-1.5 py-1 rounded font-medium ${planColor}`}>
              {PLAN_LABELS[r.plan]}
            </span>
          )}
          {isRepeater && (
            <span className="text-sm px-1.5 py-1 rounded bg-blue-100 text-blue-700 font-medium">
              リピーター（{history.visitCount}回目）
            </span>
          )}
          {r.status === "pending" && (
            <span className="text-sm px-1.5 py-1 rounded bg-orange-100 text-orange-700 font-medium">
              確認待ち
            </span>
          )}
          {hasAlert && <span className="text-xs">⚠️</span>}
        </div>
        <a href={`tel:${r.customers.phone}`} className="text-sm text-[#B87942]" onClick={(e) => e.stopPropagation()}>
          {r.customers.phone}
        </a>
      </div>

      <p className="text-base font-medium mb-1.5">
        {r.customers.last_name} {r.customers.first_name} 様
        {isRepeater && history.lastVisitDate && (
          <span className="text-sm text-gray-500 font-normal ml-2">
            前回 {formatShortDate(history.lastVisitDate)}
          </span>
        )}
      </p>

      {/* ワンちゃん詳細 */}
      <div className="space-y-1.5">
        {dogs.map((dog, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded shrink-0">
              {dog.name}
            </span>
            <span className="text-sm text-gray-500">
              {dog.breed} / {dog.weight}kg
            </span>
          </div>
        ))}
      </div>

      {/* 備考 */}
      {r.notes && (
        <p className="text-xs text-gray-500 mt-2 bg-gray-50 px-2 py-1.5 rounded">
          {r.notes}
        </p>
      )}
    </Link>
  );
}
