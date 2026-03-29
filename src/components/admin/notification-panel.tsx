"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const PLAN_NAMES: Record<string, string> = {
  spot: "スポット",
  "4h": "半日",
  "8h": "1日",
  stay: "宿泊",
};

type Activity = {
  id: string;
  date: string;
  plan: string;
  status: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  dog_names: string;
  type: "new" | "cancelled" | "confirmed" | "modified";
};

function formatRelativeTime(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}日前`;
}

function formatDate(d: string) {
  const date = new Date(d + "T00:00:00");
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getMonth() + 1}/${date.getDate()}（${days[date.getDay()]}）`;
}

export function NotificationPanel({
  open,
  onClose,
  lastSeen,
}: {
  open: boolean;
  onClose: () => void;
  lastSeen: string;
}) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);

    (async () => {
      // 直近7日間の予約アクティビティを取得
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data } = await supabase
        .from("reservations")
        .select(
          "id, date, plan, status, created_at, updated_at, customers!inner(last_name, first_name), reservation_dogs(dogs(name))"
        )
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(20);

      if (!data) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const items: Activity[] = (data as unknown[]).map((r: unknown) => {
        const row = r as {
          id: string;
          date: string;
          plan: string;
          status: string;
          created_at: string;
          updated_at: string;
          customers: { last_name: string; first_name: string };
          reservation_dogs: { dogs: { name: string } | null }[];
        };

        let type: Activity["type"] = "new";
        if (row.status === "cancelled") type = "cancelled";
        else if (row.updated_at !== row.created_at && row.status === "confirmed") type = "confirmed";

        return {
          id: row.id,
          date: row.date,
          plan: row.plan,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          customer_name: `${row.customers.last_name}${row.customers.first_name || ""}`,
          dog_names:
            row.reservation_dogs
              ?.map((rd) => rd.dogs?.name)
              .filter(Boolean)
              .join("、") || "",
          type,
        };
      });

      setActivities(items);
      setLoading(false);
    })();
  }, [open]);

  if (!open) return null;

  const TYPE_CONFIG = {
    new: { label: "新規予約", color: "bg-blue-50 text-blue-700", icon: "+" },
    confirmed: { label: "確定", color: "bg-green-50 text-green-700", icon: "✓" },
    cancelled: { label: "キャンセル", color: "bg-red-50 text-red-700", icon: "×" },
    modified: { label: "変更", color: "bg-amber-50 text-amber-700", icon: "✎" },
  };

  return (
    <>
      {/* 背景オーバーレイ */}
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />

      {/* パネル */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="font-medium text-gray-900">お知らせ</h2>
          <button onClick={onClose} className="text-gray-400 active:text-gray-600 p-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <p className="text-center text-gray-400 py-8">読み込み中...</p>
          ) : activities.length === 0 ? (
            <p className="text-center text-gray-400 py-8">直近のお知らせはありません</p>
          ) : (
            <div className="space-y-2">
              {activities.map((a) => {
                const config = TYPE_CONFIG[a.type];
                const isNew = new Date(a.created_at) > new Date(lastSeen);
                return (
                  <Link
                    key={a.id}
                    href={`/admin/reservations/${a.id}`}
                    onClick={onClose}
                    className={`block p-3 rounded-lg border transition-colors active:bg-gray-50 ${
                      isNew ? "border-blue-200 bg-blue-50/30" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${config.color}`}>
                        {config.label}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {a.customer_name} 様
                          {a.dog_names && <span className="text-gray-400 font-normal ml-1">（{a.dog_names}）</span>}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {PLAN_NAMES[a.plan]} {formatDate(a.date)}
                        </p>
                      </div>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">
                        {formatRelativeTime(a.created_at)}
                      </span>
                    </div>
                    {isNew && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 absolute top-3 left-1" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
