import { google } from "googleapis";

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const sheets = google.sheets({ version: "v4", auth });
const drive = google.drive({ version: "v3", auth });

const SPREADSHEET_ID = process.env.CMS_SPREADSHEET_ID!;

// Wikimedia Commons 画像メタデータ
// 全て商用利用可能なライセンス（CC BY / CC BY-SA / Public Domain）の画像のみ登録
// ファイル詳細ページは https://commons.wikimedia.org/wiki/File:{fileName} で参照可
type WmImage = { url: string; title: string; fileName: string };
const WM: Record<string, WmImage> = {
  // ポーラ美術館
  polaMuseum: {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/51/230908_Pola_Museum_of_Art_Hakone_Japan05s3.jpg",
    title: "ポーラ美術館",
    fileName: "230908_Pola_Museum_of_Art_Hakone_Japan05s3.jpg",
  },
  polaMuseum2: {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/191103_Pola_Museum_of_Art_Hakone_Japan08s3.jpg",
    title: "ポーラ美術館（外観）",
    fileName: "191103_Pola_Museum_of_Art_Hakone_Japan08s3.jpg",
  },
  // 彫刻の森美術館
  chokokuNoMori: {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/51/Hakone_Open_Air_Museum_%286969727342%29.jpg",
    title: "彫刻の森美術館",
    fileName: "Hakone_Open_Air_Museum_(6969727342).jpg",
  },
  chokokuNoMoriPicasso: {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7f/2017_Hakone_Open-Air_Museum_Picasso.jpg",
    title: "彫刻の森美術館 ピカソ館",
    fileName: "2017_Hakone_Open-Air_Museum_Picasso.jpg",
  },
  // 箱根ガラスの森美術館
  glassForest: {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/84/Hakone_Venetian_Glass_Museum_%2845468299462%29.jpg",
    title: "箱根ガラスの森美術館",
    fileName: "Hakone_Venetian_Glass_Museum_(45468299462).jpg",
  },
  glassForestRain: {
    url: "https://upload.wikimedia.org/wikipedia/commons/1/1c/Venetian_Glass_in_rain_%2844605402835%29.jpg",
    title: "箱根ガラスの森美術館（雨のガラス）",
    fileName: "Venetian_Glass_in_rain_(44605402835).jpg",
  },
  // 大涌谷
  owakudani: {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c9/161223_Owakudani_Hakone_Japan02s3.jpg",
    title: "大涌谷",
    fileName: "161223_Owakudani_Hakone_Japan02s3.jpg",
  },
  owakudani2: {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f0/%C5%8Cwakudani%2C_May_31%2C_2018_04.jpg",
    title: "大涌谷の噴気",
    fileName: "Ōwakudani,_May_31,_2018_04.jpg",
  },
  // 芦ノ湖
  ashinokoFuji: {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/LakeAshi_and_MtFuji_Hakone.JPG",
    title: "芦ノ湖と富士山",
    fileName: "LakeAshi_and_MtFuji_Hakone.JPG",
  },
  ashinokoTorii: {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/bb/A_view_of_Lake_Ashi_with_Peace_Torii_gate%2C_Hakone%2C_Japan1.jpg",
    title: "芦ノ湖 平和の鳥居",
    fileName: "A_view_of_Lake_Ashi_with_Peace_Torii_gate,_Hakone,_Japan1.jpg",
  },
  ashinokoShrine: {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Lake_Ashi_%26_Mt_Fuji_%26_Hakone_Shrine.jpg",
    title: "芦ノ湖・富士山・箱根神社",
    fileName: "Lake_Ashi_&_Mt_Fuji_&_Hakone_Shrine.jpg",
  },
  // 箱根神社
  hakoneShrineGate: {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/06/Gate_of_the_Hakone_shrine%2C_facing_the_lake_Ashinoko_-_Flickr_-_odako1.jpg",
    title: "箱根神社の鳥居（芦ノ湖側）",
    fileName: "Gate_of_the_Hakone_shrine,_facing_the_lake_Ashinoko_-_Flickr_-_odako1.jpg",
  },
  hakoneShrineHaiden: {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4f/Hakone_Shrine_Haiden.jpg",
    title: "箱根神社 拝殿",
    fileName: "Hakone_Shrine_Haiden.jpg",
  },
  hakoneShrinePath: {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Hakone_Shrine_path%2C_Hakone%2C_Kanagawa_Prefecture%2C_November_2016.jpg",
    title: "箱根神社 参道",
    fileName: "Hakone_Shrine_path,_Hakone,_Kanagawa_Prefecture,_November_2016.jpg",
  },
  // ロープウェイ・海賊船
  komagatakeRopeway: {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Hakone_Komagatake_Ropeway_2025_July_6_various_09.jpg",
    title: "箱根駒ヶ岳ロープウェイ",
    fileName: "Hakone_Komagatake_Ropeway_2025_July_6_various_09.jpg",
  },
  pirateShip: {
    url: "https://upload.wikimedia.org/wikipedia/commons/6/63/Sightseeing_Cruise_%40_Lake_Ashi_%40_From_Togendai_to_Hakone-Machi_%2810621217225%29.jpg",
    title: "芦ノ湖 箱根海賊船",
    fileName: "Sightseeing_Cruise_@_Lake_Ashi_@_From_Togendai_to_Hakone-Machi_(10621217225).jpg",
  },
  // 強羅公園
  goraParkRose: {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/38/Rose_garden_-_Gora_Park_-_Hakone%2C_Kanagawa%2C_Japan_-_DSC08411.jpg",
    title: "強羅公園 バラ園",
    fileName: "Rose_garden_-_Gora_Park_-_Hakone,_Kanagawa,_Japan_-_DSC08411.jpg",
  },
  goraPark: {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/23/Gora_Park_-_Hakone%2C_Kanagawa%2C_Japan_-_DSC08388.jpg",
    title: "強羅公園",
    fileName: "Gora_Park_-_Hakone,_Kanagawa,_Japan_-_DSC08388.jpg",
  },
  // 仙石原すすき
  sengokuSusuki: {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/41/Hakone_sengokuhara_susuki1.jpg",
    title: "仙石原のすすき草原",
    fileName: "Hakone_sengokuhara_susuki1.jpg",
  },
  sengokuSusuki2: {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/89/Hakone_sengokuhara_susuki2.jpg",
    title: "仙石原のすすき草原（夕景）",
    fileName: "Hakone_sengokuhara_susuki2.jpg",
  },
  // ユネッサン
  yunessun: {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/34/251122_Hakone_Kowakien_Yunessun_Hakone_Japan01s3.jpg",
    title: "箱根小涌園ユネッサン",
    fileName: "251122_Hakone_Kowakien_Yunessun_Hakone_Japan01s3.jpg",
  },
  // 箱根園
  hakoneEn: {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/84/Hakone-en_Zoo_-_Hakone%2C_Japan_-_DSC05664.jpg",
    title: "箱根園",
    fileName: "Hakone-en_Zoo_-_Hakone,_Japan_-_DSC05664.jpg",
  },
  // 箱根湯本
  yumoto: {
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Hakone-Yumoto_station_2024.jpg",
    title: "箱根湯本駅",
    fileName: "Hakone-Yumoto_station_2024.jpg",
  },
  yumotoRiver: {
    url: "https://upload.wikimedia.org/wikipedia/commons/6/6d/River_in_Hakone-Yumoto_2018-07-12.jpg",
    title: "箱根湯本の川",
    fileName: "River_in_Hakone-Yumoto_2018-07-12.jpg",
  },
};

