import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const plans = [
  {
    label: "半日プラン",
    duration: "最大4時間",
    price: "¥3,300",
    description: "美術館・温泉など短時間のお出かけに",
    scenes: ["ポーラ美術館", "箱根美術館", "強羅温泉"],
    href: "/4h",
    color: "border-[#E8F3EF]",
  },
  {
    label: "1日プラン",
    duration: "最大8時間",
    price: "¥5,500",
    description: "ゴルフ・日帰り観光のフルデイに",
    scenes: ["大箱根CC", "ユネッサン", "大涌谷"],
    href: "/8h",
    color: "border-[#2A5C45]",
    featured: true,
  },
  {
    label: "宿泊プラン",
    duration: "1泊〜",
    price: "¥7,700〜",
    description: "高級旅館・温泉宿に泊まりたい方へ",
    scenes: ["レジーナリゾート", "仙石原プリンス", "強羅花壇"],
    href: "/stay",
    color: "border-[#E8F3EF]",
  },
];

const scenes = [
  { icon: "⛳", title: "ゴルフ", desc: "大箱根CCと提携。早朝7時からお預かり可能。" },
  { icon: "♨️", title: "温泉旅館", desc: "ペット不可の高級旅館に泊まりたい方に。愛犬はDogHubで快適に過ごします。" },
  { icon: "🏊", title: "ユネッサン", desc: "「ユネッサン ペット 預かり」で検索1位。安心してお任せください。" },
  { icon: "🖼️", title: "美術館", desc: "ポーラ美術館、岡田美術館など。ゆっくり鑑賞できます。" },
];

