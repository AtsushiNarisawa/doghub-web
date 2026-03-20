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
  age: string;        // 年齢（0歳の場合はage_monthsを使用）
  age_months: string; // 月齢（age="0"の時のみ使用）
  sex: "male" | "female" | "";
  has_rabies_vaccine: boolean; // 狂犬病ワクチン接種済み（後方互換）
  has_mixed_vaccine: boolean;  // 混合ワクチン接種済み（後方互換）
  rabies_vaccine_status: "" | "within_1year" | "multi_year" | "unable"; // 狂犬病ワクチン状況
  mixed_vaccine_status: "" | "within_1year" | "multi_year" | "unable";  // 混合ワクチン状況
  vaccine_unable_reason: string; // 接種できない事情
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
  checkin_extension: boolean;        // 宿泊チェックイン前の早預かり
  checkin_extension_from: string;    // 早預かり開始時間
  checkout_extension: boolean;       // 宿泊チェックアウト後の延長預かり
  checkout_extension_until: string;  // 延長終了時間
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
  // LINE連携（LIFFから取得）
  line_id?: string;
  // 受付チャネル（省略時はweb）
  source?: "web" | "line" | "phone" | "walk_in";
}

export const PLANS: PlanInfo[] = [
  {
    id: "4h",
    name: "半日お預かり（4時間）",
    description: "美術館や日帰り温泉の間にちょうどいい。",
    basePrice: 3300,
    priceUnit: "",
    checkinRange: { start: "09:00", end: "13:00" },
    maxHours: 4,
  },
  {
    id: "8h",
    name: "1日お預かり（8時間）",
    description: "ユネッサンを満喫、またゴルフにちょうどいい。",
    basePrice: 5500,
    priceUnit: "",
    checkinRange: { start: "07:00", end: "09:00" },
    maxHours: 8,
  },
  {
    id: "stay",
    name: "宿泊お預かり",
    description: "ワンちゃんと泊まれるホテルに空きがない時や、ワンちゃんNGのホテルに泊まる時に。",
    basePrice: 7700,
    priceUnit: "/泊",
    checkinRange: { start: "14:00", end: "17:00" },
    checkoutInfo: "チェックアウト 9:00〜11:00",
    maxHours: null,
  },
];

export const EXTRA_HOUR_FEE = 1100;
export const WALK_OPTION_FEE = 550;

// 1日お預かり（8h）向け行き先
export const DAY_DESTINATIONS = [
  "ゴルフ（大箱根CC）",
  "ゴルフ（箱根湖畔GC）",
  "ゴルフ（箱根園GF）",
  "ユネッサン",
  "ポーラ美術館",
  "ガラスの森美術館",
  "天山湯治郷",
  "箱根の外へお出かけ",
  "その他",
] as const;

// 半日お預かり（4h）向け行き先
export const DAY_DESTINATIONS_4H = [
  "ポーラ美術館",
  "ガラスの森美術館",
  "天山湯治郷",
  "箱根の外へお出かけ",
  "その他",
] as const;

// 「その他」選択時のサジェスト候補
export const DESTINATION_SUGGESTIONS = [
  // ゴルフ
  "大箱根カントリークラブ", "箱根湖畔ゴルフコース", "箱根園ゴルフ場",
  "箱根カントリー仙石", "箱根湯の花ゴルフ場", "大箱根カントリークラブ西コース",
  // 美術館
  "彫刻の森美術館", "岡田美術館", "成川美術館", "ラリック美術館",
  "星の王子さまミュージアム",
  // 温泉
  "箱根湯寮", "かっぱ天国", "箱根小涌園 元湯 森の湯",
  // 観光
  "大涌谷", "芦ノ湖遊覧船", "箱根関所", "箱根神社",
  "御殿場プレミアム・アウトレット",
  // 宿泊施設（日帰り利用）
  "強羅花壇", "箱根吟遊", "富士屋ホテル",
] as const;

// 宿泊預かり（stay）向け行き先
export const STAY_DESTINATIONS = [
  // 仙石原・強羅エリア
  "仙石原プリンスホテル",
  "エクシブ箱根離宮",
  "強羅花壇",
  "界箱根 / 界仙石原",
  "東急ハーヴェスト箱根",
  "箱根翡翠",
  "金乃竹 仙石原",
  "雲外荘",
  "ゆるり箱根",
  "きたの風茶寮",
  "モリトソラ",
  // その他箱根エリア
  "富士屋ホテル（宮ノ下）",
  "箱根吟遊",
  "はつはな",
  "白檀",
  "金乃竹 塔ノ沢",
  "ザ・プリンス箱根芦ノ湖",
  "エクシブ湯河原離宮",
  "箱根湯本の旅館",
  // その他
  "未定",
  "その他（自由記入）",
] as const;

export const REFERRAL_SOURCES = [
  "Googleで検索した",
  "Googleマップで見つけた",
  "Instagramで見つけた",
  "ホテル・ゴルフ場で紹介された",
  "知人・友人の紹介",
  "福利厚生（リロクラブ等）",
  "その他",
] as const;

export const INITIAL_DOG: DogFormData = {
  name: "",
  breed: "",
  weight: "",
  age: "",
  age_months: "",
  sex: "",
  has_rabies_vaccine: false,
  has_mixed_vaccine: false,
  rabies_vaccine_status: "",
  mixed_vaccine_status: "",
  vaccine_unable_reason: "",
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
  checkin_extension: false,
  checkin_extension_from: "",
  checkout_extension: false,
  checkout_extension_until: "",
  early_morning: false,
  destination: "",
  dogs: [{ ...INITIAL_DOG }],
  customer: { ...INITIAL_CUSTOMER },
  referral_source: "",
  walk_option: false,
  notes: "",
  agreed: false,
};
