// Fragrance EC の定数を1箇所に集める。
// 商品名・価格・送料は DB（fragrance_products）が正本なので、ここには置かない。
// ここに置くのは「コードの振る舞いを決める数字」だけ。
//
// 正本＝fragrance/EC構築計画_2026-09-05.md §5

/**
 * Checkout Session の有効期限（分）。
 *
 * 🔴 Stripe の制約は「作成から30分〜24時間」。ちょうど30分にすると、サーバー時刻のずれや
 * API 往復の遅れで最小値を割ってセッション作成が失敗しうるため 35 分にする。
 */
export const SESSION_EXPIRES_MINUTES = 35;

/**
 * 取り置きの仮期限（分）。Session 作成前に先に確保するため、Session より長めに置く。
 * Session 作成後に fragrance_bind_hold() で「Session の期限＋15分」へ更新する。
 *
 * 🔴 取り置きが Session より先に切れると、A さんの決済画面が生きたまま在庫が戻り、
 *    B さんが同じ最後の1本を買えてしまう（＝二重販売）。順序は必ず hold → Session → bind。
 */
export const HOLD_PROVISIONAL_MINUTES = 40;

/** bind 時に Session の期限へ足す余裕（分）。3Dセキュア認証中に期限をまたぐ決済への保険。 */
export const HOLD_GRACE_MINUTES = 15;

/** 1注文あたりの上限本数の既定値（商品ごとに fragrance_products.max_qty_per_order で上書き）。 */
export const DEFAULT_MAX_QTY = 3;

/** 連打制限：同一IPからの取り置きを、この分数の間にこの件数まで許す。 */
export const RATE_LIMIT_WINDOW_MINUTES = 10;
export const RATE_LIMIT_MAX_HOLDS = 10;

/** 店頭お渡しの保管期限（日）。特商法の「引渡時期」として注文確認メールにも書く。 */
export const PICKUP_HOLD_DAYS = 90;

/** 配送の発送目安（営業日）。Checkout の配送オプションと注文確認メールで同じ数字を使う。 */
export const SHIP_ESTIMATE_MIN_DAYS = 3;
export const SHIP_ESTIMATE_MAX_DAYS = 7;

/** 発送先住所を伏せるまでの日数（個人情報の保持期間）。 */
export const ADDRESS_MASK_AFTER_DAYS = 90;

/** フォローメールの送信タイミング（発送日／お渡し日からの日数）。 */
export const FOLLOWUP_2W_DAYS = 14;
export const FOLLOWUP_8W_DAYS = 56;

/** 販売スイッチの site_settings キー。ロットの status と二重の安全弁。 */
export const SALES_OPEN_KEY = "fragrance_sales_open";

/** 受取方法。Stripe の shipping_rate ID は毎回変わるので、判別は必ずこの metadata を正とする。 */
export type Fulfillment = "pickup" | "ship";

/** 店頭お渡しの案内文（Checkout の確認画面に出す）。 */
export const PICKUP_NOTICE =
  `お渡し場所：DogHub箱根仙石原 ホテル受付（金〜火 9:00〜17:00・次のご来店時）。` +
  `送料はかかりません。決済日から${PICKUP_HOLD_DAYS}日以内にお受け取りください。`;

/**
 * Checkout の同意チェックに出す文（返品特約の要旨＋引渡時期＋電子通知への同意）。
 *
 * 🔴 3つとも必要な理由：
 *  - 返品特約は「広告（/fragrance/legal）」と「最終確認画面（ここ）」の両方に出さないと
 *    特定商取引法15条の3ただし書が効かず、「到着後8日以内は理由を問わず返品可」が既定になる
 *  - 引渡時期は「入荷次第」等の曖昧表現が不可（消費者庁 Q&A）＝期限の形で書く
 *  - 電子メールでの承諾通知に同意をもらう（特商法13条2項・施行令8条）
 *
 * ⚠️ Stripe の custom_text は 1,200 文字まで。
 */
export function consentText(fulfillment: Fulfillment): string {
  const delivery =
    fulfillment === "pickup"
      ? `お渡し：決済日から${PICKUP_HOLD_DAYS}日以内に、DogHub箱根仙石原 ホテル受付にてお渡しします。`
      : `お届け：ご注文から${SHIP_ESTIMATE_MIN_DAYS}〜${SHIP_ESTIMATE_MAX_DAYS}営業日以内に発送します。`;
  return (
    `${delivery}` +
    `返品：未開封のものに限り、商品到着後8日以内にご連絡いただいた場合にお受けします（返送料はお客様のご負担）。` +
    `開封後、およびお名前をお入れした商品の返品はお受けできません。` +
    `ご注文の確認・承諾のご連絡を電子メールでお受け取りいただくことに同意します。`
  );
}

/**
 * 本番以外（プレビュー・ローカル）かどうか。
 *
 * 設計方針は既存の予約 API（api/booking/route.ts）と同じ「本番は絶対に止めない（fail-open）」。
 * 判定材料が取れないときは本番とみなして通す。ここで得た値は、テスト注文のメールを
 * 本当のお客様やスタッフに飛ばさないためのガードに使う。
 */
export function nonProductionEnv(): string | null {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "preview" || vercelEnv === "development") return vercelEnv;
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === "development" || nodeEnv === "test") return "development";
  return null;
}
