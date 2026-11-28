// 記念ショート動画の「並び」と「自動の文字」（2段目-B・2026-11-28 S88）。
// 構成の正本＝docs/specs/memorial_video_composition_v2_2026-11-28.md §8〜§9（v2.2・CEO 承認）
// 計画＝docs/specs/memorial_video_stage2b_plan_2026-11-28.md §2
//
// 🔴 自動の文字は、どの子にも本当であること（11-28 CEO）。
//    その子が実際にしたか分からないこと（おやつ・水あそび・お昼寝など）は入れない。
//    ここの文はお客様に届く（L3）＝変えるときは CEO 承認。
// 🔴 景色の文字は「いまの箱根」の一般的な話（お客様がそこへ行ったとは書かない）＝CEO が景色と一緒に登録する。

export type ShotKind = "video" | "photo";

export type DogShot = { kind: ShotKind; file: string; durationSec: number | null };
export type SceneShot = { id: string; kind: ShotKind; file: string; caption: string };

export type TextBlock = { lines: string[]; size: number; bold: boolean; top: number };

export type Clip = {
  kind: ShotKind;
  file: string;
  seconds: number;
  /** 動画のとき、どこから使うか（秒） */
  startSec: number;
  /** 写真のとき、ゆっくり寄る */
  zoom: boolean;
  /** 場面の役目（アルバム型で文字の置き方・ロゴを決める） */
  role: "title" | "mid" | "end" | "scene";
  texts: TextBlock[];
};

export const VIDEO_W = 720;
export const VIDEO_H = 1280;
const TEXT_TOP = Math.round(VIDEO_H * 0.17);

/**
 * 3場面目（犬3）の文の候補。どの子にも本当のことだけ。
 * 🔴 CEO 承認待ち（11-28 S88 起案）＝本番前に確認していただく
 */
export const EXTRA_LINES = {
  stay: [["スタッフと過ごした", "箱根の夜"], ["家族の帰りを", "仙石原で待ってたよ"]],
  // 1日（8時間）だけ「一日」。半日・スポットで「一日」は事実と違う（11-28 S88 ユーザーテストの指摘）
  fullDay: [["スタッフと過ごした", "仙石原の一日"], ["家族の帰りを", "仙石原で待ってたよ"]],
  short: [["スタッフと過ごした", "仙石原のひととき"], ["家族の帰りを", "仙石原で待ってたよ"]],
} as const;

/**
 * 最初から入っている見本の景色（web/assets/scenes/・11-28 S88 CEO「景色はデフォルトで入っていると良い」）。
 * CEO が設定で登録した景色が足りない月は、ここから足す（登録した景色が先）。
 * 🔴 季節外れの文字を出さないよう、月で絞る（すすき＝10〜11月・林の「11月の箱根」＝11月）。
 *    12月〜9月の見本はまだ無い＝撮りためて設定から登録する。
 */
export const DEFAULT_SCENES: { id: string; file: string; caption: string; months: number[] }[] = [
  { id: "default-susuki", file: "default-susuki.mp4", caption: "いまの仙石原は\nすすきが金色に", months: [10, 11] },
  { id: "default-hayashi", file: "default-hayashi.mp4", caption: "空気が澄んだ\n11月の箱根", months: [11] },
];

/**
 * 記念動画の型（11-28 S88 CEO「いろいろな型を試し、良いものを集約していく」）。
 * 予約ごとに自動で入れ替え、受け取りページでの保存を型ごとに数える（dataLayer の memorial_save）。
 * 型を足すときは、ここと memorial-render.tsx の分岐に足す。
 */
export const MEMORIAL_STYLES = ["classic", "album", "cinema"] as const;
export type MemorialStyle = (typeof MEMORIAL_STYLES)[number];
export const STYLE_LABELS: Record<MemorialStyle, string> = {
  classic: "帯（黒い帯に白い字）",
  album: "アルバム（紙と写真）",
  cinema: "シネマ（旅行 vlog 風）",
};
export function isMemorialStyle(v: unknown): v is MemorialStyle {
  return typeof v === "string" && (MEMORIAL_STYLES as readonly string[]).includes(v);
}
/** 置き場の住所から型を読む（memorial-<型>-<時刻>-<uuid>.mp4。型の無い古いものは classic） */
export function styleFromPath(storagePath: string): MemorialStyle {
  const m = storagePath.match(/\/memorial-([a-z]+)-\d+-/);
  return m && isMemorialStyle(m[1]) ? m[1] : "classic";
}

