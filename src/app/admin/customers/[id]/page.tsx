"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Customer {
  id: string;
  last_name: string;
  first_name: string;
  last_name_kana: string;
  first_name_kana: string;
  phone: string;
  email: string;
  postal_code: string | null;
  address: string | null;
  source: string;
  notes: string | null;
  line_id: string | null;
  created_at: string;
}

interface Dog {
  id: string;
  name: string;
  breed: string;
  weight: number;
  age: number | null;
  sex: string;
  allergies: string | null;
  meal_notes: string | null;
  medication_notes: string | null;
}

interface ReservationSummary {
  id: string;
  plan: string;
  date: string;
  status: string;
  source: string;
  reservation_dogs: { dogs: { name: string } }[];
}

const PLAN_LABELS: Record<string, string> = {
  spot: "スポット", "4h": "半日", "8h": "1日", stay: "宿泊",
};
const STATUS_STYLES: Record<string, { label: string; bg: string }> = {
  confirmed:  { label: "確定",       bg: "bg-green-100 text-green-700" },
  pending:    { label: "確認待ち",   bg: "bg-orange-100 text-orange-700" },
  cancelled:  { label: "キャンセル", bg: "bg-gray-100 text-gray-400" },
  completed:  { label: "完了",       bg: "bg-blue-100 text-blue-700" },
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    const [customerRes, dogsRes, resRes] = await Promise.all([
      supabase.from("customers").select("*").eq("id", id).single(),
      supabase.from("dogs").select("*").eq("customer_id", id).order("created_at"),
      supabase
        .from("reservations")
        .select("id, plan, date, status, source, reservation_dogs(dogs(name))")
        .eq("customer_id", id)
        .order("date", { ascending: false })
        .limit(20),
    ]);

    if (customerRes.data) {
      const c = customerRes.data as Customer;
      setCustomer(c);
      setEditData(c);
      setNotes(c.notes || "");
    }
    setDogs((dogsRes.data as Dog[]) || []);
    setReservations((resRes.data as unknown as ReservationSummary[]) || []);
    setLoading(false);
  };

  const saveCustomer = async () => {
    setSaving(true);
    await supabase.from("customers").update(editData).eq("id", id);
    setCustomer((prev) => prev ? { ...prev, ...editData } : prev);
    setEditMode(false);
    setSaving(false);
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    await supabase.from("customers").update({ notes }).eq("id", id);
    setSavingNotes(false);
  };

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return `${date.getMonth() + 1}/${date.getDate()}（${"日月火水木金土"[date.getDay()]}）`;
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }
  if (!customer) {
    return <div className="py-20 text-center text-sm text-gray-400">顧客が見つかりません</div>;
  }

  const completedCount = reservations.filter((r) => r.status !== "cancelled").length;

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-lg active:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="font-medium">{customer.last_name} {customer.first_name} 様</h2>
          {(customer.last_name_kana || customer.first_name_kana) && (
            <p className="text-xs text-gray-400">{customer.last_name_kana} {customer.first_name_kana}</p>
          )}
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{completedCount}回利用</span>
      </div>

      {/* この顧客で新規予約 */}
      <Link
        href={`/admin/new-booking?customer_id=${id}`}
        className="flex items-center justify-center gap-2 w-full py-3 bg-[#B87942] text-white rounded-xl text-sm font-medium active:bg-[#a06535]"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        この顧客で予約を作成する
      </Link>

      {/* 顧客情報 */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500">お客様情報</p>
          <button
            onClick={() => editMode ? saveCustomer() : setEditMode(true)}
            disabled={saving}
            className="text-xs text-[#B87942] font-medium disabled:opacity-50"
          >
            {editMode ? (saving ? "保存中..." : "保存") : "編集"}
          </button>
        </div>
        {editMode ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400">姓</label>
                <input
                  value={editData.last_name || ""}
                  onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">名</label>
                <input
                  value={editData.first_name || ""}
                  onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400">電話番号</label>
              <input
                value={editData.phone || ""}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                type="tel"
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">メール</label>
              <input
                value={editData.email || ""}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                type="email"
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
              />
            </div>
            <button
              onClick={() => setEditMode(false)}
              className="w-full py-2 text-sm text-gray-500 bg-gray-50 rounded-xl"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">電話番号</span>
              <a href={`tel:${customer.phone}`} className="text-sm text-[#B87942] font-medium">
                {customer.phone}
              </a>
            </div>
            {customer.email && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-gray-400 shrink-0">メール</span>
                <span className="text-sm text-gray-700 text-right truncate">{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs text-gray-400 shrink-0 pt-0.5">住所</span>
                <span className="text-sm text-gray-700 text-right">〒{customer.postal_code}<br />{customer.address}</span>
              </div>
            )}
            {customer.line_id && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">LINE</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">連携済み</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ワンちゃん */}
      <div className="bg-white rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 mb-3">登録ワンちゃん（{dogs.length}頭）</p>
        {dogs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-2">ワンちゃん情報なし</p>
        ) : (
          <div className="space-y-3">
            {dogs.map((dog) => (
              <div key={dog.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium">{dog.name}（{dog.breed}）</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {dog.weight}kg
                  {dog.age != null && ` / ${dog.age}歳`}
                  {" / "}{dog.sex === "male" ? "オス" : "メス"}
                </p>
                {dog.allergies && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {dog.allergies}</p>
                )}
                {dog.meal_notes && (
                  <p className="text-xs text-yellow-700 mt-0.5">🍚 {dog.meal_notes}</p>
                )}
                {dog.medication_notes && (
                  <p className="text-xs text-purple-700 mt-0.5">💊 {dog.medication_notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* スタッフメモ */}
      <div className="bg-white rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 mb-2">スタッフメモ</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="顧客についての内部メモ..."
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:border-[#B87942] focus:outline-none resize-none"
        />
        <button
          onClick={saveNotes}
          disabled={savingNotes}
          className="mt-2 w-full py-2.5 bg-[#B87942] text-white rounded-xl text-sm font-medium disabled:opacity-50"
        >
          {savingNotes ? "保存中..." : "メモを保存"}
        </button>
      </div>

      {/* 予約履歴 */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">予約履歴（直近{reservations.length}件）</p>
        {reservations.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-sm text-gray-400">
            予約履歴なし
          </div>
        ) : (
          <div className="space-y-2">
            {reservations.map((r) => {
              const st = STATUS_STYLES[r.status] || STATUS_STYLES.confirmed;
              const dogNames = r.reservation_dogs.map((rd) => rd.dogs.name).join("・");
              return (
                <Link
                  key={r.id}
                  href={`/admin/reservations/${r.id}`}
                  className="block bg-white rounded-xl p-3 active:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{formatDate(r.date)}</span>
                      <span className="text-xs text-gray-400 ml-2">{PLAN_LABELS[r.plan]}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${st.bg}`}>{st.label}</span>
                  </div>
                  {dogNames && (
                    <p className="text-xs text-gray-400 mt-0.5">🐾 {dogNames}</p>
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
