"use client";

import type { BookingFormData, DogFormData } from "@/types/booking";
import { INITIAL_DOG } from "@/types/booking";

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
            step="0.1"
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
          <input
            type="number"
            inputMode="numeric"
            value={dog.age}
            onChange={(e) => onUpdate({ ...dog, age: e.target.value })}
            placeholder="3"
            className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
          />
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

      {/* 去勢・避妊 */}
      <div>
        <label className="flex items-center gap-3 p-3 rounded-lg bg-[#F8F5F0]">
          <input
            type="checkbox"
            checked={dog.neutered}
            onChange={(e) => onUpdate({ ...dog, neutered: e.target.checked })}
            className="w-5 h-5 rounded accent-[#B87942]"
          />
          <span className="text-sm">去勢・避妊済み</span>
        </label>
      </div>

      {/* ワクチン接種期限 */}
      <div className="space-y-3">
        <p className="text-sm text-[#888]">
          ワクチン接種記録 <span className="text-red-400">*</span>
          <span className="text-[12px] block mt-0.5">1年以内の接種が必要です</span>
        </p>
        <div>
          <label className="text-sm text-[#888] block mb-1">
            狂犬病ワクチン接種期限
          </label>
          <input
            type="date"
            value={dog.rabies_vaccine_expires_at}
            onChange={(e) => onUpdate({ ...dog, rabies_vaccine_expires_at: e.target.value })}
            className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm text-[#888] block mb-1">
            混合ワクチン接種期限
          </label>
          <input
            type="date"
            value={dog.mixed_vaccine_expires_at}
            onChange={(e) => onUpdate({ ...dog, mixed_vaccine_expires_at: e.target.value })}
            className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
          />
        </div>
        <p className="text-[12px] text-[#888]">
          ワクチン証明書は当日ご持参ください（写真でも可）
        </p>
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
  const updateDog = (index: number, dog: DogFormData) => {
    const dogs = [...form.dogs];
    dogs[index] = dog;
    onChange({ ...form, dogs });
  };

  const addDog = () => {
    // 前頭の情報を一部コピー（名前以外）
    const lastDog = form.dogs[form.dogs.length - 1];
    onChange({
      ...form,
      dogs: [
        ...form.dogs,
        {
          ...INITIAL_DOG,
          breed: lastDog?.breed || "",
        },
      ],
    });
  };

  const removeDog = (index: number) => {
    onChange({
      ...form,
      dogs: form.dogs.filter((_, i) => i !== index),
    });
  };

  const isValid = form.dogs.every(
    (d) => d.name && d.breed && d.weight && d.age && d.sex
  );

  return (
    <div className="space-y-4">
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
