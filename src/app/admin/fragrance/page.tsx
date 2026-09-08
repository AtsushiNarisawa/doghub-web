"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Fragrance の管理画面。スタッフが毎日触るのは「注文」と「閉店時の入力」の2つだけ。
//
// 🔴 データはブラウザから直接読まない。注文には住所と電話が入るため、必ず API を通す。
//    API 側は「本当にログインしているか」を確かめる（Cookie の値だけでは通さない）。

type Tab = "stock" | "orders" | "list" | "decision";

const yen = (n: number) => `¥${(n ?? 0).toLocaleString("ja-JP")}`;

async function authedFetch(url: string, init?: RequestInit) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
}

export default function AdminFragrancePage() {
  const [tab, setTab] = useState<Tab>("orders");

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-1">商品（Fragrance）</h1>
      <p className="text-sm text-gray-500 mb-5">
        ハンドクリームの在庫・ご注文・名簿。閉店時の入力はこの画面から。
      </p>

      <div className="flex gap-2 border-b mb-5 overflow-x-auto">
        {(
          [
            ["orders", "ご注文"],
            ["stock", "在庫・閉店入力"],
            ["list", "名簿"],
            ["decision", "増産の判断"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${
              tab === key ? "border-[#3C200F] font-medium" : "border-transparent text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "orders" && <OrdersTab />}
      {tab === "stock" && <StockTab />}
      {tab === "list" && <ListTab />}
      {tab === "decision" && <DecisionTab />}
    </div>
  );
}

// ── ご注文 ───────────────────────────────────────────────
type Order = {
  id: string;
  order_no: string;
  created_at: string;
  email: string;
  customer_name: string | null;
  phone: string | null;
  qty: number;
  total_jpy: number;
  fulfillment: string;
  status: string;
  tracking_no: string | null;
  dog_name: string | null;
  shipping_address: Record<string, string> | null;
  confirm_email_sent_at: string | null;
  confirm_email_error: string | null;
  admin_notes: string | null;
  lot_id: string;
};

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeTest, setIncludeTest] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await authedFetch(`/api/admin/fragrance/orders?include_test=${includeTest ? 1 : 0}`);
    const json = await res.json().catch(() => ({ orders: [] }));
    setOrders(json.orders || []);
    setLoading(false);
  }, [includeTest]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(orderId: string, action: string, extra: Record<string, unknown> = {}) {
    const res = await authedFetch("/api/admin/fragrance/orders", {
      method: "PATCH",
      body: JSON.stringify({ order_id: orderId, action, ...extra }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(`できませんでした：${json.error || res.status}`);
      return;
    }
    if (json.mail_failed) alert("状態は更新しましたが、メールの送信に失敗しました。");
    load();
  }

  const pending = orders.filter((o) => o.status === "paid" || o.status === "oversold");

  if (loading) return <p className="text-sm text-gray-500">読み込んでいます…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm">
          対応が必要：<strong>{pending.length}</strong> 件 ／ 全 {orders.length} 件
        </p>
        <label className="text-xs text-gray-500 flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeTest}
            onChange={(e) => setIncludeTest(e.target.checked)}
          />
          テスト注文も表示
        </label>
      </div>

      {orders.length === 0 && <p className="text-sm text-gray-500">まだご注文はありません。</p>}

      <div className="space-y-3">
        {orders.map((o) => (
          <div
            key={o.id}
            className={`border rounded-lg p-4 ${
              o.status === "oversold" ? "border-red-400 bg-red-50" : "bg-white"
            }`}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
              <span className="font-mono text-sm">{o.order_no}</span>
              <span className="font-medium">{o.customer_name || "（お名前なし）"}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                {o.fulfillment === "pickup" ? "店頭お渡し" : "配送"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100">{statusLabel(o.status)}</span>
              <span className="text-sm text-gray-500 ml-auto">
                {o.qty}本・{yen(o.total_jpy)}
              </span>
            </div>

            <p className="text-xs text-gray-500">
              {new Date(o.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
              ・{o.email}
              {o.phone ? `・${o.phone}` : ""}
              {o.dog_name ? `・お名入れ「${o.dog_name}」` : ""}
            </p>

            {o.status === "oversold" && (
              <p className="text-sm text-red-700 mt-2">
                要対応：在庫を超えたご注文です。店頭の分から回すか、返金するかをご判断ください。
              </p>
            )}
            {o.confirm_email_error && (
              <p className="text-sm text-orange-700 mt-2">
                確認メールが送れていません：{o.confirm_email_error.slice(0, 80)}
              </p>
            )}
            {o.fulfillment === "ship" && o.shipping_address && (
              <p className="text-xs text-gray-600 mt-2">
                〒{o.shipping_address.postal_code} {o.shipping_address.state}
                {o.shipping_address.city}
                {o.shipping_address.line1} {o.shipping_address.line2 || ""}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {o.status === "paid" && o.fulfillment === "pickup" && (
                <button
                  onClick={() => {
                    const by = prompt("お受け取りになった方のお名前を入れてください");
                    if (by) act(o.id, "picked_up", { picked_up_by: by });
                  }}
                  className="text-sm px-3 py-1.5 bg-[#3C200F] text-white rounded"
                >
                  お渡し済みにする
                </button>
              )}
              {o.status === "paid" && o.fulfillment === "ship" && (
                <button
                  onClick={() => {
                    const t = prompt("追跡番号（空でも構いません）") || "";
                    act(o.id, "shipped", { tracking_no: t });
                  }}
                  className="text-sm px-3 py-1.5 bg-[#3C200F] text-white rounded"
                >
                  発送済みにする（お客様へメール）
                </button>
              )}
              {!o.confirm_email_sent_at && (
                <button
                  onClick={() => act(o.id, "resend_confirm")}
                  className="text-sm px-3 py-1.5 border rounded"
                >
                  確認メールを送り直す
                </button>
              )}
              {o.status === "refunded" && (
                <button
                  onClick={() => {
                    if (confirm("現物が戻ってきましたか？在庫に戻します。"))
                      act(o.id, "return_stock", { lot_id: o.lot_id });
                  }}
                  className="text-sm px-3 py-1.5 border rounded"
                >
                  在庫に戻す
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 在庫・閉店入力 ────────────────────────────────────────
type Lot = {
  id: string;
  product_id: string;
  lot_no: number;
  qty_received: number;
  qty_internal: number;
  qty_ec_alloc: number;
  status: string;
  is_paused: boolean;
  expires_on: string | null;
};
type Availability = { lot_id: string; ec_available: number; store_remaining: number };

function StockTab() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [avail, setAvail] = useState<Availability[]>([]);
  const [today, setToday] = useState("");
  const [sold, setSold] = useState(0);
  const [tried, setTried] = useState(0);
  const [asked, setAsked] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await authedFetch("/api/admin/fragrance/lots");
    const json = await res.json().catch(() => ({}));
    setLots(json.lots || []);
    setAvail(json.availability || []);
  }, []);

  useEffect(() => {
    load();
    setToday(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo" }).format(new Date()));
  }, [load]);

  const onSale = lots.find((l) => l.status === "on_sale");
  const a = avail.find((x) => x.lot_id === onSale?.id);

  async function submitClosing() {
    setMsg(null);
    if (onSale && sold > 0) {
      const r = await authedFetch("/api/admin/fragrance/stock-move", {
        method: "POST",
        body: JSON.stringify({ lot_id: onSale.id, reason: "store_sale", qty: sold }),
      });
      if (!r.ok) {
        setMsg("店頭の本数を記録できませんでした。");
        return;
      }
    }
    const r2 = await authedFetch("/api/admin/fragrance/tester", {
      method: "POST",
      body: JSON.stringify({ action: "count", date: today, tried_count: tried, asked_count: asked }),
    });
    if (!r2.ok) {
      setMsg("試香の人数を記録できませんでした。");
      return;
    }
    setMsg("記録しました。");
    setSold(0);
    setTried(0);
    setAsked(0);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-medium mb-3">いまの在庫</h2>
        {!onSale && <p className="text-sm text-gray-500">販売中のロットはありません。</p>}
        {onSale && (
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="オンライン分" value={a?.ec_available ?? 0} />
            <Stat label="店頭分" value={a?.store_remaining ?? 0} />
            <Stat label="着荷数" value={onSale.qty_received} />
          </div>
        )}
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-medium mb-1">閉店時の入力</h2>
        <p className="text-xs text-gray-500 mb-4">
          この記録が、在庫の数と「試された方のうち何人が買ってくださったか」の分母になります。
          入っていない日があると、翌朝おしらせが届きます。
        </p>
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <Field label="日付">
            <input
              type="date"
              value={today}
              onChange={(e) => setToday(e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </Field>
          <Field label="店頭で売れた本数">
            <input
              type="number"
              min={0}
              value={sold}
              onChange={(e) => setSold(Number(e.target.value))}
              className="border rounded px-3 py-2 w-full"
            />
          </Field>
          <Field label="試された人数">
            <input
              type="number"
              min={0}
              value={tried}
              onChange={(e) => setTried(Number(e.target.value))}
              className="border rounded px-3 py-2 w-full"
            />
          </Field>
          <Field label="お声かけした人数">
            <input
              type="number"
              min={0}
              value={asked}
              onChange={(e) => setAsked(Number(e.target.value))}
              className="border rounded px-3 py-2 w-full"
            />
          </Field>
        </div>
        <button
          onClick={submitClosing}
          className="mt-4 px-5 py-2 bg-[#3C200F] text-white rounded text-sm"
        >
          記録する
        </button>
        {msg && <p className="text-sm mt-3">{msg}</p>}
      </div>

      <div className="border rounded-lg p-4 bg-white">
        <h2 className="font-medium mb-3">ロット</h2>
        {lots.length === 0 && <p className="text-sm text-gray-500">まだ登録されていません。</p>}
        <div className="space-y-2">
          {lots.map((l) => {
            const av = avail.find((x) => x.lot_id === l.id);
            return (
              <div key={l.id} className="flex flex-wrap items-center gap-3 text-sm border-b pb-2">
                <span className="font-mono">
                  {l.product_id} #{l.lot_no}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100">{lotLabel(l.status)}</span>
                <span className="text-gray-600">
                  着荷 {l.qty_received}／EC枠 {l.qty_ec_alloc}／予備 {l.qty_internal}
                </span>
                <span className="text-gray-600">
                  残り オンライン {av?.ec_available ?? 0}・店頭 {av?.store_remaining ?? 0}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          ロットの登録・販売開始・完売の切り替えは、いまのところ参謀長にご依頼ください（誤操作を防ぐため）。
        </p>
      </div>
    </div>
  );
}

// ── 名簿 ─────────────────────────────────────────────────
function ListTab() {
  const [data, setData] = useState<{
    totals: { tried: number; asked: number };
    signups: { email: string; name: string | null; kind: string; source: string | null; created_at: string; opted_out_at: string | null }[];
  } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await authedFetch("/api/admin/fragrance/tester");
      setData(await res.json().catch(() => null));
    })();
  }, []);

  if (!data) return <p className="text-sm text-gray-500">読み込んでいます…</p>;

  const active = data.signups.filter((s) => !s.opted_out_at);
  const byKind = (k: string) => active.filter((s) => s.kind === k).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="通知をご希望" value={byKind("launch")} />
        <Stat label="試された方" value={byKind("tester")} />
        <Stat label="店頭でご購入" value={byKind("buyer_store")} />
        <Stat label="試された延べ人数" value={data.totals.tried} />
      </div>
      <p className="text-xs text-gray-500">
        発売までに <strong>130人</strong> を目標にしています（内訳＝メール47／店頭のテスター60／予約メール20／ほか）。
      </p>
      <div className="border rounded-lg bg-white divide-y">
        {active.slice(0, 50).map((s) => (
          <div key={s.email + s.kind} className="px-4 py-2 text-sm flex flex-wrap gap-x-3">
            <span className="font-mono text-xs text-gray-500">{s.kind}</span>
            <span>{s.name || "—"}</span>
            <span className="text-gray-500">{s.email}</span>
            <span className="text-xs text-gray-400 ml-auto">
              {new Date(s.created_at).toLocaleDateString("ja-JP")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 増産の判断 ────────────────────────────────────────────
function DecisionTab() {
  const [d, setD] = useState<{
    decision: Record<string, number | string | boolean | null>;
    capacity: { annual_pace: number | null; max_to_make: number | null; note: string };
    funding: { buyback_rate: number; note: string };
    monthly: Record<string, { count: number; qty: number; sales: number; fee: number; pickup: number; ship: number }>;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await authedFetch("/api/admin/fragrance/summary");
      setD(await res.json().catch(() => null));
    })();
  }, []);

  if (!d) return <p className="text-sm text-gray-500">読み込んでいます…</p>;

  const conv = d.decision.conversion as number | null;

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-5 bg-white">
        <h2 className="font-medium mb-1">いまの判定</h2>
        <p className="text-lg text-[#3C200F] mb-4">{String(d.decision.verdict)}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat
            label="試された方が買った割合"
            value={conv === null ? "—" : `${(conv * 100).toFixed(1)}%`}
          />
          <Stat label="試された人数" value={String(d.decision.tried)} />
          <Stat label="買ってくださった数" value={String(d.decision.purchases)} />
          <Stat label="再入荷をお待ちの方" value={String(d.decision.restock_waiting)} />
        </div>
        <p className="text-xs text-gray-500 mt-4 leading-relaxed">
          基準は発売前に決めてあります＝主：15%以上／従：完売までの日数（オンライン分3日・全体45日）
          または再入荷をお待ちの方30人以上。主を満たし従のどちらかを満たしたら約300個へ。
          8〜15%なら同じ110個でもう一度、8%未満なら商品の前提を見直します。
        </p>
      </div>

      <div className="border rounded-lg p-5 bg-white">
        <h2 className="font-medium mb-3">作ってよい上限</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="いまの年間ペース" value={d.capacity.annual_pace ?? "—"} />
          <Stat label="作ってよい上限" value={d.capacity.max_to_make ?? "—"} />
        </div>
        <p className="text-xs text-gray-500 mt-3">{d.capacity.note}</p>
        <p className="text-xs text-red-700 mt-2">{d.funding.note}</p>
      </div>

      <div className="border rounded-lg p-5 bg-white">
        <h2 className="font-medium mb-3">月ごと（帳簿への転記用）</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">月</th>
              <th>件数</th>
              <th>本数</th>
              <th>売上</th>
              <th>決済手数料（概算）</th>
              <th>店頭／配送</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(d.monthly)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, m]) => (
                <tr key={month} className="border-b">
                  <td className="py-2">{month}</td>
                  <td>{m.count}</td>
                  <td>{m.qty}</td>
                  <td>{yen(m.sales)}</td>
                  <td>{yen(m.fee)}</td>
                  <td>
                    {m.pickup}／{m.ship}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {Object.keys(d.monthly).length === 0 && (
          <p className="text-sm text-gray-500">まだご注文はありません。</p>
        )}
      </div>
    </div>
  );
}

// ── 小物 ─────────────────────────────────────────────────
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded p-3 text-center">
      <div className="text-xl font-medium">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

function statusLabel(s: string): string {
  return (
    {
      paid: "お支払い済み",
      oversold: "要対応（在庫超過）",
      picked_up: "お渡し済み",
      shipped: "発送済み",
      refunded: "返金済み",
      disputed: "申立てあり",
    }[s] || s
  );
}

function lotLabel(s: string): string {
  return (
    {
      planned: "予定",
      received: "着荷済み",
      on_sale: "販売中",
      sold_out: "完売",
      closed: "終了",
    }[s] || s
  );
}
