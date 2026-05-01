import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    const { keep_dog_id, remove_dog_id } = await req.json();

    if (!keep_dog_id || !remove_dog_id) {
      return NextResponse.json({ error: "keep_dog_id と remove_dog_id が必要です" }, { status: 400 });
    }
    if (keep_dog_id === remove_dog_id) {
      return NextResponse.json({ error: "同じ ID は統合できません" }, { status: 400 });
    }

    // 両方の dogs を取得して同じ顧客に属していることを確認
    const { data: dogs, error: dogsErr } = await supabase
      .from("dogs")
      .select("id, customer_id, name")
      .in("id", [keep_dog_id, remove_dog_id]);

    if (dogsErr) {
      console.error("Merge dogs - fetch error:", dogsErr);
      return NextResponse.json({ error: "犬情報の取得に失敗しました" }, { status: 500 });
    }
    if (!dogs || dogs.length !== 2) {
      return NextResponse.json({ error: "指定された犬が見つかりません" }, { status: 404 });
    }
    const keepDog = dogs.find((d) => d.id === keep_dog_id);
    const removeDog = dogs.find((d) => d.id === remove_dog_id);
    if (!keepDog || !removeDog) {
      return NextResponse.json({ error: "犬情報の照合に失敗しました" }, { status: 500 });
    }
    if (keepDog.customer_id !== removeDog.customer_id) {
      return NextResponse.json({ error: "異なる顧客の犬は統合できません" }, { status: 403 });
    }

    // 同じ予約に両方の犬が紐付いてるケースを先に処理（重複制約回避）
    const { data: keepResvDogs } = await supabase
      .from("reservation_dogs")
      .select("reservation_id")
      .eq("dog_id", keep_dog_id);
    const keepResvIds = new Set((keepResvDogs || []).map((r) => r.reservation_id));

    const { data: removeResvDogs } = await supabase
      .from("reservation_dogs")
      .select("reservation_id")
      .eq("dog_id", remove_dog_id);

    // remove_dog 側の reservation_dogs のうち、keep_dog 側にも同じ予約があれば先に削除
    const conflictResvIds = (removeResvDogs || [])
      .map((r) => r.reservation_id)
      .filter((rid) => keepResvIds.has(rid));

    if (conflictResvIds.length > 0) {
      const { error: delConflictErr } = await supabase
        .from("reservation_dogs")
        .delete()
        .eq("dog_id", remove_dog_id)
        .in("reservation_id", conflictResvIds);
      if (delConflictErr) {
        console.error("Merge dogs - conflict delete error:", delConflictErr);
        return NextResponse.json({ error: "重複行の削除に失敗しました" }, { status: 500 });
      }
    }

    // remove_dog の reservation_dogs を keep_dog に書き換え
    const { data: updated, error: updateErr } = await supabase
      .from("reservation_dogs")
      .update({ dog_id: keep_dog_id })
      .eq("dog_id", remove_dog_id)
      .select("reservation_id");

    if (updateErr) {
      console.error("Merge dogs - update error:", updateErr);
      return NextResponse.json({ error: "予約紐付けの更新に失敗しました" }, { status: 500 });
    }

    // remove_dog レコードを削除
    const { error: deleteErr } = await supabase
      .from("dogs")
      .delete()
      .eq("id", remove_dog_id);

    if (deleteErr) {
      console.error("Merge dogs - delete error:", deleteErr);
      return NextResponse.json({ error: "犬レコードの削除に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      moved_count: updated?.length || 0,
      removed_conflict_count: conflictResvIds.length,
    });
  } catch (e) {
    console.error("Merge dogs API error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
