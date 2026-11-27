import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminBearer, actorLabel } from "@/lib/admin-auth";
import {
  MEMORIES_BUCKET,
  MEMORIES_SIGNED_URL_TTL,
  buildMediaPath,
  isValidMediaPath,
} from "@/lib/memories";

// 管理画面「思い出の動画・写真」（記念ショート動画 1段目・2026-11-28 S84）
// GET    ?reservation_id=…         一覧（確認用の署名つきリンク付き）・動画不要の印・お礼の送信済み
// POST   { action: "sign", … }      スタッフの端末から直接送るための送り先を発行（Vercel の 4.5MB 制限を避ける）
// POST   { action: "register", … }  送り終えたファイルを記録に足す
// DELETE { id }                     ファイルと記録を消す
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const unauthorized = () =>
  NextResponse.json(
    { error: "ログインの有効期限が切れました。ログインし直してください。" },
    { status: 401 }
  );

type Kind = "video" | "photo";
const isKind = (k: unknown): k is Kind => k === "video" || k === "photo";

async function loadReservation(id: string) {
  const { data } = await supabase
    .from("reservations")
    .select("id, customer_id, status, thankyou_sent, customers(memorial_opt_out)")
    .eq("id", id)
    .single();
  return data;
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdminBearer(req))) return unauthorized();
  const reservationId = req.nextUrl.searchParams.get("reservation_id");
  if (!reservationId) return NextResponse.json({ error: "予約IDが必要です" }, { status: 400 });

  const r = await loadReservation(reservationId);
  if (!r) return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });

  const { data: rows, error } = await supabase
    .from("reservation_media")
    .select("id, kind, storage_path, size_bytes, width, height, duration_sec, created_at")
    .eq("reservation_id", reservationId)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "一覧の取得に失敗しました" }, { status: 500 });

  const paths = (rows || []).map((m) => m.storage_path);
  const signed = paths.length
    ? (await supabase.storage.from(MEMORIES_BUCKET).createSignedUrls(paths, MEMORIES_SIGNED_URL_TTL)).data || []
    : [];
  const urlOf = new Map(signed.map((s) => [s.path, s.signedUrl]));

  const customer = r.customers as unknown as { memorial_opt_out: boolean } | null;
  return NextResponse.json({
    media: (rows || []).map((m) => ({ ...m, url: urlOf.get(m.storage_path) || null })),
    memorial_opt_out: customer?.memorial_opt_out === true,
    thankyou_sent: r.thankyou_sent === true,
  });
}

export async function POST(req: NextRequest) {
  const identity = await verifyAdminBearer(req);
  if (!identity) return unauthorized();

  try {
    const body = await req.json();
    const { action, reservation_id, kind } = body || {};
    if (!reservation_id || !isKind(kind)) {
      return NextResponse.json({ error: "予約IDと種類が必要です" }, { status: 400 });
    }
    const r = await loadReservation(reservation_id);
    if (!r) return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    if (r.status === "cancelled") {
      return NextResponse.json({ error: "キャンセル済みの予約には載せられません" }, { status: 400 });
    }

    if (action === "sign") {
      const path = buildMediaPath(reservation_id, kind);
      const { data, error } = await supabase.storage.from(MEMORIES_BUCKET).createSignedUploadUrl(path);
      if (error || !data) {
        console.error("memories sign error:", error);
        return NextResponse.json({ error: "送り先の準備に失敗しました" }, { status: 500 });
      }
      return NextResponse.json({ path: data.path, token: data.token });
    }

    if (action === "register") {
      const { path, size_bytes, width, height, duration_sec } = body;
      if (typeof path !== "string" || !isValidMediaPath(path, reservation_id, kind)) {
        return NextResponse.json({ error: "ファイルの場所が正しくありません" }, { status: 400 });
      }
      // 本当に送り終わっているか（置き場に実物があるか）を確かめてから記録する
      const folder = path.split("/")[0];
      const name = path.split("/")[1];
      const { data: found } = await supabase.storage.from(MEMORIES_BUCKET).list(folder, { search: name });
      if (!found?.some((f) => f.name === name)) {
        return NextResponse.json({ error: "ファイルが届いていません。もう一度お試しください" }, { status: 400 });
      }
      const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
      const { data: row, error } = await supabase
        .from("reservation_media")
        .insert({
          reservation_id,
          customer_id: r.customer_id,
          kind,
          storage_path: path,
          size_bytes: num(size_bytes),
          width: num(width) !== null ? Math.round(width) : null,
          height: num(height) !== null ? Math.round(height) : null,
          duration_sec: num(duration_sec),
          uploaded_by: actorLabel(identity),
        })
        .select("id")
        .single();
      if (error) {
        console.error("memories register error:", error);
        return NextResponse.json({ error: "記録に失敗しました" }, { status: 500 });
      }
      return NextResponse.json({ id: row.id });
    }

    return NextResponse.json({ error: "不明な操作です" }, { status: 400 });
  } catch (e) {
    console.error("memories POST error:", e);
    return NextResponse.json({ error: "処理に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdminBearer(req))) return unauthorized();
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    const { data: m } = await supabase
      .from("reservation_media")
      .select("id, storage_path")
      .eq("id", id)
      .single();
    if (!m) return NextResponse.json({ error: "見つかりません" }, { status: 404 });

    const { error: rmError } = await supabase.storage.from(MEMORIES_BUCKET).remove([m.storage_path]);
    if (rmError) {
      console.error("memories remove error:", rmError);
      return NextResponse.json({ error: "ファイルの削除に失敗しました" }, { status: 500 });
    }
    await supabase.from("reservation_media").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("memories DELETE error:", e);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
