import { NextRequest, NextResponse } from "next/server";
import { fdb } from "@/lib/fragrance/db";

// 配信停止。
//
// 予約のお客様は既存の unsubscribe_token を使うが、Fragrance の通知希望・試香・再入荷待ちで
// 登録された方は「顧客」ではないため、そちらの表にある unsub_token で止める。
//
// 🔴 メールの中のリンクをクリックするだけで止まること。ログインも問い合わせも要らせない
//    （特定電子メール法・一発で止められることが求められる）。

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return html("リンクが正しくないようです", "お手数ですが info@dog-hub.shop までご連絡ください。");
  }

  const now = new Date().toISOString();
  let stopped = false;

  const { data: w } = await fdb
    .from("fragrance_waitlist")
    .update({ opted_out_at: now })
    .eq("unsub_token", token)
    .is("opted_out_at", null)
    .select("id");
  if (w?.length) stopped = true;

  const { data: r } = await fdb
    .from("fragrance_restock_requests")
    .update({ opted_out_at: now })
    .eq("unsub_token", token)
    .is("opted_out_at", null)
    .select("id");
  if (r?.length) stopped = true;

  // 既に停止済みでも「止まっています」と伝える（同じリンクを二度押しても不安にさせない）
  return html(
    "配信を停止しました",
    stopped
      ? "今後、こちらのご案内はお送りしません。ありがとうございました。"
      : "こちらのアドレスへの配信は、すでに停止しています。",
  );
}

function html(title: string, message: string) {
  return new NextResponse(
    `<!doctype html><html lang="ja"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<meta name="robots" content="noindex"><title>${title}｜DogHub箱根仙石原</title></head>` +
      `<body style="font-family:sans-serif;line-height:2;color:#3C200F;max-width:520px;margin:80px auto;padding:0 24px;text-align:center">` +
      `<p style="font-size:0.8rem;letter-spacing:0.3em;color:#3C200F80">DOGHUB FRAGRANCE</p>` +
      `<h1 style="font-size:1.15rem;font-weight:500">${title}</h1>` +
      `<p style="color:#3C200Fcc">${message}</p>` +
      `<p style="margin-top:40px"><a href="https://dog-hub.shop/" style="color:#3C200F">DogHub箱根仙石原</a></p>` +
      `</body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
