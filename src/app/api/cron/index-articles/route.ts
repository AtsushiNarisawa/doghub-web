import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getArticles } from "@/lib/cms";
import nodemailer from "nodemailer";

// 過去24時間以内に Google Doc が更新された記事の URL を Google Indexing API に
// 通知する。Vercel Cron で毎朝 11:00 JST に実行。

const SITE_URL = "https://dog-hub.shop";

// Indexing API 用 OAuth2 クライアント
function getIndexingAuth() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({
    refresh_token: process.env.GSC_INDEXING_REFRESH_TOKEN,
  });
  return auth;
}

// Drive API で Doc の最終更新時刻を取得
async function getDocModifiedTime(docId: string): Promise<Date | null> {
  const driveAuth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  driveAuth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  const drive = google.drive({ version: "v3", auth: driveAuth });
  try {
    const res = await drive.files.get({
      fileId: docId,
      fields: "modifiedTime",
    });
    return res.data.modifiedTime ? new Date(res.data.modifiedTime) : null;
  } catch (e) {
    console.error(`[index-articles] Failed to fetch modifiedTime for ${docId}:`, (e as Error).message);
    return null;
  }
}

// Google Indexing API に URL を通知
async function notifyIndexing(url: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const auth = getIndexingAuth();
    const indexing = google.indexing({ version: "v3", auth });
    await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type: "URL_UPDATED",
      },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message?.slice(0, 200) };
  }
}

// 失敗時のメール通知
async function sendFailureEmail(failures: { url: string; error: string }[]) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return;
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const body = `インデックス申請の自動化で ${failures.length} 件の失敗が発生しました。\n\n` +
    failures.map((f) => `❌ ${f.url}\n   ${f.error}`).join("\n\n") +
    `\n\nVercelログでも確認できます。`;

  try {
    await transporter.sendMail({
      from: `"DogHub Cron" <${process.env.GMAIL_USER}>`,
      to: "narisawa@dog-hub.shop",
      subject: `【DogHub】インデックス申請失敗通知（${failures.length}件）`,
      text: body,
    });
  } catch (e) {
    console.error("[index-articles] Failed to send notification email:", (e as Error).message);
  }
}

export async function GET(req: NextRequest) {
  // Vercel Cron 認証
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 全記事取得
  const articles = await getArticles();
  if (articles.length === 0) {
    return NextResponse.json({ message: "No articles found", submitted: 0 });
  }

  // 24時間前
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // 過去24時間に更新された記事を抽出
  const recentArticles: { slug: string; title: string }[] = [];
  for (const article of articles) {
    if (!article.docId) continue;
    const modifiedTime = await getDocModifiedTime(article.docId);
    if (modifiedTime && modifiedTime >= cutoff) {
      recentArticles.push({ slug: article.slug, title: article.title });
    }
  }

  if (recentArticles.length === 0) {
    return NextResponse.json({
      message: "No recently updated articles",
      checked: articles.length,
      submitted: 0,
    });
  }

  // インデックス申請
  const results: { url: string; ok: boolean; error?: string }[] = [];
  for (const a of recentArticles) {
    const url = `${SITE_URL}/news/${a.slug}`;
    const result = await notifyIndexing(url);
    results.push({ url, ...result });
    console.log(`[index-articles] ${result.ok ? "✅" : "❌"} ${url}${result.error ? ` - ${result.error}` : ""}`);
  }

  const succeeded = results.filter((r) => r.ok).length;
  const failures = results.filter((r) => !r.ok).map((r) => ({ url: r.url, error: r.error || "unknown" }));

  // 失敗があればメール通知
  if (failures.length > 0) {
    await sendFailureEmail(failures);
  }

  return NextResponse.json({
    message: `Indexing submitted: ${succeeded}/${recentArticles.length}`,
    checked: articles.length,
    recent: recentArticles.length,
    succeeded,
    failed: failures.length,
    results,
  });
}
