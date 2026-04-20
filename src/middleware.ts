import { NextRequest, NextResponse } from "next/server";

const PREVIEW_COOKIE = "doghub-preview-auth";
const ADMIN_COOKIE = "doghub-admin-session";

// プレビュー保護パス（/walks）
const PREVIEW_PROTECTED: string[] = [];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 注: /walks/* の WanWalk 移行リダイレクトは next.config.ts の redirects() で処理
  // （末尾スラッシュ正規化との二重リダイレクト回避のため）

  // 旧Wix URLリダイレクト（middleware で処理し二重リダイレクトを防止）
  // ※ /hakone, /beginner は新規ページを作成したためリダイレクト対象から除外
  const legacyRedirects: Record<string, string> = {
    "/blog": "/news",
    "/dog-run": "/spots",
    "/home": "/booking",
    "/service-page": "/service",
    // 旧Wixサイト・旧AirReserveのURL
    "/hotel": "/service",
    "/dog-hotel": "/service",
    "/pet-hotel": "/service",
    "/doghotel": "/service",
    "/reservation": "/booking",
    "/plan": "/service",
    "/pricing": "/service",
    "/menu": "/cafe",
    "/contact": "/faq",
    "/about": "/",
    "/gallery": "/",
    "/doghubhakone/calendar": "/booking",
    // カニバリ解消: guide版を記事版に統合（2026-04-14）
    "/guide/hakone-dog": "/news/hakone-dog-trip-guide",
  };

  const redirectTarget = legacyRedirects[pathname] || (pathname.startsWith("/blog/") ? "/news" : null) || (pathname.startsWith("/post/") ? "/news" : null) || (pathname.startsWith("/service-page/") ? "/service" : null) || (pathname.startsWith("/doghubhakone") ? "/booking" : null);
  if (redirectTarget) {
    const url = req.nextUrl.clone();
    url.pathname = redirectTarget;
    return NextResponse.redirect(url, 301);
  }

  // ── 管理画面の認証保護 ──
  const isAdminPath =
    pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginPage = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin/");

  if (isAdminPath && !isLoginPage && !isAdminApi) {
    const adminCookie = req.cookies.get(ADMIN_COOKIE);
    if (adminCookie?.value !== "authorized") {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── プレビュー保護（/walks） ──
  const isPreviewProtected = PREVIEW_PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (!isPreviewProtected) return NextResponse.next();

  const previewCookie = req.cookies.get(PREVIEW_COOKIE);
  if (previewCookie?.value === "authorized") return NextResponse.next();

  const pw = req.nextUrl.searchParams.get("pw");
  const correctPw = process.env.PREVIEW_PASSWORD || "doghub2026";

  if (pw === correctPw) {
    const url = new URL(pathname, req.url);
    const res = NextResponse.redirect(url);
    res.cookies.set(PREVIEW_COOKIE, "authorized", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

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
  matcher: ["/booking/:path*", "/admin/:path*", "/blog/:path*", "/blog", "/dog-run", "/home", "/service-page/:path*", "/service-page", "/post/:path*", "/hotel", "/dog-hotel", "/pet-hotel", "/doghotel", "/reservation", "/plan", "/pricing", "/menu", "/contact", "/about", "/gallery", "/doghubhakone/:path*", "/guide/hakone-dog"],
};
