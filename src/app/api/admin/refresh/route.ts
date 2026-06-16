import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 管理画面のセッション再発行エンドポイント。
// httpOnly Cookie に保存した refresh_token からサーバー側で新しいセッションを取得し、
// 新しい refresh_token で Cookie を更新（ローテーション同期）して返す。
// クライアント（AuthGuard）は受け取ったトークンで setSession し、RLS の authenticated
// 権限で管理画面のデータを読めるようになる。失敗時は Cookie を消して 401（→ログインへ）。

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const REFRESH_COOKIE = "doghub-admin-refresh";
const AUTH_COOKIE = "doghub-admin-session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7日間

function clearCookies(res: NextResponse) {
  res.cookies.set(REFRESH_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 0, path: "/" });
  res.cookies.set(AUTH_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 0, path: "/" });
}

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session) {
    // refresh_token が失効/無効（7日経過・revoke 等）→ Cookie をクリアして再ログインへ
    const res = NextResponse.json({ error: "session_expired" }, { status: 401 });
    clearCookies(res);
    return res;
  }

  const res = NextResponse.json({
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  });
  // ローテーション後の新しい refresh_token で Cookie を更新し、入場 Cookie も延長する。
  res.cookies.set(REFRESH_COOKIE, data.session.refresh_token, {
    httpOnly: true, secure: true, sameSite: "lax", maxAge: MAX_AGE, path: "/",
  });
  res.cookies.set(AUTH_COOKIE, "authorized", {
    httpOnly: true, secure: true, sameSite: "lax", maxAge: MAX_AGE, path: "/",
  });
  return res;
}
