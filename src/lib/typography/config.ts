// Route-scoped typography config: types, defaults, and CSS var apply helper
// Svelte 5 runes-compatible consumers can import types and call applyVars

export const FONTS = {
	UNI: "Univers",
	BER: "Berkeley Mono Variable",
};

// Univers: map stretch -> allowed weights
export const UNI_STRETCH_WEIGHTS = {
	"ultra-condensed": [200, 300, 400],
	condensed: [300, 400, 600],
	normal: [300, 400, 600],
	expanded: [400],
} as const;

// export type UniStretch = keyof typeof UNI_STRETCH_WEIGHTS;

// Ordered stretches for UI (in object insertion order)
export const UNI_STRETCH = Object.keys(UNI_STRETCH_WEIGHTS) as Array<
	keyof typeof UNI_STRETCH_WEIGHTS
>;

export const UNI_WEIGHTS: readonly number[] = Array.from(
	new Set(Object.values(UNI_STRETCH_WEIGHTS).flat()),
).sort((a, b) => a - b);

// Berkeley Mono: variable font axis ranges
export const BER_WEIGHT_RANGE = { min: 100, max: 900, step: 50 } as const;
export const BER_WIDTH_RANGE = { min: 60, max: 100, step: 10 } as const;
export const BER_SLANT_RANGE = { min: -16, max: 0, step: 1 } as const;

// Generate array of values from a range
export function rangeValues(range: { min: number; max: number; step: number }): number[] {
	const values: number[] = [];
	for (let i = range.min; i <= range.max; i += range.step) {
		values.push(i);
	}
	return values;
}

// Get the center/median value from an array of numbers
export function getCenterValue(values: readonly number[]): number {
	return values[Math.floor(values.length / 2)];
}

// NOT USED BY PREVIEW PAGE - TODO: Clean up later
// export type UniConfig = {
// 	// base size in px and leading in units × rhythm
// 	size: number;
// 	units: number;
// 	// treat each stretch as its own face with an independent selected weight
// 	faces: Record<UniStretch, { weight: number }>;
// 	// currently selected stretch
// 	stretch: UniStretch;
// 	italic: boolean;
// 	// tracking via named step mapped to em
// 	trackingIdx: number; // index into trackingDefs
// };

// export type BerkeleyConfig = {
// 	// base size in px and leading in units × rhythm
// 	size: number;
// 	units: number;
// 	wght: number; // 100..900
// 	wdth: number; // percent 60..100
// 	slnt: number; // -16..0 (degrees)
// 	trackingIdx: number; // index into trackingDefs
// };

// export type TypographyConfig = {
// 	rhythm: number; // px
// 	uni: UniConfig;
// 	berkeley: BerkeleyConfig;
// };

// export const trackingDefs = [
// 	{ name: "tighter", em: -0.05 },
// 	{ name: "tight", em: -0.025 },
// 	{ name: "normal", em: 0 },
// 	{ name: "wide", em: 0.025 },
// 	{ name: "wider", em: 0.05 },
// 	{ name: "widest", em: 0.1 },
// ] as const;

// export const defaultTypographyConfig: TypographyConfig = {
// 	rhythm: 6,
// 	uni: {
// 		size: 17,
// 		units: 4,
// 		faces: {
// 			"ultra-condensed": { weight: getCenterValue(UNI_STRETCH_WEIGHTS["ultra-condensed"]) },
// 			condensed: { weight: getCenterValue(UNI_STRETCH_WEIGHTS.condensed) },
// 			normal: { weight: getCenterValue(UNI_STRETCH_WEIGHTS.normal) },
// 			expanded: { weight: getCenterValue(UNI_STRETCH_WEIGHTS.expanded) },
// 		},
// 		stretch: "normal",
// 		italic: false,
// 		trackingIdx: 2,
// 	},
// 	berkeley: {
// 		size: 16,
// 		units: 4,
// 		wght: 400,
// 		wdth: 100,
// 		slnt: 0,
// 		trackingIdx: 2,
// 	},
// };

// // Apply CSS custom properties expected by existing styles/utilities.
// // Target can be documentElement (global) or a route-scoped container.
// export function applyVars(target: HTMLElement | Document, cfg: TypographyConfig) {
// 	const el = target instanceof Document ? target.documentElement : target;
// 	const sansTrackingEm = `${trackingDefs[Math.min(cfg.uni.trackingIdx, trackingDefs.length - 1)].em}em`;
// 	const berkeleyTrackingEm = `${trackingDefs[Math.min(cfg.berkeley.trackingIdx, trackingDefs.length - 1)].em}em`;

// 	// unified rhythm var
// 	el.style.setProperty("--type-rhythm", `${cfg.rhythm}px`);

// 	// base tokens
// 	el.style.setProperty("--sans-text-base", `${cfg.uni.size}px`);
// 	el.style.setProperty("--sans-leading-base-units", `${cfg.uni.units}`);
// 	el.style.setProperty("--mono-text-base", `${cfg.berkeley.size}px`);
// 	el.style.setProperty("--mono-leading-base-units", `${cfg.berkeley.units}`);

// 	// axes
// 	// clamp sans weight to allowed weights for the active stretch if possible
// 	const activeStretch = cfg.uni.stretch;
// 	const selectedWeight = cfg.uni.faces[activeStretch]?.weight ?? 400;
// 	const allowed = [...(UNI_STRETCH_WEIGHTS[activeStretch] ?? [400])] as number[];
// 	const nearest = allowed.includes(selectedWeight)
// 		? selectedWeight
// 		: allowed.reduce((prev, curr) =>
// 				Math.abs(curr - selectedWeight) < Math.abs(prev - selectedWeight) ? curr : prev,
// 			);

// 	el.style.setProperty("--sans-weight", `${nearest}`);
// 	el.style.setProperty("--sans-stretch", `${activeStretch}`);
// 	el.style.setProperty("--sans-style", cfg.uni.italic ? "italic" : "normal");
// 	el.style.setProperty("--sans-tracking", sansTrackingEm);

// 	el.style.setProperty("--mono-wght", `${cfg.berkeley.wght}`);
// 	el.style.setProperty("--mono-stretch", `${cfg.berkeley.wdth}%`);
// 	el.style.setProperty("--mono-slnt", `${cfg.berkeley.slnt}`);
// 	el.style.setProperty("--mono-tracking", berkeleyTrackingEm);
// }
