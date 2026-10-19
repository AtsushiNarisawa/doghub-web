// 提携先専用のご予約ページ（/partner/<slug>）の定義。
// 専用ページの「ご予約へ」は /booking?partner=<slug> に飛び、予約フォームが
// 行き先ときっかけを最初から埋める。これで「どの予約がどの提携先経由か」が
// 予約DB（destination / referral_source）だけで判別でき、売掛のご請求根拠にもなる。
// 🔴 提携先のお名前は先方の了解を得てから本番に出す（marketing/reports/mitsui_hakone_partnership_kit_2026-08-14.md §4）

export type Partner = {
  slug: string;
  /** 予約フォームの「お預かり中の行き先」に入れる値 */
  destination: string;
  /** 予約フォームの「ご利用のきっかけ」に入れる値（REFERRAL_SOURCES のいずれか） */
  referralSource: string;
};

export const PARTNERS: Record<string, Partner> = {
  "mitsui-hakone": {
    slug: "mitsui-hakone",
    destination: "HOTEL THE MITSUI HAKONE",
    referralSource: "宿泊先・ゴルフ場で知った",
  },
  "exiv-hakone": {
    slug: "exiv-hakone",
    destination: "エクシブ箱根離宮",
    referralSource: "宿泊先・ゴルフ場で知った",
  },
  "sengokuhara-prince": {
    slug: "sengokuhara-prince",
    destination: "仙石原プリンスホテル",
    referralSource: "宿泊先・ゴルフ場で知った",
  },
  "yunohana-prince": {
    slug: "yunohana-prince",
    destination: "箱根湯の花プリンスホテル",
    referralSource: "宿泊先・ゴルフ場で知った",
  },
  "daihakone-cc": {
    slug: "daihakone-cc",
    destination: "大箱根カントリークラブ",
    referralSource: "宿泊先・ゴルフ場で知った",
  },
};

/** 専用ページを開いたタブで、どの提携先から来たかを覚えておく sessionStorage のキー */
export const PARTNER_STORAGE_KEY = "doghub_partner";

export function getPartner(slug: string | null | undefined): Partner | null {
  if (!slug) return null;
  return PARTNERS[slug] ?? null;
}
