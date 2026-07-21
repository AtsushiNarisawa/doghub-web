import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendLineLinkNoticeEmail } from "@/lib/email";

// LINE友だちと顧客レコードの紐付け（LIFF「お客様情報のご登録」から呼ばれる）
//
// 【本人確認は電話番号のみ】（CEO判断・2026-07-21）
// 当初は「電話番号＋わんちゃんのお名前」の2要素で設計したが、
// これは店内部での紐付けが目的であり、入力項目を増やすと登録率が落ちるため電話番号のみとした。
// 電話番号は全顧客が登録済み・重複ゼロのため、これ1つで一意に特定できる。
//
// 【そのうえで残るリスクと、その抑え方】
// 他人の電話番号を入力すれば、その方の顧客情報に自分のLINEを結びつけられてしまう
// （＝以後その方宛の予約通知が自分に届く）。これを次の2点で抑える:
//   ① 紐付け成立時に本人のメールへ通知する ← 身に覚えのない連携に気づける唯一の安全弁
//   ② 既に別のLINEが紐付いている顧客は上書きしない（乗っ取りを止める）

// customers を更新するため service_role が必須（anon へのフォールバックはしない）。
// モジュール評価時に生成するとビルド時に環境変数が無く落ちるため、リクエスト時に生成する。
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { line_id, phone } = await req.json();

    if (!line_id || !phone) {
      return NextResponse.json({ ok: false, reason: "invalid_request" }, { status: 400 });
    }

    const supabase = getSupabase();

    // このLINEアカウントが既に紐付いている場合は、そのまま完了として返す（二重登録の抑止）
    const { data: alreadyLinked } = await supabase
      .from("customers")
      .select("id, last_name, first_name")
      .eq("line_id", line_id)
      .maybeSingle();
    if (alreadyLinked) {
      const name = [alreadyLinked.last_name, alreadyLinked.first_name]
        .filter(Boolean)
        .join(" ")
        .trim();
      return NextResponse.json({ ok: true, customerName: name, reason: "already_linked_self" });
    }

    // 数字のみに正規化。実データの電話番号は893件すべて数字のみで、
    // ハイフンを含む9件は「電話番号なし」を表すプレースホルダー（NO_PHONE_DH-XXXX）のため、
    // 桁数で弾いておけばプレースホルダーに誤って一致することもない。
    const normalizedPhone = String(phone).replace(/^\+81/, "0").replace(/[^0-9]/g, "");
    if (normalizedPhone.length < 10) {
      return NextResponse.json({ ok: false, reason: "not_a_customer" });
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("id, last_name, first_name, email, line_id")
      .eq("phone", normalizedPhone)
      .maybeSingle();

    // 電話番号が見つからない＝まだご利用のない方（＝紐付ける相手がいない。エラーではない）
    if (!customer) {
      return NextResponse.json({ ok: false, reason: "not_a_customer" });
    }

    // 既に別のLINEアカウントが紐付いている顧客は上書きしない（乗っ取り防止）
    if (customer.line_id && customer.line_id !== line_id) {
      return NextResponse.json({ ok: false, reason: "occupied" });
    }

    const { error: updateError } = await supabase
      .from("customers")
      .update({ line_id })
      .eq("id", customer.id);

    if (updateError) {
      console.error("line link update failed:", updateError);
      return NextResponse.json({ ok: false, reason: "update_failed" }, { status: 500 });
    }

    const displayName = [customer.last_name, customer.first_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    // 身に覚えのない連携に本人が気づけるようメールで通知（送信失敗は紐付け自体を妨げない）
    if (customer.email) {
      sendLineLinkNoticeEmail({
        to: customer.email,
        customerName: displayName || "お客様",
      }).catch((e) => console.error("line link notice mail failed:", e));
    }

    return NextResponse.json({ ok: true, customerName: displayName });
  } catch (e) {
    console.error("line link error:", e);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 500 });
  }
}
