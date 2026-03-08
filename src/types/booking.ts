export type Plan = "spot" | "4h" | "8h" | "stay";

export type BookingStep = 1 | 2 | 3 | 4;

export interface PlanInfo {
  id: Plan;
  name: string;
  description: string;
  basePrice: number;
  priceUnit: string;
  checkinRange: { start: string; end: string };
  checkoutInfo?: string;
  maxHours: number | null;
  earlyMorning?: boolean; // 早朝プラン対応（7:00〜、要事前連絡）
}

export interface DogFormData {
  id?: string;
  name: string;
  breed: string;
  weight: string;
  age: string;
  sex: "male" | "female" | "";
  neutered: boolean;
  rabies_vaccine_expires_at: string; // 狂犬病ワクチン
  mixed_vaccine_expires_at: string;  // 混合ワクチン
  allergies: string;
  meal_notes: string;
  medication_notes: string;
}

export interface CustomerFormData {
  id?: string;
  last_name: string;
  first_name: string;
  last_name_kana: string;
  first_name_kana: string;
  phone: string;
  email: string;
  postal_code: string;
  address: string;
}

export interface BookingFormData {
  // STEP1
  plan: Plan | "";
  date: string;
  checkin_time: string;
  checkout_date: string;
  early_morning: boolean; // 早朝プラン希望
  destination: string;    // お客様の行き先（マーケティング用）
  // STEP2
  dogs: DogFormData[];
  // STEP3
  customer: CustomerFormData;
  referral_source: string;
  // STEP4
  walk_option: boolean;
  notes: string;
  agreed: boolean;
}

export const PLANS: PlanInfo[] = [
  {
    id: "spot",
    name: "スポットお預かり（1時間〜）",
    description: "ちょっとした用事に。1時間単位でお預かりします。",
    basePrice: 1100,
    priceUnit: "/時間",
    checkinRange: { start: "09:00", end: "16:00" },
    maxHours: null,
    earlyMorning: true,
  },
  {
    id: "4h",
    name: "半日お預かり（4時間）",
    description: "ユネッサンやゴルフの間にぴったり。",
    basePrice: 3300,
    priceUnit: "",
    checkinRange: { start: "09:00", end: "13:00" },
    maxHours: 4,
    earlyMorning: true,
  },
  {
    id: "8h",
    name: "1日お預かり（8時間）",
    description: "温泉旅館や観光をゆっくり楽しみたい方に。",
    basePrice: 5500,
    priceUnit: "",
    checkinRange: { start: "09:00", end: "09:00" },
    maxHours: 8,
    earlyMorning: true,
  },
  {
    id: "stay",
    name: "宿泊お預かり",
    description: "お泊まりでのご旅行に。翌日のお迎えまでしっかりお預かり。",
    basePrice: 7700,
    priceUnit: "/泊",
    checkinRange: { start: "14:00", end: "17:00" },
    checkoutInfo: "チェックアウト 9:00〜11:00",
    maxHours: null,
  },
];

export const EXTRA_HOUR_FEE = 1100;
export const WALK_OPTION_FEE = 550;

export const DESTINATIONS = [
  "ゴルフ（大箱根CC等）",
  "ユネッサン",
  "温泉旅館・ホテル",
  "美術館・博物館",
  "観光・散策",
  "お買い物",
  "その他",
] as const;

export const REFERRAL_SOURCES = [
  "Google検索",
  "Instagram",
  "旅行サイト（じゃらん等）",
  "ゴルフ場からの紹介",
  "宿泊施設からの紹介",
  "知人・友人の紹介",
  "リピーター",
  "その他",
] as const;

export const INITIAL_DOG: DogFormData = {
  name: "",
  breed: "",
  weight: "",
  age: "",
  sex: "",
  neutered: false,
  rabies_vaccine_expires_at: "",
  mixed_vaccine_expires_at: "",
  allergies: "",
  meal_notes: "",
  medication_notes: "",
};

export const INITIAL_CUSTOMER: CustomerFormData = {
  last_name: "",
  first_name: "",
  last_name_kana: "",
  first_name_kana: "",
  phone: "",
  email: "",
  postal_code: "",
  address: "",
};

export const INITIAL_FORM: BookingFormData = {
  plan: "",
  date: "",
  checkin_time: "",
  checkout_date: "",
  early_morning: false,
  destination: "",
  dogs: [{ ...INITIAL_DOG }],
  customer: { ...INITIAL_CUSTOMER },
  referral_source: "",
  walk_option: false,
  notes: "",
  agreed: false,
};
