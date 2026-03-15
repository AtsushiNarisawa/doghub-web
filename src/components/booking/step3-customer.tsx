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
  const isReturning = !!form.customer.id;
  const [editMode, setEditMode] = useState(!isReturning);

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

  const c = form.customer;

  const isValid =
    c.last_name && c.first_name &&
    c.last_name_kana && c.first_name_kana &&
    c.phone && c.email;

  return (
    <div className="space-y-6">
      {/* リピーター：確認モード */}
      {isReturning && !editMode && (
        <div className="p-4 rounded-xl border-2 border-[#B87942]/20 bg-white space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-sm">登録済みのお客様情報</h3>
            <span className="text-[11px] bg-[#B87942]/10 text-[#B87942] px-2 py-1 rounded-full font-medium">
              リピーター
            </span>
          </div>
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
            onClick={() => setEditMode(true)}
            className="text-sm text-[#B87942] underline"
          >
            情報を変更する
          </button>
        </div>
      )}

      {/* 入力フォーム（新規 or 編集モード） */}
      {(!isReturning || editMode) && (
        <div className="space-y-4">
          {isReturning && editMode && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-[#888]">情報を修正できます</p>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="text-sm text-[#888] underline"
              >
                戻る
              </button>
            </div>
          )}

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
