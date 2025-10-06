// Route-scoped typography config: types, defaults, and CSS var apply helper
// Svelte 5 runes-compatible consumers can import types and call applyVars

export const FONTS = {
	UNI: "Univers",
	BER: "Berkeley Mono",
};

export type UniStretch = "ultra-condensed" | "condensed" | "normal" | "expanded";

// Ordered stretches with allowed weights (single source of truth)
export const UNI_STRETCH_DEFS = [
	{ value: "ultra-condensed" as const, weights: [200, 300, 400] as const },
	{ value: "condensed" as const, weights: [300, 400, 600] as const },
	{ value: "normal" as const, weights: [300, 400, 600] as const },
	{ value: "expanded" as const, weights: [400] as const },
] as const;

export const ALL_UNI_WEIGHTS: readonly number[] = Array.from(
	new Set(UNI_STRETCH_DEFS.flatMap((d) => d.weights)),
).sort((a, b) => a - b);

export type UniConfig = {
	// base size in px and leading in units × rhythm
	size: number;
	units: number;
	// treat each stretch as its own face with an independent selected weight
	faces: Record<UniStretch, { weight: number }>;
	// currently selected stretch
	stretch: UniStretch;
	italic: boolean;
	// tracking via named step mapped to em
	trackingIdx: number; // index into trackingDefs
};

export type BerkeleyConfig = {
	// base size in px and leading in units × rhythm
	size: number;
	units: number;
	wght: number; // 100..900
	wdth: number; // percent 60..100
	slnt: number; // -16..0 (degrees)
	trackingIdx: number; // index into trackingDefs
};

export type TypographyConfig = {
	rhythm: number; // px
	uni: UniConfig;
	berkeley: BerkeleyConfig;
};

export const trackingDefs = [
	{ name: "tighter", em: -0.05 },
	{ name: "tight", em: -0.025 },
	{ name: "normal", em: 0 },
	{ name: "wide", em: 0.025 },
	{ name: "wider", em: 0.05 },
	{ name: "widest", em: 0.1 },
] as const;

export const defaultTypographyConfig: TypographyConfig = {
	rhythm: 6,
	uni: {
		size: 17,
		units: 4,
		faces: {
			"ultra-condensed": { weight: 400 },
			condensed: { weight: 400 },
			normal: { weight: 400 },
			expanded: { weight: 400 },
		},
		stretch: "normal",
		italic: false,
		trackingIdx: 2,
	},
	berkeley: {
		size: 16,
		units: 4,
		wght: 400,
		wdth: 100,
		slnt: 0,
		trackingIdx: 2,
	},
};

// Apply CSS custom properties expected by existing styles/utilities.
// Target can be documentElement (global) or a route-scoped container.
export function applyVars(target: HTMLElement | Document, cfg: TypographyConfig) {
	const el = target instanceof Document ? target.documentElement : target;
	const sansTrackingEm = `${trackingDefs[Math.min(cfg.uni.trackingIdx, trackingDefs.length - 1)].em}em`;
	const berkeleyTrackingEm = `${trackingDefs[Math.min(cfg.berkeley.trackingIdx, trackingDefs.length - 1)].em}em`;

	// unified rhythm var
	el.style.setProperty("--type-rhythm", `${cfg.rhythm}px`);

	// base tokens
	el.style.setProperty("--sans-text-base", `${cfg.uni.size}px`);
	el.style.setProperty("--sans-leading-base-units", `${cfg.uni.units}`);
	el.style.setProperty("--mono-text-base", `${cfg.berkeley.size}px`);
	el.style.setProperty("--mono-leading-base-units", `${cfg.berkeley.units}`);

	// axes
	// clamp sans weight to allowed weights for the active stretch if possible
	const activeStretch = cfg.uni.stretch;
	const selectedWeight = cfg.uni.faces[activeStretch]?.weight ?? 400;
	const allowed = UNI_STRETCH_DEFS.find((d) => d.value === activeStretch)?.weights ?? [400];
	const nearest = allowed.includes(selectedWeight)
		? selectedWeight
		: allowed.reduce((prev, curr) =>
				Math.abs(curr - selectedWeight) < Math.abs(prev - selectedWeight) ? curr : prev,
			);

	el.style.setProperty("--sans-weight", `${nearest}`);
	el.style.setProperty("--sans-stretch", `${activeStretch}`);
	el.style.setProperty("--sans-style", cfg.uni.italic ? "italic" : "normal");
	el.style.setProperty("--sans-tracking", sansTrackingEm);

	el.style.setProperty("--mono-wght", `${cfg.berkeley.wght}`);
	el.style.setProperty("--mono-stretch", `${cfg.berkeley.wdth}%`);
	el.style.setProperty("--mono-slnt", `${cfg.berkeley.slnt}`);
	el.style.setProperty("--mono-tracking", berkeleyTrackingEm);
}
