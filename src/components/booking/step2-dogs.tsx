"use client";

import { useState } from "react";
import type { BookingFormData, DogFormData } from "@/types/booking";
import { INITIAL_DOG } from "@/types/booking";
import { supabase } from "@/lib/supabase";

interface Props {
  form: BookingFormData;
  onChange: (form: BookingFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

function DogForm({
  dog,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: {
  dog: DogFormData;
  index: number;
  onUpdate: (d: DogFormData) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="p-4 rounded-xl border-2 border-[#E5DDD8] bg-white space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">
          {index === 0 ? "ワンちゃん情報" : `${index + 1}頭目`}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-red-400 active:text-red-600"
          >
            削除
          </button>
        )}
      </div>

      {/* 名前 */}
      <div>
        <label className="text-sm text-[#888] block mb-1">
          お名前 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={dog.name}
          onChange={(e) => onUpdate({ ...dog, name: e.target.value })}
          placeholder="ポロ"
          className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
        />
      </div>

      {/* 犬種・体重 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-[#888] block mb-1">
            犬種 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={dog.breed}
            onChange={(e) => onUpdate({ ...dog, breed: e.target.value })}
            placeholder="トイプードル"
            className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-[#888] block mb-1">
            体重 (kg) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            value={dog.weight}
            onChange={(e) => onUpdate({ ...dog, weight: e.target.value })}
            placeholder="3.5"
            className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
          />
        </div>
      </div>

      {parseFloat(dog.weight) >= 15 && (
        <p className="text-orange-500 text-sm bg-orange-50 p-3 rounded-lg">
          体重15kg以上のワンちゃんは、スタッフ確認後に予約確定となります。
        </p>
      )}

      {/* 年齢・性別 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-[#888] block mb-1">
            年齢 <span className="text-red-400">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={dog.age}
              onChange={(e) => onUpdate({ ...dog, age: e.target.value, age_months: "" })}
              placeholder="3"
              className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
            />
            <span className="text-sm text-[#888] whitespace-nowrap">歳</span>
          </div>
          {dog.age === "0" && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="11"
                value={dog.age_months}
                onChange={(e) => onUpdate({ ...dog, age_months: e.target.value })}
                placeholder="6"
                className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
              />
              <span className="text-sm text-[#888] whitespace-nowrap">ヶ月</span>
            </div>
          )}
        </div>
        <div>
          <label className="text-sm text-[#888] block mb-1">
            性別 <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdate({ ...dog, sex: "male" })}
              className={`py-3 rounded-lg text-sm font-medium transition-all ${
                dog.sex === "male"
                  ? "bg-[#B87942] text-white"
                  : "bg-[#F8F5F0] text-[#3C200F] active:bg-[#E5DDD8]"
              }`}
            >
              オス
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ ...dog, sex: "female" })}
              className={`py-3 rounded-lg text-sm font-medium transition-all ${
                dog.sex === "female"
                  ? "bg-[#B87942] text-white"
                  : "bg-[#F8F5F0] text-[#3C200F] active:bg-[#E5DDD8]"
              }`}
            >
              メス
            </button>
          </div>
        </div>
      </div>

      {/* ワクチン接種確認 */}
      <div className="space-y-3">
        <p className="text-sm text-[#888]">
          ワクチン接種 <span className="text-red-400">*</span>
          <span className="text-[12px] block mt-0.5">当日、証明書をご持参ください（スマホの写真でもOK）。</span>
        </p>

        {/* 狂犬病ワクチン */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#3C200F]">狂犬病ワクチン</p>
          <div className="space-y-1">
            {([
              { value: "within_1year", label: "接種済み（1年以内）" },
              { value: "within_3years", label: "接種済み（3年有効ワクチン）" },
              { value: "unable", label: "事情により未接種" },
            ] as const).map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F8F5F0] cursor-pointer">
                <input
                  type="radio"
                  name={`rabies-${index}`}
                  checked={dog.rabies_vaccine_status === opt.value}
                  onChange={() => onUpdate({
                    ...dog,
                    rabies_vaccine_status: opt.value,
                    has_rabies_vaccine: opt.value !== "unable",
                  })}
                  className="w-4 h-4 accent-[#B87942]"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 混合ワクチン */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-[#3C200F]">混合ワクチン</p>
          <div className="space-y-1">
            {([
              { value: "within_1year", label: "接種済み（1年以内）" },
              { value: "within_3years", label: "接種済み（3年有効ワクチン）" },
              { value: "unable", label: "事情により未接種" },
            ] as const).map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F8F5F0] cursor-pointer">
                <input
                  type="radio"
                  name={`mixed-${index}`}
                  checked={dog.mixed_vaccine_status === opt.value}
                  onChange={() => onUpdate({
                    ...dog,
                    mixed_vaccine_status: opt.value,
                    has_mixed_vaccine: opt.value !== "unable",
                  })}
                  className="w-4 h-4 accent-[#B87942]"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 事情により未接種の場合の理由入力 */}
        {(dog.rabies_vaccine_status === "unable" || dog.mixed_vaccine_status === "unable") && (
          <div>
            <label className="text-sm text-[#888] block mb-1">
              未接種の事情をお聞かせください <span className="text-red-400">*</span>
            </label>
            <textarea
              value={dog.vaccine_unable_reason}
              onChange={(e) => onUpdate({ ...dog, vaccine_unable_reason: e.target.value })}
              placeholder="例: 持病（心臓病）のため獣医師の判断で接種を見合わせています"
              rows={2}
              className="w-full px-3 py-2 border border-[#E5DDD8] rounded-lg text-sm focus:outline-none focus:border-[#B87942]"
            />
          </div>
        )}
      </div>

      {/* 注意事項（アレルギー・食事・投薬） */}
      <div>
        <label className="text-sm text-[#888] block mb-1">注意事項（アレルギー・食事・投薬など）</label>
        <textarea
          value={dog.allergies}
          onChange={(e) => onUpdate({ ...dog, allergies: e.target.value })}
          placeholder="例: 鶏肉アレルギーあり、持参フード80g×2回、朝食後に心臓の薬1錠"
          rows={3}
          className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none resize-none"
        />
      </div>
    </div>
  );
}

export function Step2Dogs({ form, onChange, onNext, onBack }: Props) {
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "found" | "not_found">(
    form.customer.id ? "found" : "idle"
  );
  const [phoneInput, setPhoneInput] = useState(form.customer.phone || "");

  // リピーター検索（STEP2の最上部で実行）
  const lookupCustomer = async () => {
    if (!phoneInput || phoneInput.length < 10) return;
    setLookupState("loading");

    const normalized = phoneInput.replace(/[-\s]/g, "");

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", normalized)
      .maybeSingle();

    if (customerError) {
      console.error("Customer lookup error:", customerError);
      setLookupState("not_found");
      return;
    }

    if (customer) {
      const { data: dogs } = await supabase
        .from("dogs")
        .select("*")
        .eq("customer_id", customer.id);

      // 犬情報のみセット（個人情報はStep3でお客様が入力）
      const dogData: DogFormData[] =
        dogs && dogs.length > 0
          ? dogs.map((d) => ({
              id: d.id,
              name: d.name,
              breed: d.breed,
              weight: String(d.weight),
              age: d.age ? String(d.age) : "",
              age_months: d.age_months ? String(d.age_months) : "",
              sex: d.sex as "male" | "female",
              has_rabies_vaccine: d.has_rabies_vaccine || false,
              has_mixed_vaccine: d.has_mixed_vaccine || false,
              rabies_vaccine_status: d.rabies_vaccine_status || (d.has_rabies_vaccine ? "within_1year" : ""),
              mixed_vaccine_status: d.mixed_vaccine_status || (d.has_mixed_vaccine ? "within_1year" : ""),
              vaccine_unable_reason: d.vaccine_unable_reason || "",
              allergies: d.allergies || "",
              meal_notes: d.meal_notes || "",
              medication_notes: d.medication_notes || "",
            }))
          : [{ ...INITIAL_DOG }];

      // 電話番号のみ保持（Step3で名前等を入力してもらう）
      onChange({
        ...form,
        customer: { ...form.customer, phone: normalized },
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

  // 検索をリセットして新規入力に切り替え
  const resetLookup = () => {
    setPhoneInput("");
    setLookupState("idle");
    onChange({ ...form, customer: { last_name: "", first_name: "", last_name_kana: "", first_name_kana: "", phone: "", email: "", postal_code: "", address: "" }, dogs: [{ ...INITIAL_DOG }] });
  };

  const updateDog = (index: number, dog: DogFormData) => {
    const dogs = [...form.dogs];
    dogs[index] = dog;
    onChange({ ...form, dogs });
  };

  const addDog = () => {
    const lastDog = form.dogs[form.dogs.length - 1];
    onChange({
      ...form,
      dogs: [...form.dogs, { ...INITIAL_DOG, breed: lastDog?.breed || "" }],
    });
  };

  const removeDog = (index: number) => {
    onChange({ ...form, dogs: form.dogs.filter((_, i) => i !== index) });
  };

  const isValid = form.dogs.every(
    (d) =>
      d.name && d.breed && d.weight && d.age && d.sex &&
      d.rabies_vaccine_status && d.mixed_vaccine_status &&
      ((d.rabies_vaccine_status !== "unable" && d.mixed_vaccine_status !== "unable") || d.vaccine_unable_reason.trim())
  );

  return (
    <div className="space-y-4">
      {/* 電話番号でリピーター検索 */}
      <div className="p-4 rounded-xl bg-[#F8F5F0] space-y-3">
        <p className="text-sm font-medium">2回目以降のご利用ですか？</p>
        <p className="text-[12px] text-[#888]">
          電話番号を入力するとワンちゃんの情報が自動で入力されます
        </p>
        <div className="flex gap-2">
          <input
            type="tel"
            inputMode="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="090-1234-5678"
            disabled={lookupState === "found"}
            className="flex-1 p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none disabled:bg-[#F0EDE8] disabled:text-[#888]"
          />
          {lookupState === "found" ? (
            <button
              type="button"
              onClick={resetLookup}
              className="px-4 py-3 rounded-lg border border-[#E5DDD8] text-[#888] text-sm whitespace-nowrap"
            >
              クリア
            </button>
          ) : (
            <button
              type="button"
              onClick={lookupCustomer}
              disabled={!phoneInput || phoneInput.length < 10 || lookupState === "loading"}
              className="px-5 py-3 rounded-lg bg-[#B87942] text-white text-sm font-medium active:bg-[#A06830] disabled:bg-[#E5DDD8] disabled:text-[#888] whitespace-nowrap"
            >
              {lookupState === "loading" ? "..." : "検索"}
            </button>
          )}
        </div>

        {lookupState === "found" && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="font-medium">おかえりなさい！</p>
            {form.dogs.some((d) => d.name && d.name !== "") ? (
              <>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.dogs.filter((d) => d.name).map((d, i) => (
                    <span key={i} className="bg-white text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                      {d.name}（{d.breed}）
                    </span>
                  ))}
                </div>
                <p className="text-[12px] mt-2 text-green-600">
                  体重・年齢をご確認のうえ必要があれば修正してください。
                </p>
              </>
            ) : (
              <p className="text-[12px] mt-1 text-green-600">
                ワンちゃん情報を下記にご入力ください。
              </p>
            )}
          </div>
        )}
        {lookupState === "not_found" && (
          <p className="text-sm text-[#888]">初めてのご利用ですね。以下にワンちゃんの情報を入力してください。</p>
        )}
      </div>

      {/* 犬フォーム */}
      {form.dogs.map((dog, i) => (
        <DogForm
          key={i}
          dog={dog}
          index={i}
          onUpdate={(d) => updateDog(i, d)}
          onRemove={() => removeDog(i)}
          canRemove={form.dogs.length > 1}
        />
      ))}

      {/* もう1頭追加 */}
      <button
        type="button"
        onClick={addDog}
        className="w-full py-3 rounded-xl border-2 border-dashed border-[#E5DDD8] text-[#888] text-sm font-medium active:bg-[#F8F5F0] transition-all"
      >
        + もう1頭追加
      </button>

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
          次へ：お客様情報
        </button>
      </div>
    </div>
  );
}
