import { google } from "googleapis";

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const sheets = google.sheets({ version: "v4", auth });
const drive = google.drive({ version: "v3", auth });

const SPREADSHEET_ID = process.env.CMS_SPREADSHEET_ID!;

// 記事に挿入する画像マッピング（slug → 見出しキーワード → 画像パス）
// ※ Google Docsテンプレートの既存画像(img-046,038,074,013)と被らないこと
const ARTICLE_IMAGES: Record<string, { keyword: string; images: string[] }[]> = {
  "spring-walk-guide": [
    { keyword: "お散歩コース", images: ["/images/img-006.jpg", "/images/img-011.jpg"] },
    { keyword: "カフェ", images: ["/images/img-042.jpg"] },
  ],
  "hakone-dog-trip-guide": [
    { keyword: "犬と一緒に行けるスポット", images: ["/images/img-008.jpg", "/images/img-011.jpg"] },
    { keyword: "持ち物", images: ["/images/img-037.jpg"] },
  ],
  "hakone-pet-hotel-comparison": [
    { keyword: "預かり環境", images: ["/images/img-041.jpg", "/images/img-037.jpg"] },
    { keyword: "運動できる環境", images: ["/images/img-022.jpg"] },
  ],
  "hakone-golf-pet-guide": [
    { keyword: "早朝7時", images: ["/images/img-003.jpg"] },
    { keyword: "ゴルフ帰り", images: ["/images/img-036.jpg"] },
  ],
  "hakone-yunessun-pet-guide": [
    { keyword: "車で約10分", images: ["/images/img-041.jpg"] },
    { keyword: "荷物は預かって", images: ["/images/img-029.jpg"] },
  ],
  "hakone-dog-friendly-hotels": [
    { keyword: "ペット不可の宿に泊まりたい", images: ["/images/img-035.png", "/images/img-041.jpg"] },
  ],
  "hakone-museum-dog-guide": [
    { keyword: "ペットホテルを活用", images: ["/images/img-041.jpg"] },
  ],
  "hakone-dog-hotel-guide": [
    { keyword: "ペットホテル専門施設", images: ["/images/img-041.jpg", "/images/img-035.png"] },
    { keyword: "犬のホテルを選ぶ5つのポイント", images: ["/images/img-037.jpg"] },
    { keyword: "犬のホテル活用モデルコース", images: ["/images/img-028.png"] },
  ],
  "hakone-dog-lunch-guide": [
    { keyword: "OMUSUBI & SOUP CAFE", images: ["/images/img-063.webp", "/images/img-045.jpg"] },
    { keyword: "犬連れランチで気をつけたい", images: ["/images/img-042.jpg"] },
  ],
  "hakone-dog-travel-model-course": [
    { keyword: "犬OKのスポットと犬NGのスポット", images: ["/images/img-008.jpg"] },
    { keyword: "コースB", images: ["/images/img-006.jpg"] },
    { keyword: "コースE", images: ["/images/img-035.png"] },
  ],
  "hakone-dog-rainy-day": [
    { keyword: "屋根付きドッグラン", images: ["/images/img-022.jpg"] },
    { keyword: "美術館めぐり", images: ["/images/img-006.jpg"] },
  ],
  "hakone-pet-hotel-area-guide": [
    { keyword: "DogHubのある仙石原エリア", images: ["/images/img-041.jpg"] },
  ],
  "hakone-ashinoko-dog-guide": [
    { keyword: "湖畔の散歩", images: ["/images/img-008.jpg"] },
  ],
  "hakone-dog-cafe-guide": [
    { keyword: "OMUSUBI & SOUP CAFE", images: ["/images/img-063.webp", "/images/img-045.jpg"] },
  ],
  "hakone-owakudani-dog-guide": [
    { keyword: "犬を預けて大涌谷", images: ["/images/img-041.jpg"] },
  ],
  "hakone-dog-spot-sengokuhara": [
    { keyword: "すすき草原", images: ["/images/img-008.jpg", "/images/img-011.jpg"] },
    { keyword: "DogHub箱根仙石原", images: ["/images/img-041.jpg"] },
  ],
  "pet-hotel-first-time-tips": [
    { keyword: "預かり環境を確認する", images: ["/images/img-035.png", "/images/img-041.jpg"] },
    { keyword: "当日の流れ", images: ["/images/img-037.jpg"] },
  ],
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&rarr;/g, "→")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
    .replace(/&yen;/g, "¥");
}

