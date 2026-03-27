import Image from "next/image";

const IG_PROFILE_URL = "https://www.instagram.com/doghub.hakone__/";

type InstagramPost = {
  id: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  media_type: string;
};

async function getLatestPosts(): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

  if (!token || !accountId) return [];

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${accountId}/media?fields=id,media_url,thumbnail_url,permalink,media_type&limit=3&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

const FOLLOW_BENEFITS = [
  "お預かり中のわんちゃんの可愛い姿が見れる",
  "箱根・仙石原の季節の風景をお届け",
  "カフェの新メニューやイベント情報をいち早くキャッチ",
];

/** 記事ページ用: サムネイル3枚 + メリット + フォローリンク */
export async function InstagramFollowFull() {
  const posts = await getLatestPosts();

  return (
    <div style={{ background: "#F8F5F0", borderRadius: "12px", padding: "20px" }}>
      <p style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 600, color: "#3C200F" }}>
        Instagramをフォローしませんか？
      </p>

      <ul style={{ margin: "0 0 14px", padding: "0 0 0 18px", fontSize: "13px", color: "#8F7B65", lineHeight: "1.9" }}>
        {FOLLOW_BENEFITS.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      {posts.length > 0 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, aspectRatio: "1", position: "relative", borderRadius: "8px", overflow: "hidden", display: "block" }}
            >
              <Image
                src={post.media_type === "VIDEO" ? (post.thumbnail_url || post.media_url) : post.media_url}
                alt=""
                fill
                sizes="(max-width: 640px) 30vw, 150px"
                style={{ objectFit: "cover" }}
              />
            </a>
          ))}
        </div>
      )}

      <a
        href={IG_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "10px 20px",
          background: "#B87942",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        @doghub.hakone__ をフォローする
      </a>
    </div>
  );
}

/** サービス・シーン別ページ用: テキストのみの軽量版 */
export function InstagramFollowLight() {
  return (
    <div style={{ borderTop: "1px solid #E5DDD8", borderBottom: "1px solid #E5DDD8", padding: "16px 0", textAlign: "center" }}>
      <p style={{ margin: "0 0 6px", fontSize: "14px", color: "#3C200F" }}>
        お預かり中のわんちゃんの可愛い姿を Instagramでお届けしています
      </p>
      <a
        href={IG_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: "14px", color: "#B87942", textDecoration: "none", fontWeight: 500 }}
      >
        @doghub.hakone__ をフォローする →
      </a>
    </div>
  );
}
