"use client";

import { useState } from "react";
import type { BookingFormData } from "@/types/booking";
import {
  REFERRAL_SOURCES,
  DAY_DESTINATIONS,
  DAY_DESTINATIONS_4H,
  STAY_DESTINATIONS,
  DESTINATION_SUGGESTIONS,
} from "@/types/booking";

interface Props {
  form: BookingFormData;
  onChange: (form: BookingFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

// サーバー側検証（api/booking/route.ts）と同一条件。正規化も揃えることで、
// ハイフン入りや全角入力など「サーバーは通すがクライアントで弾く」過剰ブロックを防ぐ。
function isValidPhone(raw: string): boolean {
  const normalized = (raw || "")
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .replace(/[-\s‐ー－]/g, "")
    .replace(/^\+81/, "0");
  return /^0\d{9,10}$/.test(normalized);
}

function isValidEmail(raw: string): boolean {
  const normalized = (raw || "")
    .replace(/＠/g, "@")
    .replace(/．/g, ".")
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
    .trim()
    .toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
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

  const isLineBooking = !!form.line_id;

  // 電話は必須かつ形式必須。メールはLINE予約のみ任意（入力時は形式必須）、それ以外は必須。
  const phoneOk = isValidPhone(c.phone);
  const emailOk = isLineBooking ? !c.email || isValidEmail(c.email) : isValidEmail(c.email);

  const isValid =
    c.last_name && c.first_name &&
    c.last_name_kana && c.first_name_kana &&
    phoneOk && emailOk &&
    (isReturning || form.referral_source);

  // 「次へ」が押せないとき、何をすれば進めるかを具体的に伝える。
  // 形式エラー（電話・メール）は各入力欄の直下にも表示済み。
  const customerHint: string | null = (() => {
    if (isValid) return null;
    const need: string[] = [];
    if (!c.last_name || !c.first_name) need.push("お名前");
    if (!c.last_name_kana || !c.first_name_kana) need.push("ふりがな");
    if (!phoneOk) need.push("電話番号");
    if (!emailOk) need.push("メールアドレス");
    if (!isReturning && !form.referral_source) need.push("ご利用のきっかけ");
    if (need.length > 0) return `あと「${need.join("」「")}」をご入力ください`;
    return null;
  })();

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
            {c.phone && !phoneOk && (
              <p className="text-orange-500 text-xs mt-1">電話番号は10〜11桁の数字でご入力ください（ハイフンは入れても大丈夫です）</p>
            )}
          </div>

          {/* メール */}
          <div>
            <label className="text-sm text-[#888] block mb-1">
              メールアドレス {isLineBooking ? <span className="text-[#888]">（任意）</span> : <span className="text-red-400">*</span>}
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
            {c.email && !isValidEmail(c.email) && (
              <p className="text-orange-500 text-xs mt-1">メールアドレスの形式をご確認ください</p>
            )}
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
              placeholder={autoAddress ? "928-15 ○○マンション102号" : "自動入力されます"}
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
          <label className="text-sm text-[#888] block mb-2">ご利用のきっかけ <span className="text-red-400">*</span></label>
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

      {/* 行き先（毎回・任意） */}
      <div>
        <label className="text-sm text-[#888] block mb-2">
          お預かり中の行き先 <span className="text-[#888]">（任意）</span>
        </label>
        <p className="text-[12px] text-[#888] mb-3">
          未定でもOK。当日の変更もOKです
        </p>
        {(() => {
          const quickButtons =
            form.plan === "stay" ? STAY_DESTINATIONS.filter(d => d !== "未定" && d !== "その他（自由記入）") :
            form.plan === "4h" ? DAY_DESTINATIONS_4H.filter(d => d !== "その他") :
            DAY_DESTINATIONS.filter(d => d !== "その他");

          const allSuggestions = [
            ...DESTINATION_SUGGESTIONS,
            ...(form.plan === "stay" ? STAY_DESTINATIONS.filter(d => d !== "未定" && d !== "その他（自由記入）") : []),
          ];

          return (
            <>
              <input
                type="text"
                list="destination-suggestions"
                value={form.destination}
                onChange={(e) => onChange({ ...form, destination: e.target.value })}
                placeholder="施設名を入力（候補が表示されます）"
                className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none"
              />
              <datalist id="destination-suggestions">
                {allSuggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              <div className="flex flex-wrap gap-2 mt-3">
                {quickButtons.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => onChange({ ...form, destination: dest })}
                    className={`px-3 py-1.5 rounded-full text-[13px] border transition-all ${
                      form.destination === dest
                        ? "bg-[#B87942] text-white border-[#B87942]"
                        : "bg-white text-[#3C200F] border-[#E5DDD8] active:border-[#B87942]"
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </>
          );
        })()}
      </div>

      {/* 「次へ」が押せない理由の案内 */}
      {customerHint && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-800">{customerHint}</p>
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
