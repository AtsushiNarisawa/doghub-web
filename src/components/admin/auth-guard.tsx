"use client";

// ミドルウェア（middleware.ts）がクッキーで /admin パスを保護しているため、
// ここまで到達した時点で認証済み。そのまま children を表示する。
export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
