// ワンちゃんの「年齢」と「その値がいつのものか」を扱う唯一の正本。
//
// 背景（2026-09-21 CEO指摘「犬はずっと年齢が固定ではない。体重も変わる」）:
//   dogs テーブルは age（整数）・weight を「最新の1状態」として持つだけで、
//   時間が経っても自動では変わらない。予約のたびに入力し直す運用（2026-06-17 対策B）で
//   更新はされるが、予約と予約の間は古いままになる。
//
// そこで:
//   - 年齢は **生年月（dogs.birth_date）** を持てば自動で正しくなる。ここで計算する。
//   - 生年月が無い子（保護犬など「わからない」を選んだ方・既存データ）は従来どおり
//     申告された age/age_months を使い、**「いつ申告された値か」を必ず添えて表示する**。
//
// 🔴 birth_date は「年月」までしか聞かない（日は 01 固定）。1日単位の精度は持たない。

import { getJstToday } from "./datetime";

/** "YYYY-MM-01"（または "YYYY-MM"）から、基準日時点の満年齢を出す。不正・未来なら null */
export function ageFromBirthDate(
  birthDate: string | null | undefined,
  onDate: string = getJstToday()
): { years: number; months: number } | null {
  if (!birthDate) return null;
  const [by, bm] = birthDate.split("-").map(Number);
  const [oy, om] = onDate.split("-").map(Number);
  if (!by || !bm || !oy || !om) return null;
  const months = (oy - by) * 12 + (om - bm);
  if (months < 0 || months > 12 * 30) return null; // 未来・ありえない値は使わない
  return { years: Math.floor(months / 12), months: months % 12 };
}

/** 「1歳3ヶ月」「5歳」「8ヶ月」の形にする */
export function formatAge(years: number, months: number): string {
  if (years <= 0) return `${months}ヶ月`;
  return months > 0 ? `${years}歳${months}ヶ月` : `${years}歳`;
}

/** 生年月から「いまの年齢」を出す（無ければ空文字） */
export function currentAgeLabel(birthDate: string | null | undefined, onDate?: string): string {
  const a = ageFromBirthDate(birthDate, onDate);
  return a ? formatAge(a.years, a.months) : "";
}

/**
 * その値がいつ申告されたものか（例:「6月22日 申告」「2025年9月18日 申告」）。
 * 年をまたいでいるときだけ年も出す＝古さが一目で分かる。
 */
export function asOfLabel(updatedAt: string | null | undefined, onDate: string = getJstToday()): string {
  if (!updatedAt) return "";
  const d = new Date(updatedAt);
  if (isNaN(d.getTime())) return "";
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const [y, m, day] = ymd.split("-").map(Number);
  const sameYear = String(y) === onDate.slice(0, 4);
  return sameYear ? `${m}月${day}日 申告` : `${y}年${m}月${day}日 申告`;
}

export interface DogAgeSource {
  birth_date?: string | null;
  age?: number | null;
  age_months?: number | null;
  updated_at?: string | null;
}

/**
 * 管理画面で年齢を表示するときの文言。
 *   - 生年月がある: 「1歳3ヶ月」（自動計算＝常に最新）
 *   - 生年月がない: 「5歳（6月22日 申告）」（いつの値かを添える）
 * 年齢が分からなければ空文字。
 */
export function dogAgeDisplay(dog: DogAgeSource, onDate?: string): string {
  const fromBirth = currentAgeLabel(dog.birth_date, onDate);
  if (fromBirth) return fromBirth;
  if (dog.age == null) return "";
  const declared = dog.age === 0 ? `${dog.age_months ?? 0}ヶ月` : `${dog.age}歳`;
  const asOf = asOfLabel(dog.updated_at, onDate);
  return asOf ? `${declared}（${asOf}）` : declared;
}

/** 体重の表示。体重は生年月のように自動では分からないので、必ず「いつの値か」を添える */
export function dogWeightDisplay(
  weight: number | string | null | undefined,
  updatedAt?: string | null,
  onDate?: string
): string {
  if (weight == null || weight === "") return "";
  const asOf = asOfLabel(updatedAt, onDate);
  return asOf ? `${weight}kg（${asOf}）` : `${weight}kg`;
}
