export function Reservation() {
  return (
    <section className="py-16 px-6 bg-white border-t border-[#E5DDD8]">
      <div className="max-w-7xl mx-auto">
        <a
          href="https://www.airrsv.net/doghubhakone/calendar"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full border border-[#3C200F] py-10 text-center hover:bg-[#F8F5F0] transition-colors"
        >
          <p className="text-[#3C200F] mb-3 flex items-center justify-center gap-3" style={{ fontSize: "clamp(24px, 4vw, 38.4px)", fontWeight: 400, letterSpacing: "2.7px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            RESERVATION
          </p>
          <p className="text-[#8F7B65]" style={{ fontSize: "clamp(14px, 2vw, 20px)", fontWeight: 400 }}>
            DogHub箱根仙石原ご予約はこちら
          </p>
        </a>
      </div>
    </section>
  );
}
