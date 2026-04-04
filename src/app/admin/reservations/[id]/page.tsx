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
  dog_count: number;
  cancel_reason: string | null;
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
    total_visits: number;
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

const PLAN_LABELS: Record<string, string> = { spot: "スポット", "4h": "半日（4時間）", "8h": "1日（8時間）", stay: "宿泊" };
const PLAN_COLORS: Record<string, string> = {
  "4h": "bg-sky-100 text-sky-700",
  "8h": "bg-amber-100 text-amber-700",
  stay: "bg-purple-100 text-purple-700",
  spot: "bg-gray-100 text-gray-600",
};
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  confirmed: { label: "確定", color: "bg-green-100 text-green-700" },
  pending: { label: "確認待ち", color: "bg-orange-100 text-orange-700" },
  completed: { label: "完了", color: "bg-blue-100 text-blue-700" },
  cancelled: { label: "キャンセル", color: "bg-gray-100 text-gray-500" },
};

export default function ReservationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [res, setRes] = useState<Reservation | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [pastVisits, setPastVisits] = useState<{ id: string; date: string; plan: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memoSaved, setMemoSaved] = useState(false);
  const [memoEditing, setMemoEditing] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newCheckinTime, setNewCheckinTime] = useState("");
  const [newCheckoutDate, setNewCheckoutDate] = useState("");

  useEffect(() => { fetchReservation(); }, [id]);

  const fetchReservation = async () => {
    const { data } = await supabase
      .from("reservations")
      .select("*, customers!inner(*), reservation_dogs(dogs(*))")
      .eq("id", id)
      .single();

    if (data) {
      setRes(data as unknown as Reservation);
      setAdminNotes(data.admin_notes || "");
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
    if (newStatus === "cancelled" && !confirm("この予約をキャンセルしますか？")) return;
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

  const startReschedule = () => {
    if (!res) return;
    setNewDate(res.date);
    setNewCheckinTime(res.checkin_time?.slice(0, 5) || "");
    setNewCheckoutDate(res.checkout_date || "");
    setRescheduling(true);
  };

  const saveReschedule = async () => {
    if (!newDate) return;
    setSaving(true);
    try {
      const resp = await fetch("/api/admin/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservation_id: id,
          new_date: newDate,
          new_checkin_time: newCheckinTime,
          new_checkout_date: newCheckoutDate || undefined,
        }),
      });
      if (resp.ok) {
        setRescheduling(false);
        await fetchReservation();
      } else {
        const data = await resp.json().catch(() => ({}));
        alert(data.error || "変更に失敗しました");
      }
    } catch {
      alert("通信エラー");
    }
    setSaving(false);
  };

  const saveAdminNotes = async () => {
    setSaving(true);
    setMemoSaved(false);
    const { error } = await supabase
      .from("reservations")
      .update({ admin_notes: adminNotes })
      .eq("id", id);
    setSaving(false);
    if (error) {
      alert("メモの保存に失敗しました");
    } else {
      setMemoEditing(false);
      setMemoSaved(true);
      setTimeout(() => setMemoSaved(false), 3000);
    }
  };

  const fmtDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return `${date.getMonth() + 1}/${date.getDate()}（${"日月火水木金土"[date.getDay()]}）`;
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!res) return <p className="text-center text-gray-500 py-8">予約が見つかりません</p>;

  const customer = res.customers;
  const dogs = res.reservation_dogs.map((rd) => rd.dogs);
  const planColor = PLAN_COLORS[res.plan] || PLAN_COLORS.spot;

  // 日付ベースの自動完了判定
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = res.plan === "stay" && res.checkout_date
    ? new Date(res.checkout_date + "T00:00:00")
    : new Date(res.date + "T00:00:00");
  const isPast = endDate < today;
  const effectiveStatus = (res.status === "confirmed" && isPast) ? "completed" : res.status;
  const status = STATUS_MAP[effectiveStatus] || STATUS_MAP.confirmed;
  const stayNights = res.plan === "stay" && res.checkout_date
    ? Math.max(1, Math.round((new Date(res.checkout_date).getTime() - new Date(res.date).getTime()) / 86400000))
    : 0;

  return (
    <div className="space-y-3">
      {/* ヘッダー: 戻る + ステータスバッジ */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="text-sm text-gray-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${status.color}`}>{status.label}</span>
      </div>

      {/* 確認待ちアクション */}
      {res.status === "pending" && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-medium text-orange-700">この予約は確認待ちです</p>
          <button
            onClick={() => updateStatus("confirmed")}
            disabled={saving}
            className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-medium active:bg-green-700 disabled:opacity-50"
          >
            {saving ? "処理中..." : "予約を確定する"}
          </button>
          <button
            onClick={() => updateStatus("cancelled")}
            disabled={saving}
            className="w-full py-2.5 border border-red-300 text-red-600 rounded-xl text-xs active:bg-red-50 disabled:opacity-50"
          >
            キャンセルする
          </button>
        </div>
      )}

      {/* メインカード: お客様 + 予約概要 */}
      <div className="bg-white rounded-xl p-4">
        {/* お客様名 + 電話 */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-lg font-medium text-gray-800">
              {customer.last_name} {customer.first_name} 様
            </p>
            <p className="text-xs text-gray-400">
              {customer.last_name_kana} {customer.first_name_kana}
              {(() => {
                const visits = Math.max(customer.total_visits || 0, pastVisits.length + 1);
                return visits >= 2 ? (
                  <span className="ml-2 text-blue-500">{visits}回利用</span>
                ) : null;
              })()}
            </p>
          </div>
          <a href={`tel:${customer.phone}`} className="text-sm text-[#B87942] font-medium" onClick={(e) => e.stopPropagation()}>
            {customer.phone}
          </a>
        </div>

        {/* 予約概要: プラン + 日時 */}
        {rescheduling ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 space-y-2">
            <p className="text-sm font-medium text-amber-800">日程変更</p>
            <div>
              <label className="text-xs text-gray-500">日付</label>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#B87942] focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-500">チェックイン時間</label>
              <input type="time" value={newCheckinTime} onChange={(e) => setNewCheckinTime(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#B87942] focus:outline-none" />
            </div>
            {res.plan === "stay" && (
              <div>
                <label className="text-xs text-gray-500">チェックアウト日</label>
                <input type="date" value={newCheckoutDate} onChange={(e) => setNewCheckoutDate(e.target.value)}
                  min={newDate}
                  className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#B87942] focus:outline-none" />
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={saveReschedule} disabled={saving}
                className="flex-1 py-2 bg-[#B87942] text-white text-sm rounded-lg font-medium disabled:opacity-50">
                {saving ? "変更中..." : "変更を保存"}
              </button>
              <button onClick={() => setRescheduling(false)}
                className="px-4 py-2 bg-gray-100 text-sm text-gray-500 rounded-lg">
                キャンセル
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`text-sm px-2 py-1 rounded font-medium ${planColor}`}>{PLAN_LABELS[res.plan]}</span>
            <span className="text-sm text-gray-700">{fmtDate(res.date)} {res.checkin_time.slice(0, 5)}</span>
            {res.checkout_date && (
              <span className="text-sm text-gray-500">→ CO {fmtDate(res.checkout_date)}{stayNights > 1 ? `（${stayNights}泊）` : ""}</span>
            )}
            {res.status !== "cancelled" && (
              <button onClick={startReschedule} className="text-xs text-[#B87942] font-medium ml-1">
                日程変更
              </button>
            )}
          </div>
        )}
        {res.walk_option && <p className="text-xs text-[#B87942] mb-2">🐕 お散歩オプションあり</p>}

        {/* キャンセル理由 */}
        {res.status === "cancelled" && res.cancel_reason && (
          <div className="bg-red-50 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-red-500 mb-0.5">キャンセル理由</p>
            <p className="text-sm text-red-700">{res.cancel_reason}</p>
          </div>
        )}

        {/* 備考 */}
        {res.notes && (
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-gray-500 mb-0.5">📝 備考</p>
            <p className="text-sm text-gray-700">{res.notes}</p>
          </div>
        )}

        {/* 区切り線 */}
        <div className="border-t border-gray-100 pt-3">
          {/* ワンちゃん一覧 */}
          <div className="space-y-3">
            {dogs.map((dog, i) => {
              const sexLabel = dog.sex === "male" ? "オス" : dog.sex === "female" ? "メス" : "";
              const details = [dog.breed, sexLabel, dog.age != null ? `${dog.age}歳` : "", `${dog.weight}kg`, dog.neutered ? "去勢済" : ""].filter(Boolean).join(" / ");
              const hasAlert = dog.allergies || dog.meal_notes || dog.medication_notes;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-medium text-gray-800">
                      {dogs.length > 1 && <span className="text-gray-400 mr-1">{i + 1}.</span>}
                      {dog.name}
                    </p>
                    {hasAlert && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">⚠ 注意事項</span>}
                  </div>
                  <p className="text-sm text-gray-500">{details}</p>

                  {hasAlert && (
                    <div className="mt-1.5 bg-gray-50 rounded-lg px-3 py-2 text-sm space-y-1">
                      <p className="text-gray-600 font-medium text-xs">⚠ 注意事項</p>
                      {dog.allergies && <p className="text-gray-700">{dog.allergies}</p>}
                      {dog.meal_notes && <p className="text-gray-700">{dog.meal_notes}</p>}
                      {dog.medication_notes && <p className="text-gray-700">{dog.medication_notes}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* スタッフメモ */}
      <div className="bg-white rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 mb-2">スタッフメモ</p>
        {memoEditing ? (
          <>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="メモを入力..."
              rows={4}
              autoFocus
              className="w-full p-3 rounded-lg border border-gray-200 text-sm focus:border-[#B87942] focus:outline-none resize-none"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={saveAdminNotes}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[#B87942] text-white text-sm font-medium active:bg-[#A06830] disabled:opacity-50"
              >
                {saving ? "保存中..." : "保存"}
              </button>
              <button
                onClick={() => { setMemoEditing(false); setAdminNotes(res?.admin_notes || ""); }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-500 active:bg-gray-200"
              >
                キャンセル
              </button>
            </div>
          </>
        ) : adminNotes ? (
          <>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {adminNotes}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setMemoEditing(true)}
                className="text-xs text-[#B87942] font-medium active:text-[#A06830]"
              >
                メモを修正
              </button>
              {memoSaved && <span className="text-xs text-green-600">保存しました</span>}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMemoEditing(true)}
              className="text-sm text-[#B87942] font-medium active:text-[#A06830]"
            >
              + メモを追加
            </button>
            {memoSaved && <span className="text-xs text-green-600">保存しました</span>}
          </div>
        )}
      </div>

      {/* アクション */}
      {effectiveStatus !== "cancelled" && (
        <div className="bg-white rounded-xl p-4 space-y-2">
          {/* 確認メール再送 */}
          {customer.email && (
            <button
              onClick={async () => {
                if (!confirm(`${customer.last_name}様（${customer.email}）に確認メールを再送しますか？`)) return;
                setSaving(true);
                try {
                  const r = await fetch("/api/admin/resend-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reservation_id: id }),
                  });
                  const data = await r.json();
                  if (r.ok) {
                    alert(`${data.sent_to} にメールを送信しました`);
                  } else {
                    alert(`送信失敗: ${data.error}`);
                  }
                } catch {
                  alert("通信エラー");
                }
                setSaving(false);
              }}
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium active:bg-blue-100 disabled:opacity-50"
            >
              確認メールを再送する
            </button>
          )}
          {!isPast && effectiveStatus !== "pending" && (
            <button
              onClick={() => updateStatus("cancelled")}
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-red-50 text-red-500 text-sm font-medium active:bg-red-100 disabled:opacity-50"
            >
              キャンセル
            </button>
          )}
          {/* お礼メール送信ボタン */}
          {effectiveStatus === "completed" && (
            <button
              onClick={async () => {
                if (!confirm(`${customer.last_name}様にお礼メールを送信しますか？`)) return;
                setSaving(true);
                try {
                  const resp = await fetch("/api/admin/send-thankyou", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ reservation_id: id }),
                  });
                  const data = await resp.json();
                  if (resp.ok) {
                    alert(`お礼メールを送信しました${data.isFirstVisit ? "（口コミリンク付き）" : ""}`);
                  } else {
                    alert(data.error || "送信に失敗しました");
                  }
                } catch {
                  alert("通信エラーが発生しました");
                }
                setSaving(false);
              }}
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium active:bg-amber-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              お礼メールを送信
            </button>
          )}
        </div>
      )}

      {/* お客様詳細（折りたたみ） */}
      <details className="bg-white rounded-xl">
        <summary className="p-4 text-sm text-gray-500 cursor-pointer active:bg-gray-50 list-none flex items-center justify-between">
          <span>お客様詳細・来店履歴</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="px-4 pb-4 space-y-2 text-sm">
          {customer.email && <p className="text-gray-600">{customer.email}</p>}
          {customer.address && <p className="text-gray-500">〒{customer.postal_code} {customer.address}</p>}
          <p className="text-gray-400 text-xs">予約元: {res.source}{res.referral_source ? ` / ${res.referral_source}` : ""}</p>

          {pastVisits.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1.5">過去の来店</p>
              {pastVisits.map((v) => (
                <Link key={v.id} href={`/admin/reservations/${v.id}`} className="flex justify-between py-1.5 text-sm active:bg-gray-50 rounded">
                  <span className="text-gray-600">{fmtDate(v.date)}</span>
                  <span className="text-gray-400">{PLAN_LABELS[v.plan] || v.plan}</span>
                </Link>
              ))}
            </div>
          )}

          <Link
            href={`/admin/customers/${customer.id}`}
            className="block text-center text-sm text-[#B87942] py-2.5 border border-[#B87942] rounded-xl mt-2 active:bg-orange-50"
          >
            顧客詳細ページへ
          </Link>
        </div>
      </details>
    </div>
  );
}
