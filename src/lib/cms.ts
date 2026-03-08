import { google } from "googleapis";

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const sheets = google.sheets({ version: "v4", auth });
const drive = google.drive({ version: "v3", auth });

const SPREADSHEET_ID = process.env.CMS_SPREADSHEET_ID!;

export interface Article {
  slug: string;
  date: string;
  category: string;
  title: string;
  summary: string;
  thumbnail: string;
  docId: string;
}

export async function getArticles(): Promise<Article[]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "記事一覧!A2:G100",
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row) => row[0])
    .map((row) => ({
      slug: row[0] || "",
      date: row[1] || "",
      category: row[2] || "",
      title: row[3] || "",
      summary: row[4] || "",
      thumbnail: row[5] || "",
      docId: row[6] || "",
    }))
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getArticle(
  slug: string
): Promise<{ article: Article; html: string } | null> {
  const articles = await getArticles();
  const article = articles.find((a) => a.slug === slug);
  if (!article) return null;

  const res = await drive.files.export({
    fileId: article.docId,
    mimeType: "text/html",
  });

  let html = res.data as string;

  // Google Docs HTMLからbody内のコンテンツだけ抽出
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1];
  }

  // Google Docsのインラインスタイルを除去してシンプルにする
  html = html.replace(/<style[\s\S]*?<\/style>/gi, "");

  return { article, html };
}
