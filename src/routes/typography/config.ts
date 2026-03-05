// Typography preview UI configuration
// Font variation controls and helpers specific to the preview tool

// =============================================================================
// Univers Font Variation Controls
// =============================================================================

// Univers: map stretch -> allowed weights
export const UNI_STRETCH_WEIGHTS = {
	"ultra-condensed": [200, 300, 400],
	condensed: [300, 400, 600],
	normal: [300, 400, 600],
	expanded: [400],
} as const;

// Ordered stretches for UI (in object insertion order)
export const UNI_STRETCH = Object.keys(UNI_STRETCH_WEIGHTS) as Array<
	keyof typeof UNI_STRETCH_WEIGHTS
>;

export const UNI_WEIGHTS: readonly number[] = Array.from(
	new Set(Object.values(UNI_STRETCH_WEIGHTS).flat()),
).sort((a, b) => a - b);

// =============================================================================
// Berkeley Mono Variable Font Axis Controls
// =============================================================================

// Berkeley Mono: variable font axis ranges for UI controls
export const BER_WEIGHT_RANGE = { min: 100, max: 900, step: 50 } as const;
export const BER_WIDTH_RANGE = { min: 60, max: 100, step: 10 } as const;
export const BER_SLANT_RANGE = { min: -16, max: 0, step: 1 } as const;

// =============================================================================
// UI Helpers
// =============================================================================

// Sample text for type specimens
export const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog!";

// Generate array of values from a range
export function rangeValues(range: { min: number; max: number; step: number }): number[] {
	const values: number[] = [];
	for (let i = range.min; i <= range.max; i += range.step) {
		values.push(i);
	}
	return values;
}

// Get the center/median value from an array of numbers (for default slider positions)
export function getCenterValue(values: readonly number[]): number {
	return values[Math.floor(values.length / 2)];
}
