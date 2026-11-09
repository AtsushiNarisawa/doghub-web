import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 管理画面 API の認可。
//
// 🔴 なぜ新しく作るか（2026-09-05 実測で判明した問題）
//
// 既存の管理 API（update-status / reschedule / resend-email / send-message /
// send-thankyou / merge-dogs）は、Cookie `doghub-admin-session` の値が
// 固定文字列 "authorized" かどうかだけを見ている。
//
//   const session = req.cookies.get("doghub-admin-session");
//   if (!session || session.value !== "authorized") return 401;
//
// この値は誰でも自分のリクエストに付けられるため、ログインしていなくても
// 予約の確定・キャンセル（＝お客様に自動でメールが飛ぶ）・任意の宛先へのメール送信・
// 犬データの統合ができてしまう。httpOnly は「ブラウザの JavaScript から読めない」だけで、
// 攻撃者が自分で付けることは防げない。
// さらに middleware は `/api/*` を除外しているので、そちらでも止まらない。
//
// 🔴 したがって Fragrance EC の管理 API は最初から本人確認を行う。
//    新しい鍵は増やさない ── ログイン時に既に Supabase Auth で認証しており、
//    refresh_token が httpOnly Cookie に入っているので、それを検証するだけでよい。
//    既存6本も同じ関数に差し替えれば1回で直る（別タスク・本番反映は要承認）。

const AUTH_COOKIE = "doghub-admin-session";     // 既存の互換用（値は "authorized" 固定＝それだけでは信用しない）
const REFRESH_COOKIE = "doghub-admin-refresh";  // ここに本物の refresh_token が入っている

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// スタッフのアカウント。DB の RLS（staff_full_access_*）と同じ UID。
// Supabase のアカウントは新規登録でも作れるため、「ログイン済み」だけでは管理者として通さない。
// スタッフを増やすときは RLS とここの両方に追加する。
const STAFF_USER_IDS = new Set(["fb9eff00-5e1f-485a-9e59-c6627aad5d23"]);

export type AdminIdentity = { userId: string; email: string | null };

function toStaffIdentity(user: { id: string; email?: string | null }): AdminIdentity | null {
  if (!STAFF_USER_IDS.has(user.id)) return null;
  return { userId: user.id, email: user.email ?? null };
}

/**
 * Authorization: Bearer の access_token だけでスタッフ本人か確認する。
 *
 * refresh_token は1回使うと新しいものに置き換わる。API の中で Cookie の値を使うと、
 * 新しい値を Cookie に保存できないまま古い値が残り、ログインが切れる原因になる。
 * そのため期限切れは 401 で返し、画面側の adminFetch が /api/admin/refresh で更新して再送する。
 */
export async function verifyAdminBearer(req: NextRequest): Promise<AdminIdentity | null> {
  const bearer = req.headers.get("authorization");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7).trim() : null;
  return token ? identityFromAccessToken(token) : null;
}

/**
 * 管理者本人であることを確認する。
 *
 * 判定の順番
 *   1. Authorization: Bearer <access_token>（クライアントが supabase.auth.getSession() で取れる値）
 *   2. Cookie の refresh_token を使って access_token を取り直す（画面を開きっぱなしでも通る）
 *
 * どちらも取れなければ null。呼び出し側は 401 を返すこと。
 *
 * ⚠️ 固定文字列の Cookie だけでは決して通さない。
 */
export async function verifyAdmin(req: NextRequest): Promise<AdminIdentity | null> {
  const bearer = req.headers.get("authorization");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7).trim() : null;

  if (token) {
    const identity = await identityFromAccessToken(token);
    if (identity) return identity;
  }

  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      const client = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client.auth.refreshSession({ refresh_token: refreshToken });
      if (!error && data.user) {
        return toStaffIdentity(data.user);
      }
    } catch {
      // 失敗＝未ログイン扱い
    }
  }

  return null;
}

async function identityFromAccessToken(token: string): Promise<AdminIdentity | null> {
  try {
    const client = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return null;
    return toStaffIdentity(data.user);
  } catch {
    return null;
  }
}

/** 台帳の actor 欄に残す名前（誰が操作したか）。 */
export function actorLabel(identity: AdminIdentity): string {
  return identity.email || identity.userId.slice(0, 8);
}

/** 既存 Cookie が付いているか（移行期の観測用。単独では認可に使わない）。 */
export function hasLegacyCookie(req: NextRequest): boolean {
  return req.cookies.get(AUTH_COOKIE)?.value === "authorized";
}
