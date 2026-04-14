"use client";

import { useState } from "react";
import type { BookingFormData } from "@/types/booking";
import { PLANS, EXTRA_HOUR_FEE, WALK_OPTION_FEE } from "@/types/booking";

interface Props {
  form: BookingFormData;
  onChange: (form: BookingFormData) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  onGoToStep?: (step: number) => void;
}

export function Step4Confirm({ form, onChange, onSubmit, onBack, onGoToStep }: Props) {
  const [submitting, setSubmitting] = useState(false);

  // 前日17時以降の翌日予約か判定
  const isLateBooking = (() => {
    if (!form.date) return false;
    const now = new Date();
    const bookingDate = new Date(form.date + "T00:00:00");
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return bookingDate.getTime() === tomorrow.getTime() && now.getHours() >= 17;
  })();

  const plan = PLANS.find((p) => p.id === form.plan);
  const dogCount = form.dogs.length;
  const baseTotal = (plan?.basePrice ?? 0) * dogCount;
  const hasHeavyDog = form.dogs.some((d) => parseFloat(d.weight) >= 15);

  // 宿泊日数
  const stayNights =
    form.plan === "stay" && form.checkout_date && form.date
      ? Math.max(
          1,
          Math.round(
            (new Date(form.checkout_date).getTime() - new Date(form.date).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const formatDate = (d: string) => {
    if (!d) return "";
    const date = new Date(d);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${"日月火水木金土"[date.getDay()]}）`;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* プラン・日程 */}
      <div className="p-4 rounded-xl border-2 border-[#E5DDD8] bg-white space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-[#888]">プラン・日程</h3>
          {onGoToStep && <button type="button" onClick={() => onGoToStep(1)} className="text-xs text-[#B87942]">修正する</button>}
        </div>
        <p className="font-medium">{plan?.name}</p>
        <p className="text-sm">{formatDate(form.date)}</p>
        <p className="text-sm">チェックイン: {form.checkin_time}</p>
        {form.early_morning && (
          <p className="text-[12px] text-[#B87942]">早朝プラン</p>
        )}
        {form.plan === "stay" && form.checkout_date && (
          <>
            <p className="text-sm">
              チェックアウト: {formatDate(form.checkout_date)}（{stayNights}泊）/ 9:00〜11:00
            </p>
            {form.checkin_extension && form.checkin_extension_from && (
              <p className="text-[12px] text-[#B87942]">
                早預かり: {form.checkin_extension_from}〜チェックイン（¥1,100/時間）
              </p>
            )}
            {form.checkout_extension && form.checkout_extension_until && (
              <p className="text-[12px] text-[#B87942]">
                延長預かり: チェックアウト後〜{form.checkout_extension_until}（¥1,100/時間）
              </p>
            )}
          </>
        )}
      </div>

      {/* ワンちゃん情報 */}
      <div className="p-4 rounded-xl border-2 border-[#E5DDD8] bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-[#888]">ワンちゃん情報</h3>
          {onGoToStep && <button type="button" onClick={() => onGoToStep(2)} className="text-xs text-[#B87942]">修正する</button>}
        </div>
        {form.dogs.map((dog, i) => (
          <div
            key={i}
            className={`space-y-1 ${i > 0 ? "pt-3 border-t border-[#E5DDD8]" : ""}`}
          >
            <p className="font-medium">
              {dog.name}（{dog.breed}）
            </p>
            <p className="text-sm text-[#888]">
              {dog.weight}kg /
              {dog.age === "0" && dog.age_months ? ` ${dog.age_months}ヶ月` : ` ${dog.age}歳`} /
              {dog.sex === "male" ? " オス" : " メス"}
            </p>
            <p className="text-[12px] text-[#888]">
              狂犬病ワクチン: {dog.has_rabies_vaccine ? "接種済み" : "未接種"} /
              混合ワクチン: {dog.has_mixed_vaccine ? "接種済み" : "未接種"}
            </p>
            {dog.allergies && (
              <p className="text-sm text-[#888]">アレルギー: {dog.allergies}</p>
            )}
            {dog.meal_notes && (
              <p className="text-sm text-[#888]">食事: {dog.meal_notes}</p>
            )}
            {dog.medication_notes && (
              <p className="text-sm text-[#888]">投薬: {dog.medication_notes}</p>
            )}
          </div>
        ))}
      </div>

      {/* お客様情報 */}
      <div className="p-4 rounded-xl border-2 border-[#E5DDD8] bg-white space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-[#888]">お客様情報</h3>
          {onGoToStep && <button type="button" onClick={() => onGoToStep(3)} className="text-xs text-[#B87942]">修正する</button>}
        </div>
        <p className="font-medium">
          {form.customer.last_name} {form.customer.first_name}
          <span className="text-sm text-[#888] ml-2">
            （{form.customer.last_name_kana} {form.customer.first_name_kana}）
          </span>
        </p>
        <p className="text-sm">{form.customer.phone}</p>
        <p className="text-sm">{form.customer.email}</p>
        {form.customer.address && (
          <p className="text-sm">
            〒{form.customer.postal_code} {form.customer.address}
          </p>
        )}
        {form.referral_source && (
          <p className="text-sm text-[#888]">きっかけ: {form.referral_source}</p>
        )}
        {form.destination && (
          <p className="text-sm text-[#888]">行き先: {form.destination}</p>
        )}
      </div>

      {/* オプション・備考 */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 rounded-lg bg-[#F8F5F0]">
          <input
            type="checkbox"
            checked={form.walk_option}
            onChange={(e) => onChange({ ...form, walk_option: e.target.checked })}
            className="w-5 h-5 rounded accent-[#B87942]"
          />
          <div>
            <span className="text-sm">お散歩オプションを希望する（¥{WALK_OPTION_FEE.toLocaleString()}/1回1頭）</span>
            <p className="text-[11px] text-[#888] mt-0.5">複数回ご希望の場合はチェックイン時にお伝えください</p>
          </div>
        </label>

        <div>
          <label className="text-sm text-[#888] block mb-1">
            備考・ご要望
          </label>
          <p className="text-[13px] text-[#888] mb-1">※ 特にない場合は空欄のままで大丈夫です</p>
          <textarea
            value={form.notes}
            onChange={(e) => onChange({ ...form, notes: e.target.value })}
            placeholder="到着が遅れる場合やお伝えしたいことがあればご記入ください"
            rows={3}
            className="w-full p-3 rounded-lg border border-[#E5DDD8] text-base bg-white focus:border-[#B87942] focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* 料金の目安 */}
      {(() => {
        const baseFee = (plan?.basePrice ?? 0) * dogCount * Math.max(stayNights, 1);

        // CI前早預かり延長料金
        let ciExtFee = 0;
        let ciExtHours = 0;
        if (form.checkin_extension && form.checkin_extension_from) {
          const [fh] = form.checkin_extension_from.split(":").map(Number);
          ciExtHours = Math.max(0, 14 - fh);
          ciExtFee = ciExtHours * EXTRA_HOUR_FEE * dogCount;
        }

        // CO後延長料金
        let coExtFee = 0;
        let coExtHours = 0;
        if (form.checkout_extension && form.checkout_extension_until) {
          const [th] = form.checkout_extension_until.split(":").map(Number);
          coExtHours = Math.max(0, th - 11);
          coExtFee = coExtHours * EXTRA_HOUR_FEE * dogCount;
        }

        // 散歩オプション
        const walkFee = form.walk_option ? WALK_OPTION_FEE * dogCount : 0;

        const totalEstimate = baseFee + ciExtFee + coExtFee + walkFee;

        return (
          <div className="p-4 rounded-xl bg-[#F8F5F0] space-y-2">
            <h3 className="font-medium text-sm text-[#888]">料金の目安</h3>
            <div className="flex justify-between text-sm">
              <span>
                {plan?.name} x {dogCount}頭
                {stayNights > 1 ? ` x ${stayNights}泊` : ""}
              </span>
              <span>¥{baseFee.toLocaleString()}</span>
            </div>
            {ciExtFee > 0 && (
              <div className="flex justify-between text-sm text-[#B87942]">
                <span>早預かり（{ciExtHours}時間 x {dogCount}頭）</span>
                <span>¥{ciExtFee.toLocaleString()}</span>
              </div>
            )}
            {coExtFee > 0 && (
              <div className="flex justify-between text-sm text-[#B87942]">
                <span>延長預かり（{coExtHours}時間 x {dogCount}頭）</span>
                <span>¥{coExtFee.toLocaleString()}</span>
              </div>
            )}
            {walkFee > 0 && (
              <div className="flex justify-between text-sm text-[#B87942]">
                <span>お散歩オプション（{dogCount}頭）</span>
                <span>¥{walkFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-medium pt-2 border-t border-[#E5DDD8]">
              <span>合計（税込）</span>
              <span>¥{totalEstimate.toLocaleString()}〜</span>
            </div>
            <p className="text-[12px] text-[#888]">
              ※ 引き取り時間超過の場合 ¥{EXTRA_HOUR_FEE.toLocaleString()}/時間が別途発生します
            </p>
            <p className="text-[12px] text-[#888]">
              ※ お支払いは現地にて（現金・カード・各種電子マネー・QR決済対応）
            </p>
          </div>
        );
      })()}

      {/* 15kg以上の注意 */}
      {hasHeavyDog && (
        <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-sm text-orange-700">
          体重15kg以上のワンちゃんがいるため、スタッフ確認後に予約確定となります。
          確認メールをお送りいたしますので、しばらくお待ちください。
        </div>
      )}

      {/* キャンセルポリシー */}
      <div className="p-4 rounded-xl border border-[#E5DDD8] text-sm space-y-2">
        <h3 className="font-medium">キャンセルポリシー</h3>
        <ul className="text-[#888] space-y-1 text-[13px]">
          <li>前日キャンセル：予約日数の50%</li>
          <li>当日キャンセル：予約日数の100%</li>
        </ul>
        <p className="text-[#888] text-[12px] mt-1">※ペットの体調不良・ケガ・病気、飼い主様の病気、台風や大雪などの場合はキャンセル料をいただかない場合もございます。</p>
        <p className="text-[#888] text-[12px]">※キャンセル・変更の際はできるだけ速やかにご連絡ください。</p>
      </div>

      {/* 当日のご案内 */}
      <div className="p-4 rounded-xl border border-[#E5DDD8] text-sm space-y-2">
        <h3 className="font-medium">当日のご案内</h3>
        <div className="text-[13px] text-[#666] space-y-1.5">
          <p><span className="font-medium text-[#3C200F]">持ち物:</span> ワクチン証明書（狂犬病・混合）、リード、普段の食事（宿泊の場合）</p>
          <p><span className="font-medium text-[#3C200F]">場所:</span> 神奈川県足柄下郡箱根町仙石原928-15（<a href="https://maps.google.com/?q=35.2547,139.0295" style={{color:"#B87942",textDecoration:"underline"}}>Googleマップ</a>）</p>
          <p><span className="font-medium text-[#3C200F]">駐車場:</span> 施設前に無料駐車スペースあり（3台）</p>
          <p><span className="font-medium text-[#3C200F]">お支払い:</span> 現地にて（現金・クレジットカード・電子マネー・QR決済対応）</p>
        </div>
      </div>

      {/* 同意チェック */}
      <label className="flex items-start gap-3 p-4 rounded-xl bg-[#F8F5F0]">
        <input
          type="checkbox"
          checked={form.agreed}
          onChange={(e) => onChange({ ...form, agreed: e.target.checked })}
          className="w-5 h-5 rounded accent-[#B87942] mt-0.5"
        />
        <span className="text-sm leading-relaxed">
          上記の内容とキャンセルポリシーに同意の上、予約を送信します
        </span>
      </label>

      {isLateBooking && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[13px] text-amber-700">
          前日17時以降のため<strong>仮予約</strong>となります。翌朝9時までにメールで確定をご連絡します。
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
          disabled={!form.agreed || submitting}
          onClick={handleSubmit}
          className={`flex-[2] py-4 rounded-xl text-base font-medium transition-all ${
            form.agreed && !submitting
              ? "bg-[#B87942] text-white active:bg-[#A06830]"
              : "bg-[#E5DDD8] text-[#888] cursor-not-allowed"
          }`}
        >
          {submitting ? "送信中..." : isLateBooking ? "仮予約を送信する" : "予約を送信する"}
        </button>
      </div>
    </div>
  );
}
