import { PLANS, EXTRA_HOUR_FEE, WALK_OPTION_FEE } from "@/types/booking";
import type { BookingFormData } from "@/types/booking";

export function calculateBookingTotal(form: BookingFormData): number {
  const plan = PLANS.find((p) => p.id === form.plan);
  if (!plan) return 0;
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

  let ciExtFee = 0;
  if (form.checkin_extension && form.checkin_extension_from) {
    const [fh] = form.checkin_extension_from.split(":").map(Number);
    const hours = Math.max(0, 14 - fh);
    ciExtFee = hours * EXTRA_HOUR_FEE * dogCount;
  }

  let coExtFee = 0;
  if (form.checkout_extension && form.checkout_extension_until) {
    const [th] = form.checkout_extension_until.split(":").map(Number);
    const hours = Math.max(0, th - 11);
    coExtFee = hours * EXTRA_HOUR_FEE * dogCount;
  }

  const walkFee = form.walk_option ? WALK_OPTION_FEE * dogCount : 0;

  return baseFee + ciExtFee + coExtFee + walkFee;
}
