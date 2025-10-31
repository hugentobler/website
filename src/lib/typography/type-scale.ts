// Type scale configuration for typography preview
// Defines font size and line height for each typographic level

export type TypeLevel = "h1" | "h2" | "h3" | "p" | "small";

export type TypeScaleLevel = {
	fontSize: number; // in pixels
	lineHeight: number; // unitless multiplier
};

export type TypeScale = Record<TypeLevel, TypeScaleLevel>;

// Default type scale values (starting points for tuning)
export const DEFAULT_TYPE_SCALES: Record<"UNI" | "BER", TypeScale> = {
	UNI: {
		h1: { fontSize: 48, lineHeight: 1.2 },
		h2: { fontSize: 36, lineHeight: 1.3 },
		h3: { fontSize: 24, lineHeight: 1.4 },
		p: { fontSize: 16, lineHeight: 1.5 },
		small: { fontSize: 14, lineHeight: 1.5 },
	},
	BER: {
		// Monospace typically needs tighter leading
		h1: { fontSize: 48, lineHeight: 1.1 },
		h2: { fontSize: 36, lineHeight: 1.2 },
		h3: { fontSize: 24, lineHeight: 1.3 },
		p: { fontSize: 16, lineHeight: 1.4 },
		small: { fontSize: 14, lineHeight: 1.4 },
	},
};

// Sample text for type specimens
export const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog";

// Labels for display
export const TYPE_LEVEL_LABELS: Record<TypeLevel, string> = {
	h1: "H1",
	h2: "H2",
	h3: "H3",
	p: "P",
	small: "Small",
};
