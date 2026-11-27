"use client";

// LINE のやり取り（1件の会話・読むだけ / Phase 2B）
//
// この画面はやり取りを書き換えない。既読にする処理も持たない（未読管理は作らない方針）。
// 例外（2026-11-21）: 毎朝の要返信チェックが作った「返信の下書き」（line_reply_drafts）を表示し、
// 「LINEで送りました」を押すと下書きを消す。LINE への送信そのものはしない（LINE アプリで送る）。
// 例外（2026-11-27）: 「LINEで送りました」／「LINEアプリで返信済みにする」を押すと、その事実を
// 会話に1行だけ控えとして残す（/api/admin/line/mark-replied）。毎朝の要返信チェックは
// 控えより前のお客様のメッセージを拾い直さない。控えが残せなくても下書きは消す（操作を止めない）。
// 表示できるのは3種類だけ:
//   ① お客様からの受信  ② Botの自動応答  ③ 当店からの自動通知（予約確認・リマインドなど）
// スタッフがLINEアプリから手で送った返信はLINEの仕様上取得できないため、ここには出ない。

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { adminFetch } from "@/lib/admin-fetch";
import { lineAwaitingReply } from "@/lib/line-notification";
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
  const [draft, setDraft] = useState<{ body: string; confirm_note: string | null } | null>(null);
  const [draftText, setDraftText] = useState("");
  const [copied, setCopied] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    supabase
      .from("line_reply_drafts" as never)
      .select("body, confirm_note")
      .eq("conversation_id", conversationId)
      .maybeSingle()
      .then(({ data, error }) => {
        const d = error || !data ? null : (data as unknown as { body: string; confirm_note: string | null });
        setDraft(d);
        setDraftText(d?.body ?? "");
      });
  }, [conversationId]);

  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("コピーできませんでした。文面を長押しして選んでください");
    }
  };

  const discardDraft = async () => {
    if (!confirm("この下書きを捨てますか？")) return;
    await supabase.from("line_reply_drafts" as never).delete().eq("conversation_id", conversationId);
    setDraft(null);
  };

  // LINE アプリで返信したことを控えとして残す。失敗しても例外を出さず false を返す（操作は止めない）
  const recordReplied = async (text: string | null): Promise<boolean> => {
    try {
      const res = await adminFetch("/api/admin/line/mark-replied", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId, body: text }),
      });
      const json = await res.json().catch(() => ({}));
      return res.ok && json?.recorded === true;
    } catch {
      return false;
    }
  };

  const loadMessages = async () => {
    const { data: msgs } = await supabase
      .from("line_messages")
      .select("id, direction, sender, message_type, text, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (msgs) setMessages(msgs as Message[]);
  };

  // 下書きあり: 直した後の本文を控えに残してから下書きを消す
  const sentDraft = async () => {
    if (!confirm("LINEで送りましたか？下書きを消して、返信済みの印を残します。")) return;
    setMarking(true);
    const recorded = await recordReplied(draftText);
    await supabase.from("line_reply_drafts" as never).delete().eq("conversation_id", conversationId);
    setDraft(null);
    if (recorded) await loadMessages();
    setMarking(false);
    if (!recorded) {
      alert("下書きは消しましたが、返信済みの印を残せませんでした。少し時間をおいて、この画面の「LINEアプリで返信済みにする」を押してください（押さないと翌朝の要返信チェックでもう一度出ることがあります）。");
    }
  };

  // 下書きなし（LINEアプリから直接返信した）: 本文なしで控えだけ残す
  const markRepliedWithoutDraft = async () => {
    if (!confirm("LINEアプリでこのお客様に返信しましたか？返信済みの印を残します（LINEには何も送りません）。")) return;
    setMarking(true);
    const recorded = await recordReplied(null);
    if (recorded) await loadMessages();
    setMarking(false);
    if (!recorded) alert("返信済みの印を残せませんでした。時間をおいてもう一度お試しください。");
  };

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

      {draft && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-900 mb-1">✉ 返信の下書きがあります</p>
          {draft.confirm_note && (
            <p className="text-sm text-red-700 mb-2">送信前に確認: {draft.confirm_note}</p>
          )}
          <textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={8}
            className="w-full mt-1 p-3 text-sm border border-gray-200 rounded-lg bg-white focus:border-[#B87942] focus:outline-none resize-none"
          />
          <p className="text-xs text-gray-500 mt-1 mb-3">
            直したら「コピー」を押し、LINEアプリのこのお客様とのトークに貼って送ってください。
          </p>
          <div className="flex gap-2">
            <button
              onClick={copyDraft}
              className="flex-1 py-2.5 rounded-lg bg-[#B87942] text-white text-sm font-medium active:bg-[#A06830]"
            >
              {copied ? "コピーしました" : "コピー"}
            </button>
            <button
              onClick={sentDraft}
              disabled={marking}
              className="flex-1 py-2.5 rounded-lg border border-[#B87942] text-[#B87942] text-sm font-medium active:bg-[#F7F5F0] disabled:opacity-50"
            >
              LINEで送りました
            </button>
            <button
              onClick={discardDraft}
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 active:bg-gray-50"
            >
              捨てる
            </button>
          </div>
        </div>
      )}

      {!draft && lineAwaitingReply(messages) && (
        <div className="bg-white rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-2 leading-relaxed">
            LINEアプリから直接返信したときは、ここを押すと翌朝の要返信チェックがこのメッセージを拾い直しません（LINEには何も送りません）。
          </p>
          <button
            onClick={markRepliedWithoutDraft}
            disabled={marking}
            className="w-full py-2.5 rounded-lg border border-[#B87942] text-[#B87942] text-sm font-medium active:bg-[#F7F5F0] disabled:opacity-50"
          >
            LINEアプリで返信済みにする
          </button>
        </div>
      )}

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
  // 下書きなしで「LINEアプリで返信済みにする」を押したときの控え（本文は LINE アプリ側にだけある）
  staff_reply_marked: "LINEアプリで返信しました（本文はLINEアプリでご確認ください）",
};

function nonTextLabel(messageType: string): string {
  return NON_TEXT_LABELS[messageType] ?? "（本文なし）";
}
