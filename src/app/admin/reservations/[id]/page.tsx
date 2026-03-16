"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
      rabies_vaccine_expires_at: string | null;
      mixed_vaccine_expires_at: string | null;
      allergies: string | null;
      meal_notes: string | null;
      medication_notes: string | null;
    };
  }[];
}

const PLAN_LABELS: Record<string, string> = { spot: "スポット（1時間〜）", "4h": "半日（4時間）", "8h": "1日（8時間）", stay: "宿泊" };
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
  const [pastVisits, setPastVisits] = useState<{ id: string; date: string; plan: string; status: string }[]>([]);
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

      // 過去の来店履歴を取得
      const customerId = (data as unknown as Reservation).customers.id;
      const { data: history } = await supabase
        .from("reservations")
        .select("id, date, plan, status")
        .eq("customer_id", customerId)
        .neq("id", id)
        .in("status", ["confirmed", "completed"])
        .order("date", { ascending: false })
        .limit(10);
      setPastVisits(history || []);
    }
    setLoading(false);
  };

  const updateStatus = async (newStatus: string) => {
    setSaving(true);
    try {
      const resp = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: id, status: newStatus }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        alert(data.error || "更新に失敗しました");
      }
      await fetchReservation();
    } catch {
      alert("通信エラーが発生しました");
    }
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

      {/* 確認待ち → 確定アクション */}
      {res.status === "pending" && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
          <p className="text-base font-medium text-orange-700">この予約は確認待ちです</p>
          <p className="text-sm text-orange-600">内容を確認のうえ、確定またはキャンセルしてください。</p>
          <button
            type="button"
            onClick={() => updateStatus("confirmed")}
            disabled={saving}
            className="w-full py-4 bg-green-600 text-white rounded-xl text-base font-medium active:bg-green-700 disabled:opacity-50"
          >
            {saving ? "処理中..." : "予約を確定する"}
          </button>
          <button
            type="button"
            onClick={() => updateStatus("cancelled")}
            disabled={saving}
            className="w-full py-3 border border-red-300 text-red-600 rounded-xl text-sm font-medium active:bg-red-50 disabled:opacity-50"
          >
            キャンセルする
          </button>
        </div>
      )}

      {/* ステータス変更 */}
      <div className="bg-white rounded-xl p-4 space-y-3">
        <h3 className="text-base font-medium text-gray-500">ステータス</h3>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateStatus(opt.value)}
              disabled={saving}
              className={`py-3 rounded-lg text-sm font-medium transition-all ${
                res.status === opt.value
                  ? `${opt.color} ring-2 ring-offset-1 ring-gray-300`
                  : "bg-gray-50 text-gray-500 active:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 予約情報 */}
      <div className="bg-white rounded-xl p-4 space-y-2">
        <h3 className="text-base font-medium text-gray-500">予約情報</h3>
        <div className="space-y-1 text-sm">
          <p><span className="text-gray-500 inline-block w-24">プラン</span>{PLAN_LABELS[res.plan]}</p>
          <p><span className="text-gray-500 inline-block w-24">日付</span>{formatDate(res.date)}</p>
          <p><span className="text-gray-500 inline-block w-24">チェックイン</span>{res.checkin_time.slice(0, 5)}</p>
          {res.checkout_date && (
            <p><span className="text-gray-500 inline-block w-24">チェックアウト</span>{formatDate(res.checkout_date)}</p>
          )}
          <p><span className="text-gray-500 inline-block w-24">散歩</span>{res.walk_option ? "あり" : "なし"}</p>
          <p><span className="text-gray-500 inline-block w-24">予約元</span>{res.source}</p>
          {res.referral_source && (
            <p><span className="text-gray-500 inline-block w-24">きっかけ</span>{res.referral_source}</p>
          )}
          {res.notes && (
            <p><span className="text-gray-500 inline-block w-24">備考</span>{res.notes}</p>
          )}
        </div>
      </div>

      {/* お客様情報 */}
      <div className="bg-white rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-500">お客様情報</h3>
          {pastVisits.length > 0 && (
            <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
              リピーター（{pastVisits.length + 1}回目）
            </span>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <p className="text-base font-medium">
            {customer.last_name} {customer.first_name}
            <span className="text-gray-500 ml-2 font-normal text-sm">
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

        {/* 過去の来店履歴 */}
        {pastVisits.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-2">過去の来店</p>
            <div className="space-y-1.5">
              {pastVisits.map((v) => {
                const d = new Date(v.date + "T00:00:00");
                const dateStr = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}（${"日月火水木金土"[d.getDay()]}）`;
                return (
                  <Link
                    key={v.id}
                    href={`/admin/reservations/${v.id}`}
                    className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                  >
                    <span className="text-gray-700">{dateStr}</span>
                    <span className="text-gray-500">{PLAN_LABELS[v.plan] || v.plan}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <Link
          href={`/admin/customers/${customer.id}`}
          className="block text-center text-sm text-[#B87942] py-2.5 border border-[#B87942] rounded-xl mt-3 active:bg-orange-50"
        >
          顧客詳細・予約履歴 →
        </Link>
      </div>

      {/* ワンちゃん情報 */}
      {dogs.map((dog, i) => (
        <div key={i} className="bg-white rounded-xl p-4 space-y-2">
          <h3 className="text-base font-medium text-gray-500">
            🐾 {dogs.length > 1 ? `ワンちゃん ${i + 1}` : "ワンちゃん情報"}
          </h3>
          <div className="space-y-1 text-sm">
            <p className="text-base font-medium">{dog.name}（{dog.breed}）</p>
            <p>
              <span className="text-gray-500">体重:</span> {dog.weight}kg
              {dog.age != null && <><span className="text-gray-500 ml-3">年齢:</span> {dog.age}歳</>}
              <span className="text-gray-500 ml-3">{dog.sex === "male" ? "オス" : "メス"}</span>
              <span className="text-gray-500 ml-3">{dog.neutered ? "去勢済" : "未去勢"}</span>
            </p>
          </div>
          {dog.allergies && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
              <p className="text-sm font-medium text-red-600 mb-1">⚠️ アレルギー・注意事項</p>
              <p className="text-sm text-red-700">{dog.allergies}</p>
            </div>
          )}
          {dog.meal_notes && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-700 mb-1">🍚 食事メモ</p>
              <p className="text-sm text-yellow-800">{dog.meal_notes}</p>
            </div>
          )}
          {dog.medication_notes && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
              <p className="text-sm font-medium text-purple-700 mb-1">💊 投薬メモ</p>
              <p className="text-sm text-purple-800">{dog.medication_notes}</p>
            </div>
          )}
        </div>
      ))}

      {/* スタッフメモ */}
      <div className="bg-white rounded-xl p-4 space-y-3">
        <h3 className="text-base font-medium text-gray-500">スタッフメモ</h3>
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
          className="px-4 py-3 rounded-lg bg-gray-100 text-sm text-gray-700 active:bg-gray-200 disabled:opacity-50"
        >
          {saving ? "保存中..." : "メモを保存"}
        </button>
      </div>
    </div>
  );
}
