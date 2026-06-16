"use client";

// 管理画面の認証セッション管理。
// 入場可否（/admin パス）はミドルウェアが Cookie で守るが、データ読み取りは Supabase の
// 認証セッション（RLS）に依存する。両者の寿命がズレると「画面は開けるがデータが空」に
// なるため、ここで以下を担保する:
//  ① 有効なセッションが無い/失効間近 → /api/admin/refresh（Cookie の refresh_token）で再発行。
//  ② 再発行できない（refresh_token 失効）→ ログイン画面へ誘導（空表示を出さない）。
//  ③ access token が切れる前に定期更新＋タブ復帰時に更新（autoRefreshToken は無効化済み）。

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// access token 失効まで残りこの秒数を切ったら更新する（余裕を持って先に更新）
const REFRESH_BEFORE_SEC = 10 * 60; // 10分
// 定期チェック間隔（access token 1h より十分短く）
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5分

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    // 有効なセッションを保証する。true=利用可 / false=要ログイン
    const ensureSession = async (): Promise<boolean> => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const now = Math.floor(Date.now() / 1000);

      // 有効な access token があり、失効まで十分余裕があればそのまま使う
      if (session?.expires_at && session.expires_at - now > REFRESH_BEFORE_SEC) {
        return true;
      }

      // 失効/不在 → サーバー（Cookie の refresh_token）経由で再発行
      try {
        const res = await fetch("/api/admin/refresh", { method: "POST" });
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
          if (json?.session?.access_token && json?.session?.refresh_token) {
            await supabase.auth.setSession({
              access_token: json.session.access_token,
              refresh_token: json.session.refresh_token,
            });
            return true;
          }
        }
      } catch {
        // ネットワーク等で失敗 → 下で再チェック
      }

      // 再発行に失敗。別タブが更新して localStorage を更新済みかもしれないので最終確認。
      const { data: recheck } = await supabase.auth.getSession();
      if (recheck.session?.expires_at && recheck.session.expires_at - now > 0) {
        return true;
      }
      return false;
    };

    (async () => {
      const ok = await ensureSession();
      if (!active) return;
      if (ok) {
        setReady(true);
        timer = setInterval(() => {
          ensureSession().then((stillOk) => {
            if (active && !stillOk) router.replace("/admin/login");
          });
        }, CHECK_INTERVAL_MS);
      } else {
        router.replace("/admin/login");
      }
    })();

    // タブ復帰時（スマホでバックグラウンドから戻った時など）にも更新
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        ensureSession().then((ok) => {
          if (active && !ok) router.replace("/admin/login");
        });
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-gray-400 text-sm">
        読み込み中…
      </div>
    );
  }

  return <>{children}</>;
}
