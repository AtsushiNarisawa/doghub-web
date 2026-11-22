import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminBearer } from "@/lib/admin-auth";
import { PHYSICAL_ROOM_LIMIT } from "@/lib/capacity";
import {
  activeFootprint,
  diffFootprint,
  increasedDates,
  checkoutAddonBlockReason,
  checkoutAddonStaffMessage,
} from "@/lib/booking-rules";
import { applyCapacityDelta } from "@/lib/capacity-server";
import { normalizeCheckinAddonFrom } from "@/types/booking";

// 管理画面から、既存の宿泊予約に「半日・1日」を付ける／外す（2026-11-22 第1段）。
// 電話・LINE で受けた付け外しはスタッフがここで操作する（お客様ご自身の付け外しは第2段）。
//
//   side = "checkout": チェックアウト後の半日・1日。CO日の day_booked に頭数分を数える。
//                      定休日・臨時休業の CO日には付けられない（スタッフも不可・11-22 CEO 決定）。
//                      Web受付停止の日・Web上限15を超える日は、スタッフは付けられる（上限は物理19）。
//   side = "checkin":  チェックイン前の半日・1日。部屋数は動かない（CI日はすでに宿泊で数えている）。
//                      半日は10:00固定、1日は 07:00/08:00/09:00。
//   plan = "4h" | "8h" で付ける（付け替え）、null で外す。
//
// 枠は lib/booking-rules.ts の footprint の差分だけを動かす（半日→1日の付け替えは差分0）。
// お客様への通知はしない（電話・LINE で受けた内容をスタッフが入力する前提）。

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  if (!(await verifyAdminBearer(req))) {
    return NextResponse.json(
      { error: "ログインの有効期限が切れました。ログインし直してください。" },
      { status: 401 },
    );
  }

  try {
    const { reservation_id, side, plan, from } = await req.json();
    if (!reservation_id || (side !== "checkout" && side !== "checkin")) {
      return NextResponse.json({ error: "必須パラメータが不足" }, { status: 400 });
    }
    if (plan !== null && plan !== "4h" && plan !== "8h") {
      return NextResponse.json({ error: "半日（4h）か1日（8h）を指定してください" }, { status: 400 });
    }

    const { data: res } = await supabase
      .from("reservations")
      .select("id, status, plan, date, checkout_date, dog_count, checkout_addon_plan, checkin_addon_plan, checkin_addon_from, checkin_extension_from, checkout_extension_until")
      .eq("id", reservation_id)
      .single();
    if (!res) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }
    if (res.plan !== "stay" || !res.checkout_date) {
      return NextResponse.json({ error: "半日・1日を付けられるのは宿泊の予約だけです" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (side === "checkin") {
      if (plan && res.checkin_extension_from) {
        return NextResponse.json(
          { error: "早預かり（時間）が付いています。先に早預かりを外してください（同じ側では一緒に持てません）" },
          { status: 400 },
        );
      }
      const fromNorm = plan ? normalizeCheckinAddonFrom(plan, from) : null;
      if (plan && !fromNorm) {
        return NextResponse.json({ error: "1日の開始時刻は 7:00／8:00／9:00 から選んでください" }, { status: 400 });
      }
      updates.checkin_addon_plan = plan;
      updates.checkin_addon_from = fromNorm;
      // CI前の半日・1日があるときは到着時刻を 14:00 に揃える（予約APIと同じ・計画書 §1-2）
      if (plan) updates.checkin_time = "14:00";
      // 部屋数は動かない（footprint に CI前は入らない）
      const { error } = await supabase.from("reservations").update(updates).eq("id", reservation_id);
      if (error) {
        console.error("[set-addon] checkin update error:", error);
        return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    // side === "checkout"
    if (plan && res.checkout_extension_until) {
      return NextResponse.json(
        { error: "延長預かり（時間）が付いています。先に延長を外してください（同じ側では一緒に持てません）" },
        { status: 400 },
      );
    }
    const capDelta = diffFootprint(activeFootprint(res), activeFootprint({ ...res, checkout_addon_plan: plan }));

    if (increasedDates(capDelta).length > 0) {
      const { data: coRow } = await supabase
        .from("daily_capacity")
        .select("closed, web_closed, day_booked, stay_booked")
        .eq("date", res.checkout_date)
        .maybeSingle();
      const reason = checkoutAddonBlockReason(res.checkout_date, coRow, {
        isStaff: true,
        addDogs: res.dog_count || 1,
        limit: PHYSICAL_ROOM_LIMIT,
      });
      if (reason) {
        return NextResponse.json({ error: checkoutAddonStaffMessage(reason, res.checkout_date) }, { status: 400 });
      }
    }

    // 枠を先に確保（原子的・上限19）。休業・満室のレースならここで止まり、予約は変わらない。
    if (capDelta.length > 0) {
      const cap = await applyCapacityDelta(supabase, capDelta, PHYSICAL_ROOM_LIMIT);
      if (!cap.ok) {
        const reason = cap.kind === "closed" ? "closed" : "full";
        return NextResponse.json({ error: checkoutAddonStaffMessage(reason, cap.date) }, { status: 400 });
      }
    }

    updates.checkout_addon_plan = plan;
    const { error } = await supabase.from("reservations").update(updates).eq("id", reservation_id);
    if (error) {
      console.error("[set-addon] checkout update error:", error);
      if (capDelta.length > 0) await applyCapacityDelta(supabase, diffFootprint(capDelta, []));
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[set-addon] error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
