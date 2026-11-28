import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPhoneLast4 } from "@/lib/booking-auth";
import { MEMORIES_BUCKET, MEMORIES_SIGNED_URL_TTL } from "@/lib/memories";

// お客様の受け取りページ用（記念ショート動画 1段目・2026-11-28 S84）。
// id＝お礼のリンクに入っている予約の UUID。本人確認＝電話番号の下4桁（予約の変更・キャンセル画面と同じ型）。
// 確認できたら、そのお客様の全部の回の動画・写真を、1時間だけ有効な署名つきリンクで返す。
// 電話番号・メールなどは返さない（表示に要る最小限だけ）。
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function authorize(id: string, phoneLast4: string | null) {
  if (!phoneLast4) return { error: NextResponse.json({ error: "本人確認が必要です" }, { status: 401 }) };
  const { data } = await supabase
    .from("reservations")
    .select("id, customer_id, customers(last_name, phone, memorial_opt_out)")
    .eq("id", id)
    .single();
  if (!data) return { error: NextResponse.json({ error: "not found" }, { status: 404 }) };
  const c = data.customers as unknown as { last_name: string; phone: string; memorial_opt_out: boolean } | null;
  if (!verifyPhoneLast4(c?.phone, phoneLast4)) {
    return { error: NextResponse.json({ error: "本人確認に失敗しました" }, { status: 403 }) };
  }
  return { reservation: data, customer: c! };
}

function planKind(plan: string): "stay" | "day" {
  return plan === "stay" ? "stay" : "day";
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authorize(id, req.nextUrl.searchParams.get("phone_last4"));
    if ("error" in auth) return auth.error;
    const { reservation, customer } = auth;

    const { data: rows } = await supabase
      .from("reservation_media")
      .select("id, reservation_id, kind, storage_path, width, height, created_at")
      .eq("customer_id", reservation.customer_id)
      .order("created_at", { ascending: true });
    const media = rows || [];
    const reservationIds = [...new Set([id, ...media.map((m) => m.reservation_id)])];

    const { data: resRows } = await supabase
      .from("reservations")
      .select("id, date, checkout_date, plan, reservation_dogs(dogs(name))")
      .in("id", reservationIds);

    const resById = new Map((resRows || []).map((r) => [r.id, r]));

    // 署名つきリンク（見る用・保存用）。保存用はファイル名を付ける
    const signed = await Promise.all(
      media.map(async (m, i) => {
        const r = resById.get(m.reservation_id);
        const ext = m.kind === "photo" ? "jpg" : "mp4";
        const fileName =
          m.kind === "memorial"
            ? `DogHub_${r?.date || "memory"}_memorial.mp4`
            : `DogHub_${r?.date || "memory"}_${i + 1}.${ext}`;
        const store = supabase.storage.from(MEMORIES_BUCKET);
        const [view, dl] = await Promise.all([
          store.createSignedUrl(m.storage_path, MEMORIES_SIGNED_URL_TTL),
          store.createSignedUrl(m.storage_path, MEMORIES_SIGNED_URL_TTL, { download: fileName }),
        ]);
        return {
          id: m.id,
          reservation_id: m.reservation_id,
          kind: m.kind,
          width: m.width,
          height: m.height,
          url: view.data?.signedUrl || null,
          download_url: dl.data?.signedUrl || null,
        };
      })
    );

    // 回ごとにまとめる。開いた回をいちばん上、残りは新しい順
    const groups = reservationIds
      .map((rid) => {
        const r = resById.get(rid);
        if (!r) return null;
        const dogs = ((r.reservation_dogs as unknown as { dogs: { name: string } | null }[]) || [])
          .map((rd) => rd.dogs?.name)
          .filter(Boolean) as string[];
        return {
          reservation_id: rid,
          date: r.date,
          checkout_date: r.checkout_date,
          plan_kind: planKind(r.plan),
          dogs,
          // 記念動画（2段目-B・サーバーで自動で作ったもの）は上に1つ、元の写真・動画は下に
          memorial: signed.filter((s) => s.reservation_id === rid && s.url && s.kind === "memorial").pop() || null,
          media: signed.filter((s) => s.reservation_id === rid && s.url && s.kind !== "memorial"),
        };
      })
      .filter((g): g is NonNullable<typeof g> => !!g && (g.reservation_id === id || g.media.length > 0))
      .sort((a, b) => {
        if (a.reservation_id === id) return -1;
        if (b.reservation_id === id) return 1;
        return (b.date || "").localeCompare(a.date || "");
      });

    return NextResponse.json({
      last_name: customer.last_name,
      memorial_opt_out: customer.memorial_opt_out === true,
      groups,
    });
  } catch (e) {
    console.error("memories lookup error:", e);
    return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  }
}

// 「今後は動画は不要です」（と、その取り消し）
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const auth = await authorize(id, body?.phone_last4 ?? null);
    if ("error" in auth) return auth.error;
    const optOut = body?.action === "opt_out" ? true : body?.action === "opt_in" ? false : null;
    if (optOut === null) return NextResponse.json({ error: "不明な操作です" }, { status: 400 });

    const { error } = await supabase
      .from("customers")
      .update({ memorial_opt_out: optOut })
      .eq("id", auth.reservation.customer_id);
    if (error) return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    return NextResponse.json({ ok: true, memorial_opt_out: optOut });
  } catch (e) {
    console.error("memories opt-out error:", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
