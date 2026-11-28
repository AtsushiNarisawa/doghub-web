import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminBearer, actorLabel } from "@/lib/admin-auth";
import { MEMORIES_BUCKET, MEMORIES_SIGNED_URL_TTL } from "@/lib/memories";

// 管理画面の設定「記念動画の景色」（2段目-B・2026-11-28 S88）。
// 景色（縦の写真か動画）＋文字＋使う月（1〜12）＋使う／止める を CEO が登録する。
// 🔴 景色の文字は「いまの箱根」の一般的な話（お客様がそこへ行ったとは書かない）。季節外れの文字を出さないよう月で絞る。
// GET                          一覧（確認用の署名つきリンク付き）
// POST   { action: "sign", kind }                         置き場への送り先を発行
// POST   { action: "register", kind, path, caption, months } 送り終えた景色を登録
// PATCH  { id, caption?, months?, active? }               文字・月・使う／止める を変える
// DELETE { id }                                           ファイルと登録を消す
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const unauthorized = () =>
  NextResponse.json({ error: "ログインの有効期限が切れました。ログインし直してください。" }, { status: 401 });

type Kind = "video" | "photo";
const isKind = (k: unknown): k is Kind => k === "video" || k === "photo";
const PATH_RE = /^scenes\/scene-\d+-[0-9a-f-]{36}\.(mp4|jpg)$/;

function cleanCaption(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const lines = v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0 || lines.length > 2 || lines.some((l) => l.length > 20)) return null;
  return lines.join("\n");
}

function cleanMonths(v: unknown): number[] | null {
  if (!Array.isArray(v)) return null;
  const ms = [...new Set(v.map(Number))].filter((m) => Number.isInteger(m) && m >= 1 && m <= 12).sort((a, b) => a - b);
  return ms;
}

export async function GET(req: NextRequest) {
  if (!(await verifyAdminBearer(req))) return unauthorized();
  const { data, error } = await supabase
    .from("memorial_scenes")
    .select("id, kind, storage_path, caption, months, active, created_at")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("memorial_scenes list error:", error.message);
    return NextResponse.json({ error: "一覧の取得に失敗しました（表がまだ無い可能性があります）" }, { status: 500 });
  }
  const paths = (data || []).map((s) => s.storage_path);
  const signed = paths.length
    ? (await supabase.storage.from(MEMORIES_BUCKET).createSignedUrls(paths, MEMORIES_SIGNED_URL_TTL)).data || []
    : [];
  const urlOf = new Map(signed.map((s) => [s.path, s.signedUrl]));
  return NextResponse.json({ scenes: (data || []).map((s) => ({ ...s, url: urlOf.get(s.storage_path) || null })) });
}

export async function POST(req: NextRequest) {
  const identity = await verifyAdminBearer(req);
  if (!identity) return unauthorized();
  try {
    const body = await req.json();
    const { action, kind } = body || {};
    if (!isKind(kind)) return NextResponse.json({ error: "種類が必要です" }, { status: 400 });

    if (action === "sign") {
      const path = `scenes/scene-${Date.now()}-${crypto.randomUUID()}.${kind === "video" ? "mp4" : "jpg"}`;
      const { data, error } = await supabase.storage.from(MEMORIES_BUCKET).createSignedUploadUrl(path);
      if (error || !data) return NextResponse.json({ error: "送り先の準備に失敗しました" }, { status: 500 });
      return NextResponse.json({ path: data.path, token: data.token });
    }

    if (action === "register") {
      const { path } = body;
      const caption = cleanCaption(body.caption);
      const months = cleanMonths(body.months);
      if (typeof path !== "string" || !PATH_RE.test(path) || !path.endsWith(kind === "video" ? ".mp4" : ".jpg")) {
        return NextResponse.json({ error: "ファイルの場所が正しくありません" }, { status: 400 });
      }
      if (!caption) return NextResponse.json({ error: "文字は1〜2行・1行20文字までで入れてください" }, { status: 400 });
      if (!months || months.length === 0) return NextResponse.json({ error: "使う月を1つ以上選んでください" }, { status: 400 });
      const name = path.split("/")[1];
      const { data: found } = await supabase.storage.from(MEMORIES_BUCKET).list("scenes", { search: name });
      if (!found?.some((f) => f.name === name)) {
        return NextResponse.json({ error: "ファイルが届いていません。もう一度お試しください" }, { status: 400 });
      }
      const { data: row, error } = await supabase
        .from("memorial_scenes")
        .insert({ kind, storage_path: path, caption, months, active: true, created_by: actorLabel(identity) })
        .select("id")
        .single();
      if (error) {
        console.error("memorial_scenes insert error:", error.message);
        return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
      }
      return NextResponse.json({ id: row.id });
    }
    return NextResponse.json({ error: "不明な操作です" }, { status: 400 });
  } catch (e) {
    console.error("memorial_scenes POST error:", e);
    return NextResponse.json({ error: "処理に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdminBearer(req))) return unauthorized();
  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
    const update: Record<string, unknown> = {};
    if ("caption" in body) {
      const c = cleanCaption(body.caption);
      if (!c) return NextResponse.json({ error: "文字は1〜2行・1行20文字までで入れてください" }, { status: 400 });
      update.caption = c;
    }
    if ("months" in body) {
      const m = cleanMonths(body.months);
      if (!m || m.length === 0) return NextResponse.json({ error: "使う月を1つ以上選んでください" }, { status: 400 });
      update.months = m;
    }
    if ("active" in body) update.active = body.active === true;
    if (Object.keys(update).length === 0) return NextResponse.json({ error: "変更がありません" }, { status: 400 });
    const { error } = await supabase.from("memorial_scenes").update(update).eq("id", body.id);
    if (error) return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdminBearer(req))) return unauthorized();
  try {
    const { id } = await req.json();
    const { data: s } = await supabase.from("memorial_scenes").select("id, storage_path").eq("id", id).single();
    if (!s) return NextResponse.json({ error: "見つかりません" }, { status: 404 });
    const { error: rmError } = await supabase.storage.from(MEMORIES_BUCKET).remove([s.storage_path]);
    if (rmError) return NextResponse.json({ error: "ファイルの削除に失敗しました" }, { status: 500 });
    await supabase.from("memorial_scenes").delete().eq("id", id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
