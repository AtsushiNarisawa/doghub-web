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
  dogs: { id: string; name: string; breed: string; weight: number; age: number | null }[];
}

type Step = "search" | "form";

interface SearchResult {
  id: string;
  last_name: string;
  first_name: string;
  phone: string;
  email: string;
  dogs: { id: string; name: string; breed: string; weight: number; age: number | null }[];
}

interface NewDogInput {
  name: string;
  breed: string;
  weight: string;
  age: string;
}

const CHECKIN_TIMES: Record<string, string[]> = {
  "4h":   ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00"],
  "8h":   ["07:00","08:00","09:00"],
  stay:   ["14:00","15:00","16:00","17:00"],
  spot:   ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"],
};

function NewBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledCustomerId = searchParams.get("customer_id");

  const [step, setStep] = useState<Step>(prefilledCustomerId ? "form" : "search");
  const [queryText, setQueryText] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [customer, setCustomer] = useState<CustomerResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  // 新規顧客フォーム
  const [newCustomer, setNewCustomer] = useState({ last_name: "", first_name: "", phone: "" });
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newDogs, setNewDogs] = useState<NewDogInput[]>([{ name: "", breed: "", weight: "", age: "" }]);

  // 予約フォーム
  const [plan, setPlan] = useState("");
  const [date, setDate] = useState("");
  const [checkinTime, setCheckinTime] = useState("");
  const [checkoutDate, setCheckoutDate] = useState("");
  const [selectedDogIds, setSelectedDogIds] = useState<string[]>([]);  const [notes, setNotes] = useState("");
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
      .select("id, last_name, first_name, phone, email, dogs(id, name, breed, weight, age)")
      .eq("id", customerId)
      .single();
    if (data) {
      setCustomer(data as unknown as CustomerResult);
      setStep("form");
    }
  };

  const searchCustomer = async () => {
    const q = queryText.trim();
    if (!q) return;
    setSearching(true);
    setHasSearched(true);
    setSearchResults([]);

    // 数字が含まれていたら電話番号検索、それ以外は名前検索
    const isPhone = /\d/.test(q);

    let results: SearchResult[] = [];

    if (isPhone) {
      const normalized = q.replace(/[-\s]/g, "");
      const { data } = await supabase
        .from("customers")
        .select("id, last_name, first_name, phone, email, dogs(id, name, breed, weight, age)")
        .ilike("phone", `%${normalized}%`)
        .limit(10);
      results = (data as unknown as SearchResult[]) || [];
    } else {
      // 名前検索（姓 or 名に部分一致）
      const { data } = await supabase
        .from("customers")
        .select("id, last_name, first_name, phone, email, dogs(id, name, breed, weight, age)")
        .or(`last_name.ilike.%${q}%,first_name.ilike.%${q}%`)
        .limit(10);
      results = (data as unknown as SearchResult[]) || [];
    }

    setSearchResults(results);
    setSearching(false);
  };

  const selectCustomer = (c: SearchResult) => {
    setCustomer(c as unknown as CustomerResult);
    setIsNewCustomer(false);
    setStep("form");
  };

  const handleNewCustomer = () => {
    setIsNewCustomer(true);
    setCustomer(null);
    const q = queryText.trim();
    const isPhone = /\d/.test(q);
    if (isPhone) {
      setNewCustomer({ last_name: "", first_name: "", phone: q.replace(/[-\s]/g, "") });
    } else {
      setNewCustomer({ last_name: q, first_name: "", phone: "" });
    }
    setNewDogs([{ name: "", breed: "", weight: "", age: "" }]);
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
    if (isNewCustomer && !newDogs.some((d) => d.name)) return;

    setSubmitting(true);
    setSubmitError("");
    const makeDogData = (d: { name: string; breed: string; weight: string; age: string; id?: string }) => ({
      ...(d.id ? { id: d.id } : {}),
      name: d.name,
      breed: d.breed || "不明",
      weight: d.weight || "5",
      age: d.age || "",
      age_months: "",
      sex: "male" as const,
      has_rabies_vaccine: false,
      has_mixed_vaccine: false,
      allergies: "",
      meal_notes: "",
      medication_notes: "",
    });
    try {
      const selectedDogs = customer && (customer.dogs || []).length > 0
        ? (customer.dogs || [])
            .filter((d) => selectedDogIds.includes(d.id))
            .map((d) => makeDogData({ ...d, weight: String(d.weight), age: d.age ? String(d.age) : "" }))
        : newDogs.filter((d) => d.name).map((d) => makeDogData(d));
      const body = {
        plan,
        date,
        checkin_time: checkinTime,
        checkout_date: plan === "stay" ? checkoutDate : undefined,
        walk_option: false,
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
              email: "",
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
        <p className="text-base text-gray-500">ホームに戻ります...</p>
      </div>
    );
  }

  // ── STEP: 顧客検索 ──
  if (step === "search") {
    return (
      <div className="space-y-4">
        <h2 className="font-medium text-gray-800">顧客を検索</h2>
        <div className="bg-white rounded-xl p-4 space-y-3">
          <div className="relative">
            <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchCustomer()}
              placeholder="名前 or 電話番号"
              className="w-full pl-9 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
            />
          </div>
          <button
            onClick={searchCustomer}
            disabled={!queryText.trim() || searching}
            className="w-full py-3 bg-[#B87942] text-white rounded-xl font-medium disabled:opacity-50"
          >
            {searching ? "検索中..." : "検索する"}
          </button>
        </div>

        {/* 検索結果 */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-xl divide-y divide-gray-100">
            {searchResults.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCustomer(c)}
                className="w-full p-4 text-left active:bg-gray-50 flex items-center justify-between"
              >
                <div>
                  <p className="text-base font-medium text-gray-800">
                    {c.last_name} {c.first_name}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {c.phone}
                    {c.dogs && c.dogs.length > 0 && (
                      <span className="ml-2">
                        {c.dogs.map((d) => d.name).join("・")}
                      </span>
                    )}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* 該当なし */}
        {hasSearched && searchResults.length === 0 && !searching && (
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-base text-gray-500">該当するお客様が見つかりません</p>
          </div>
        )}

        {/* 新規顧客ボタン（常時表示） */}
        <button
          onClick={handleNewCustomer}
          className="w-full py-3 border border-[#B87942] text-[#B87942] rounded-xl text-sm font-medium active:bg-orange-50"
        >
          新規のお客様として予約する
        </button>
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
          <p className="text-sm text-gray-500 mb-1">お客様</p>
          <p className="font-medium">{customer.last_name} {customer.first_name} 様</p>
          <a href={`tel:${customer.phone}`} className="text-sm text-[#B87942]">{customer.phone}</a>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-gray-500">新規お客様情報</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={newCustomer.last_name}
              onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value })}
              placeholder="せい（必須）"
              className="px-3 py-2 text-base border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
            />
            <input
              value={newCustomer.first_name}
              onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
              placeholder="めい"
              className="px-3 py-2 text-base border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
            />
          </div>
          <input
            type="tel"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            placeholder="電話番号（必須）"
            className="w-full px-3 py-2 text-base border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
          />
        </div>
      )}

      {/* ワンちゃん情報 */}
      {customer && customer.dogs && customer.dogs.length > 0 ? (
        <div className="bg-white rounded-xl p-4">
          <p className="text-sm font-medium text-gray-500 mb-3">ワンちゃん選択（複数可）</p>
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
                  <p className="text-sm text-gray-500">
                    {dog.breed} / {dog.weight}kg{dog.age != null ? ` / ${dog.age}歳` : ""}
                  </p>
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
      ) : isNewCustomer && (
        <div className="bg-white rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-gray-500">ワンちゃん情報</p>
          {newDogs.map((dog, i) => (
            <div key={i} className="space-y-2 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
              {newDogs.length > 1 && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{i + 1}頭目</p>
                  <button
                    onClick={() => setNewDogs(newDogs.filter((_, j) => j !== i))}
                    className="text-sm text-red-500"
                  >
                    削除
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={dog.name}
                  onChange={(e) => { const d = [...newDogs]; d[i] = { ...d[i], name: e.target.value }; setNewDogs(d); }}
                  placeholder="名前（必須）"
                  className="px-3 py-2 text-base border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
                />
                <input
                  value={dog.breed}
                  onChange={(e) => { const d = [...newDogs]; d[i] = { ...d[i], breed: e.target.value }; setNewDogs(d); }}
                  placeholder="犬種"
                  className="px-3 py-2 text-base border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0"
                  value={dog.weight}
                  onChange={(e) => { const v = e.target.value; if (v === "" || parseFloat(v) >= 0) { const d = [...newDogs]; d[i] = { ...d[i], weight: v }; setNewDogs(d); } }}
                  placeholder="体重(kg)"
                  className="px-3 py-2 text-base border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={dog.age}
                  onChange={(e) => { const v = e.target.value; if (v === "" || parseInt(v) >= 0) { const d = [...newDogs]; d[i] = { ...d[i], age: v }; setNewDogs(d); } }}
                  placeholder="年齢"
                  className="px-3 py-2 text-base border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => setNewDogs([...newDogs, { name: "", breed: "", weight: "", age: "" }])}
            className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 active:bg-gray-50"
          >
            + もう1頭追加
          </button>
        </div>
      )}

      {/* プラン選択 */}
      <div className="bg-white rounded-xl p-4">
        <p className="text-sm font-medium text-gray-500 mb-3">プラン</p>
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
        <p className="text-sm font-medium text-gray-500">日程</p>
        <div>
          <label className="text-sm text-gray-500">チェックイン日</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mt-1 px-3 py-2.5 text-base border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
          />
        </div>
        {plan && (
          <div>
            <label className="text-sm text-gray-500">チェックイン時間</label>
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
            <label className="text-sm text-gray-500">チェックアウト日</label>
            <input
              type="date"
              value={checkoutDate}
              onChange={(e) => setCheckoutDate(e.target.value)}
              min={date || new Date().toISOString().split("T")[0]}
              className="w-full mt-1 px-3 py-2.5 text-base border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* メモ */}
      <div className="bg-white rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium text-gray-500">備考</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="備考・特記事項..."
          rows={3}
          className="w-full px-3 py-2 text-base border border-gray-200 rounded-xl focus:border-[#B87942] focus:outline-none resize-none"
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
