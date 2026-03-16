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
      <div className="space-y-2">
        <p className="text-sm text-[#888]">
          ワクチン接種 <span className="text-red-400">*</span>
          <span className="text-[12px] block mt-0.5">当日、狂犬病・混合ワクチンの証明書をご持参ください（スマホの写真でもOK）。未接種の場合はお預かりできません。</span>
        </p>
        <label className="flex items-center gap-3 p-3 rounded-lg bg-[#F8F5F0]">
          <input
            type="checkbox"
            checked={dog.has_rabies_vaccine}
            onChange={(e) => onUpdate({ ...dog, has_rabies_vaccine: e.target.checked })}
            className="w-5 h-5 rounded accent-[#B87942]"
          />
          <span className="text-sm">狂犬病ワクチン接種済み</span>
        </label>
        <label className="flex items-center gap-3 p-3 rounded-lg bg-[#F8F5F0]">
          <input
            type="checkbox"
            checked={dog.has_mixed_vaccine}
            onChange={(e) => onUpdate({ ...dog, has_mixed_vaccine: e.target.checked })}
            className="w-5 h-5 rounded accent-[#B87942]"
          />
          <span className="text-sm">混合ワクチン接種済み</span>
        </label>
      </div>

      {/* アレルギー */}
      <div>
        <label className="text-sm text-[#888] block mb-1">アレルギー</label>
        <input
          type="text"
          value={dog.allergies}
          onChange={(e) => onUpdate({ ...dog, allergies: e.target.value })}
          placeholder="特になし"
          className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
        />
      </div>

      {/* 食事 */}
      <div>
        <label className="text-sm text-[#888] block mb-1">食事に関する注意事項</label>
        <textarea
          value={dog.meal_notes}
          onChange={(e) => onUpdate({ ...dog, meal_notes: e.target.value })}
          placeholder="持参フードのみ、量は○g など"
          rows={2}
          className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none resize-none"
        />
      </div>

      {/* 投薬 */}
      <div>
        <label className="text-sm text-[#888] block mb-1">投薬に関する注意事項</label>
        <textarea
          value={dog.medication_notes}
          onChange={(e) => onUpdate({ ...dog, medication_notes: e.target.value })}
          placeholder="特になし"
          rows={2}
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

    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", normalized)
      .maybeSingle();

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
    (d) => d.name && d.breed && d.weight && d.age && d.sex
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
