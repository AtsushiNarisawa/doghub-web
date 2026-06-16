import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 管理画面のログイン保持は /api/admin/refresh（httpOnly Cookie の refresh_token を
// サーバーで更新）に一本化する。クライアント側の autoRefreshToken を切ることで、
// refresh_token のローテーションが Cookie と localStorage でズレて
// 「reuse 検知でセッション失効 → 管理画面が空表示」になるのを防ぐ。
// お客様側は Supabase 認証セッションを使わない（anon 読み取りのみ）ため影響なし。
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
  },
});
