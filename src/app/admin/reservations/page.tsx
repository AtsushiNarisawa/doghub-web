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
  source: string;
  notes: string | null;
  created_at: string;
  customers: {
    last_name: string;
    first_name: string;
    phone: string;
  };
  reservation_dogs: {
    dogs: { name: string; breed: string; weight: number; allergies: string | null };
  }[];
}

const PLAN_LABELS: Record<string, string> = {
  spot: "スポット", "4h": "半日", "8h": "1日", stay: "宿泊",
};
const STATUS_STYLES: Record<string, { label: string; bg: string }> = {
  confirmed:  { label: "確定",     bg: "bg-green-100 text-green-700" },
  pending:    { label: "確認待ち", bg: "bg-orange-100 text-orange-700" },
  cancelled:  { label: "キャンセル", bg: "bg-gray-100 text-gray-400" },
  completed:  { label: "完了",     bg: "bg-blue-100 text-blue-700" },
};
type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 30;

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, page]);

  const fetchReservations = async () => {
    setLoading(true);
    let q = supabase
      .from("reservations")
      .select(`
        id, plan, date, checkin_time, checkout_date, status, source, notes, created_at,
        customers!inner(last_name, first_name, phone),
        reservation_dogs(dogs(name, breed, weight, allergies))
      `)
      .order("date", { ascending: false })
      .order("checkin_time", { ascending: true })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (statusFilter !== "all") q = q.eq("status", statusFilter);

    const { data } = await q;
    setReservations((data as unknown as ReservationRow[]) || []);
    setLoading(false);
  };

  const confirmReservation = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    await supabase.from("reservations").update({ status: "confirmed" }).eq("id", id);
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "confirmed" } : r))
    );
  };

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return `${date.getMonth() + 1}/${date.getDate()}（${"日月火水木金土"[date.getDay()]}）`;
  };

  const filtered = search
    ? reservations.filter((r) => {
        const q = search.toLowerCase();
        const name = `${r.customers.last_name}${r.customers.first_name}`.toLowerCase();
        return (
          name.includes(q) ||
          r.customers.phone.includes(q) ||
          r.reservation_dogs.some((rd) => rd.dogs?.name?.toLowerCase().includes(q))
        );
      })
    : reservations;

  return (
    <div className="space-y-3">
      {/* 検索 */}
      <div className="relative">
        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

      {/* ステータスフィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(["all", "pending", "confirmed", "completed", "cancelled"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-[#B87942] text-white"
                : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            {s === "all" ? "すべて" : STATUS_STYLES[s]?.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">{filtered.length}件</p>

      {/* 予約リスト */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-sm text-gray-400">
          予約が見つかりません
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => {
            const st = STATUS_STYLES[r.status] || STATUS_STYLES.confirmed;
            const dogs = r.reservation_dogs.map((rd) => rd.dogs);
            const hasAlert = dogs.some((d) => d.allergies);
            return (
              <Link
                key={r.id}
                href={`/admin/reservations/${r.id}`}
                className="block bg-white rounded-xl p-4 active:bg-gray-50"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">
                      {formatDate(r.date)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {r.checkin_time.slice(0, 5)} {PLAN_LABELS[r.plan] || r.plan}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasAlert && (
                      <span className="text-xs text-red-500">⚠️</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.bg}`}>
                      {st.label}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium">
                  {r.customers.last_name} {r.customers.first_name} 様
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {dogs.map((d, i) => (
                    <span key={i} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                      {d.name}（{d.breed}）
                    </span>
                  ))}
                </div>
                {r.status === "pending" && (
                  <button
                    onClick={(e) => confirmReservation(r.id, e)}
                    className="mt-2 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 active:bg-green-100"
                  >
                    ✓ 予約を確定する
                  </button>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* ページング */}
      {!search && (
        <div className="flex justify-between pt-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="text-sm text-gray-500 disabled:text-gray-300 px-3 py-2"
          >
            ← 前
          </button>
          <span className="text-xs text-gray-400 self-center">
            {page + 1}ページ目
          </span>
          <button
            disabled={filtered.length < PAGE_SIZE}
            onClick={() => setPage((p) => p + 1)}
            className="text-sm text-gray-500 disabled:text-gray-300 px-3 py-2"
          >
            次 →
          </button>
        </div>
      )}
    </div>
  );
}