// URL → メタデータの逆引きマップ（クレジット自動生成に使用）
const WM_BY_URL: Record<string, WmImage> = Object.fromEntries(
  Object.values(WM).map((img) => [img.url, img])
);

// 記事に挿入する画像マッピング（slug → 見出しキーワード → 画像URL）
// 観光地・施設画像は Wikimedia Commons、DogHub自社写真は /images/ 配下
const ARTICLE_IMAGES: Record<string, { keyword: string; images: string[] }[]> = {
  "spring-walk-guide": [
    { keyword: "お散歩コース", images: [WM.sengokuSusuki.url, WM.sengokuSusuki2.url] },
    { keyword: "カフェ", images: ["/images/doghub-cafe-counter-mimosa.jpg"] },
  ],
  "hakone-dog-trip-guide": [
    { keyword: "犬と一緒に行けるスポット", images: [WM.ashinokoTorii.url, WM.sengokuSusuki.url] },
    { keyword: "持ち物", images: ["/images/img-037.jpg"] },
  ],
  "hakone-pet-hotel-comparison": [
    { keyword: "預かり環境", images: ["/images/doghub-hotel-room-full-01.jpg", "/images/img-037.jpg"] },
    { keyword: "運動できる環境", images: ["/images/doghub-dogrun-sunset.jpg"] },
  ],
  "hakone-golf-pet-guide": [
    { keyword: "早朝7時", images: ["/images/img-003.jpg"] },
    { keyword: "ゴルフ帰り", images: ["/images/img-036.jpg"] },
  ],
  "hakone-yunessun-pet-guide": [
    { keyword: "車で約10分", images: [WM.yunessun.url] },
    { keyword: "荷物は預かって", images: ["/images/img-029.jpg"] },
  ],
  "hakone-dog-friendly-hotels": [
    { keyword: "ペット不可の宿に泊まりたい", images: ["/images/doghub-hotel-interior-rooms-01.jpg", "/images/dog-poodle-hotel-bed-relax.jpg"] },
  ],
  "hakone-museum-dog-guide": [
    { keyword: "ペットホテルを活用", images: ["/images/dog-pomeranian-white-hotel.jpg"] },
  ],
  "hakone-dog-hotel-guide": [
    { keyword: "ペットホテル専門施設", images: ["/images/doghub-exterior-entrance-02.jpg", "/images/doghub-hotel-room-full-01.jpg"] },
    { keyword: "犬のホテルを選ぶ5つのポイント", images: ["/images/img-037.jpg"] },
    { keyword: "犬のホテル活用モデルコース", images: ["/images/img-028.png"] },
  ],
  "hakone-dog-lunch-guide": [
    { keyword: "OMUSUBI & SOUP CAFE", images: ["/images/img-063.webp", "/images/img-045.jpg"] },
    { keyword: "犬連れランチで気をつけたい", images: ["/images/img-042.jpg"] },
  ],
  "hakone-dog-travel-model-course": [
    { keyword: "犬OKのスポットと犬NGのスポット", images: [WM.chokokuNoMori.url] },
    { keyword: "コースB", images: [WM.sengokuSusuki.url] },
    { keyword: "コースE", images: [WM.ashinokoTorii.url] },
  ],
  "hakone-dog-rainy-day": [
    { keyword: "屋根付きドッグラン", images: ["/images/img-022.jpg"] },
    { keyword: "美術館めぐり", images: [WM.polaMuseum.url] },
  ],
  "hakone-pet-hotel-area-guide": [
    { keyword: "DogHubのある仙石原エリア", images: [WM.sengokuSusuki.url] },
  ],
  "hakone-ashinoko-dog-guide": [
    { keyword: "湖畔の散歩", images: [WM.ashinokoFuji.url, WM.ashinokoTorii.url] },
  ],
  "hakone-dog-cafe-guide": [
    { keyword: "OMUSUBI & SOUP CAFE", images: ["/images/doghub-cafe-counter-mimosa.jpg", "/images/img-045.jpg"] },
  ],
  "hakone-owakudani-dog-guide": [
    { keyword: "犬を預けて大涌谷", images: [WM.owakudani.url, WM.owakudani2.url] },
  ],
  "hakone-dog-spot-sengokuhara": [
    { keyword: "すすき草原", images: [WM.sengokuSusuki.url, WM.sengokuSusuki2.url] },
    { keyword: "DogHub箱根仙石原", images: ["/images/doghub-exterior-flowers-01.jpg"] },
  ],
  "hakone-chokoku-no-mori-dog-guide": [
    { keyword: "うちのお客さまはこうしています", images: [WM.chokokuNoMori.url] },
    { keyword: "モデルプラン", images: [WM.chokokuNoMoriPicasso.url] },
  ],
  "hakone-pola-museum-dog-guide": [
    { keyword: "DogHubから車4分", images: [WM.polaMuseum.url] },
    { keyword: "モデルプラン", images: [WM.polaMuseum2.url] },
  ],
  "hakone-jinja-dog-guide": [
    { keyword: "参拝ルート", images: [WM.hakoneShrineGate.url, WM.hakoneShrineHaiden.url] },
  ],
  "hakone-ropeway-pirate-ship-dog-guide": [
    { keyword: "ゴールデンコース", images: [WM.komagatakeRopeway.url, WM.pirateShip.url] },
  ],
  "hakone-en-dog-guide": [
    { keyword: "箱根園水族館", images: [WM.hakoneEn.url, WM.ashinokoFuji.url] },
  ],
  "hakone-gora-park-dog-guide": [
    { keyword: "強羅エリア", images: [WM.goraParkRose.url, WM.goraPark.url] },
  ],
  "hakone-gw-spring-dog-guide": [
    { keyword: "コースB", images: [WM.sengokuSusuki.url] },
    { keyword: "GWの予約", images: ["/images/dog-pomeranian-white-hotel.jpg"] },
  ],
  "hakone-dog-day-trip": [
    { keyword: "コースB", images: [WM.ashinokoFuji.url] },
    { keyword: "日帰りプラン", images: [WM.sengokuSusuki.url] },
  ],
  "hakone-yumoto-pet-hotel": [
    { keyword: "DogHub箱根仙石原", images: ["/images/doghub-exterior-entrance-02.jpg"] },
    { keyword: "犬のホテルを選ぶ", images: [WM.yumoto.url, WM.yumotoRiver.url] },
  ],
  "hakone-dog-hotel-cost-comparison": [
    { keyword: "パターンA", images: ["/images/doghub-hotel-room-plant-side.jpg"] },
    { keyword: "DogHubに預けた場合", images: ["/images/doghub-hotel-interior-rooms-01.jpg"] },
  ],
  "pet-hotel-first-time-tips": [
    { keyword: "預かり環境を確認する", images: ["/images/dog-pomeranian-white-hotel.jpg", "/images/doghub-hotel-room-full-01.jpg"] },
    { keyword: "当日の流れ", images: ["/images/img-037.jpg"] },
  ],
  "hakone-glass-forest-museum-dog-guide": [
    { keyword: "庭園", images: [WM.glassForest.url] },
    { keyword: "DogHub", images: [WM.glassForestRain.url] },
  ],
  "hakone-dog-day-hot-spring-guide": [
    { keyword: "DogHub", images: ["/images/doghub-exterior-entrance-02.jpg"] },
    { keyword: "温泉", images: [WM.yumoto.url, WM.yumotoRiver.url] },
  ],
  "hakone-sengokuhara-prince-dog-guide": [
    { keyword: "愛犬と一緒に泊まれる", images: ["/images/prince-hakone-sengokuhara-exterior.jpg"] },
    { keyword: "お客さまの過ごし方", images: ["/images/doghub-schnauzer-exterior.jpg"] },
  ],
  "hakone-miyanoshita-xiv-dog-guide": [
    { keyword: "犬連れ事情", images: ["/images/xiv-hakone-rikyu-exterior.jpg"] },
  ],
  "hakone-daihakone-cc-dog-guide": [
    { keyword: "犬連れ事情", images: ["/images/daihakone-cc-course.jpg"] },
  ],
  "hakone-regina-resort-dog-guide": [
    { keyword: "愛犬と泊まれる宿", images: ["/images/regina-sengokuhara-exterior.jpg"] },
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

function buildImageCreditsHtml(imageUrls: string[]): string {
  const wmUrls = Array.from(
    new Set(imageUrls.filter((u) => u && u.includes("upload.wikimedia.org")))
  );
  if (wmUrls.length === 0) return "";

  const items = wmUrls.map((url) => {
    const meta = WM_BY_URL[url];
    const fileName = meta?.fileName || decodeURIComponent(url.split("/").pop() || "");
    const title = meta?.title || fileName.replace(/_/g, " ").replace(/\.[^.]+$/, "");
    const sourcePage = `https://commons.wikimedia.org/wiki/File:${fileName}`;
    return `<li><a href="${sourcePage}" target="_blank" rel="noopener nofollow">${title}</a></li>`;
  });

  return `<section class="image-credits"><h3>画像出典</h3><p>以下の画像は Wikimedia Commons のクリエイティブ・コモンズ等のライセンスで公開されているものを利用しています。</p><ul>${items.join("")}</ul></section>`;
}

function enhanceArticleHtml(html: string, slug?: string, thumbnailUrl?: string): string {
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

  // 記事本文内の自然な内部リンク挿入（各キーワードは記事内で最初の1回のみ）
  const internalLinks: { pattern: RegExp; href: string; label: string }[] = [
    { pattern: /半日預かり（4時間）/g, href: "/4h", label: "半日預かり（4時間）" },
    { pattern: /半日（4時間）/g, href: "/4h", label: "半日（4時間）" },
    { pattern: /半日お預かり（4時間/g, href: "/4h", label: "半日お預かり（4時間" },
    { pattern: /1日預かり（8時間）/g, href: "/8h", label: "1日預かり（8時間）" },
    { pattern: /1日（8時間）/g, href: "/8h", label: "1日（8時間）" },
    { pattern: /1日お預かり（8時間/g, href: "/8h", label: "1日お預かり（8時間" },
    { pattern: /宿泊プラン（1泊/g, href: "/stay", label: "宿泊プラン（1泊" },
    { pattern: /宿泊1泊/g, href: "/stay", label: "宿泊1泊" },
    { pattern: /OMUSUBI &amp; SOUP CAFE/g, href: "/cafe", label: "OMUSUBI & SOUP CAFE" },
    { pattern: /OMUSUBI & SOUP CAFE/g, href: "/cafe", label: "OMUSUBI & SOUP CAFE" },
  ];

  for (const link of internalLinks) {
    // 既にaタグ内にあるテキストはスキップ（<a>タグ内のマッチを除外）
    const firstMatch = html.match(link.pattern);
    if (!firstMatch) continue;
    const idx = html.indexOf(firstMatch[0]);
    // このマッチが<a>タグ内かチェック
    const beforeMatch = html.slice(Math.max(0, idx - 200), idx);
    if (/<a[^>]*>[^<]*$/.test(beforeMatch)) continue;
    // 最初の1回だけ置換
    html = html.replace(link.pattern, (match) => {
      // 1回だけ置換するためにフラグで管理
      if (html.indexOf(`href="${link.href}"`) !== -1) return match; // 既にリンク済み
      return `<a href="${link.href}">${link.label}</a>`;
    });
  }

  // 目次を生成（h2が2つ以上ある場合のみ）
  let toc = "";
  if (headings.length >= 2) {
    const tocItems = headings.map(h => `<li><a href="#${h.id}">${h.text}</a></li>`).join("");
    toc = `<nav class="article-toc"><div class="article-toc-title">この記事の内容</div><ol>${tocItems}</ol></nav>`;
  }

  // 画像クレジット（Wikimedia Commons画像を記事内で使っている場合のみ）
  const urlsInBody: string[] = [];
  const urlMatches = html.matchAll(/https:\/\/upload\.wikimedia\.org\/[^\s"')]+/g);
  for (const m of urlMatches) urlsInBody.push(m[0]);
  if (thumbnailUrl) urlsInBody.push(thumbnailUrl);
  const creditsHtml = buildImageCreditsHtml(urlsInBody);

  return toc + html + creditsHtml;
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

// ビルド時のAPI呼び出しをキャッシュ（Quota超過防止）
let articlesCache: Article[] | null = null;
let articlesCacheTime = 0;

export async function getArticles(): Promise<Article[]> {
  // キャッシュが5分以内ならそのまま返す（ビルド中の重複API呼び出し防止）
  if (articlesCache && Date.now() - articlesCacheTime < 5 * 60 * 1000) {
    return articlesCache;
  }

  if (!SPREADSHEET_ID) return [];
  let res;
  try {
    res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "記事一覧!A2:G100",
    });
  } catch (e) {
    console.error("[cms] getArticles error:", (e as Error).message?.slice(0, 200));
    if (articlesCache) return articlesCache; // Quota超過時は古いキャッシュを返す
    return [];
  }

  const rows = res.data.values;
  if (!rows || rows.length === 0) return [];

  const result = rows
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

  // キャッシュを更新
  articlesCache = result;
  articlesCacheTime = Date.now();

  return result;
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

  // 記事HTMLを読みやすく後処理（サムネURLも渡してクレジット生成に含める）
  html = enhanceArticleHtml(html, slug, article.thumbnail);

  return { article, html };
}
