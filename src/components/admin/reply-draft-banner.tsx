"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// 返信の下書きがある予約へのリンク一覧（2026-11-06 新設）。
// 毎朝の要返信チェック（inbox-check スキル）が reservation_reply_drafts に入れた下書きを、
// 管理画面の最初に見える場所へ出す。下書きは予約の日付が先のことが多く、
// 日付で絞った予約一覧には出てこないため、日付に関係なくここで拾う。
// テーブルが読めないときは何も出さない（管理画面を止めない）。

interface DraftRow {
  reservation_id: string;
  confirm_note: string | null;
  reservations: { date: string; customers: { last_name: string } | null } | null;
}

export default function ReplyDraftBanner() {
  const [drafts, setDrafts] = useState<DraftRow[]>([]);

  useEffect(() => {
    supabase
      .from("reservation_reply_drafts" as never)
      .select("reservation_id, confirm_note, reservations(date, customers(last_name))")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setDrafts(data as unknown as DraftRow[]);
      });
  }, []);

  if (drafts.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
      <p className="text-sm font-medium text-amber-900 mb-2">✉ 返信の下書きが{drafts.length}件あります</p>
      <div className="space-y-1">
        {drafts.map((d) => {
          const date = d.reservations?.date ?? "";
          const label = date ? `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}` : "";
          return (
            <Link
              key={d.reservation_id}
              href={`/admin/reservations/${d.reservation_id}`}
              className="flex items-center justify-between text-sm text-amber-900 underline underline-offset-2 active:text-amber-700"
            >
              <span>{d.reservations?.customers?.last_name ?? "お客様"}様（{label}のご予約）</span>
              {d.confirm_note && <span className="text-xs no-underline text-red-700">要確認</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
