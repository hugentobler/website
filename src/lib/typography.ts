// Typography system: type scales and baseline grid configuration
// Shared across the entire site

// =============================================================================
// Types
// =============================================================================

export type ScaleLevel = {
	fontSize: number; // CSS font-size in pixels
	lineHeight: number; // Line height in pixels (converted to unitless for CSS)
};

// T-shirt size names (same for all fonts)
export type Size = "lg" | "md" | "base" | "sm" | "xs";

// Font identifiers (matches CSS naming: font-sans, font-mono)
export type FontId = "sans" | "mono";

// =============================================================================
// Constants
// =============================================================================

// Font identifiers and their CSS font-family values
export const FONTS = {
	sans: "Univers",
	mono: "Berkeley Mono Variable",
} as const;

// The baseline grid - the vertical measure all text aligns to
export const BASELINE = 96; // px

// Type scales per font - SINGLE SOURCE OF TRUTH
// These values are tuned to align optically with the baseline grid
export const TYPE_SCALES: Record<FontId, Record<Size, ScaleLevel>> = {
	sans: {
		lg: { fontSize: 36, lineHeight: 48 },
		md: { fontSize: 24, lineHeight: 32 },
		base: { fontSize: 18, lineHeight: 24 },
		sm: { fontSize: 16, lineHeight: 19 },
		xs: { fontSize: 14, lineHeight: 16 },
	},
	mono: {
		lg: { fontSize: 44, lineHeight: 66 },
		md: { fontSize: 32, lineHeight: 32 },
		base: { fontSize: 22, lineHeight: 22 },
		sm: { fontSize: 16, lineHeight: 16 },
		xs: { fontSize: 11, lineHeight: 11 },
	},
};
