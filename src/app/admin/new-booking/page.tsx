"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PLANS } from "@/types/booking";

interface CustomerResult {
  id: string;
  last_name: string;
  first_name: string;
  phone: string;
  email: string;
  dogs: { id: string; name: string; breed: string; weight: number }[];
}

type Step = "search" | "form";

const CHECKIN_TIMES: Record<string, string[]> = {
  "4h":   ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00"],
  "8h":   ["07:00","09:00"],
  stay:   ["14:00","15:00","16:00","17:00"],
  spot:   ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"],
};

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCustomerId = searchParams.get("customer_id");

  const [step, setStep] = useState<Step>(prefilledCustomerId ? "form" : "search");
  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [customer, setCustomer] = useState<CustomerResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  // 新規顧客フォーム
  const [newCustomer, setNewCustomer] = useState({ last_name: "", first_name: "", phone: "", email: "" });
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // 予約フォーム
  const [plan, setPlan] = useState("");
  const [date, setDate] = useState("");
  const [checkinTime, setCheckinTime] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);
  const [walkOption, setWalkOption] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // 既存顧客IDで直接開いた場合
  useEffect(() => {
    if (prefilledCustomerId) {
      loadCustomerById(prefilledCustomerId);
    }
  }, [prefilledCustomerId]);

  const loadCustomerById = async (customerId: string) => {
    const { data } = await supabase
      .from("customers")
      .select("id, last_name, first_name, phone, email, dogs(id, name, breed, weight)")
      .eq("id", customerId)
      .single();
    if (data) {
      setCustomer(data as unknown as CustomerResult);
      setStep("form");
    }
  };

  const searchCustomer = async () => {
    if (!phone.trim()) return;
    setSearching(true);
    setNotFound(false);
    const normalized = phone.replace(/[-\s]/g, "");

    const { data } = await supabase
      .from("customers")
      .select("id, last_name, first_name, phone, email, dogs(id, name, breed, weight)")
      .eq("phone", normalized)
      .maybeSingle();

    if (data) {
      setCustomer(data as unknown as CustomerResult);
      setIsNewCustomer(false);
      setStep("form");
    } else {
      setNotFound(true);
      setNewCustomer((prev) => ({ ...prev, phone: normalized }));
    }
    setSearching(false);
  };

  const handleNewCustomer = () => {
    setIsNewCustomer(true);
    setCustomer(null);
    setStep("form");
  };

  const toggleDog = (dogId: string) => {
    setSelectedDogIds((prev) =>
      prev.includes(dogId) ? prev.filter((id) => id !== dogId) : [...prev, dogId]
    );
  };

  const submit = async () => {
    if (!plan || !date || !checkinTime) return;
    if (!customer && !isNewCustomer) return;
    if (isNewCustomer && (!newCustomer.last_name || !newCustomer.phone)) return;

    setSubmitting(true);
    setSubmitError("");
    const defaultDog = { name: "（未登録）", breed: "不明", weight: "5", age: "", age_months: "", sex: "male" as const, has_rabies_vaccine: false, has_mixed_vaccine: false, allergies: "", meal_notes: "", medication_notes: "" };
    try {
      const selectedDogs = customer && (customer.dogs || []).length > 0
        ? (customer.dogs || [])
            .filter((d) => selectedDogIds.includes(d.id))
            .map((d) => ({
              id: d.id,
              name: d.name,
              breed: d.breed || "不明",
              weight: String(d.weight || 5),
              age: "",
              age_months: "",
              sex: "male" as const,
              has_rabies_vaccine: false,
              has_mixed_vaccine: false,
              allergies: "",
              meal_notes: "",
              medication_notes: "",
            }))
        : [defaultDog];
      const body = {
        plan,
        date,
        checkin_time: checkinTime,
        checkout_date: plan === "stay" ? checkoutDate : undefined,
        walk_option: walkOption,
        notes,
        dogs: selectedDogs,
        customer: customer
          ? {
              id: customer.id,
              last_name: customer.last_name,
              first_name: customer.first_name,
              last_name_kana: "",
              first_name_kana: "",
              phone: customer.phone,
              email: customer.email,
              postal_code: "",
              address: "",
            }
          : {
              last_name: newCustomer.last_name,
              first_name: newCustomer.first_name,
              last_name_kana: "",
              first_name_kana: "",
              phone: newCustomer.phone,
              email: newCustomer.email,
              postal_code: "",
              address: "",
            },
        referral_source: "電話受付",
        source: "phone",
      };

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => router.push("/admin"), 2000);
      } else {
        const json = await res.json().catch(() => ({}));
        setSubmitError(json.error || "予約登録に失敗しました。もう一度お試しください。");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("通信エラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="text-4xl">✅</div>
        <p className="font-medium text-gray-800">予約を登録しました</p>
        <p className="text-sm text-gray-400">ホームに戻ります...</p>
      </div>
    );
  }

  // ── STEP: 顧客検索 ──
  if (step === "search") {
    return (
      <div className="space-y-4">
        <h2 className="font-medium text-gray-800">電話番号で顧客を検索</h2>
        <div className="bg-white rounded-xl p-4 space-y-3">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchCustomer()}
            placeholder="090-XXXX-XXXX"
            className="w-full px-4 py-3 text-base border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
          />
          <button
            onClick={searchCustomer}
            disabled={!phone.trim() || searching}
            className="w-full py-3 bg-[#B87942] text-white rounded-xl font-medium disabled:opacity-50"
          >
            {searching ? "検索中..." : "検索する"}
          </button>
        </div>

        {notFound && (
          <div className="bg-white rounded-xl p-4 space-y-3">
            <p className="text-sm text-gray-500 text-center">この電話番号の顧客は登録されていません</p>
            <button
              onClick={handleNewCustomer}
              className="w-full py-3 border border-[#B87942] text-[#B87942] rounded-xl text-sm font-medium active:bg-orange-50"
            >
              新規顧客として予約する
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── STEP: 予約フォーム ──
  const availableTimes = CHECKIN_TIMES[plan] || [];
  const hasDogs = customer && customer.dogs && customer.dogs.length > 0;
  const canSubmit =
    plan && date && checkinTime &&
    (plan === "stay" ? checkoutDate : true) &&
    (customer ? (!hasDogs || selectedDogIds.length > 0) : isNewCustomer);

  return (
    <div className="space-y-4">
      {/* 戻るボタン */}
      <button
        onClick={() => { setStep("search"); setCustomer(null); setNotFound(false); }}
        className="text-sm text-gray-500 flex items-center gap-1 -ml-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {prefilledCustomerId ? "顧客詳細に戻る" : "検索に戻る"}
      </button>

      {/* 顧客情報 */}
      {customer ? (
        <div className="bg-white rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">お客様</p>
          <p className="font-medium">{customer.last_name} {customer.first_name} 様</p>
          <a href={`tel:${customer.phone}`} className="text-sm text-[#B87942]">{customer.phone}</a>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-4 space-y-3">
          <p className="text-xs font-medium text-gray-500">新規お客様情報</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={newCustomer.last_name}
              onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
              placeholder="姓（必須）"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
            />
            <input
              value={newCustomer.first_name}
              onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
              placeholder="名"
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
            />
          </div>
          <input
            type="tel"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            placeholder="電話番号（必須）"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
          />
          <input
            type="email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            placeholder="メールアドレス"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
          />
        </div>
      )}

      {/* ワンちゃん選択（既存顧客のみ） */}
      {customer && customer.dogs && customer.dogs.length > 0 && (
        <div className="bg-white rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 mb-3">ワンちゃん選択（複数可）</p>
          <div className="space-y-2">
            {customer.dogs.map((dog) => (
              <button
                key={dog.id}
                onClick={() => toggleDog(dog.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  selectedDogIds.includes(dog.id)
                    ? "border-[#B87942] bg-orange-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="text-left">
                  <p className="text-sm font-medium">{dog.name}</p>
                  <p className="text-xs text-gray-400">{dog.breed} / {dog.weight}kg</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedDogIds.includes(dog.id) ? "border-[#B87942] bg-[#B87942]" : "border-gray-300"
                }`}>
                  {selectedDogIds.includes(dog.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* プラン選択 */}
      <div className="bg-white rounded-xl p-4">
        <p className="text-xs font-medium text-gray-500 mb-3">プラン</p>
        <div className="grid grid-cols-2 gap-2">
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPlan(p.id); setCheckinTime(""); }}
              className={`py-3 px-2 rounded-xl border text-sm font-medium transition-colors ${
                plan === p.id
                  ? "border-[#B87942] bg-orange-50 text-[#B87942]"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              {p.name.split("（")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 日程 */}
      <div className="bg-white rounded-xl p-4 space-y-3">
        <p className="text-xs font-medium text-gray-500">日程</p>
        <div>
          <label className="text-xs text-gray-400">チェックイン日</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full mt-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
          />
        </div>
        {plan && (
          <div>
            <label className="text-xs text-gray-400">チェックイン時間</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {availableTimes.map((t) => (
                <button
                  key={t}
                  onClick={() => setCheckinTime(t)}
                  className={`py-2 rounded-xl text-sm border font-dm transition-colors ${
                    checkinTime === t
                      ? "border-[#B87942] bg-orange-50 text-[#B87942]"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
        {plan === "stay" && (
          <div>
            <label className="text-xs text-gray-400">チェックアウト日</label>
            <input
              type="date"
              value={checkoutDate}
              onChange={(e) => setCheckoutDate(e.target.value)}
              min={date || new Date().toISOString().split("T")[0]}
              className="w-full mt-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* オプション */}
      <div className="bg-white rounded-xl p-4 space-y-3">
        <p className="text-xs font-medium text-gray-500">オプション・メモ</p>
        <button
          onClick={() => setWalkOption(!walkOption)}
          className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-colors ${
            walkOption ? "border-[#B87942] bg-orange-50" : "border-gray-200"
          }`}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            walkOption ? "border-[#B87942] bg-[#B87942]" : "border-gray-300"
          }`}>
            {walkOption && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-700">散歩オプション (+¥550)</span>
        </button>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="備考・特記事項..."
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none resize-none"
        />
      </div>

      {/* エラー表示 */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* 送信 */}
      <button
        onClick={submit}
        disabled={!canSubmit || submitting}
        className="w-full py-4 bg-[#B87942] text-white rounded-xl font-medium text-base disabled:opacity-40 active:bg-[#a06535]"
      >
        {submitting ? "登録中..." : "予約を登録する"}
      </button>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-[#B87942] border-t-transparent rounded-full mx-auto" />
      </div>
    }>
      <NewBookingForm />
    </Suspense>
  );
}
