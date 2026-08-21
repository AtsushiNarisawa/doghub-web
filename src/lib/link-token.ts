import crypto from "crypto";

// ───────────────────────────────────────────
// メール経由の「1タップLINE連携」用トークン
// ───────────────────────────────────────────
// LINEは当店にメールアドレスを渡さないため、「LINE友だち＝どの顧客か」を
// システムが自力で判定する材料が無い。一方メールは宛先が既知なので、
// メールに顧客IDを署名付きで載せておけば、LIFF が返す LINE userId と
// 突き合わせるだけで **入力ゼロ** の紐付けができる。
// （従来の紐付けはLIFFでお電話番号を手入力させており、これが最大の摩擦だった）
//
// 【鍵】専用の環境変数を増やさず CRON_SECRET から用途別に派生させる。
//   CRON_SECRET はサーバー専用で既に本番に存在する。用途文字列を挟むことで
//   Cron認証そのものとは別の鍵になり、片方が漏れても他方に転用できない。
//   ⚠️ CRON_SECRET をローテーションすると発行済みリンクは失効する（許容。
//      期限付きの短命リンクであり、失効しても電話番号入力へフォールバックする）。
//
// 【安全性】トークンは「そのメールを受け取れる本人」であることの証明。
//   電話番号方式（他人の番号を入力できてしまう）より入口が狭い。
//   なお api/line/link 側で「既に別のLINEが紐付いた顧客は上書きしない」
//   「紐付け成立時に本人へ通知メール」のガードは従来どおり効く。

const TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60日

function getKey(): Buffer | null {
  const base = process.env.CRON_SECRET;
  if (!base) return null;
  return crypto.createHmac("sha256", base).update("line-link-token/v1").digest();
}

export function createLinkToken(customerId: string): string | null {
  const key = getKey();
  if (!key) {
    console.error("link-token: CRON_SECRET is not set");
    return null;
  }
  const payload = `${customerId}.${Date.now() + TTL_MS}`;
  const sig = crypto.createHmac("sha256", key).update(payload).digest();
  return `${Buffer.from(payload).toString("base64url")}.${sig.toString("base64url")}`;
}

export function verifyLinkToken(token: string): { customerId: string } | null {
  const key = getKey();
  if (!key || typeof token !== "string") return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  let payload: string;
  let given: Buffer;
  try {
    payload = Buffer.from(token.slice(0, dot), "base64url").toString("utf8");
    given = Buffer.from(token.slice(dot + 1), "base64url");
  } catch {
    return null;
  }

  const expected = crypto.createHmac("sha256", key).update(payload).digest();
  // 長さが違うと timingSafeEqual が例外を投げるので先に弾く
  if (given.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(given, expected)) return null;

  const sep = payload.lastIndexOf(".");
  if (sep <= 0) return null;
  const customerId = payload.slice(0, sep);
  const exp = Number(payload.slice(sep + 1));
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  if (!customerId) return null;

  return { customerId };
}

// メールに載せるLIFFリンク。LINE内で開かれると LIFF が userId を返すため、
// 画面側（LineLinkForm）がトークンと合わせて自動で連携APIを叩く。
export function buildLineLinkUrl(customerId: string): string | null {
  const token = createLinkToken(customerId);
  if (!token) return null;
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "2009688745-qZi2jM4g";
  return `https://liff.line.me/${liffId}?mode=link&t=${encodeURIComponent(token)}`;
}
