"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isLateBooking } from "@/lib/booking-rules";

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
  /** この行の「出来事が起きた時刻」。新規＝作成時刻、確定/変更/キャンセル＝更新時刻 */
  activity_at: string;
  customer_name: string;
  dog_names: string;
  type: "new" | "cancelled" | "confirmed" | "modified" | "no_show";
};

/** ISO日時から JST の「日付」と「時」を取り出す（サーバー側 lib/datetime.ts と同じ求め方） */
function jstParts(iso: string): { date: string; hour: number } {
  const d = new Date(iso);
  return {
    date: new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric", month: "2-digit", day: "2-digit",
    }).format(d),
    hour: parseInt(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Tokyo", hour: "2-digit", hour12: false,
      }).format(d),
      10,
    ),
  };
}

/**
 * 予約1件に「何が起きたか」を判定する（総点検 #17）。
 *
 * 🔴 前提: reservations.updated_at は DB トリガーで自動更新されるため、
 *    お客様・スタッフが何もしていなくても**お礼メールの cron が thankyou_sent を立てただけ**で動く。
 *    実測（2026-08-30・直近14日）では更新のあった行のほぼ全部がこのパターンで、
 *    従来の「updated_at ≠ created_at かつ confirmed なら確定」という判定は、
 *    ただの新規予約を1〜2日後に「確定」と誤表示していた。
 *
 * そこで判定を次の順序にした:
 *   1. キャンセル済み            → キャンセル
 *   1b. 無断キャンセル            → 無断キャンセル（これが無いと「変更」と誤表示される）
 *   2. 更新されていない          → 新規予約
 *   3. お礼送信済み（cronの更新） → 新規予約（＝人の操作ではないので出来事にしない）
 *   4. まだ確認待ち              → 新規予約
 *   5. 作られた時点が「仮予約」だった → 確定（スタッフが pending→confirmed にした）
 *   6. それ以外の更新            → 変更（日程変更・お客様のセルフ変更）
 *
 * 5 の判定は lib/booking-rules.ts の isLateBooking をそのまま使う。
 * サーバーが予約作成時に仮予約とするかを決めているのと同じ関数なので、
 * 「作られたときに仮予約だったか」を作成時刻から正確に再現できる。
 */
function classifyActivity(r: {
  status: string;
  source: string;
  date: string;
  created_at: string;
  updated_at: string;
  thankyou_sent: boolean | null;
}): Activity["type"] {
  if (r.status === "cancelled") return "cancelled";
  // 無断キャンセルの記録（総点検 #15）。これを先に返さないと、
  // 状態を変えただけで updated_at が動くため「変更」として出てしまう。
  if (r.status === "no_show") return "no_show";
  if (!r.updated_at || r.updated_at === r.created_at) return "new";
  if (r.thankyou_sent) return "new";
  if (r.status === "pending") return "new";

  const created = jstParts(r.created_at);
  const wasPendingAtCreation =
    r.source !== "phone" && isLateBooking(r.date, created.date, created.hour);
  if (wasPendingAtCreation && r.status === "confirmed") return "confirmed";
  return "modified";
}

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
      // 直近7日間の予約アクティビティを取得。
      // 「作られた予約」だけでなく「動きのあった予約」も拾う（総点検 #17）。
      // 従来は created_at のみで絞っていたため、3週間前に入った予約の日程を
      // スタッフが動かしてもこのお知らせには一切出てこなかった。
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const since = sevenDaysAgo.toISOString();

      const { data } = await supabase
        .from("reservations")
        .select(
          "id, date, plan, status, source, thankyou_sent, created_at, updated_at, customers!inner(last_name, first_name), reservation_dogs(dogs(name))"
        )
        .or(`created_at.gte.${since},updated_at.gte.${since}`)
        .order("updated_at", { ascending: false })
        .limit(60);

      if (!data) {
        setActivities([]);
        setLoading(false);
        return;
      }

      const items: Activity[] = (data as unknown[])
        .map((r: unknown) => {
          const row = r as {
            id: string;
            date: string;
            plan: string;
            status: string;
            source: string;
            thankyou_sent: boolean | null;
            created_at: string;
            updated_at: string;
            customers: { last_name: string; first_name: string };
            reservation_dogs: { dogs: { name: string } | null }[];
          };

          const type = classifyActivity(row);

          return {
            id: row.id,
            date: row.date,
            plan: row.plan,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            // 新規は「入った時刻」、確定/変更/キャンセルは「動いた時刻」を出来事の時刻とする
            activity_at: type === "new" ? row.created_at : row.updated_at || row.created_at,
            customer_name: `${row.customers.last_name}${row.customers.first_name || ""}`,
            dog_names:
              row.reservation_dogs
                ?.map((rd) => rd.dogs?.name)
                .filter(Boolean)
                .join("、") || "",
            type,
          };
        })
        // 「新規」なのに7日より前に入った予約は出さない（お礼cronの更新で拾われただけの行）
        .filter(
          (a) =>
            a.type !== "new" ||
            new Date(a.created_at).getTime() >= sevenDaysAgo.getTime(),
        )
        .sort(
          (a, b) =>
            new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime(),
        )
        .slice(0, 20);

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
    no_show: { label: "無断キャンセル", color: "bg-gray-100 text-gray-600", icon: "−" },
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
                    <div className="flex items-start gap-2">
                      {/* 未読の青ドット。以前は absolute だったが親に relative が無く、
                          カードの外（パネル左上）にずれて表示されていた（総点検 #17）。
                          位置がずれない行内配置にし、未読でないときも幅を確保して列を揃える。 */}
                      <span className="mt-1.5 w-2 shrink-0" aria-hidden="true">
                        {isNew && <span className="block w-2 h-2 rounded-full bg-blue-500" />}
                      </span>
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
                        {formatRelativeTime(a.activity_at)}
                      </span>
                    </div>
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
