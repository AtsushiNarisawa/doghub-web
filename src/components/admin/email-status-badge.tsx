// お客様メールの配信状態バッジ（管理画面用）
// - email_bounced=true : ハードバウンス（宛先不明）＝「配信不可（不達）」赤バッジ
// - email_opt_out=true : お客様都合の配信停止＝「配信停止」琥珀バッジ
// 両方 false のときは何も描画しない。
export function EmailStatusBadge({
  bounced,
  optedOut,
  className = "",
}: {
  bounced?: boolean | null;
  optedOut?: boolean | null;
  className?: string;
}) {
  if (!bounced && !optedOut) return null;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {bounced && (
        <span className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
          🚩 配信不可（不達）
        </span>
      )}
      {optedOut && (
        <span className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
          配信停止
        </span>
      )}
    </span>
  );
}
