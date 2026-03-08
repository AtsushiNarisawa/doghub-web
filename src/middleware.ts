import { NextRequest, NextResponse } from "next/server";

// テスト期間中のパスワード保護
// 公開時にこのファイルを削除するだけでOK
const PROTECTED_PATHS = ["/booking", "/admin"];
const COOKIE_NAME = "doghub-preview-auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 保護対象パスかチェック
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!isProtected) return NextResponse.next();

  // API routeは除外（booking APIは保護しない）
  if (pathname.startsWith("/api/")) return NextResponse.next();

  // 認証済みクッキーがあればスルー
  const authCookie = req.cookies.get(COOKIE_NAME);
  if (authCookie?.value === "authorized") return NextResponse.next();

  // パスワード送信の処理
  if (req.method === "POST") {
    // POSTボディは middleware では読めないので、URLパラメータで代用
  }

  // ?pw= パラメータでパスワードチェック
  const pw = req.nextUrl.searchParams.get("pw");
  const correctPw = process.env.PREVIEW_PASSWORD || "doghub2026";

  if (pw === correctPw) {
    const url = new URL(pathname, req.url);
    const res = NextResponse.redirect(url);
    res.cookies.set(COOKIE_NAME, "authorized", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30日間有効
    });
    return res;
  }

  // パスワード入力画面を返す
  return new NextResponse(getPasswordPage(pathname), {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function getPasswordPage(pathname: string) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>DogHub - Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #F7F5F0; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: white; border-radius: 16px; padding: 32px; max-width: 360px; width: 100%; box-shadow: 0 2px 12px rgba(0,0,0,0.08); text-align: center; }
    h1 { font-size: 18px; color: #3C200F; margin-bottom: 8px; }
    p { font-size: 13px; color: #888; margin-bottom: 24px; }
    input { width: 100%; padding: 14px; border: 2px solid #E5DDD8; border-radius: 12px; font-size: 16px; text-align: center; outline: none; }
    input:focus { border-color: #B87942; }
    button { width: 100%; padding: 14px; border: none; border-radius: 12px; background: #B87942; color: white; font-size: 16px; font-weight: 600; margin-top: 12px; cursor: pointer; }
    button:active { background: #A06830; }
  </style>
</head>
<body>
  <div class="card">
    <h1>DogHub Preview</h1>
    <p>テスト用パスワードを入力してください</p>
    <form onsubmit="go(event)">
      <input type="password" id="pw" placeholder="パスワード" autofocus>
      <button type="submit">入る</button>
    </form>
  </div>
  <script>
    function go(e) {
      e.preventDefault();
      const pw = document.getElementById('pw').value;
      window.location.href = '${pathname}?pw=' + encodeURIComponent(pw);
    }
  </script>
</body>
</html>`;
}

export const config = {
  matcher: ["/booking/:path*", "/admin/:path*"],
};
