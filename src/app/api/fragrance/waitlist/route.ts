import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Fragrance 発売前ウェイトリスト登録。
// anon からのテーブル直書きは RLS で全面拒否し、この API（service_role）だけを書込経路にする。
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // honeypot: 人間には見えないフィールドが埋まっていたら bot とみなし、成功を装って捨てる
    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    const clip = (v: unknown) => (typeof v === "string" && v ? v.slice(0, 200) : null);

    const { error } = await supabase.from("fragrance_waitlist").insert({
      email,
      utm_source: clip(body.utm_source),
      utm_medium: clip(body.utm_medium),
      utm_campaign: clip(body.utm_campaign),
      referrer: clip(body.referrer),
    });

    if (error) {
      // 23505 = unique violation（登録済み）。登録済みも「受付済み」として同じ顔を返す
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, already: true });
      }
      console.error("fragrance waitlist insert error:", error);
      return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("fragrance waitlist error:", e);
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
}
