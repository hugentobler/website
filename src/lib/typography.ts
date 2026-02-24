/**
 * Typography System
 * =================
 *
 * A bottom-up type system where:
 *
 * 1. BASE SIZE is the anchor - the most-used body text, optically tuned for readability
 * 2. BASELINE = base.lineHeight - the grid unit for all layout spacing
 * 3. OTHER SIZES are optically tuned independently (line-heights don't need to be multiples)
 * 4. VISUAL ALIGNMENT comes from tuning font-size + line-height together so letterforms
 *    (baseline, cap-height) align to the grid
 *
 * Usage:
 *   - Layout spacing: use baseline multiples (h-baseline, gap-baseline, p-baseline, etc.)
 *   - Typography: use type-* utilities (type-lg, type-base, etc.)
 *   - Font family: combine with font-sans or font-mono
 *
 * CSS Variables:
 *   - --type-baseline: Global baseline value (compiled, for Tailwind utilities)
 *   - --baseline: Local/stateful baseline (for dynamic preview components)
 *
 * Reference: Daybreak Studio's Atlas type system for Adaline
 *
 * Notes:
 * - All scale values are stored in rem to keep the system rooted in the baseline.
 * - Any px conversion is a UI concern (typography preview), not part of the core data.
 */

// =============================================================================
// Types
// =============================================================================

export type ScaleLevel = {
	fontSize: number; // CSS font-size in rem
	lineHeight: number; // CSS line-height in rem
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

/**
 * Type scales per font - optically tuned font-size and line-height pairs
 * 
 * The `base` size anchors the system:
 * - Its line-height becomes the baseline grid unit
 * - Other sizes are tuned for visual balance, not mathematical ratios
 * 
 * IMPORTANT: All fonts should share the same base.lineHeight so they
 * align to a unified baseline grid. Sans is the primary font.
 */
export const TYPE_SCALES: Record<FontId, Record<Size, ScaleLevel>> = {
	sans: {
		"2xl": { fontSize: 5, lineHeight: 6 },
		xl: { fontSize: 3.375, lineHeight: 6 },
		lg: { fontSize: 2.25, lineHeight: 3 },
		md: { fontSize: 1.5, lineHeight: 2 },
		base: { fontSize: 1.125, lineHeight: 1.5 }, // ← baseline = 1.5rem (primary)
		sm: { fontSize: 1, lineHeight: 1.1875 },
		xs: { fontSize: 0.875, lineHeight: 1 },
	},
	mono: {
		// TODO: Tune mono to use base.lineHeight = 1.5rem (same as sans)
		"2xl": { fontSize: 5.5, lineHeight: 5.5 },
		xl: { fontSize: 4, lineHeight: 4 },
		lg: { fontSize: 2.75, lineHeight: 2.75 },
		md: { fontSize: 2, lineHeight: 2 },
		base: { fontSize: 1.375, lineHeight: 1.375 },
		sm: { fontSize: 1, lineHeight: 1 },
		xs: { fontSize: 0.6875, lineHeight: 0.6875 },
	},
};

// =============================================================================
// Helpers
// =============================================================================

/** Get baseline (grid unit) for a font - equals base.lineHeight */
export const getBaseline = (font: FontId): number => TYPE_SCALES[font].base.lineHeight;

/** Get baseline multiple for a size (e.g., lg = 2× baseline) */
export const getBaselineMultiple = (font: FontId, size: Size): number => {
	const baseline = getBaseline(font);
	const lineHeight = TYPE_SCALES[font][size].lineHeight;
	return lineHeight / baseline;
};
