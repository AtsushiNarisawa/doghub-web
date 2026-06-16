import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "入力が不足しています" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json(
      { error: "メールアドレスまたはパスワードが正しくありません" },
      { status: 401 }
    );
  }

  // クライアント（@/lib/supabase）に Supabase セッションを設定させるためにトークンを返す。
  // これにより管理画面のクエリが anon ではなく authenticated 権限で実行され、
  // RLS の anon 全許可ポリシーを撤去しても staff_full_access（authenticated）で動作する。
  const res = NextResponse.json({
    success: true,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  });
  res.cookies.set("doghub-admin-session", "authorized", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7日間
    path: "/",
  });
  // refresh_token を httpOnly Cookie に保存し、セッション切れ時に /api/admin/refresh で
  // サーバー側から再発行できるようにする（最大7日間は再ログイン不要にするため）。
  // Set-Cookie 由来の httpOnly Cookie は Safari ITP の「JS Cookie 7日上限」の対象外で、
  // localStorage が消えても残るため、スマホでもログイン保持が効く。
  res.cookies.set("doghub-admin-refresh", data.session.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7日間
    path: "/",
  });
  return res;
}
