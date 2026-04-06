const LINE_ADD_URL = "https://line.me/R/ti/p/@794wdxyu";
const LINE_COLOR = "#06C755";

function LineIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.95 1.91 5.53 4.75 7.05-.17.6-.62 2.24-.71 2.58-.12.43.16.43.33.31.13-.09 2.1-1.38 2.94-1.95.88.13 1.79.2 2.69.2 5.52 0 10-3.82 10-8.5S17.52 2 12 2zm-3.3 11h-1.4c-.28 0-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5s.5.22.5.5v3.5h.9c.28 0 .5.22.5.5s-.22.5-.5.5zm2.1-.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5s.5.22.5.5v4zm4.4 0c0 .21-.13.4-.33.47-.06.02-.12.03-.17.03-.15 0-.29-.07-.38-.2l-1.82-2.47v2.17c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-4c0-.21.13-.4.33-.47.06-.02.12-.03.17-.03.15 0 .29.07.38.2l1.82 2.47V8.5c0-.28.22-.5.5-.5s.5.22.5.5v4zm3-1.5h-.9v.5h.9c.28 0 .5.22.5.5s-.22.5-.5.5h-1.4c-.28 0-.5-.22-.5-.5v-4c0-.28.22-.5.5-.5h1.4c.28 0 .5.22.5.5s-.22.5-.5.5h-.9v.5h.9c.28 0 .5.22.5.5s-.22.5-.5.5z" />
    </svg>
  );
}

/** 予約ページ・サービスページ用: Web予約と並列 */
export function LineBookingButton({ className }: { className?: string }) {
  return (
    <a
      href={LINE_ADD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 text-white font-medium transition-opacity hover:opacity-90 ${className || ""}`}
      style={{ background: LINE_COLOR, borderRadius: "12px", padding: "14px 24px", fontSize: "15px" }}
    >
      <LineIcon size={22} />
      LINEで予約する
    </a>
  );
}

/** 予約完了画面用: 友だち追加促進 */
export function LineAddFriendBanner() {
  return (
    <a
      href={LINE_ADD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl p-4 text-center transition-opacity hover:opacity-90"
      style={{ background: "#F0FFF4", border: "1px solid #C6F6D5" }}
    >
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full" style={{ background: LINE_COLOR }}>
          <LineIcon size={18} />
        </span>
        <span className="text-sm font-medium" style={{ color: "#22543D" }}>LINE友だち追加</span>
      </div>
      <p className="text-xs" style={{ color: "#2F855A" }}>
        予約確認・リマインドがLINEで届きます。2回目以降は入力不要でかんたん予約。
      </p>
    </a>
  );
}

/** モバイル固定CTA用: LINEアイコンボタン */
export function LineMiniButton() {
  return (
    <a
      href={LINE_ADD_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center rounded-xl shadow-lg"
      style={{ background: LINE_COLOR, width: "48px", height: "48px" }}
      aria-label="LINEで予約"
    >
      <LineIcon size={24} />
    </a>
  );
}
