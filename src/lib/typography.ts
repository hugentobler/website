// biome-ignore-all assist/source/useSortedKeys: key order is load-bearing (scale order 2xl → xs, sans before mono)
/**
 * Typography System
 * =================
 *
 * Inspired by:
 *   - Daybreak Studio's Atlas type system for Adaline — optical tuning, baseline grid
 *     alignment, and t-shirt sizing (see requirements.md for the full article)
 *   - Utopia (utopia.fyi) — fluid type interpolation using CSS clamp()
 *
 * Approach:
 *   Traditional type systems use mathematical ratios. This system uses optical tuning:
 *   each font-size / line-height pair is set by eye, not by formula. The only hard
 *   constraint is that base.lineHeight defines the baseline grid — everything else is
 *   tuned for visual balance at that size.
 *
 * Key concepts:
 *   - BASE SIZE: body text (the most common size), optically tuned for readability
 *   - BASELINE: base.lineHeight — the spatial unit for the entire layout grid
 *   - GRID ALIGNMENT: sizes whose lineHeight is an exact multiple of the baseline
 *     (e.g. lg = 2×) sit on-grid naturally; others use snap padding at block boundaries
 *   - FLUID TYPE: each size has min (mobile) and max (desktop) values; CSS clamp()
 *     interpolates linearly between them across the viewport range
 *
 * Data flow:
 *
 *   typography.ts (this file)          Source of truth: scale values in rem
 *       │
 *       │  TYPE_SCALES ──── max viewport values (desktop, ≥1240px)
 *       │  TYPE_SCALES_MIN ── min viewport values (mobile, ≤360px)
 *       │  FLUID_VIEWPORT ── interpolation bounds (360px–1240px)
 *       │
 *       ▼
 *   typography-generator.ts            Build-time CSS generation
 *       │
 *       │  For each size, generates:
 *       │  ├─ --type-{size}:    clamp(min, slope, max)     ← fontSize
 *       │  ├─ --leading-{size}: clamp() or calc(baseline × N)  ← lineHeight
 *       │  └─ --snap-{size}:    padding to next grid line  ← for non-grid-aligned sizes
 *       │
 *       │  Grid-lock detection: if lineHeight / baseline is the same integer
 *       │  at both min and max endpoints, lineHeight locks to calc(baseline × N)
 *       │  for exact alignment at every viewport. Otherwise, independent clamp.
 *       │
 *       ▼
 *   typography.css (auto-generated)    CSS custom properties + utilities
 *       │
 *       │  :root        → --baseline (fluid), --snap-* padding values
 *       │  @utility sans → --type-*, --leading-* variables (scoped to font)
 *       │  @utility type-*    → applies font-size + line-height from variables
 *       │  @utility baseline-grid → debug overlay
 *       │
 *       ▼
 *   Components                         Consume via utility classes
 *       sans type-lg              → fluid heading, grid-locked at 2× baseline
 *       sans type-base            → fluid body text, line-height = baseline
 *       gap-baseline, p-baseline       → layout spacing in baseline units
 *
 * Notes:
 *   - All values in rem so spacing scales with user font preferences
 *   - px conversions are a UI concern (typography preview), not part of core data
 *   - Sizes use t-shirt names (xs–2xl) not semantic names (body, heading) so they
 *     can be used freely across contexts without implying a specific role
 */

// =============================================================================
// Types
// =============================================================================

export type ScaleLevel = {
	fontSize: number; // rem
	lineHeight: number; // rem
};

export type Size = "2xl" | "xl" | "lg" | "md" | "base" | "sm" | "xs";
export type FontId = "sans" | "mono";

// =============================================================================
// Constants
// =============================================================================

export const FONTS = {
	sans: "Univers",
	mono: "Berkeley Mono Variable",
} as const;

// =============================================================================
// Fluid Type Configuration
// =============================================================================

/** Viewport bounds for fluid interpolation (px). Below min → clamped to min. Above max → clamped to max. */
export const FLUID_VIEWPORT = {
	min: 360,
	max: 1240,
} as const;

/**
 * MAX viewport type scales (desktop, ≥1240px)
 *
 * Each size is an optically tuned fontSize / lineHeight pair.
 * base.lineHeight is the baseline grid unit — all layout spacing derives from it.
 * All fonts should share the same base.lineHeight for a unified grid.
 */
export const TYPE_SCALES: Record<FontId, Record<Size, ScaleLevel>> = {
	sans: {
		"2xl": { fontSize: 5, lineHeight: 6 },
		xl: { fontSize: 3.375, lineHeight: 4.5 },
		lg: { fontSize: 2.25, lineHeight: 3 },
		md: { fontSize: 1.5, lineHeight: 2 },
		base: { fontSize: 1.125, lineHeight: 1.5 }, // ← baseline = 1.5rem
		sm: { fontSize: 1, lineHeight: 1.1875 },
		xs: { fontSize: 0.875, lineHeight: 1 },
	},
	mono: {
		"2xl": { fontSize: 4.5, lineHeight: 6 }, // 4× baseline
		xl: { fontSize: 3, lineHeight: 4.5 }, // 3× baseline
		lg: { fontSize: 2, lineHeight: 3 }, // 2× baseline
		md: { fontSize: 1.375, lineHeight: 1.5 }, // 1× baseline
		base: { fontSize: 1, lineHeight: 1.5 }, // 1× baseline ← shared grid
		sm: { fontSize: 0.875, lineHeight: 1.1875 },
		xs: { fontSize: 0.75, lineHeight: 1 },
	},
};

/**
 * MIN viewport type scales (mobile, ≤360px) — placeholder values, needs optical tuning
 *
 * The Vite plugin interpolates between these and TYPE_SCALES using clamp().
 * Only fonts with min values get fluid behavior; others stay fixed.
 */
export const TYPE_SCALES_MIN: Partial<Record<FontId, Record<Size, ScaleLevel>>> = {
	sans: {
		"2xl": { fontSize: 2.5, lineHeight: 3 },
		xl: { fontSize: 2, lineHeight: 4.125 },
		lg: { fontSize: 1.5, lineHeight: 2.75 },
		md: { fontSize: 1.25, lineHeight: 1.75 },
		base: { fontSize: 1, lineHeight: 1.375 },
		sm: { fontSize: 0.875, lineHeight: 1.0625 },
		xs: { fontSize: 0.8125, lineHeight: 0.875 },
	},
	mono: {
		"2xl": { fontSize: 2.25, lineHeight: 3 }, // 2× baseline (min)
		xl: { fontSize: 1.75, lineHeight: 4.125 },
		lg: { fontSize: 1.25, lineHeight: 2.75 },
		md: { fontSize: 1.125, lineHeight: 1.375 },
		base: { fontSize: 0.875, lineHeight: 1.375 }, // ← matches sans min baseline
		sm: { fontSize: 0.75, lineHeight: 1.0625 },
		xs: { fontSize: 0.625, lineHeight: 0.875 },
	},
};

// =============================================================================
// Helpers
// =============================================================================

/** Baseline grid unit for a font (= base.lineHeight) */
export const getBaseline = (font: FontId): number => TYPE_SCALES[font].base.lineHeight;

/** Baseline multiple for a size (e.g. lg = 2×, md = 1.333×) */
export const getBaselineMultiple = (font: FontId, size: Size): number => {
	const baseline = getBaseline(font);
	const lineHeight = TYPE_SCALES[font][size].lineHeight;
	return lineHeight / baseline;
};
