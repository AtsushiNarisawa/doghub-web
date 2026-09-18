import { NextRequest, NextResponse } from "next/server";
import { fdb } from "@/lib/fragrance/db";

// 配信停止（Fragrance の一斉配信メールの「配信の停止」リンクの行き先）。
//
// トークンは3種類あり、どれが来ても「押した本人への以後の配信」を実際に止める：
//   ① fragrance_waitlist.unsub_token         … 通知希望・試香・店頭購入で登録された方
//   ② fragrance_restock_requests.unsub_token … 再入荷待ちの方
//   ③ customers.unsubscribe_token            … 予約のお客様（発売前の告知・発売案内は顧客宛に送る）
//
// ③ は新しい停止フラグを作らず、既存の顧客向け一斉配信（リピートエンジン）と同じ
//    customers.email_opt_out で止める。書き込みも既存の停止ページ /unsubscribe（ボタン1つ）→
//    /api/email/unsubscribe に任せる。GET で即書き込みにしないのは、メールのセキュリティ機能が
//    リンクを先読みしただけで「DogHub からのご案内すべて」が止まってしまうのを避けるため。
//
// 🔴 トークンが見つからないときに「すでに停止しています」と言わない（止まっていないのに安心させてしまう）。
//    「すでに停止しています」は、停止済みの行が実際に見つかったときだけ。
//
// 送信側（api/admin/fragrance-send）は、①②③のどこかで停止・不達になっているアドレスを
// セグメントを問わず宛先から外す（同じ人が別の表にも載っていても届かない）。

export const dynamic = "force-dynamic";

const CONTACT = "お手数ですが info@dog-hub.shop までご連絡ください。";

export async function GET(req: NextRequest) {
  const token = (req.nextUrl.searchParams.get("token") || "").trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    return html("リンクが無効です", CONTACT, 400);
  }

  // ①② Fragrance の登録
  const [waitlist, restock] = await Promise.all([
    fdb.from("fragrance_waitlist").select("id, opted_out_at").eq("unsub_token", token),
    fdb.from("fragrance_restock_requests").select("id, opted_out_at").eq("unsub_token", token),
  ]);
  if (waitlist.error || restock.error) {
    console.error("fragrance unsubscribe: lookup failed", waitlist.error || restock.error);
    return failed();
  }

  const wRows = (waitlist.data || []) as { id: string; opted_out_at: string | null }[];
  const rRows = (restock.data || []) as { id: string; opted_out_at: string | null }[];

  if (wRows.length || rRows.length) {
    const now = new Date().toISOString();
    let stoppedNow = false;

    if (wRows.some((x) => !x.opted_out_at)) {
      const { error } = await fdb
        .from("fragrance_waitlist")
        .update({ opted_out_at: now })
        .eq("unsub_token", token)
        .is("opted_out_at", null);
      if (error) {
        console.error("fragrance unsubscribe: waitlist update failed", error);
        return failed();
      }
      stoppedNow = true;
    }
    if (rRows.some((x) => !x.opted_out_at)) {
      const { error } = await fdb
        .from("fragrance_restock_requests")
        .update({ opted_out_at: now })
        .eq("unsub_token", token)
        .is("opted_out_at", null);
      if (error) {
        console.error("fragrance unsubscribe: restock update failed", error);
        return failed();
      }
      stoppedNow = true;
    }

    return stoppedNow
      ? html("配信を停止しました", "今後、ハンドクリームのご案内はお送りしません。ありがとうございました。")
      : html("配信を停止しています", "こちらのアドレスへのハンドクリームのご案内は、すでに停止しています。");
  }

  // ③ 予約のお客様 → 既存の停止ページ（customers.email_opt_out を立てる正規の経路）へ
  const { data: customer, error: cErr } = await fdb
    .from("customers")
    .select("id")
    .eq("unsubscribe_token", token)
    .maybeSingle();
  if (cErr) {
    console.error("fragrance unsubscribe: customer lookup failed", cErr);
    return failed();
  }
  if (customer) {
    const url = req.nextUrl.clone();
    url.pathname = "/unsubscribe";
    url.search = `?token=${encodeURIComponent(token)}`;
    return NextResponse.redirect(url, 303);
  }

  // どこにも無い＝止められていない。事実どおりに伝える
  return html("リンクが無効です", CONTACT, 404);
}

function failed() {
  return html(
    "手続きができませんでした",
    "時間をおいてもう一度お試しください。" + CONTACT,
    500,
  );
}

function html(title: string, message: string, status = 200) {
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
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
