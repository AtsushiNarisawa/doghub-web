"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

// お支払いが終わったあとの画面。
//
// 🔴 売上の計測（GA4）を二重に数えないため、発火してよいかどうかはサーバーが決める。
//    ブラウザの記憶だけに頼ると、別のタブで開いたときや、翌日ブックマークから開いたときに
//    もう一度数えてしまう。サーバーは「まだ数えていない注文か」を見て、最初の1回だけ true を返す。
//
// 🔴 表示できたら、住所欄の代わりに使っている決済番号を URL から消す（履歴に残さない）。

type Summary = {
  ok: boolean;
  status: "paid" | "pending";
  first_view?: boolean;
  order?: {
    order_no: string;
    qty: number;
    total: number;
    shipping: number;
    unit_price: number;
    fulfillment: "pickup" | "ship";
    product_id: string;
    product_name: string;
  };
};

const yen = (n: number) => `¥${n.toLocaleString("ja-JP")}`;

export function ThanksContent() {
  const params = useSearchParams();
  const sid = params.get("sid");
  const [data, setData] = useState<Summary | null>(null);
  const [failed, setFailed] = useState(false);

  // 🔴 最初に受け取った決済番号を覚えておく（2026-09-08 の通し確認で見つけた不具合）。
  //    下で URL から sid を消すと useSearchParams() が更新されて sid が null になり、
  //    「!sid」の分岐に落ちて、出したばかりのご注文内容が
  //    「このページは、お支払いのあとに表示されます。」に置き換わってしまう。
  //    お客様がお支払い直後に見る画面なので、ここは URL ではなく記憶で判断する。
  const seenSid = useRef<string | null>(null);
  if (sid && !seenSid.current) seenSid.current = sid;
  const hadSid = seenSid.current !== null;

  useEffect(() => {
    if (!sid) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/fragrance/order-summary?sid=${encodeURIComponent(sid)}`);
        const json: Summary = await res.json();
        if (cancelled) return;
        setData(json);

        if (json.status === "paid" && json.order && json.first_view) {
          window.dataLayer?.push({ ecommerce: null });
          window.dataLayer?.push({
            event: "purchase",
            ecommerce: {
              transaction_id: json.order.order_no,
              value: json.order.total,
              shipping: json.order.shipping,
              currency: "JPY",
              items: [
                {
                  item_id: json.order.product_id,
                  item_name: json.order.product_name,
                  price: json.order.unit_price,
                  quantity: json.order.qty,
                },
              ],
            },
            delivery: json.order.fulfillment,
          });
        }

        // 決済番号を URL から外す（ページの見え方は変えない）
        if (json.status === "paid") {
          window.history.replaceState({}, "", "/fragrance/thanks");
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sid]);

  if (!hadSid) {
    return <Message title="ご注文の確認" body="このページは、お支払いのあとに表示されます。" />;
  }
  if (failed) {
    return (
      <Message
        title="ご注文は承っています"
        body="確認の表示に失敗しましたが、ご注文は完了しています。確認のメールをお送りしていますので、そちらをご覧ください。"
      />
    );
  }
  if (!data) {
    return <Message title="確認しています…" body="少しお待ちください。" />;
  }
  if (data.status === "pending" || !data.order) {
    return (
      <Message
        title="確認しています"
        body="お支払いの確認に少し時間がかかっています。確認でき次第、メールでお知らせします。"
      />
    );
  }

  const o = data.order;
  return (
    <div className="max-w-md mx-auto text-center">
      <p className="text-sm tracking-[0.3em] text-[#3C200F]/50 mb-8">DogHub FRAGRANCE</p>
      <h1 className="text-xl text-[#3C200F] font-medium mb-6">ご注文ありがとうございます</h1>

      <div className="bg-white border border-[#3C200F]/10 rounded-lg px-6 py-5 text-left text-sm text-[#3C200F]/80 space-y-2">
        <Row label="注文番号" value={o.order_no} />
        <Row label="商品" value={o.product_name} />
        <Row label="本数" value={`${o.qty} 本`} />
        <Row label="お支払金額" value={`${yen(o.total)}（税込）`} />
      </div>

      <div className="mt-8 text-[#3C200F]/80 leading-relaxed">
        {o.fulfillment === "pickup" ? (
          <>
            <p className="font-medium text-[#3C200F] mb-2">店頭でお渡しします</p>
            <p className="text-sm">
              次にご来店いただいたときに、ホテル受付でお名前をお伝えください。
              <br />
              受付時間は金・土・日・月・火の 9:00〜17:00 です（水・木は定休）。
              <br />
              このためだけにお越しいただく必要はありません。
            </p>
          </>
        ) : (
          <>
            <p className="font-medium text-[#3C200F] mb-2">お届けの準備をします</p>
            <p className="text-sm">
              3〜7営業日以内に発送し、追跡番号をあらためてご連絡します。
            </p>
          </>
        )}
      </div>

      <p className="mt-8 text-sm text-[#3C200F]/60">
        確認のメールをお送りしました。届いていない場合は
        <a href="mailto:info@dog-hub.shop" className="underline">
          info@dog-hub.shop
        </a>
        までご連絡ください。
      </p>

      <p className="mt-10 text-sm tracking-widest text-[#3C200F]/45">
        散歩のあと、手を洗ったら。
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[#3C200F]/55 shrink-0">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="max-w-md mx-auto text-center">
      <p className="text-sm tracking-[0.3em] text-[#3C200F]/50 mb-8">DogHub FRAGRANCE</p>
      <h1 className="text-xl text-[#3C200F] font-medium mb-4">{title}</h1>
      <p className="text-sm text-[#3C200F]/70 leading-relaxed">{body}</p>
    </div>
  );
}
