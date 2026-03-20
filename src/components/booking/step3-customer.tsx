"use client";

import { useState } from "react";
import type { BookingFormData } from "@/types/booking";
import { REFERRAL_SOURCES } from "@/types/booking";

interface Props {
  form: BookingFormData;
  onChange: (form: BookingFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Customer({ form, onChange, onNext, onBack }: Props) {
  // リピーター判定：犬情報がDBから読み込まれている（idがある）場合
  const isReturning = form.dogs.some((d) => !!d.id);

  // 住所を自動入力部分と手入力部分に分離して管理
  const [autoAddress, setAutoAddress] = useState(() => {
    // 既存の住所がある場合、都道府県〜町名部分を推定
    return "";
  });
  const [detailAddress, setDetailAddress] = useState(() => {
    // 既存の住所から番地以降を取得
    return form.customer.address || "";
  });

  const [zipError, setZipError] = useState("");

  // 郵便番号から住所自動入力
  const fetchAddress = async (postalCode: string) => {
    const code = postalCode.replace(/-/g, "");
    if (code.length !== 7) return;
    setZipError("");
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`);
      if (!res.ok) {
        setZipError("住所の自動入力ができませんでした。手動で入力してください。");
        return;
      }
      const json = await res.json();
      if (json.results?.[0]) {
        const r = json.results[0];
        const base = `${r.address1}${r.address2}${r.address3}`;
        setAutoAddress(base);
        // 手入力部分が空、または前の自動入力部分だけだった場合はクリア
        if (!detailAddress || detailAddress === form.customer.address) {
          setDetailAddress("");
        }
        onChange({
          ...form,
          customer: { ...form.customer, postal_code: postalCode, address: base },
        });
      } else {
        setZipError("該当する住所が見つかりませんでした。手動で入力してください。");
      }
    } catch {
      setZipError("住所の自動入力ができませんでした。手動で入力してください。");
    }
  };

  // 番地・建物名の変更時に結合してaddressを更新
  const handleDetailChange = (val: string) => {
    setDetailAddress(val);
    const combined = autoAddress ? `${autoAddress}${val}` : val;
    onChange({
      ...form,
      customer: { ...form.customer, address: combined },
    });
  };

  const c = form.customer;

  const isValid =
    c.last_name && c.first_name &&
    c.last_name_kana && c.first_name_kana &&
    c.phone && c.email;

  return (
    <div className="space-y-6">
      {/* 入力フォーム */}
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

          {/* 電話番号 */}
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

          {/* 郵便番号 */}
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
            {zipError && <p className="text-orange-500 text-xs mt-1">{zipError}</p>}
          </div>

          {/* 住所（自動入力部分） */}
          {autoAddress && (
            <div>
              <label className="text-sm text-[#888] block mb-1">都道府県・市区町村</label>
              <div className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-[#F8F5F0] text-[#666]">
                {autoAddress}
              </div>
            </div>
          )}

          {/* 住所（手入力部分：番地・建物名） */}
          <div>
            <label className="text-sm text-[#888] block mb-1">
              {autoAddress ? "番地・建物名" : "住所"}
            </label>
            <input
              type="text"
              value={detailAddress}
              onChange={(e) => handleDetailChange(e.target.value)}
              placeholder={autoAddress ? "1246-125 メゾン仙石原102号" : "自動入力されます"}
              className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
            />
            {autoAddress && !detailAddress && (
              <p className="text-[12px] text-orange-500 mt-1">
                番地・建物名をご入力ください
              </p>
            )}
          </div>
      </div>

      {/* きっかけ（初回のみ） */}
      {!isReturning && (
        <div>
          <label className="text-sm text-[#888] block mb-2">ご利用のきっかけ</label>
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
      )}

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