/** 文字列から決まった数を作る（同じ予約なら毎回同じ並び・別の予約なら入れ替わる） */
export function hashOf(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 「ムック」「ムックとモカ」「ムック・モカ・ハナ」 */
/** 予約ごとに型を決める（同じ予約なら毎回同じ・予約によって入れ替わる） */
export function pickStyle(reservationId: string): MemorialStyle {
  return MEMORIAL_STYLES[hashOf(reservationId + ":style") % MEMORIAL_STYLES.length];
}

export function joinDogNames(names: string[]): string {
  const n = names.map((s) => s.trim()).filter(Boolean);
  if (n.length === 0) return "";
  if (n.length <= 2) return n.join("と");
  return n.join("・");
}

/** "2026-11-27" → 11 */
export function monthOf(date: string): number {
  return Number(date.slice(5, 7));
}

/** その月に使える景色から、予約ごとに入れ替えて最大 max 個を選ぶ */
export function pickScenes<T extends { id: string; months: number[]; active: boolean }>(
  scenes: T[],
  month: number,
  reservationId: string,
  max = 3
): T[] {
  return scenes
    .filter((s) => s.active && s.months.includes(month))
    .sort((a, b) => hashOf(reservationId + a.id) - hashOf(reservationId + b.id))
    .slice(0, max);
}

/** たくさん載っていても4つまで（最初と最後を含めて均等に選ぶ） */
function pickDogShots(shots: DogShot[]): DogShot[] {
  if (shots.length <= 4) return shots;
  const idx = [0, 1, 2, 3].map((i) => Math.round((i * (shots.length - 1)) / 3));
  return idx.map((i) => shots[i]);
}

export type TimelineInput = {
  reservationId: string;
  plan: string; // stay / 8h / 4h / spot
  date: string; // ご利用日（YYYY-MM-DD）
  dogNames: string[];
  dogShots: DogShot[]; // 載せた順
  scenes: SceneShot[]; // pickScenes 済み
};

/**
 * 並び：犬（題名）→ 景色 → 犬（プラン）→ 景色 → 犬（候補の文）→ 景色 → 犬（おかえり）
 * 素材の数で伸び縮みする：
 *   1つ＝題名 → おかえり（同じ素材）／2つ＝題名 → プラン → おかえり（1つ目）
 *   3つ＝題名 → プラン → 候補 → おかえり（1つ目）／4つ以上＝題名 → プラン → 候補 → おかえり（4つ目）
 * 景色はあいだに入る（足りなければ前から順に・無ければ景色なし）
 */
export function buildTimeline(input: TimelineInput): Clip[] {
  const shots = pickDogShots(input.dogShots);
  if (shots.length === 0) return [];

  const stay = input.plan === "stay";
  const names = joinDogNames(input.dogNames);
  const [y, m] = input.date.split("-");

  const title: TextBlock[] = [
    { lines: [names ? `${names}の箱根旅` : "箱根旅"], size: 50, bold: true, top: TEXT_TOP },
    { lines: [`${y}.${m}`], size: 28, bold: false, top: TEXT_TOP + 95 },
  ];
  const planText: TextBlock[] = [
    {
      lines: [`${names ? `${names}は` : ""}DogHubで${stay ? "お泊まり" : "お留守番"}`],
      size: 38,
      bold: true,
      top: TEXT_TOP,
    },
  ];
  const extras = stay ? EXTRA_LINES.stay : input.plan === "8h" ? EXTRA_LINES.fullDay : EXTRA_LINES.short;
  const extraText: TextBlock[] = [
    { lines: [...extras[hashOf(input.reservationId) % extras.length]], size: 38, bold: true, top: TEXT_TOP },
  ];
  const endText: TextBlock[] = [
    { lines: ["おかえり！", "また会おうね"], size: 46, bold: true, top: TEXT_TOP },
    { lines: ["DogHub箱根仙石原"], size: 26, bold: false, top: Math.round(VIDEO_H * 0.72) },
  ];

  type Slot = { shot: DogShot; texts: TextBlock[]; role: "title" | "mid" | "end" };
  const slots: Slot[] = [{ shot: shots[0], texts: title, role: "title" }];
  if (shots.length >= 2) slots.push({ shot: shots[1], texts: planText, role: "mid" });
  if (shots.length >= 3) slots.push({ shot: shots[2], texts: extraText, role: "mid" });
  slots.push({ shot: shots.length >= 4 ? shots[3] : shots[0], texts: endText, role: "end" });

  // 素材が少ないときは1コマを少し長く
  const few = slots.length + Math.min(input.scenes.length, slots.length - 1) <= 3;
  const photoSec = (role: Slot["role"]) => (few ? 3.0 : role === "title" ? 2.5 : role === "end" ? 2.6 : 2.2);

  const clips: Clip[] = [];
  slots.forEach((slot, i) => {
    const s = slot.shot;
    if (s.kind === "video") {
      const dur = s.durationSec ?? 0;
      const start = dur > 3.5 ? 0.5 : 0;
      clips.push({ kind: "video", file: s.file, seconds: 2.5, startSec: start, zoom: false, texts: slot.texts, role: slot.role });
    } else {
      clips.push({ kind: "photo", file: s.file, seconds: photoSec(slot.role), startSec: 0, zoom: true, texts: slot.texts, role: slot.role });
    }
    const scene = i < slots.length - 1 ? input.scenes[i] : undefined;
    if (scene) {
      clips.push({
        kind: scene.kind,
        file: scene.file,
        seconds: 2.0,
        startSec: 0,
        zoom: scene.kind === "photo",
        role: "scene",
        texts: [
          {
            lines: scene.caption.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 2),
            size: 38,
            bold: true,
            top: TEXT_TOP,
          },
        ],
      });
    }
  });
  return clips;
}
