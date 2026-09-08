import { NextRequest, NextResponse } from "next/server";
import { fdb } from "@/lib/fragrance/db";
import { verifyAdmin, actorLabel } from "@/lib/admin-auth";

// 試香された方の記録。
//
// 🔴 これが主KPI「試香→購入 15%」の分母になる。
//    メールを書いてくださった方だけを数えると分母が小さくなり、購入率が実態より高く出る。
//    そのため「試した人数（正の字）」と「お声かけした人数」を毎日1行で入れる。
//
// 使い方
//   ・count  … 閉店時に、紙の正の字を転記する
//   ・signup … メールを書いてくださった方を1人ずつ登録する（あとで先行案内を送る宛先になる）

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const days = Math.min(Number(req.nextUrl.searchParams.get("days") || 60), 365);
  const since = new Date(Date.now() - days * 86400_000).toISOString().slice(0, 10);

  const [{ data: counts }, { data: signups }] = await Promise.all([
    fdb
      .from("fragrance_tester_counts")
      .select("date, tried_count, asked_count, actor, note")
      .gte("date", since)
      .order("date", { ascending: false }),
    fdb
      .from("fragrance_waitlist")
      .select("email, name, kind, source, created_at, opted_out_at")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const tried = (counts || []).reduce((s, r) => s + (r.tried_count || 0), 0);
  const asked = (counts || []).reduce((s, r) => s + (r.asked_count || 0), 0);

  return NextResponse.json({
    ok: true,
    totals: { tried, asked },
    counts: counts || [],
    signups: signups || [],
  });
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const action = String(body.action || "count");

    // ── 閉店時の転記（同じ日を入れ直したら上書き） ──
    if (action === "count") {
      const date = String(body.date || "").slice(0, 10);
      const tried = Number(body.tried_count ?? 0);
      const asked = Number(body.asked_count ?? 0);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || tried < 0 || asked < 0) {
        return NextResponse.json({ error: "bad_request" }, { status: 400 });
      }
      const { error } = await fdb.from("fragrance_tester_counts").upsert(
        {
          date,
          tried_count: tried,
          asked_count: asked,
          actor: actorLabel(admin),
          note: String(body.note || "").slice(0, 200) || null,
        },
        { onConflict: "date" },
      );
      if (error) {
        return NextResponse.json({ error: "upsert_failed", detail: error.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    // ── 試香された方・店頭で買われた方の登録 ──
    if (action === "signup") {
      const email = String(body.email || "").trim().toLowerCase();
      const kind = ["tester", "buyer_store", "launch"].includes(body.kind) ? body.kind : "tester";
      if (!EMAIL_RE.test(email) || email.length > 254) {
        return NextResponse.json({ error: "invalid_email" }, { status: 400 });
      }
      const { error } = await fdb.from("fragrance_waitlist").insert({
        email,
        kind,
        name: String(body.name || "").slice(0, 60) || null,
        source: String(body.source || "store").slice(0, 60),
      });
      if (error) {
        // 23505＝同じ人が既に同じ種別で登録済み。二重登録は成功扱いにする
        if (error.code === "23505") return NextResponse.json({ ok: true, already: true });
        return NextResponse.json({ error: "insert_failed", detail: error.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  } catch (e) {
    console.error("admin fragrance tester error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
