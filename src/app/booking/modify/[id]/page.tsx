"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

const PLAN_NAMES: Record<string, string> = {
  spot: "スポットお預かり",
  "4h": "半日お預かり（4時間）",
  "8h": "1日お預かり（8時間）",
  stay: "宿泊お預かり",
};

const STAY_TIMES = ["14:00", "15:00", "16:00", "17:00"];

function formatDate(d: string) {
  if (!d) return "";
  const date = new Date(d);
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${days[date.getDay()]}）`;
}

type Reservation = {
  id: string;
  status: string;
  date: string;
  checkin_time: string;
  plan: string;
  checkout_date: string | null;
  notes: string | null;
  customers: { last_name: string; first_name: string } | null;
  reservation_dogs: { dogs: { name: string; breed: string } | null }[];
};

export default function ModifyPage() {
  const params = useParams();
  const id = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [checkinTime, setCheckinTime] = useState("");
  const [notes, setNotes] = useState("");
  const [phone4, setPhone4] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // 本人確認（電話番号の下4桁）→ 一致したら予約内容を取得
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone4.replace(/\D/g, "").length < 4) {
      setError("電話番号の下4桁を入力してください");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch(`/api/booking/reservation/${id}?phone_last4=${encodeURIComponent(phone4)}`);
      if (res.status === 403) {
        setError("電話番号が一致しません。ご予約時の電話番号の下4桁をご確認ください。");
        setVerifying(false);
        return;
      }
      if (!res.ok) {
        setError("予約が見つかりません");
        setVerifying(false);
        return;
      }
      const { reservation: data } = await res.json();
      if (data) {
        setReservation(data as Reservation);
        setCheckinTime(data.checkin_time?.slice(0, 5) || "");
        setNotes(data.notes || "");
      }
      setVerified(true);
      setVerifying(false);
    } catch {
      setError("通信エラーが発生しました");
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!reservation) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/booking/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: id,
          checkin_time: checkinTime,
          notes: notes || null,
          phone_last4: phone4,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "変更に失敗しました");
      } else {
        setDone(true);
      }
    } catch {
      setError("通信エラーが発生しました");
    }
    setSaving(false);
  };

  const hasChanges =
    checkinTime !== reservation?.checkin_time?.slice(0, 5) ||
    (notes || "") !== (reservation?.notes || "");

  if (!verified) {
    return (
      <div className="min-h-dvh bg-[#F8F5F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
          <h1 className="text-lg font-medium text-[#3C200F] mb-2">ご本人確認</h1>
          <p className="text-sm text-[#888] mb-4">ご予約時の電話番号の下4桁をご入力ください。</p>
          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="tel"
              inputMode="numeric"
              maxLength={4}
              value={phone4}
              onChange={(e) => setPhone4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="例: 0290"
              className="w-full p-4 rounded-xl border border-[#E5DDD8] text-center text-2xl tracking-[0.5em] focus:border-[#B87942] focus:outline-none"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={verifying}
              className="w-full py-4 rounded-xl bg-[#3C200F] text-white text-base font-medium disabled:opacity-50"
            >
              {verifying ? "確認中..." : "予約内容を表示"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-dvh bg-[#F8F5F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full">
          <p className="text-4xl mb-4">😢</p>
          <h1 className="text-lg font-medium mb-2">予約が見つかりません</h1>
          <p className="text-sm text-[#888]">URLが正しいかご確認ください。</p>
        </div>
      </div>
    );
  }

  if (reservation.status === "cancelled") {
    return (
      <div className="min-h-dvh bg-[#F8F5F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full">
          <p className="text-4xl mb-4">🚫</p>
          <h1 className="text-lg font-medium mb-2">キャンセル済みの予約です</h1>
          <p className="text-sm text-[#888]">この予約は既にキャンセルされています。</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-dvh bg-[#F8F5F0] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full">
          <p className="text-4xl mb-4">✅</p>
          <h1 className="text-lg font-medium mb-2">変更が完了しました</h1>
          <p className="text-sm text-[#888] mb-6">スタッフにも変更内容を通知しました。</p>
          <a
            href="/"
            className="inline-block bg-[#B87942] text-white px-8 py-3 rounded-xl text-sm font-medium"
          >
            トップページへ
          </a>
        </div>
      </div>
    );
  }

  const customerName = `${reservation.customers?.last_name || ""}${reservation.customers?.first_name || ""}`;
  const dogNames = reservation.reservation_dogs
    ?.map((rd) => rd.dogs?.name)
    .filter(Boolean)
    .join("、");

  return (
    <div className="min-h-dvh bg-[#F8F5F0]">
      <header className="bg-white border-b border-[#E5DDD8] sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <a className="text-sm text-[#888]" href="/">← トップへ</a>
          <h1 className="font-medium text-[15px]">予約内容の変更</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 予約概要（変更不可） */}
        <div className="bg-white rounded-xl p-5 space-y-3">
          <h2 className="font-medium text-[15px] mb-3">ご予約内容</h2>
          <div className="text-sm space-y-2 text-[#3C200F]">
            <p><span className="text-[#888] inline-block w-20">お名前</span>{customerName} 様</p>
            <p><span className="text-[#888] inline-block w-20">プラン</span>{PLAN_NAMES[reservation.plan]}</p>
            <p><span className="text-[#888] inline-block w-20">日付</span>{formatDate(reservation.date)}</p>
            {reservation.checkout_date && (
              <p><span className="text-[#888] inline-block w-20">チェックアウト</span>{formatDate(reservation.checkout_date)}</p>
            )}
            <p><span className="text-[#888] inline-block w-20">ワンちゃん</span>{dogNames}</p>
          </div>
        </div>

        {/* 変更可能な項目 */}
        <div className="bg-white rounded-xl p-5 space-y-5">
          <h2 className="font-medium text-[15px]">変更できる項目</h2>

          {/* 到着予定時間（宿泊のみグリッド表示） */}
          {reservation.plan === "stay" ? (
            <div>
              <label className="text-sm text-[#888] block mb-2">到着予定時間（目安）</label>
              <div className="grid grid-cols-4 gap-2">
                {STAY_TIMES.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setCheckinTime(time)}
                    className={`py-3 rounded-lg text-sm font-medium transition-all ${
                      checkinTime === time
                        ? "bg-[#B87942] text-white"
                        : "bg-[#F8F5F0] text-[#3C200F] active:bg-[#E5DDD8]"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#888] mt-2">当日のご都合に合わせて変更できます。</p>
            </div>
          ) : (
            <div>
              <label className="text-sm text-[#888] block mb-2">チェックイン時間</label>
              <p className="text-sm text-[#3C200F] bg-[#F8F5F0] rounded-lg p-3">
                {checkinTime}
                <span className="text-xs text-[#888] ml-2">（時間の変更はお電話でご連絡ください）</span>
              </p>
            </div>
          )}

          {/* 備考 */}
          <div>
            <label className="text-sm text-[#888] block mb-2">備考・連絡事項</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="到着が遅れる場合や、お伝えしたいことがあればご記入ください"
              className="w-full border border-[#E5DDD8] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B87942]/30 bg-white"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !hasChanges}
          className={`w-full py-4 rounded-xl text-base font-medium transition-all ${
            hasChanges && !saving
              ? "bg-[#B87942] text-white active:bg-[#A06830]"
              : "bg-[#E5DDD8] text-[#888] cursor-not-allowed"
          }`}
        >
          {saving ? "変更中..." : hasChanges ? "変更を確定する" : "変更なし"}
        </button>

        <p className="text-center text-xs text-[#888]">
          日付やプランの変更は、一度キャンセルして再予約をお願いいたします。
        </p>
      </main>
    </div>
  );
}
