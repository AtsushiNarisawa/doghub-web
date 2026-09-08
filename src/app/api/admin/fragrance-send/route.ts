import { NextRequest, NextResponse } from "next/server";
import { fdb } from "@/lib/fragrance/db";
import { createBulkTransport, type MailTransport } from "@/lib/email";
import { SELLER } from "@/lib/fragrance-email";

// Fragrance の一斉配信。
//
// 送り方は既存のリピートエンジン（api/admin/marketing-send）と同じ型にそろえてある：
//   ・専用のトランスポートを作り、最後に必ず閉じる（共有のものを使うと接続が壊れて他のメールが固まる）
//   ・100通ずつ・250ミリ秒あけて送る（Gmail の連続ログイン制限を避ける）
//   ・送る前に「送った」と記録してから送る（同じ人に二度送らないため）
//
// 🔴 実際に送るのは CEO の承認後。既定は下見（dryRun）で、件数と宛先のサンプルしか返さない。
// 🔴 完売しているときに「買えます」という案内を943人に送ってしまわないよう、
//    発売案内は送信直前に在庫を見て、無ければ「再入荷のお知らせ」の文面に自動で切り替える。
//
// 認証は既存の cron と同じ Bearer 方式（手元から curl でも叩ける）。

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const THROTTLE_MS = 250;
const SEND_TIMEOUT_MS = 30000;

const SEGMENTS = ["pre_all", "priority", "all_launch", "restock", "interim", "f2_buyers"] as const;
type Segment = (typeof SEGMENTS)[number];

type Recipient = {
  email: string;
  name: string | null;
  customer_id: string | null;
  unsub_token: string | null;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`送信タイムアウト ${ms}ms: ${label}`)), ms);
  });
  return Promise.race([p.finally(() => clearTimeout(timer!)), timeout]);
}

function maskEmail(email: string): string {
  const [u, d] = (email || "").split("@");
  if (!d) return "***";
  return `${u.length <= 2 ? u[0] || "*" : u.slice(0, 2)}***@${d}`;
}

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const segment = sp.get("segment") as Segment | null;
  const campaign = sp.get("campaign") || "";
  const limit = Math.min(Number(sp.get("limit") || 100), 200);
  const dryRun = sp.get("dryRun") === "1";
  const testTo = sp.get("testTo");

  if (!segment || !SEGMENTS.includes(segment)) {
    return NextResponse.json({ error: "bad_segment", allowed: SEGMENTS }, { status: 400 });
  }
  if (!campaign) {
    return NextResponse.json({ error: "campaign_required" }, { status: 400 });
  }

  // 発売案内のときは在庫を見て文面を切り替える
  const soldOut = await isSoldOut();
  const template = pickTemplate(segment, soldOut);

  // 宛先を取る（このキャンペーンで送信済みの人は関数側で除外される）
  const excludeParam = sp.get("exclude");
  const { data: recipients, error } = await fdb.rpc("get_fragrance_recipients", {
    p_segment: segment,
    p_campaign_key: campaign,
    p_limit: limit,
    p_exclude_campaigns: excludeParam ? excludeParam.split(",").map((s) => s.trim()) : null,
  });

  if (error) {
    console.error("fragrance-send: recipients failed", error);
    return NextResponse.json({ error: "recipients_failed", detail: error.message }, { status: 500 });
  }

  const list = (recipients || []) as Recipient[];

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      segment,
      campaign,
      template: template.name,
      sold_out: soldOut,
      count: list.length,
      sample: list.slice(0, 5).map((r) => maskEmail(r.email)),
    });
  }

  const transport = createBulkTransport();
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    // 自分宛の確認送信（1通だけ・記録もしない）
    if (testTo) {
      const body = template.build({ email: testTo, name: "テスト", unsub_token: null });
      await withTimeout(sendOne(transport, testTo, body.subject, body.text), SEND_TIMEOUT_MS, testTo);
      return NextResponse.json({ ok: true, test: true, to: maskEmail(testTo), subject: body.subject });
    }

    for (const r of list) {
      // 先に「送る」と記録して席を取る。落ちても二重送信にならない
      const { error: claimErr } = await fdb.from("fragrance_email_log").insert({
        email: r.email,
        campaign_key: campaign,
        customer_id: r.customer_id,
        subject: template.subjectFor(soldOut),
        status: "sending",
      });
      if (claimErr) continue; // 23505＝他の便が既に取った

      try {
        const body = template.build(r);
        await withTimeout(sendOne(transport, r.email, body.subject, body.text), SEND_TIMEOUT_MS, r.email);
        await fdb
          .from("fragrance_email_log")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("email", r.email)
          .eq("campaign_key", campaign);
        sent++;
      } catch (e) {
        failed++;
        errors.push(`${maskEmail(r.email)}: ${String(e).slice(0, 120)}`);
        await fdb
          .from("fragrance_email_log")
          .update({ status: "failed", error: String(e).slice(0, 300) })
          .eq("email", r.email)
          .eq("campaign_key", campaign);
      }
      await sleep(THROTTLE_MS);
    }
  } finally {
    try {
      transport.close();
    } catch {
      // 解放できなくても関数終了時に片付く
    }
  }

  return NextResponse.json({
    ok: true,
    segment,
    campaign,
    template: template.name,
    sold_out: soldOut,
    sent,
    failed,
    errors: errors.slice(0, 10),
  });
}

