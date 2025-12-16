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
 */

// =============================================================================
// Types
// =============================================================================

export type ScaleLevel = {
	fontSize: number; // CSS font-size in pixels
	lineHeight: number; // CSS line-height in pixels
};

export type Size = "lg" | "md" | "base" | "sm" | "xs";
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
		lg: { fontSize: 36, lineHeight: 48 },
		md: { fontSize: 24, lineHeight: 32 },
		base: { fontSize: 18, lineHeight: 24 }, // ← baseline = 24px (primary)
		sm: { fontSize: 16, lineHeight: 19 },
		xs: { fontSize: 14, lineHeight: 16 },
	},
	mono: {
		// TODO: Tune mono to use base.lineHeight = 24px (same as sans)
		lg: { fontSize: 44, lineHeight: 44 },
		md: { fontSize: 32, lineHeight: 32 },
		base: { fontSize: 22, lineHeight: 22 },
		sm: { fontSize: 16, lineHeight: 16 },
		xs: { fontSize: 11, lineHeight: 11 },
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
