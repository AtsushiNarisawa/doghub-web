"use client";

import { useState } from "react";
import type { BookingFormData, CustomerFormData, DogFormData } from "@/types/booking";
import { REFERRAL_SOURCES } from "@/types/booking";
import { supabase } from "@/lib/supabase";

interface Props {
  form: BookingFormData;
  onChange: (form: BookingFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

type LookupState = "idle" | "loading" | "found" | "not_found";

export function Step3Customer({ form, onChange, onNext, onBack }: Props) {
  const [lookupState, setLookupState] = useState<LookupState>("idle");
  const [phoneInput, setPhoneInput] = useState(form.customer.phone);

  // リピーター検索
  const lookupCustomer = async () => {
    if (!phoneInput || phoneInput.length < 10) return;
    setLookupState("loading");

    // 電話番号でハイフン除去して正規化
    const normalized = phoneInput.replace(/[-\s]/g, "");

    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", normalized)
      .maybeSingle();

    if (customer) {
      // 犬情報も取得
      const { data: dogs } = await supabase
        .from("dogs")
        .select("*")
        .eq("customer_id", customer.id);

      const customerData: CustomerFormData = {
        id: customer.id,
        last_name: customer.last_name,
        first_name: customer.first_name,
        last_name_kana: customer.last_name_kana,
        first_name_kana: customer.first_name_kana,
        phone: customer.phone,
        email: customer.email,
        postal_code: customer.postal_code || "",
        address: customer.address || "",
      };

      const dogData: DogFormData[] = dogs && dogs.length > 0
        ? dogs.map((d) => ({
            id: d.id,
            name: d.name,
            breed: d.breed,
            weight: String(d.weight),
            age: d.age ? String(d.age) : "",
            sex: d.sex as "male" | "female",
            neutered: d.neutered,
            rabies_vaccine_expires_at: d.rabies_vaccine_expires_at || "",
            mixed_vaccine_expires_at: d.mixed_vaccine_expires_at || "",
            allergies: d.allergies || "",
            meal_notes: d.meal_notes || "",
            medication_notes: d.medication_notes || "",
          }))
        : form.dogs;

      onChange({
        ...form,
        customer: customerData,
        dogs: dogData,
      });
      setLookupState("found");
    } else {
      onChange({
        ...form,
        customer: { ...form.customer, phone: normalized },
      });
      setLookupState("not_found");
    }
  };

  // 郵便番号から住所自動入力
  const fetchAddress = async (postalCode: string) => {
    const code = postalCode.replace(/-/g, "");
    if (code.length !== 7) return;
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`);
      const json = await res.json();
      if (json.results?.[0]) {
        const r = json.results[0];
        const addr = `${r.address1}${r.address2}${r.address3}`;
        onChange({
          ...form,
          customer: { ...form.customer, postal_code: postalCode, address: addr },
        });
      }
    } catch {
      // 静かに失敗
    }
  };

  const isReturning = lookupState === "found";
  const c = form.customer;

  const isValid =
    c.last_name && c.first_name &&
    c.last_name_kana && c.first_name_kana &&
    c.phone && c.email;

  return (
    <div className="space-y-6">
      {/* 電話番号でリピーター検索 */}
      <div className="p-4 rounded-xl bg-[#F8F5F0] space-y-3">
        <p className="text-sm font-medium">
          まず電話番号を入力してください
        </p>
        <p className="text-[12px] text-[#888]">
          2回目以降のお客様は、お客様情報が自動入力されます
        </p>
        <div className="flex gap-2">
          <input
            type="tel"
            inputMode="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="090-1234-5678"
            className="flex-1 p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
          />
          <button
            type="button"
            onClick={lookupCustomer}
            disabled={!phoneInput || phoneInput.length < 10 || lookupState === "loading"}
            className="px-5 py-3 rounded-lg bg-[#B87942] text-white text-sm font-medium active:bg-[#A06830] disabled:bg-[#E5DDD8] disabled:text-[#888] whitespace-nowrap"
          >
            {lookupState === "loading" ? "..." : "検索"}
          </button>
        </div>
        {lookupState === "found" && (
          <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            お客様情報が見つかりました。内容をご確認ください。
          </p>
        )}
        {lookupState === "not_found" && (
          <p className="text-sm text-[#888]">
            初めてのご利用ですね。以下の情報をご入力ください。
          </p>
        )}
      </div>

      {/* リピーター：確認モード */}
      {isReturning && (
        <div className="p-4 rounded-xl border-2 border-[#B87942]/20 bg-white space-y-3">
          <h3 className="font-medium text-sm">登録済みのお客様情報</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-[#888] inline-block w-20">お名前</span>
              {c.last_name} {c.first_name}（{c.last_name_kana} {c.first_name_kana}）
            </p>
            <p>
              <span className="text-[#888] inline-block w-20">電話番号</span>
              {c.phone}
            </p>
            <p>
              <span className="text-[#888] inline-block w-20">メール</span>
              {c.email}
            </p>
            {c.address && (
              <p>
                <span className="text-[#888] inline-block w-20">住所</span>
                〒{c.postal_code} {c.address}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setLookupState("not_found")}
            className="text-sm text-[#B87942] underline"
          >
            情報を変更する
          </button>
        </div>
      )}

      {/* 新規 or 変更モード */}
      {(lookupState === "not_found" || lookupState === "idle") && (
        <div className="space-y-4">
          {/* 氏名 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-[#888] block mb-1">
                姓 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={c.last_name}
                onChange={(e) =>
                  onChange({ ...form, customer: { ...c, last_name: e.target.value } })
                }
                placeholder="山田"
                className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-[#888] block mb-1">
                名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={c.first_name}
                onChange={(e) =>
                  onChange({ ...form, customer: { ...c, first_name: e.target.value } })
                }
                placeholder="花子"
                className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
              />
            </div>
          </div>

          {/* ふりがな */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-[#888] block mb-1">
                せい <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={c.last_name_kana}
                onChange={(e) =>
                  onChange({ ...form, customer: { ...c, last_name_kana: e.target.value } })
                }
                placeholder="やまだ"
                className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-[#888] block mb-1">
                めい <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={c.first_name_kana}
                onChange={(e) =>
                  onChange({ ...form, customer: { ...c, first_name_kana: e.target.value } })
                }
                placeholder="はなこ"
                className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
              />
            </div>
          </div>

          {/* 電話番号（すでに入力済み） */}
          <div>
            <label className="text-sm text-[#888] block mb-1">
              電話番号 <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              inputMode="tel"
              value={c.phone}
              onChange={(e) =>
                onChange({ ...form, customer: { ...c, phone: e.target.value } })
              }
              placeholder="09012345678"
              className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
            />
          </div>

          {/* メール */}
          <div>
            <label className="text-sm text-[#888] block mb-1">
              メールアドレス <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              inputMode="email"
              value={c.email}
              onChange={(e) =>
                onChange({ ...form, customer: { ...c, email: e.target.value } })
              }
              placeholder="hanako@example.com"
              className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
            />
          </div>

          {/* 郵便番号・住所 */}
          <div>
            <label className="text-sm text-[#888] block mb-1">郵便番号</label>
            <input
              type="text"
              inputMode="numeric"
              value={c.postal_code}
              onChange={(e) => {
                const val = e.target.value;
                onChange({ ...form, customer: { ...c, postal_code: val } });
                fetchAddress(val);
              }}
              placeholder="250-0631"
              className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-[#888] block mb-1">住所</label>
            <input
              type="text"
              value={c.address}
              onChange={(e) =>
                onChange({ ...form, customer: { ...c, address: e.target.value } })
              }
              placeholder="自動入力されます"
              className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* きっかけ */}
      <div>
        <label className="text-sm text-[#888] block mb-2">
          ご利用のきっかけ
        </label>
        <div className="grid grid-cols-2 gap-2">
          {REFERRAL_SOURCES.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => onChange({ ...form, referral_source: src })}
              className={`py-2.5 px-3 rounded-lg text-[13px] transition-all text-left ${
                form.referral_source === src
                  ? "bg-[#B87942] text-white"
                  : "bg-[#F8F5F0] text-[#3C200F] active:bg-[#E5DDD8]"
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 rounded-xl border-2 border-[#E5DDD8] text-[#3C200F] text-base font-medium active:bg-[#F8F5F0]"
        >
          戻る
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className={`flex-[2] py-4 rounded-xl text-base font-medium transition-all ${
            isValid
              ? "bg-[#B87942] text-white active:bg-[#A06830]"
              : "bg-[#E5DDD8] text-[#888] cursor-not-allowed"
          }`}
        >
          次へ：確認
        </button>
      </div>
    </div>
  );
}
