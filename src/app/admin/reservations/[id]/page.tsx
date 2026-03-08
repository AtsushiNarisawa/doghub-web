"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Reservation {
  id: string;
  plan: string;
  date: string;
  checkin_time: string;
  checkout_date: string | null;
  status: string;
  total_price: number | null;
  extra_hours_fee: number;
  walk_option: boolean;
  referral_source: string | null;
  notes: string | null;
  admin_notes: string | null;
  source: string;
  created_at: string;
  customers: {
    id: string;
    last_name: string;
    first_name: string;
    last_name_kana: string;
    first_name_kana: string;
    phone: string;
    email: string;
    postal_code: string | null;
    address: string | null;
  };
  reservation_dogs: {
    dogs: {
      id: string;
      name: string;
      breed: string;
      weight: number;
      age: number | null;
      sex: string;
      neutered: boolean;
      vaccine_expires_at: string | null;
      allergies: string | null;
      meal_notes: string | null;
      medication_notes: string | null;
    };
  }[];
}

const PLAN_LABELS: Record<string, string> = { "4h": "半日（4時間）", "8h": "1日（8時間）", stay: "宿泊" };
const STATUS_OPTIONS = [
  { value: "confirmed", label: "確定", color: "bg-green-100 text-green-700" },
  { value: "pending", label: "確認待ち", color: "bg-orange-100 text-orange-700" },
  { value: "completed", label: "完了", color: "bg-blue-100 text-blue-700" },
  { value: "cancelled", label: "キャンセル", color: "bg-gray-100 text-gray-500" },
];

export default function ReservationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [res, setRes] = useState<Reservation | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const fetchReservation = async () => {
    const { data } = await supabase
      .from("reservations")
      .select(`
        *,
        customers!inner(*),
        reservation_dogs(dogs(*))
      `)
      .eq("id", id)
      .single();

    if (data) {
      setRes(data as unknown as Reservation);
      setAdminNotes(data.admin_notes || "");
    }
    setLoading(false);
  };

  const updateStatus = async (newStatus: string) => {
    setSaving(true);
    await supabase
      .from("reservations")
      .update({ status: newStatus })
      .eq("id", id);
    await fetchReservation();
    setSaving(false);
  };

  const saveAdminNotes = async () => {
    setSaving(true);
    await supabase
      .from("reservations")
      .update({ admin_notes: adminNotes })
      .eq("id", id);
    setSaving(false);
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}（${"日月火水木金土"[date.getDay()]}）`;
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!res) {
    return <p className="text-center text-gray-500 py-8">予約が見つかりません</p>;
  }

  const customer = res.customers;
  const dogs = res.reservation_dogs.map((rd) => rd.dogs);

  return (
    <div className="space-y-4">
      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        戻る
      </button>

      {/* ステータス変更 */}
      <div className="bg-white rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-500">ステータス</h3>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateStatus(opt.value)}
              disabled={saving}
              className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                res.status === opt.value
                  ? `${opt.color} ring-2 ring-offset-1 ring-gray-300`
                  : "bg-gray-50 text-gray-400 active:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 予約情報 */}
      <div className="bg-white rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-500">予約情報</h3>
        <div className="space-y-1 text-sm">
          <p><span className="text-gray-400 inline-block w-24">プラン</span>{PLAN_LABELS[res.plan]}</p>
          <p><span className="text-gray-400 inline-block w-24">日付</span>{formatDate(res.date)}</p>
          <p><span className="text-gray-400 inline-block w-24">チェックイン</span>{res.checkin_time.slice(0, 5)}</p>
          {res.checkout_date && (
            <p><span className="text-gray-400 inline-block w-24">チェックアウト</span>{formatDate(res.checkout_date)}</p>
          )}
          <p><span className="text-gray-400 inline-block w-24">散歩</span>{res.walk_option ? "あり" : "なし"}</p>
          <p><span className="text-gray-400 inline-block w-24">予約元</span>{res.source}</p>
          {res.referral_source && (
            <p><span className="text-gray-400 inline-block w-24">きっかけ</span>{res.referral_source}</p>
          )}
          {res.notes && (
            <p><span className="text-gray-400 inline-block w-24">備考</span>{res.notes}</p>
          )}
        </div>
      </div>

      {/* お客様情報 */}
      <div className="bg-white rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-medium text-gray-500">お客様情報</h3>
        <div className="space-y-1 text-sm">
          <p className="font-medium">
            {customer.last_name} {customer.first_name}
            <span className="text-gray-400 ml-2 font-normal">
              （{customer.last_name_kana} {customer.first_name_kana}）
            </span>
          </p>
          <p>
            <a href={`tel:${customer.phone}`} className="text-[#B87942] underline">
              {customer.phone}
            </a>
          </p>
          <p>{customer.email}</p>
          {customer.address && (
            <p className="text-gray-500">〒{customer.postal_code} {customer.address}</p>
          )}
        </div>
      </div>

      {/* ワンちゃん情報 */}
      {dogs.map((dog, i) => (
        <div key={i} className="bg-white rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-500">
            {dogs.length > 1 ? `ワンちゃん ${i + 1}` : "ワンちゃん情報"}
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{dog.name}（{dog.breed}）</p>
            <p>
              <span className="text-gray-400">体重:</span> {dog.weight}kg
              <span className="text-gray-400 ml-3">年齢:</span> {dog.age}歳
              <span className="text-gray-400 ml-3">{dog.sex === "male" ? "オス" : "メス"}</span>
              <span className="text-gray-400 ml-3">{dog.neutered ? "去勢済" : "未去勢"}</span>
            </p>
            {dog.vaccine_expires_at && (
              <p><span className="text-gray-400">ワクチン期限:</span> {dog.vaccine_expires_at}</p>
            )}
            {dog.allergies && <p><span className="text-gray-400">アレルギー:</span> {dog.allergies}</p>}
            {dog.meal_notes && <p><span className="text-gray-400">食事:</span> {dog.meal_notes}</p>}
            {dog.medication_notes && <p><span className="text-gray-400">投薬:</span> {dog.medication_notes}</p>}
          </div>
        </div>
      ))}

      {/* スタッフメモ */}
      <div className="bg-white rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-gray-500">スタッフメモ</h3>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="内部メモを入力..."
          rows={3}
          className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:border-[#B87942] focus:outline-none resize-none"
        />
        <button
          onClick={saveAdminNotes}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-700 active:bg-gray-200 disabled:opacity-50"
        >
          {saving ? "保存中..." : "メモを保存"}
        </button>
      </div>
    </div>
  );
}
