import { PLANS, EXTRA_HOUR_FEE, WALK_OPTION_FEE } from "@/types/booking";
import type { BookingFormData } from "@/types/booking";

// 料金計算はこのファイルが唯一の正本（Single Source of Truth）。
// 以前は確認画面（step4-confirm.tsx）が同じ式を独自に持っており、片方だけ直すと
// 「画面に出した金額」と「GA4に送る金額」がずれる状態だった（総点検 #28）。
// 内訳の表示が必要な画面は calculateBookingBreakdown() を、合計だけでよい所は
// calculateBookingTotal() を呼ぶこと。式をここ以外に書かない。

/** 料金の内訳（確認画面の「料金の目安」表示にそのまま使える形） */
export interface BookingPriceBreakdown {
  /** 宿泊の泊数（宿泊以外・未入力は 0） */
  stayNights: number;
  /** 頭数 */
  dogCount: number;
  /** プラン基本料金 x 頭数 x 泊数 */
  baseFee: number;
  /** チェックイン前の早預かり時間数 */
  ciExtHours: number;
  ciExtFee: number;
  /** チェックアウト後の延長預かり時間数 */
  coExtHours: number;
  coExtFee: number;
  /** お散歩オプション（宿泊のみ） */
  walkFee: number;
  /** 合計（税込） */
  total: number;
}

const EMPTY_BREAKDOWN: BookingPriceBreakdown = {
  stayNights: 0,
  dogCount: 0,
  baseFee: 0,
  ciExtHours: 0,
  ciExtFee: 0,
  coExtHours: 0,
  coExtFee: 0,
  walkFee: 0,
  total: 0,
};

export function calculateBookingBreakdown(form: BookingFormData): BookingPriceBreakdown {
  const plan = PLANS.find((p) => p.id === form.plan);
  if (!plan) return { ...EMPTY_BREAKDOWN };
  const dogCount = form.dogs.length;

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

  const baseFee = plan.basePrice * dogCount * Math.max(stayNights, 1);

  let ciExtHours = 0;
  let ciExtFee = 0;
  if (form.checkin_extension && form.checkin_extension_from) {
    const [fh] = form.checkin_extension_from.split(":").map(Number);
    ciExtHours = Math.max(0, 14 - fh);
    ciExtFee = ciExtHours * EXTRA_HOUR_FEE * dogCount;
  }

  let coExtHours = 0;
  let coExtFee = 0;
  if (form.checkout_extension && form.checkout_extension_until) {
    const [th] = form.checkout_extension_until.split(":").map(Number);
    coExtHours = Math.max(0, th - 11);
    coExtFee = coExtHours * EXTRA_HOUR_FEE * dogCount;
  }

  // お散歩オプションは宿泊のお預かりのみ
  const walkFee = form.plan === "stay" && form.walk_option ? WALK_OPTION_FEE * dogCount : 0;

  return {
    stayNights,
    dogCount,
    baseFee,
    ciExtHours,
    ciExtFee,
    coExtHours,
    coExtFee,
    walkFee,
    total: baseFee + ciExtFee + coExtFee + walkFee,
  };
}

export function calculateBookingTotal(form: BookingFormData): number {
  return calculateBookingBreakdown(form).total;
}