const dogDifferences = [
  "広いドッグランで思いっきり走り回れる",
  "スタッフが常にそばで見守り、たっぷり遊んでもらえる",
  "自然豊かな箱根の空気の中でリラックスできる",
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center bg-[#1A1A1A] overflow-hidden pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2e24] via-[#1A1A1A] to-[#0d1a12] opacity-90" />

          <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
            <p className="font-dm text-[#C49A3C] text-sm tracking-[0.3em] uppercase mb-6">
              Hakone Sengokuhara
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
              箱根で、あなたも<br />
              愛犬も、<br className="sm:hidden" />
              <span className="text-[#C49A3C]">最高の一日</span>を。
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed">
              ゴルフ、温泉旅館、ユネッサン——<br />
              行きたいところを、もう我慢しなくていい。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/booking"
                className="bg-[#C49A3C] hover:bg-[#d4aa4c] text-white font-medium px-8 py-4 rounded-full text-lg transition-colors"
              >
                ご予約はこちら
              </Link>
              <Link
                href="/service"
                className="border border-white/40 hover:border-white text-white font-medium px-8 py-4 rounded-full text-lg transition-colors"
              >
                サービスを見る
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-4 text-white/60 text-sm">
              <span>★4.8（32件のレビュー）</span>
              <span className="hidden sm:block">·</span>
              <span>大箱根CC提携</span>
              <span className="hidden sm:block">·</span>
              <span>早朝7時〜対応</span>
            </div>
          </div>
        </section>

        {/* Value – Owner */}
        <section className="py-24 px-4 bg-[#F7F5F0]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#2A5C45] text-sm tracking-widest uppercase font-dm mb-3">For You</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
                箱根の楽しみを、我慢しなくていい。
              </h2>
              <p className="text-[#6B6B6B] text-lg leading-relaxed max-w-xl mx-auto">
                ユネッサンに行きたい。温泉旅館に泊まりたい。<br />
                ゴルフを楽しみたい。でも、愛犬が心配——<br />
                そんな悩みを、DogHubが解決します。
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {scenes.map((scene) => (
                <div key={scene.title} className="bg-white rounded-2xl p-6 text-center shadow-sm">
                  <div className="text-4xl mb-3">{scene.icon}</div>
                  <h3 className="font-bold text-[#1A1A1A] mb-2">{scene.title}</h3>
                  <p className="text-[#6B6B6B] text-xs leading-relaxed">{scene.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value – Dog */}
        <section className="py-24 px-4 bg-[#2A5C45]">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-[#C49A3C] text-sm tracking-widest uppercase font-dm mb-3">For Your Dog</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                  ゲージじゃない。<br />
                  <span className="text-[#C49A3C]">リゾートホテル</span>です。
                </h2>
                <p className="text-white/80 text-lg leading-relaxed mb-8">
                  通常のペットホテルは、一日中ゲージの中で待つだけ。<br />
                  DogHubでは、広いドッグランで思いっきり遊べます。
                </p>
                <ul className="space-y-3">
                  {dogDifferences.map((d, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-[#C49A3C] mt-0.5 flex-shrink-0">✓</span>
                      <span className="text-white text-sm leading-relaxed">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Photo placeholder */}
              <div className="rounded-3xl bg-white/10 aspect-square flex items-center justify-center">
                <p className="text-white/40 text-sm text-center px-8">
                  ドッグランで遊ぶ<br />ワンちゃんの写真
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="py-24 px-4 bg-[#F7F5F0]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-[#2A5C45] text-sm tracking-widest uppercase font-dm mb-3">Plans</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A]">ご利用プラン</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.label}
                  className={`bg-white rounded-2xl p-8 border-2 ${plan.color} ${plan.featured ? "shadow-lg" : "shadow-sm"} relative`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2A5C45] text-white text-xs px-4 py-1 rounded-full">
                      人気No.1
                    </div>
                  )}
                  <p className="text-[#6B6B6B] text-sm mb-1">{plan.duration}</p>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">{plan.label}</h3>
                  <p className="font-dm text-3xl font-bold text-[#2A5C45] mb-3">{plan.price}</p>
                  <p className="text-[#6B6B6B] text-sm mb-5 leading-relaxed">{plan.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {plan.scenes.map((s) => (
                      <span key={s} className="bg-[#E8F3EF] text-[#2A5C45] text-xs px-3 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={plan.href}
                    className="block text-center border border-[#2A5C45] text-[#2A5C45] hover:bg-[#2A5C45] hover:text-white text-sm font-medium py-2.5 rounded-full transition-colors"
                  >
                    詳しく見る
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-center text-[#6B6B6B] text-sm mt-6">
              スポット利用（¥1,100/時間）は予約不要・当日来店のみ
            </p>
          </div>
        </section>

        {/* Reviews */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-[#2A5C45] text-sm tracking-widest uppercase font-dm mb-3">Reviews</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">お客様の声</h2>
            <div className="flex items-center justify-center gap-3 mb-12">
              <span className="font-dm text-5xl font-bold text-[#1A1A1A]">4.8</span>
              <div>
                <div className="text-[#C49A3C] text-xl">★★★★★</div>
                <p className="text-[#6B6B6B] text-sm">Google レビュー 32件</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              {[
                {
                  text: "ゴルフの間、安心して預けられました。帰ってきた時の愛犬が本当に嬉しそうで、また利用したいと思います。",
                  name: "東京都 / Y.T様",
                  plan: "1日プラン",
                },
                {
                  text: "温泉旅館に泊まりたくてDogHubさんを利用しました。ドッグランで遊んでもらえると聞いて安心できました。",
                  name: "神奈川県 / M.S様",
                  plan: "宿泊プラン",
                },
                {
                  text: "ユネッサンに行く間お願いしました。スタッフさんがとても丁寧で、とても安心して楽しめました。",
                  name: "埼玉県 / K.W様",
                  plan: "半日プラン",
                },
              ].map((review, i) => (
                <div key={i} className="bg-[#F7F5F0] rounded-2xl p-6">
                  <div className="text-[#C49A3C] mb-3">★★★★★</div>
                  <p className="text-[#1A1A1A] text-sm leading-relaxed mb-4">{review.text}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B6B6B] text-xs">{review.name}</span>
                    <span className="bg-[#E8F3EF] text-[#2A5C45] text-xs px-2 py-0.5 rounded-full">{review.plan}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partners */}
        <section className="py-16 px-4 bg-[#F7F5F0]">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-[#6B6B6B] text-xs tracking-widest uppercase mb-8">提携施設</p>
            <div className="flex flex-wrap justify-center gap-4">
              {["レジーナリゾート箱根仙石原", "大箱根カントリークラブ", "仙石原プリンスホテル", "リロクラブ"].map((p) => (
                <span key={p} className="text-sm text-[#6B6B6B] border border-[#DDD8D0] px-5 py-2 rounded-full">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 bg-[#1A1A1A] text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">今すぐ予約する</h2>
            <p className="text-white/60 mb-8">前日17時まで受付。スポット利用は当日来店のみ。</p>
            <Link
              href="/booking"
              className="inline-block bg-[#C49A3C] hover:bg-[#d4aa4c] text-white font-medium px-10 py-4 rounded-full text-lg transition-colors"
            >
              ご予約はこちら
            </Link>
            <p className="text-white/40 text-sm mt-6">
              <a href="tel:0460838523" className="hover:text-white/70 transition-colors">
                お電話：0460-83-8523（9:00〜17:00）
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
