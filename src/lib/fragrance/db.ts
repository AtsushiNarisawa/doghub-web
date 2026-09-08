import { createClient } from "@supabase/supabase-js";

// Fragrance EC 用の Supabase クライアント（service_role・サーバー専用）。
//
// なぜ supabase-server.ts の supabaseAdmin を使わないか：
//   あちらは生成済みの型定義 src/types/database.ts を当てているが、その定義には
//   予約まわりの5テーブルしか入っていない（site_settings も fragrance_waitlist も無い）。
//   既存の API（waitlist・cron・marketing-send）はいずれも型を当てない createClient を
//   その場で作っており、ここでもその流儀に合わせる。
//
// 🔴 Fragrance の全テーブルは RLS を有効にしてポリシーを1つも作らない設計なので、
//    この service_role クライアントだけが唯一の出入り口になる。
//    ブラウザ側（anon）からは読むことも書くこともできない。注文には住所と電話が入るため、
//    管理画面の「読み」もこのクライアントを通す API 経由に限定すること。
//
// ⚠️ このファイルをクライアントコンポーネントから import しないこと（鍵が漏れる）。

export const fdb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // ビルド時のモジュール評価で undefined にならないよう anon にフォールバック（既存 API と同じ方式）。
  // 本番では必ず service_role が入る。
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
