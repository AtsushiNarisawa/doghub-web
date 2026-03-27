import { NextRequest, NextResponse } from "next/server";
import { sendBookingEmails, sendThankYouEmail } from "@/lib/email";
import type { BookingFormData } from "@/types/booking";

const TEST_BOOKING: BookingFormData = {
  plan: "4h",
  date: "2026-04-05",
  checkin_time: "09:00",
  checkout_date: "",
  checkin_extension: false,
  checkin_extension_from: "",
  checkout_extension: false,
  checkout_extension_until: "",
  early_morning: false,
  walk_option: true,
  destination: "ポーラ美術館",
  referral_source: "Google検索",
  agreed: true,
  notes: "",
  dogs: [
    {
      name: "ポチ",
      breed: "トイプードル",
      weight: "4",
      age: "3",
      age_months: "",
      sex: "male" as const,
      has_rabies_vaccine: true,
      has_mixed_vaccine: true,
      allergies: "",
      meal_notes: "",
      medication_notes: "",
      rabies_vaccine_status: "within_1year" as const,
      mixed_vaccine_status: "within_1year" as const,
      vaccine_unable_reason: "",
    },
  ],
  customer: {
    last_name: "テスト",
    first_name: "太郎",
    last_name_kana: "テスト",
    first_name_kana: "タロウ",
    phone: "090-1234-5678",
    email: "narisawa@dog-hub.shop",
    postal_code: "250-0631",
    address: "神奈川県足柄下郡箱根町仙石原928-15",
  },
};

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") || "booking";

  try {
    if (type === "thankyou") {
      await sendThankYouEmail(
        "narisawa@dog-hub.shop",
        "テスト 太郎",
        ["ポチ"],
        "半日お預かり（4時間）",
        true, // isFirstVisit = true でレビューリンク付き
      );
      return NextResponse.json({ ok: true, type: "thankyou", sent: "narisawa@dog-hub.shop" });
    } else {
      await sendBookingEmails(TEST_BOOKING, "TEST1234-5678-ABCD-EFGH", "confirmed");
      return NextResponse.json({ ok: true, type: "booking", sent: "narisawa@dog-hub.shop" });
    }
  } catch (err) {
    const e = err as Error;
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
