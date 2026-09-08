import Stripe from "stripe";

// Stripe クライアント（サーバー専用）。
//
// 🔴 apiVersion は指定しない ＝ SDK が固定している既定版（v18.5.0 では 2025-08-27.basil）を使う。
//    Stripe ダッシュボードで Webhook エンドポイントを作るときも、同じバージョンを選ぶこと。
//    バージョンがずれると、SDK の型と実際に届く JSON が食い違う（住所の置き場所が変わる）。
//
// 🔴 キーはテストと本番で入れ替える。会社設立（登記）が済むまでは本番キーが存在しないので、
//    テストキーだけで E2E まで通し切る設計にしてある。

// ---------------------------------------------------------------------------
// 🔴 キーの取り違えを止める番人（2026-09-08 に実際の事故を受けて追加）
//
// 何が起きたか：`~/.zshrc` に別事業（kininaru）の **本番** キーが
// `STRIPE_SECRET_KEY` として設定されていた。Next.js は「シェルの環境変数」を
// `.env.local` より優先するため、当店の `.env.local` に入れたテストキーは
// 黙って上書きされ、**別会社の本番アカウントに ¥4,500 の決済ページが作られた**
// （カード入力前に気づいたため入金は発生していない）。
//
// 画面上は何の警告も出ない。決済ページのタイトルが別事業の名前になって
// 初めて分かる。だからここで止める。
//
// 判定は2つ。どちらか一方でも外れたら **例外で落とす**（黙って続行しない）。
//   1. 環境とキーの種類が合っているか（本番以外で本番キーを使わない）
//   2. キーが当店のアカウントのものか
//      ─ Stripe のシークレットキーは値の中にアカウント ID を含んでいる。
//        acct_1UDCKBCwpcORaX9C → キーに "1UDCKBCwpcORaX9C" が現れる。
//        これは公式に文書化された仕様ではないので、将来 Stripe が形式を
//        変えたらこの検査が誤って落ちる可能性がある。そのときは
//        STRIPE_ACCOUNT_CHECK=off で一時的に外せるようにしてある
//        （外したまま本番に出さないこと）。
// ---------------------------------------------------------------------------

/** Motonari株式会社の Stripe アカウント。ここ以外に決済を作ってはいけない。 */
export const EXPECTED_STRIPE_ACCOUNT = "acct_1UDCKBCwpcORaX9C";

/** 本番環境かどうか（Vercel の Production だけを本番とみなす）。 */
function isProductionEnv(): boolean {
  return process.env.VERCEL_ENV === "production";
}

function assertKeyBelongsHere(key: string): void {
  const live = key.startsWith("sk_live_");
  const test = key.startsWith("sk_test_");

  if (!live && !test) {
    throw new Error(
      "STRIPE_SECRET_KEY の形式が不正です（sk_test_ か sk_live_ で始まる必要があります）。",
    );
  }

  // 1. 環境とキーの種類
  if (!isProductionEnv() && live) {
    throw new Error(
      "本番キー（sk_live_）が本番以外の環境で使われています。停止しました。\n" +
        "原因の多くは ~/.zshrc の STRIPE_SECRET_KEY がシェルから紛れ込むことです" +
        "（Next.js はシェルの環境変数を .env.local より優先します）。\n" +
        "確認: /bin/zsh -c 'source ~/.zshrc; echo ${STRIPE_SECRET_KEY:0:8}'",
    );
  }

  // 2. アカウントの一致
  if (process.env.STRIPE_ACCOUNT_CHECK !== "off") {
    const fragment = EXPECTED_STRIPE_ACCOUNT.replace(/^acct_/, "");
    if (!key.includes(fragment)) {
      throw new Error(
        `別の Stripe アカウントのキーが使われています。停止しました。\n` +
          `当店のアカウント: ${EXPECTED_STRIPE_ACCOUNT}（Motonari株式会社）\n` +
          `このキーはそこに属していません。.env.local と、シェルの環境変数の両方を確認してください。`,
      );
    }
  }
}

let cached: Stripe | null = null;

/** Stripe クライアント。キー未設定なら null（＝EC を作り込み中でもビルドが落ちない）。 */
export function getStripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  assertKeyBelongsHere(key);   // 🔴 取り違えていたらここで落ちる
  cached = new Stripe(key);
  return cached;
}

/** Stripe クライアント。無ければ例外（API ルートの中で使う）。 */
export function requireStripe(): Stripe {
  const s = getStripe();
  if (!s) throw new Error("STRIPE_SECRET_KEY が設定されていません");
  return s;
}

/**
 * いま使っているキーが本番（live）かどうか。
 * Webhook の livemode ガードで「届いたイベントの種別」と突き合わせる。
 */
export function isLiveKey(): boolean {
  return (process.env.STRIPE_SECRET_KEY || "").startsWith("sk_live_");
}

/**
 * Checkout Session から配送先を取り出す。
 *
 * 🔴 API 2025-03-31.basil で、トップレベルの `shipping_details` は削除された。
 *    住所と宛名は `collected_information.shipping_details` に移り、
 *    電話番号はそこには無いので `customer_details.phone` から取る。
 */
export function extractShipping(session: Stripe.Checkout.Session): {
  address: Record<string, string | null> | null;
  name: string | null;
  phone: string | null;
} {
  const collected = (session as unknown as {
    collected_information?: {
      shipping_details?: { name?: string | null; address?: Record<string, string | null> } | null;
    } | null;
  }).collected_information;

  const sd = collected?.shipping_details ?? null;
  return {
    address: sd?.address ? { ...sd.address } : null,
    name: sd?.name ?? session.customer_details?.name ?? null,
    phone: session.customer_details?.phone ?? null,
  };
}
