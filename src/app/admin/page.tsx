"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ReservationRow {
  id: string;
  plan: string;
  date: string;
  checkin_time: string;
  checkout_date: string | null;
  status: string;
  walk_option: boolean;
  notes: string | null;
  customers: {
    last_name: string;
    first_name: string;
    phone: string;
  };
  reservation_dogs: {
    dogs: {
      name: string;
      breed: string;
      weight: number;
    };
  }[];
}

interface CapacityRow {
  stay_limit: number;
  day_limit: number;
  stay_booked: number;
  day_booked: number;
}

const PLAN_LABELS: Record<string, string> = {
  "4h": "半日",
  "8h": "1日",
  stay: "宿泊",
};

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  confirmed: { label: "確定", color: "bg-green-100 text-green-700" },
  pending: { label: "確認待ち", color: "bg-orange-100 text-orange-700" },
  cancelled: { label: "キャンセル", color: "bg-gray-100 text-gray-500" },
  completed: { label: "完了", color: "bg-blue-100 text-blue-700" },
};

export default function AdminDashboard() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [capacity, setCapacity] = useState<CapacityRow | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);

    // 予約取得
    const { data: resData } = await supabase
      .from("reservations")
      .select(`
        id, plan, date, checkin_time, checkout_date, status, walk_option, notes,
        customers!inner(last_name, first_name, phone),
        reservation_dogs(dogs(name, breed, weight))
      `)
      .eq("date", selectedDate)
      .neq("status", "cancelled")
      .order("checkin_time");

    // 容量取得
    const { data: capData } = await supabase
      .from("daily_capacity")
      .select("*")
      .eq("date", selectedDate)
      .maybeSingle();

    // 確認待ち件数
    const { count } = await supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    setReservations((resData as unknown as ReservationRow[]) || []);
    setCapacity(
      capData || { stay_limit: 10, day_limit: 9, stay_booked: 0, day_booked: 0 }
    );
    setPendingCount(count || 0);
    setLoading(false);
  };

  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}（${"日月火水木金土"[date.getDay()]}）`;
  };

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-4">
      {/* 確認待ちアラート */}
      {pendingCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-700">
              確認待ちの予約があります
            </p>
            <p className="text-[12px] text-orange-600">{pendingCount}件</p>
          </div>
          <Link
            href="/admin/calendar"
            className="text-sm text-orange-700 font-medium px-3 py-1.5 rounded-lg bg-orange-100 active:bg-orange-200"
          >
            確認する
          </Link>
        </div>
      )}

      {/* 日付ナビ */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-lg active:bg-gray-100"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="font-medium">{formatDate(selectedDate)}</p>
          {isToday && <p className="text-[11px] text-[#B87942]">今日</p>}
        </div>
        <button
          onClick={() => changeDate(1)}
          className="p-2 rounded-lg active:bg-gray-100"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 空き状況バー */}
      {capacity && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3">
            <p className="text-[11px] text-gray-500 mb-1">日帰り</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-medium font-dm">
                {capacity.day_booked}
              </span>
              <span className="text-sm text-gray-400 mb-0.5">
                / {capacity.day_limit}
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  capacity.day_booked >= capacity.day_limit
                    ? "bg-red-400"
                    : capacity.day_booked >= capacity.day_limit - 2
                      ? "bg-orange-400"
                      : "bg-green-400"
                }`}
                style={{
                  width: `${Math.min(100, (capacity.day_booked / capacity.day_limit) * 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="bg-white rounded-xl p-3">
            <p className="text-[11px] text-gray-500 mb-1">宿泊</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-medium font-dm">
                {capacity.stay_booked}
              </span>
              <span className="text-sm text-gray-400 mb-0.5">
                / {capacity.stay_limit}
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  capacity.stay_booked >= capacity.stay_limit
                    ? "bg-red-400"
                    : capacity.stay_booked >= capacity.stay_limit - 2
                      ? "bg-orange-400"
                      : "bg-green-400"
                }`}
                style={{
                  width: `${Math.min(100, (capacity.stay_booked / capacity.stay_limit) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 予約一覧 */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-2">
          予約一覧（{reservations.length}件）
        </h2>
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-sm text-gray-400">
            この日の予約はありません
          </div>
        ) : (
          <div className="space-y-2">
            {reservations.map((r) => {
              const statusInfo = STATUS_STYLES[r.status] || STATUS_STYLES.confirmed;
              const customer = r.customers;
              const dogs = r.reservation_dogs.map((rd) => rd.dogs);
              return (
                <Link
                  key={r.id}
                  href={`/admin/reservations/${r.id}`}
                  className="block bg-white rounded-xl p-4 active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium font-dm">
                        {r.checkin_time.slice(0, 5)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {PLAN_LABELS[r.plan] || r.plan}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium">
                    {customer.last_name} {customer.first_name} 様
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {dogs.map((dog, i) => (
                      <span key={i} className="text-[12px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                        {dog.name}（{dog.breed} / {dog.weight}kg）
                      </span>
                    ))}
                  </div>
                  {r.walk_option && (
                    <span className="text-[11px] text-blue-600 mt-1 inline-block">
                      散歩オプション
                    </span>
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