async function sendOne(transport: MailTransport, to: string, subject: string, text: string) {
  const name = SELLER.legalName ? `${SELLER.displayName}（${SELLER.legalName}）` : SELLER.displayName;
  await transport.sendMail({
    from: `"${name}" <${SELLER.from}>`,
    replyTo: SELLER.email,
    to,
    subject,
    text,
  });
}

/** オンライン分が売り切れているか（発売案内の文面を切り替えるため）。 */
async function isSoldOut(): Promise<boolean> {
  const { data } = await fdb
    .from("fragrance_lot_availability")
    .select("ec_available, status, is_paused")
    .eq("status", "on_sale");
  const rows = (data || []) as { ec_available: number; is_paused: boolean }[];
  if (!rows.length) return true;
  return rows.every((r) => r.is_paused || Number(r.ec_available) <= 0);
}

// ── 文面 ───────────────────────────────────────────────────
// 🔴 広告のメールなので、送信者の名称・住所と配信停止の方法を必ず入れる（特定電子メール法）。
// 🔴 残数や「残りわずか」は書かない。急かす言い方はブランドを損なう。

const SITE = "https://dog-hub.shop/fragrance";

function footer(r: { unsub_token: string | null }): string {
  const stop = r.unsub_token
    ? `${SITE.replace("/fragrance", "")}/api/fragrance/unsubscribe?token=${r.unsub_token}`
    : `${SELLER.email} 宛にご返信ください`;
  return (
    `\n\n──\n` +
    `${SELLER.legalName ? `${SELLER.displayName}（${SELLER.legalName}）` : SELLER.displayName}\n` +
    `${SELLER.address}\n電話 ${SELLER.tel}\n\n` +
    `配信の停止：${stop}\n`
  );
}

function greet(name: string | null): string {
  return name ? `${name} 様\n\n` : "";
}

type Template = {
  name: string;
  subjectFor: (soldOut: boolean) => string;
  build: (r: { email: string; name: string | null; unsub_token: string | null }) => {
    subject: string;
    text: string;
  };
};

function pickTemplate(segment: Segment, soldOut: boolean): Template {
  // 発売の案内なのに完売している場合は、再入荷のお知らせに切り替える
  if ((segment === "priority" || segment === "all_launch") && soldOut) {
    return TEMPLATES.restock;
  }
  if (segment === "priority" || segment === "all_launch") return TEMPLATES.launch;
  if (segment === "restock") return TEMPLATES.restock;
  if (segment === "interim") return TEMPLATES.interim;
  return TEMPLATES.prelaunch;
}

const TEMPLATES: Record<string, Template> = {
  prelaunch: {
    name: "prelaunch",
    subjectFor: () => "犬と暮らす手のための、ハンドクリームをつくっています",
    build: (r) => ({
      subject: "犬と暮らす手のための、ハンドクリームをつくっています",
      text:
        greet(r.name) +
        `DogHub が、ハンドクリームをつくっています。\n\n` +
        `その手は、いつも犬にふれています。\n` +
        `だから、犬に有害とされる精油は、はじめから候補に入れていません。\n` +
        `入れられるものだけで、香りを立てました。\n\n` +
        `朝、犬と歩く道の木漏れ日のような香りです。\n` +
        `散歩のあと、手を洗ったら、どうぞ。\n\n` +
        `初回は、110本だけです。\n` +
        `できあがりましたら、あらためてお知らせします。\n\n` +
        `${SITE}\n` +
        `―― 箱根仙石原の、犬の宿から。` +
        footer(r),
    }),
  },
  launch: {
    name: "launch",
    subjectFor: () => "その手で、犬にふれるから。― ハンドクリームができました",
    build: (r) => ({
      subject: "その手で、犬にふれるから。― ハンドクリームができました",
      text:
        greet(r.name) +
        `お待たせしました。ハンドクリームができあがりました。\n\n` +
        `その手は、いつも犬にふれています。\n` +
        `だから、犬に有害とされる精油は、はじめから候補に入れていません。\n` +
        `入れられるものだけで、香りを立てました。\n\n` +
        `散歩のあと、手を洗ったら。\n\n` +
        `ご購入はこちらから：\n${SITE}\n\n` +
        `店頭でのお受け取りもお選びいただけます（送料はかかりません）。\n` +
        `次にご来店いただいたときに、受付でお渡しします。\n\n` +
        `―― 箱根仙石原の、犬の宿から。` +
        footer(r),
    }),
  },
  restock: {
    name: "restock",
    subjectFor: (soldOut) => (soldOut ? "またご用意ができましたら、お知らせします" : "戻ってきました"),
    build: (r) => ({
      subject: "戻ってきました",
      text:
        greet(r.name) +
        `お待たせしました。ハンドクリームのご用意ができました。\n\n` +
        `散歩のあと、手を洗ったら。\n\n` +
        `ご購入はこちらから：\n${SITE}\n\n` +
        `―― 箱根仙石原の、犬の宿から。` +
        footer(r),
    }),
  },
  interim: {
    name: "interim",
    subjectFor: () => "次のロットのこと",
    build: (r) => ({
      subject: "次のロットのこと",
      text:
        greet(r.name) +
        `ハンドクリームのご案内をお待ちいただき、ありがとうございます。\n\n` +
        `次のご用意ができましたら、いちばんにお知らせします。\n` +
        `もうしばらくお待ちください。\n\n` +
        `―― 箱根仙石原の、犬の宿から。` +
        footer(r),
    }),
  },
};
