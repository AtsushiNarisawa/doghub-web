"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PLAN_NAMES: Record<string, string> = {
  spot: "スポットお預かり",
  "4h": "半日お預かり（4時間）",
  "8h": "1日お預かり（8時間）",
  stay: "宿泊お預かり",
};

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
  customers: { last_name: string; first_name: string } | null;
  reservation_dogs: { dogs: { name: string } | null }[];
};

export default function CancelPage() {
  const params = useParams();
  const id = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (!id) return;
    supabase
      .from("reservations")
      .select("id, status, date, checkin_time, plan, checkout_date, customers(last_name, first_name), reservation_dogs(dogs(name))")
      .eq("id", id)
      .single()
      .then(({ data, error: e }) => {
        if (e || !data) {
          setError("予約が見つかりません");
        } else {
          const r = data as unknown as Reservation;
          if (r.status === "cancelled") {
            setError("この予約は既にキャンセルされています");
          } else {
            const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })();
            if (r.date < today) {
              setError("過去の予約はキャンセルできません");
            }
          }
          setReservation(r);
        }
        setLoading(false);
      });
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/booking/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservation_id: id, cancel_reason: cancelReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "キャンセルに失敗しました");
        setCancelling(false);
        return;
      }
      setDone(true);
    } catch {
      setError("通信エラーが発生しました");
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#F8F5F0]">
      <header className="bg-white border-b border-[#E5DDD8]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <a className="text-sm text-[#888]" href="/">← トップへ</a>
          <h1 className="font-medium text-[15px]">予約キャンセル</h1>
          <div className="w-16"></div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-[#888]">読み込み中...</div>
        ) : done ? (
          <div className="bg-white rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-[#3C200F] mb-2">キャンセルが完了しました</h2>
            <p className="text-sm text-[#888] mb-6">ご予約のキャンセルを承りました。</p>
            <a href="/" className="inline-block bg-[#3C200F] text-white px-6 py-3 rounded-xl text-sm font-medium">
              トップページへ
            </a>
          </div>
        ) : error && !reservation ? (
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <a href="/" className="text-sm text-[#B87942]">トップページへ</a>
          </div>
        ) : reservation ? (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-medium text-[#3C200F] mb-4">以下の予約をキャンセルしますか？</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-[#f0ebe5]">
                <span className="text-sm text-[#888]">お名前</span>
                <span className="text-sm">{reservation.customers?.last_name} {reservation.customers?.first_name} 様</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#f0ebe5]">
                <span className="text-sm text-[#888]">プラン</span>
                <span className="text-sm">{PLAN_NAMES[reservation.plan] || reservation.plan}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#f0ebe5]">
                <span className="text-sm text-[#888]">日付</span>
                <span className="text-sm">{formatDate(reservation.date)} {reservation.checkin_time.slice(0, 5)}</span>
              </div>
              {reservation.plan === "stay" && reservation.checkout_date && (
                <div className="flex justify-between py-2 border-b border-[#f0ebe5]">
                  <span className="text-sm text-[#888]">チェックアウト</span>
                  <span className="text-sm">{formatDate(reservation.checkout_date)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-[#f0ebe5]">
                <span className="text-sm text-[#888]">ワンちゃん</span>
                <span className="text-sm">
                  {reservation.reservation_dogs.map((rd) => rd.dogs?.name).filter(Boolean).join("、")}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {reservation.status !== "cancelled" && reservation.date >= (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })() ? (
              !confirming ? (
                <button
                  onClick={() => setConfirming(true)}
                  className="w-full py-4 rounded-xl text-base font-medium bg-red-500 text-white active:bg-red-600 transition-colors"
                >
                  この予約をキャンセルする
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#3C200F] font-medium mb-2">キャンセルの理由を教えてください（任意）</p>
                    <div className="space-y-2">
                      {[
                        "予定が変更になったため",
                        "宿泊先が見つかったため",
                        "体調不良のため",
                        "天候の影響",
                        "その他",
                      ].map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => setCancelReason(cancelReason === reason ? "" : reason)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                            cancelReason === reason
                              ? "bg-[#B87942] text-white"
                              : "bg-[#F8F5F0] text-[#3C200F] active:bg-[#E5DDD8]"
                          }`}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-center text-red-600 font-medium">この操作は取り消せません。</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setConfirming(false); setCancelReason(""); }}
                      className="flex-1 py-3 rounded-xl border border-[#E5DDD8] text-sm font-medium"
                      disabled={cancelling}
                    >
                      戻る
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium disabled:opacity-50"
                    >
                      {cancelling ? "処理中..." : "キャンセル確定"}
                    </button>
                  </div>
                </div>
              )
            ) : (
              <p className="text-center text-sm text-[#888]">
                {reservation.status === "cancelled" ? "この予約は既にキャンセルされています" : "過去の予約はキャンセルできません"}
              </p>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