function enhanceArticleHtml(html: string, slug?: string): string {
  // Google Docsの空spanやstyle属性を除去
  html = html.replace(/\sstyle="[^"]*"/gi, "");
  html = html.replace(/<span>([\s\S]*?)<\/span>/gi, "$1");

  // HTMLエンティティの矢印を統一
  html = html.replace(/&rarr;/g, "→");

  // h2にidを付与（目次リンク用）
  let headingIndex = 0;
  const headings: { id: string; text: string }[] = [];
  html = html.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_match, content) => {
    const text = decodeHtmlEntities(content.replace(/<[^>]+>/g, "")).trim();
    const id = `section-${headingIndex++}`;
    headings.push({ id, text });
    return `<h2 id="${id}">${text}</h2>`;
  });

  // h3もクリーンアップ
  html = html.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_match, content) => {
    const text = decodeHtmlEntities(content.replace(/<[^>]+>/g, "")).trim();
    return `<h3>${text}</h3>`;
  });

  // pタグの中身もエンティティをデコード
  html = html.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_match, content) => {
    const decoded = decodeHtmlEntities(content);
    return `<p>${decoded}</p>`;
  });

  // liタグの中身もデコード
  html = html.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match, content) => {
    const decoded = decodeHtmlEntities(content);
    return `<li>${decoded}</li>`;
  });

  // モデルコース（時間→の形式）をタイムライン風に変換
  html = html.replace(
    /<p>((?:\d{1,2}:\d{2}\s.+?→\s*)+.+?)<\/p>/gi,
    (_match, content) => {
      const text = content.replace(/<[^>]+>/g, "");
      const steps = text.split(/\s*→\s*/).filter(Boolean);
      const stepsHtml = steps.map((step: string) => {
        const timeMatch = step.match(/^(\d{1,2}:\d{2})\s*(.*)/);
        if (timeMatch) {
          return `<div class="model-course-step"><span class="time">${timeMatch[1]}</span>${timeMatch[2]}</div>`;
        }
        return `<div class="model-course-step">${step}</div>`;
      }).join("");
      return `<div class="model-course">${stepsHtml}</div>`;
    }
  );

  // 料金情報をインフォボックスに変換（¥を含む短い段落）
  html = html.replace(
    /<p>((?:(?!<\/p>)[\s\S])*?(?:¥[\d,]+)(?:(?!<\/p>)[\s\S])*?)<\/p>/gi,
    (_match, content) => {
      const text = content.replace(/<[^>]+>/g, "").trim();
      // 長い段落は変換しない（100文字以下のみ）
      if (text.length > 100) return `<p>${content}</p>`;
      return `<div class="info-box">${content}</div>`;
    }
  );

  // slug別の画像挿入
  if (slug && ARTICLE_IMAGES[slug]) {
    for (const mapping of ARTICLE_IMAGES[slug]) {
      const idx = html.indexOf(mapping.keyword);
      if (idx === -1) continue;
      // キーワードを含む見出しまたは段落の後に画像を挿入
      const afterH2 = html.indexOf("</h2>", idx);
      const afterP = html.indexOf("</p>", idx);
      let afterTag = -1;
      if (afterH2 !== -1 && afterH2 - idx < 200) {
        afterTag = afterH2 + 5;
      } else if (afterP !== -1) {
        afterTag = afterP + 4;
      }
      if (afterTag === -1) continue;

      const imgsHtml = mapping.images.length === 1
        ? `<img src="${mapping.images[0]}" alt="" class="article-single-img" />`
        : `<div class="article-images">${mapping.images.map(src => `<img src="${src}" alt="" />`).join("")}</div>`;

      html = html.slice(0, afterTag) + imgsHtml + html.slice(afterTag);
    }
  }

  // 目次を生成（h2が2つ以上ある場合のみ）
  let toc = "";
  if (headings.length >= 2) {
    const tocItems = headings.map(h => `<li><a href="#${h.id}">${h.text}</a></li>`).join("");
    toc = `<nav class="article-toc"><div class="article-toc-title">この記事の内容</div><ol>${tocItems}</ol></nav>`;
  }

  return toc + html;
}


export interface NewsItem {
  date: string;
  category: string;
  title: string;
  href: string | null;
}

export async function getNewsItems(): Promise<NewsItem[]> {
  if (!SPREADSHEET_ID) return [];
  let res;
  try {
    res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "お知らせ!A2:D50",
    });
  } catch {
    return [];
  }

  const rows = res.data.values;
  if (!rows || rows.length === 0) return [];

  return rows
    .filter((row) => row[0] && row[2])
    .map((row) => ({
      date: row[0] || "",
      category: row[1] || "お知らせ",
      title: row[2] || "",
      href: row[3] ? row[3] : null,
    }));
}

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
  if (!SPREADSHEET_ID) return [];
  let res;
  try {
    res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "記事一覧!A2:G100",
    });
  } catch {
    return [];
  }

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

  // 記事HTMLを読みやすく後処理
  html = enhanceArticleHtml(html, slug);

  return { article, html };
}
