export default function WalksAppCTA() {
  return (
    <section className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 md:p-12 text-white text-center">
      <h2 className="text-2xl md:text-3xl font-bold mb-3">
        アプリで記録しながら歩こう
      </h2>
      <p className="text-amber-100 mb-6 max-w-lg mx-auto">
        WanWalkアプリなら、散歩ルートをGPSで自動記録。
        歩いた距離や時間を振り返りながら、愛犬との思い出を残せます。
      </p>
      <a
        href="https://apps.apple.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-white text-amber-600 font-semibold px-8 py-3 rounded-full hover:bg-amber-50 transition-colors"
      >
        App Store からダウンロード
      </a>
    </section>
  );
}
