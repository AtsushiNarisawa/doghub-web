"use client";

// LINE のやり取り一覧（受信トレイ・読むだけ / Phase 2B）
//
// 設計方針:
//  - 未読/既読の管理は作らない。バッジを付けると「LINEアプリ」と「管理画面」の
//    2か所を見張ることになり、スタッフの手間が増えるため（CEO決定・2026-08-30）。
//    この画面は一切DBに書き込まない＝純粋に読むだけ。
//  - データは管理画面の他ページと同じく、ログイン済みスタッフの Supabase セッションで読む。
//    line_conversations / line_messages は RLS でスタッフUIDのみ許可・anon ポリシー0のため、
//    ログインしていない相手にはこのデータは1行も見えない。
//  - 友だち追加だけでやり取りが無い方（last_message_at が空）は一覧に出さない。

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LineInboxNotice, conversationName, formatJst } from "@/components/admin/line-inbox";

const PAGE_SIZE = 100;

interface ConversationRow {
  id: string;
  display_name: string | null;
  customer_id: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_direction: string | null;
  customers: { last_name: string; first_name: string | null } | null;
}

export default function LineMessagesPage() {
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPage = useCallback(async (from: number) => {
    const { data } = await supabase
      .from("line_conversations")
      .select(
        "id, display_name, customer_id, last_message_at, last_message_preview, last_message_direction, customers(last_name, first_name)"
      )
      // やり取りが1件も無い会話（友だち追加だけ）は読むものが無いので出さない
      .not("last_message_at", "is", null)
      .order("last_message_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    const page = (data ?? []) as unknown as ConversationRow[];
    setHasMore(page.length === PAGE_SIZE);
    return page;
  }, []);

  useEffect(() => {
    (async () => {
      setRows(await fetchPage(0));
      setLoading(false);
    })();
  }, [fetchPage]);

  const loadMore = async () => {
    setLoadingMore(true);
    const next = await fetchPage(rows.length);
    setRows((prev) => [...prev, ...next]);
    setLoadingMore(false);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        conversationName(r).toLowerCase().includes(q) ||
        (r.last_message_preview || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-medium text-gray-900">LINEのやり取り</h2>
        <p className="text-xs text-gray-500 mt-0.5">新しい順。タップすると全文が読めます。</p>
      </div>

      <LineInboxNotice />

      <div className="relative">
        <svg
          className="w-5 h-5 text-gray-500 absolute left-3 top-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="お名前・本文で絞り込む"
          className="w-full pl-10 pr-3 py-2.5 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#B87942]"
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 py-8 text-center">読み込み中…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          {search ? "該当するやり取りはありません" : "まだやり取りがありません"}
        </p>
      ) : (
        <div className="bg-white rounded-xl divide-y divide-gray-100 overflow-hidden">
          {filtered.map((c) => {
            const fromCustomer = c.last_message_direction === "inbound";
            return (
              <Link
                key={c.id}
                href={`/admin/messages/${c.id}`}
                className="block px-4 py-3 active:bg-gray-50"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {conversationName(c)}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0">
                    {formatJst(c.last_message_at)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                      fromCustomer
                        ? "bg-[#B87942]/10 text-[#B87942]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {fromCustomer ? "お客様" : "当店"}
                  </span>
                  <span className="text-xs text-gray-600 truncate">
                    {c.last_message_preview || ""}
                  </span>
                </div>
                {!c.customer_id && (
                  <p className="text-xs text-gray-400 mt-1">顧客情報と未連携</p>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {hasMore && !search && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full py-2.5 text-sm text-[#B87942] bg-white rounded-xl active:bg-gray-50 disabled:opacity-50"
        >
          {loadingMore ? "読み込み中…" : "もっと見る"}
        </button>
      )}
    </div>
  );
}
