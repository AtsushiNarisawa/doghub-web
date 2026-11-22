"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  checkinAddonLabel,
  checkoutAddonLabel,
  CHECKOUT_ADDON_OPTIONS,
  CHECKIN_ADDON_OPTIONS,
  CHECKIN_ADDON_8H_FROM_OPTIONS,
  checkoutAddonPrice,
  formatAddonTime,
  normalizeCheckinAddonFrom,
  type CheckoutAddonPlan,
} from "@/types/booking";
import { supabase } from "@/lib/supabase";
import {
  checkoutAddonBlockReason,
  checkoutAddonCustomerMessage,
  isLateBooking,
  type CheckoutDayRow,
} from "@/lib/booking-rules";
import { WEB_ROOM_LIMIT } from "@/lib/capacity";
import { getJstToday } from "@/lib/datetime";

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
  checkout_addon_plan?: string | null;
  checkin_addon_plan?: string | null;
  checkin_addon_from?: string | null;
  dog_count?: number | null;
  checkin_extension_from?: string | null;
  checkout_extension_until?: string | null;
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

  // 宿泊に付ける半日・1日（2026-11-22 第2段＝お客様ご自身で付け外し・付け替え）。
  // 判定・文言は予約フォームと同じ（lib/booking-rules.ts）。最終の判定はサーバーが行う。
  const [coAddon, setCoAddon] = useState<CheckoutAddonPlan | "">("");
  const [ciAddon, setCiAddon] = useState<CheckoutAddonPlan | "">("");
  const [ciAddonFrom, setCiAddonFrom] = useState("");
  const [coCap, setCoCap] = useState<{ date: string; row: CheckoutDayRow | null } | null>(null);
  const coDate = reservation?.plan === "stay" ? reservation.checkout_date || "" : "";
  useEffect(() => {
    if (!coDate) return;
    let cancelled = false;
    supabase
      .from("daily_capacity")
      .select("closed, web_closed, day_booked, stay_booked")
      .eq("date", coDate)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) setCoCap({ date: coDate, row: error ? null : (data as CheckoutDayRow | null) });
      });
    return () => {
      cancelled = true;
    };
  }, [coDate]);

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
        setCoAddon((data.checkout_addon_plan as CheckoutAddonPlan | null) || "");
        setCiAddon((data.checkin_addon_plan as CheckoutAddonPlan | null) || "");
        setCiAddonFrom(data.checkin_addon_from?.slice(0, 5) || "");
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
          // 変えた側だけ送る（送らない側はサーバーが「変更しない」と扱う）
          ...(coAddonChanged ? { checkout_addon: coAddon } : {}),
          ...(ciAddonChanged ? { checkin_addon: ciAddon, checkin_addon_from: ciAddonFromNorm || "" } : {}),
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

  const ciAddonFromNorm = ciAddon ? normalizeCheckinAddonFrom(ciAddon, ciAddonFrom) : null;
  const coAddonChanged = (reservation?.checkout_addon_plan || "") !== coAddon;
  const ciAddonChanged =
    (reservation?.checkin_addon_plan || "") !== ciAddon ||
    (!!ciAddon && (reservation?.checkin_addon_from || "").slice(0, 5) !== (ciAddonFromNorm || ""));
  const hasChanges =
    (!ciAddon && checkinTime !== reservation?.checkin_time?.slice(0, 5)) ||
    (notes || "") !== (reservation?.notes || "") ||
    coAddonChanged ||
    ciAddonChanged;
  const addonIncomplete = !!ciAddon && !ciAddonFromNorm;

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

  // ── 半日・1日の付け外し（宿泊のみ） ──
  function renderAddonSection() {
    if (!reservation) return null;
    const today = getJstToday();
    const dogCount = Math.max(1, reservation.dog_count || 1);
    // 締切は新しくご予約いただくときと同じ（当日・前日17時以降の翌日分はお電話）
    const tooLate = (d: string) => !d || d <= today || isLateBooking(d, today);
    const coLocked = tooLate(coDate);
    const ciLocked = tooLate(reservation.date);
    // 今は付いていない側に新しく付けるときだけ、チェックアウト日の空きを見る（付け替えはお部屋の数が変わらない）
    const coLoaded = coCap?.date === coDate;
    const coBlock =
      !reservation.checkout_addon_plan && coLoaded
        ? checkoutAddonBlockReason(coDate, coCap!.row, { isStaff: false, addDogs: dogCount, limit: WEB_ROOM_LIMIT })
        : null;
    const choiceClass = (on: boolean, disabled = false) =>
      `py-3 rounded-lg text-sm font-medium transition-all ${
        disabled
          ? "bg-[#F8F5F0] text-[#C8BFB8] cursor-not-allowed"
          : on
            ? "bg-[#B87942] text-white"
            : "bg-[#F8F5F0] text-[#3C200F] active:bg-[#E5DDD8]"
      }`;
    const phoneNote = "直前の変更は、お手数ですがお電話（0460-80-0290）でご連絡ください。";

    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm text-[#888] block mb-1">半日・1日のお預かり</label>
          <p className="text-xs text-[#888] leading-relaxed">
            半日・1日を付けると、その時間のお部屋の枠を確保します。固定料金のため、早めにお迎えの場合も同じ金額です。
          </p>
        </div>

        {/* チェックイン前 */}
        <div>
          <p className="text-sm text-[#3C200F] mb-2">チェックイン前</p>
          {reservation.checkin_extension_from ? (
            <p className="text-xs text-[#888] bg-[#F8F5F0] rounded-lg p-3">
              早預かり（{formatAddonTime(reservation.checkin_extension_from)}から）が付いています。半日・1日への切り替えはお電話でご連絡ください。
            </p>
          ) : ciLocked ? (
            <p className="text-xs text-[#888] bg-[#F8F5F0] rounded-lg p-3">
              {checkinAddonLabel(reservation.checkin_addon_plan, reservation.checkin_addon_from) ?? "なし"}。{phoneNote}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => { setCiAddon(""); setCiAddonFrom(""); }} className={choiceClass(ciAddon === "")}>
                  なし
                </button>
                {CHECKIN_ADDON_OPTIONS.map((o) => (
                  <button
                    key={o.plan}
                    type="button"
                    onClick={() => {
                      setCiAddon(o.plan);
                      setCiAddonFrom(o.plan === "4h" ? o.from : "");
                    }}
                    className={choiceClass(ciAddon === o.plan)}
                  >
                    {o.shortName}
                  </button>
                ))}
              </div>
              {ciAddon && (
                <p className="text-xs text-[#888] mt-2">
                  {CHECKIN_ADDON_OPTIONS.find((o) => o.plan === ciAddon)?.name}（1頭あたり¥
                  {checkoutAddonPrice(ciAddon).toLocaleString()}・{CHECKIN_ADDON_OPTIONS.find((o) => o.plan === ciAddon)?.fromLabel}）
                </p>
              )}
              {ciAddon === "8h" && (
                <div className="mt-2">
                  <p className="text-sm text-[#3C200F] mb-2">何時からお預けしますか？</p>
                  <div className="grid grid-cols-3 gap-2">
                    {CHECKIN_ADDON_8H_FROM_OPTIONS.map((t) => (
                      <button key={t} type="button" onClick={() => setCiAddonFrom(t)} className={choiceClass(ciAddonFrom === t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* チェックアウト後 */}
        <div>
          <p className="text-sm text-[#3C200F] mb-2">チェックアウト後</p>
          {reservation.checkout_extension_until ? (
            <p className="text-xs text-[#888] bg-[#F8F5F0] rounded-lg p-3">
              延長（〜{formatAddonTime(reservation.checkout_extension_until)}）が付いています。半日・1日への切り替えはお電話でご連絡ください。
            </p>
          ) : coLocked ? (
            <p className="text-xs text-[#888] bg-[#F8F5F0] rounded-lg p-3">
              {checkoutAddonLabel(reservation.checkout_addon_plan) ?? "なし"}。{phoneNote}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setCoAddon("")} className={choiceClass(coAddon === "")}>
                  なし
                </button>
                {CHECKOUT_ADDON_OPTIONS.map((o) => {
                  const disabled = !!coBlock || (!reservation.checkout_addon_plan && !coLoaded);
                  return (
                    <button
                      key={o.plan}
                      type="button"
                      disabled={disabled}
                      onClick={() => setCoAddon(o.plan)}
                      className={choiceClass(coAddon === o.plan, disabled)}
                    >
                      {o.shortName}
                    </button>
                  );
                })}
              </div>
              {coBlock ? (
                <p className="text-xs text-red-500 mt-2 leading-relaxed">{checkoutAddonCustomerMessage(coBlock, coDate)}</p>
              ) : (
                coAddon && (
                  <p className="text-xs text-[#888] mt-2">
                    {CHECKOUT_ADDON_OPTIONS.find((o) => o.plan === coAddon)?.name}（1頭あたり¥
                    {checkoutAddonPrice(coAddon).toLocaleString()}・{CHECKOUT_ADDON_OPTIONS.find((o) => o.plan === coAddon)?.untilLabel}）
                  </p>
                )
              )}
            </>
          )}
        </div>
      </div>
    );
  }
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
            {reservation.plan === "stay" && checkinAddonLabel(reservation.checkin_addon_plan, reservation.checkin_addon_from) && (
              <p>{checkinAddonLabel(reservation.checkin_addon_plan, reservation.checkin_addon_from)}</p>
            )}
            {reservation.plan === "stay" && checkoutAddonLabel(reservation.checkout_addon_plan) && (
              <p>{checkoutAddonLabel(reservation.checkout_addon_plan)}</p>
            )}
            <p><span className="text-[#888] inline-block w-20">ワンちゃん</span>{dogNames}</p>
          </div>
        </div>

        {/* 変更可能な項目 */}
        <div className="bg-white rounded-xl p-5 space-y-5">
          <h2 className="font-medium text-[15px]">変更できる項目</h2>

          {/* 到着予定時間（宿泊のみグリッド表示） */}
          {reservation.plan === "stay" && ciAddon ? (
            <div>
              <label className="text-sm text-[#888] block mb-2">お預けの開始時刻</label>
              <p className="text-sm text-[#3C200F] bg-[#F8F5F0] rounded-lg p-3">
                {ciAddonFromNorm
                  ? `${formatAddonTime(ciAddonFromNorm)}にお越しください（14時の到着は不要です）`
                  : "下の「チェックイン前」で開始時刻をお選びください"}
              </p>
            </div>
          ) : reservation.plan === "stay" ? (
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

          {reservation.plan === "stay" && renderAddonSection()}

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
          disabled={saving || !hasChanges || addonIncomplete}
          className={`w-full py-4 rounded-xl text-base font-medium transition-all ${
            hasChanges && !saving && !addonIncomplete
              ? "bg-[#B87942] text-white active:bg-[#A06830]"
              : "bg-[#E5DDD8] text-[#888] cursor-not-allowed"
          }`}
        >
          {saving ? "変更中..." : hasChanges ? "変更を確定する" : "変更なし"}
        </button>

        {/* キャンセル導線。LINE予約のお客様には変更ページのリンクしか届かないため
            （lib/line.ts buildBookingConfirmMessage は modify の1本のみ）、ここに
            キャンセルへの導線が無いと「一度キャンセルして再予約を」と案内しながら
            行き止まりになる。キャンセル側は独立して電話番号下4桁の本人確認を行う。 */}
        <div className="text-center space-y-3 pt-1">
          <p className="text-xs text-[#888]">
            日付やプランの変更は、一度キャンセルして再予約をお願いいたします。
          </p>
          <a
            href={`/booking/cancel/${id}`}
            className="inline-block text-sm text-[#888] underline underline-offset-4"
          >
            予約をキャンセルする
          </a>
        </div>
      </main>
    </div>
  );
}
