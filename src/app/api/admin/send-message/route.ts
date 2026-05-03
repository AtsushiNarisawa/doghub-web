import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendCustomMessage } from "@/lib/email";
import { getJstNow } from "@/lib/datetime";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const session = req.cookies.get("doghub-admin-session");
  if (!session || session.value !== "authorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { reservation_id, subject, body } = await req.json();

    if (!reservation_id || !subject?.trim() || !body?.trim()) {
      return NextResponse.json(
        { error: "件名と本文は必須です" },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json({ error: "件名が長すぎます" }, { status: 400 });
    }
    if (body.length > 5000) {
      return NextResponse.json({ error: "本文が長すぎます" }, { status: 400 });
    }

    const { data: res, error: fetchError } = await supabase
      .from("reservations")
      .select(
        "id, plan, date, checkin_time, checkout_date, admin_notes, customers!inner(last_name, first_name, email), reservation_dogs(dogs(name))"
      )
      .eq("id", reservation_id)
      .single();

    if (fetchError || !res) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    const customer = res.customers as unknown as {
      last_name: string;
      first_name: string;
      email: string;
    };
    if (!customer?.email) {
      return NextResponse.json(
        { error: "メールアドレスが登録されていません" },
        { status: 400 }
      );
    }

    const dogNames = ((res.reservation_dogs || []) as unknown as { dogs: { name: string } | null }[])
      .map((rd) => rd.dogs?.name)
      .filter((n): n is string => !!n);

    // メール送信（fire-and-forget回避のため await）
    await sendCustomMessage({
      to: customer.email,
      subject: subject.trim(),
      body: body.trim(),
      customerName: `${customer.last_name} ${customer.first_name || ""}`.trim(),
      reservation: {
        id: res.id,
        plan: res.plan,
        date: res.date,
        checkin_time: res.checkin_time,
        checkout_date: res.checkout_date,
      },
      dogNames,
    });

    // スタッフメモに送信履歴を追記（件名 + 本文を残す）
    const logEntry = [
      `[${getJstNow()} メール送信]`,
      `件名: ${subject.trim()}`,
      `本文:`,
      body.trim(),
    ].join("\n");
    const newAdminNotes = res.admin_notes
      ? `${res.admin_notes}\n${logEntry}`
      : logEntry;

    await supabase
      .from("reservations")
      .update({ admin_notes: newAdminNotes })
      .eq("id", reservation_id);

    return NextResponse.json({ ok: true, sent_to: customer.email });
  } catch (err) {
    console.error("Send message error:", err);
    const message = err instanceof Error ? err.message : "メール送信に失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
