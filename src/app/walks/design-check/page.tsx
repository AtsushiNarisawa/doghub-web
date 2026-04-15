import {
  Path,
  Clock,
  Mountains,
  ChartLineUp,
  Dog,
  BookmarkSimple,
  ShareNetwork,
  MapPin,
  Leaf,
  Car,
  Toilet,
  Drop,
  House,
} from "@phosphor-icons/react/dist/ssr";

/**
 * Day 0 デザインシステム適用検証ページ（CEOレビュー用）
 * 仕様: /Users/atsushinarisawa/projects/wanwalk/DESIGN_TOKENS.md
 * 本番リリース前に削除予定（Phase 1 検証が終わったら）
 */
export default function DesignCheckPage() {
  const icons = [
    { Cmp: Path, name: "Path" },
    { Cmp: Clock, name: "Clock" },
    { Cmp: Mountains, name: "Mountains" },
    { Cmp: ChartLineUp, name: "ChartLineUp" },
    { Cmp: Dog, name: "Dog" },
    { Cmp: BookmarkSimple, name: "BookmarkSimple" },
    { Cmp: ShareNetwork, name: "ShareNetwork" },
    { Cmp: MapPin, name: "MapPin" },
    { Cmp: Leaf, name: "Leaf" },
    { Cmp: Car, name: "Car" },
    { Cmp: Toilet, name: "Toilet" },
    { Cmp: Drop, name: "Drop" },
    { Cmp: House, name: "House" },
  ];

  const colorSwatches = [
    { label: "bg-primary", hex: "#FFFFFF", border: true },
    { label: "bg-secondary", hex: "#F8F6F2" },
    { label: "bg-tertiary", hex: "#EFECE5" },
    { label: "text-primary", hex: "#2A2A2A" },
    { label: "accent", hex: "#6B7F5B" },
    { label: "accent-hover", hex: "#556649" },
    { label: "accent-soft", hex: "#E8EDE1" },
    { label: "accent-gold", hex: "#B8905C" },
    { label: "level-easy", hex: "#8BA885" },
    { label: "level-moderate", hex: "#B8905C" },
    { label: "level-hard", hex: "#A84A3D" },
  ];

  return (
    <main className="mx-auto max-w-[1200px] px-10 py-16">
      <p className="mb-2 text-[12px] uppercase tracking-[0.08em] text-[color:var(--color-ww-text-secondary)]">
        Day 0 — Design System Check
      </p>
      <h1 className="text-[48px] leading-[1.3] font-bold">
        WanWalk デザイントークン検証
      </h1>
      <p className="mt-4 text-[16px] leading-[1.75] text-[color:var(--color-ww-text-secondary)]">
        Wildboundsトーン適用後のカラー・タイポグラフィ・Phosphorアイコンの表示確認です。
        愛犬と歩ける散歩コースを、抑制された洗練で届けます。
      </p>

      {/* Typography */}
      <section className="mt-16">
        <p className="mb-3 text-[12px] uppercase tracking-[0.08em] text-[color:var(--color-ww-text-secondary)]">
          Typography
        </p>
        <h1 className="text-[36px] leading-[1.35] font-bold">h1 Noto Serif JP 700 36px</h1>
        <h2 className="mt-4 text-[28px] leading-[1.4] font-semibold">h2 Noto Serif JP 600 28px</h2>
        <h3 className="mt-4 text-[20px] leading-[1.5] font-semibold font-sans">h3 Noto Sans JP 600 20px</h3>
        <p className="mt-4 text-[18px] leading-[1.75] font-sans">body-lg 18px / 1.75 — 体験ストーリー用の大きめ本文</p>
        <p className="mt-2 text-[16px] leading-[1.75] font-sans">body 16px / 1.75 — 通常本文。日本語は広めの行間</p>
        <p className="mt-2 font-sans ww-numeric text-[22px] font-semibold">3.1 km · 60分 · +120m</p>
      </section>

      {/* Colors */}
      <section className="mt-16">
        <p className="mb-3 text-[12px] uppercase tracking-[0.08em] text-[color:var(--color-ww-text-secondary)]">
          Color Palette
        </p>
        <div className="grid grid-cols-4 gap-4">
          {colorSwatches.map((sw) => (
            <div key={sw.label}>
              <div
                className="h-20 rounded-[4px]"
                style={{
                  backgroundColor: sw.hex,
                  border: sw.border ? "1px solid var(--color-ww-border-subtle)" : undefined,
                }}
              />
              <p className="mt-2 text-[13px]">{sw.label}</p>
              <p className="text-[12px] font-sans ww-numeric text-[color:var(--color-ww-text-secondary)]">
                {sw.hex}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Phosphor icons */}
      <section className="mt-16">
        <p className="mb-3 text-[12px] uppercase tracking-[0.08em] text-[color:var(--color-ww-text-secondary)]">
          Phosphor Icons (Regular · 24px)
        </p>
        <div className="grid grid-cols-6 gap-6 rounded-[8px] bg-[color:var(--color-ww-bg-secondary)] p-8">
          {icons.map(({ Cmp, name }) => (
            <div key={name} className="flex flex-col items-center gap-2">
              <Cmp size={24} weight="regular" color="#2A2A2A" />
              <span className="text-[12px] text-[color:var(--color-ww-text-secondary)]">
                {name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="mt-16">
        <p className="mb-3 text-[12px] uppercase tracking-[0.08em] text-[color:var(--color-ww-text-secondary)]">
          Buttons
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            className="inline-flex h-11 items-center gap-2 rounded-[8px] px-6 text-[14px] font-medium text-white"
            style={{ backgroundColor: "var(--color-ww-accent)" }}
          >
            Primary Button
          </button>
          <button
            className="inline-flex h-11 items-center gap-2 rounded-[8px] border px-6 text-[14px] font-medium"
            style={{ borderColor: "var(--color-ww-border-strong)", color: "var(--color-ww-text)" }}
          >
            Secondary
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-[8px] border px-3.5 text-[14px]"
            style={{ borderColor: "var(--color-ww-border-strong)" }}
          >
            <BookmarkSimple size={20} weight="regular" /> 保存
          </button>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-[8px] border px-3.5 text-[14px]"
            style={{ borderColor: "var(--color-ww-border-strong)" }}
          >
            <ShareNetwork size={20} weight="regular" /> 共有
          </button>
        </div>
      </section>
    </main>
  );
}
