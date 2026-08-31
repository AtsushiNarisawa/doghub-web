"use client";

// LINE のやり取り（1件の会話・読むだけ / Phase 2B）
//
// この画面もDBには一切書き込まない。既読にする処理も持たない（未読管理は作らない方針）。
// 表示できるのは3種類だけ:
//   ① お客様からの受信  ② Botの自動応答  ③ 当店からの自動通知（予約確認・リマインドなど）
// スタッフがLINEアプリから手で送った返信はLINEの仕様上取得できないため、ここには出ない。

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  LineInboxNotice,
  conversationName,
  formatJst,
  messageLabel,
} from "@/components/admin/line-inbox";

interface Conversation {
  id: string;
  display_name: string | null;
  customer_id: string | null;
  customers: { last_name: string; first_name: string | null; phone: string | null } | null;
}

interface Message {
  id: string;
  direction: string;
  sender: string;
  message_type: string;
  text: string | null;
  created_at: string;
}

export default function LineConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: conv }, { data: msgs }] = await Promise.all([
        supabase
          .from("line_conversations")
          .select(
            "id, display_name, customer_id, customers(last_name, first_name, phone)"
          )
          .eq("id", conversationId)
          .maybeSingle(),
        supabase
          .from("line_messages")
          .select("id, direction, sender, message_type, text, created_at")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: true }),
      ]);

      setConversation((conv as unknown as Conversation) ?? null);
      setMessages((msgs ?? []) as Message[]);
      setLoading(false);
    })();
  }, [conversationId]);

  if (loading) {
    return <p className="text-sm text-gray-500 py-8 text-center">読み込み中…</p>;
  }

  if (!conversation) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500 py-8 text-center">
          このやり取りは見つかりませんでした
        </p>
        <Link href="/admin/messages" className="text-sm text-[#B87942]">
          ← LINEのやり取りへ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/admin/messages"
        className="inline-flex items-center gap-1 text-sm text-[#B87942] active:opacity-70"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        LINEのやり取り
      </Link>

      <div className="bg-white rounded-xl p-4">
        <p className="text-base font-medium text-gray-900">
          {conversationName(conversation)}
        </p>
        {conversation.customer_id ? (
          <Link
            href={`/admin/customers/${conversation.customer_id}`}
            className="inline-flex items-center gap-1 text-sm text-[#B87942] mt-1 active:opacity-70"
          >
            お客様の情報を見る
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <p className="text-xs text-gray-500 mt-1">
            まだ顧客情報と連携されていません（LINEの表示名で表示しています）
          </p>
        )}
      </div>

      <LineInboxNotice />

      {messages.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          記録されているメッセージはありません
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const fromCustomer = m.direction === "inbound";
            return (
              <div
                key={m.id}
                className={`flex flex-col ${fromCustomer ? "items-start" : "items-end"}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      fromCustomer
                        ? "bg-[#B87942]/10 text-[#B87942]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {messageLabel(m.sender, m.message_type)}
                  </span>
                  <span className="text-xs text-gray-400">{formatJst(m.created_at)}</span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap break-words ${
                    fromCustomer
                      ? "bg-white text-gray-900"
                      : "bg-[#F7F5F0] text-gray-700 border border-[#E5DDD8]"
                  }`}
                >
                  {m.text ? m.text : nonTextLabel(m.message_type)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 画像・スタンプなどは本文が無い。何が届いたかだけ示す（実体はLINEアプリで見る）
const NON_TEXT_LABELS: Record<string, string> = {
  image: "画像が届いています（LINEアプリでご確認ください）",
  video: "動画が届いています（LINEアプリでご確認ください）",
  audio: "音声が届いています（LINEアプリでご確認ください）",
  file: "ファイルが届いています（LINEアプリでご確認ください）",
  sticker: "スタンプ",
  location: "位置情報が届いています（LINEアプリでご確認ください）",
};

function nonTextLabel(messageType: string): string {
  return NON_TEXT_LABELS[messageType] ?? "（本文なし）";
}
