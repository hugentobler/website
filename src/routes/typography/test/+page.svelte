<script lang="ts">
	import { Popover } from "bits-ui";
	import { Slider, ToggleGroup } from "$lib/components/ui";
	import { getContext } from "svelte";
	import type { TypographyConfig, UniStretch } from "$lib/typography/config";
	import { trackingDefs } from "$lib/typography/config";

	// === Global ===
	let font = $state<"UNI" | "BM">("UNI");
	let gridOn = $state<boolean>(true);
	let gridClass = $derived(gridOn ? "baseline-grid-major" : "");
	let rhythm = $state<number>(6);

	// === UNI: Typography Tokens ===
	let uniSize = $state<number>(17);
	let uniUnits = $state<number>(4);
	let uniLeading = $derived(rhythm * uniUnits);

  // === UNI: Stretch ===
  import { UNI_STRETCH_DEFS, ALL_UNI_WEIGHTS } from "$lib/typography/config";
  let uniStretchIdx = $state<number>(2);
  let uniStretch = $derived(UNI_STRETCH_DEFS[uniStretchIdx].value as UniStretch);
  const currentUniWeights = $derived<readonly number[]>(UNI_STRETCH_DEFS[uniStretchIdx].weights);

	// === UNI: Weights ===
  const allUniWeights = $derived<readonly number[]>(ALL_UNI_WEIGHTS);
	let uniWeight = $state<number>(400);

	let uniTrackingIdx = $state<number>(2);

	let uniItalic = $state<boolean>(false);

	// === BM: Controls (Berkeley Mono Variable) ===
	let bmSize = $state<number>(16);
	let bmUnits = $state<number>(4);
	let bmLeading = $derived(rhythm * bmUnits);
	let bmWght = $state<number>(400);
	let bmWdth = $state<number>(100); // percent 60..100
	let bmSlnt = $state<number>(0); // -16..0
	let bmTrackingIdx = $state<number>(2); // default to 'normal'

	$effect(() => {
		const r = document.documentElement;
		// unified rhythm var
		r.style.setProperty("--type-rhythm", `${rhythm}px`);

		// font-size tokens (px) + unit multipliers for leading
		r.style.setProperty("--sans-text-base", `${uniSize}px`);
		r.style.setProperty("--sans-leading-base-units", `${uniUnits}`);
		r.style.setProperty("--mono-text-base", `${bmSize}px`);
		r.style.setProperty("--mono-leading-base-units", `${bmUnits}`);

		// map tracking indices to em values
		const sansTrackingEm = `${trackingDefs[Math.min(uniTrackingIdx, trackingDefs.length - 1)].em}em`;
		const monoTrackingEm = `${trackingDefs[Math.min(bmTrackingIdx, trackingDefs.length - 1)].em}em`;

		// axes
		r.style.setProperty("--sans-weight", `${uniWeight}`);
		r.style.setProperty("--sans-stretch", `${uniStretch}`);
		r.style.setProperty("--sans-style", uniItalic ? "italic" : "normal");
		r.style.setProperty("--sans-tracking", sansTrackingEm);

		r.style.setProperty("--mono-wght", `${bmWght}`);
		r.style.setProperty("--mono-stretch", `${bmWdth}%`);
		r.style.setProperty("--mono-slnt", `${bmSlnt}`);
		r.style.setProperty("--mono-tracking", monoTrackingEm);
	});

	function inc(val: number, by = 1) {
		return val + by;
	}
	function dec(val: number, by = 1) {
		return Math.max(0, val - by);
	}

	// Bridge to route layout config
	type TypographyCtx = {
		get: () => TypographyConfig;
		set: (next: TypographyConfig) => void;
		apply: () => void;
	};
  const typCtx = getContext<TypographyCtx>("typographyConfig");

  // Live apply: whenever local state changes, push into route config
  $effect(() => {
    if (!typCtx) return;
    const next: TypographyConfig = {
      rhythm,
      uni: {
        size: uniSize,
        units: uniUnits,
        faces: {
          'ultra-condensed': { weight: 400 },
          condensed: { weight: 400 },
          normal: { weight: uniWeight },
          expanded: { weight: 400 },
        },
        stretch: uniStretch as UniStretch,
        italic: uniItalic,
        trackingIdx: uniTrackingIdx,
      },
      berkeley: {
        size: bmSize,
        units: bmUnits,
        wght: bmWght,
        wdth: bmWdth,
        slnt: bmSlnt,
        trackingIdx: bmTrackingIdx,
      },
    };
    typCtx.set(next);
    typCtx.apply();
  });

	function applyToRoute() {
		if (!typCtx) return;
		const next: TypographyConfig = {
			rhythm,
			uni: {
				size: uniSize,
				units: uniUnits,
				faces: {
					"ultra-condensed": { weight: 400 },
					condensed: { weight: 400 },
					normal: { weight: 400 },
					expanded: { weight: 400 },
				},
				stretch: uniStretch as UniStretch,
				italic: uniItalic,
				trackingIdx: uniTrackingIdx,
			},
			berkeley: {
				size: bmSize,
				units: bmUnits,
				wght: bmWght,
				wdth: bmWdth,
				slnt: bmSlnt,
				trackingIdx: bmTrackingIdx,
			},
		};
		typCtx.set(next);
		typCtx.apply();
	}
</script>

<!--
  Slider snippet: vertical slider with optional tick and thumb labels.
  Args:
  - value: current numeric value
  - setValue: updater called on change
  - availableValues: range or set used for min/max
  - steps: number | number[] (increment or discrete snaps)
  - formatLabel?: (value) => string | undefined (tick labels)
  - formatThumbLabel?: (value) => string | undefined (thumb label)
-->

{#snippet slider({
	value,
	setValue,
	availableValues,
	steps,
	formatLabel,
	formatThumbLabel,
	disabled,
}: {
	value: number;
	setValue: (v: number) => void;
	availableValues: readonly number[];
	steps?: number | number[];
	formatLabel?: (value: number) => string | undefined;
	formatThumbLabel?: (value: number) => string | undefined;
	disabled?: boolean;
})}
	{@const min = Math.min(...availableValues)}
	{@const max = Math.max(...availableValues)}
	{@const step = 1}
	<div class="h-60 justify-center flex">
		<Slider.Root
			type="single"
			orientation="vertical"
			{value}
			{min}
			{max}
			step={steps ?? step}
			class="relative flex h-full touch-none select-none flex-col items-center"
			trackPadding={3}
			onValueChange={(value) => setValue(value)}
			{disabled}
		>
			{#snippet children({ tickItems })}
				<span
					class="bg-(--background) relative h-full w-2 cursor-pointer overflow-hidden rounded-full"
				>
					<Slider.Range class="bg-(--foreground) absolute w-full" />
				</span>
				<Slider.Thumb
					index={0}
					class="border-border-input bg-(--background) hover:border-dark-40 focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 z-5 focus-visible:outline-hidden data-active:scale-[0.98] block size-[25px] cursor-pointer rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
				/>
				{#if formatThumbLabel}
					<Slider.ThumbLabel
						index={0}
						position="right"
						class="bg-muted text-foreground ml-5 rounded-md px-2 py-1 text-sm"
					>
						{formatThumbLabel(value)}
					</Slider.ThumbLabel>
				{/if}
				{#each tickItems as { index, value } (index)}
					<Slider.Tick {index} class="dark:bg-background/20 bg-background z-1 h-2 w-[1px]" />
					{@const tickText = formatLabel ? formatLabel(value) : String(value)}
					{#if tickText !== undefined}
						<Slider.TickLabel
							{index}
							class="text-muted-foreground data-bounded:text-foreground ml-5 text-sm font-medium leading-none"
							position="right"
						>
							{tickText}
						</Slider.TickLabel>
					{/if}
				{/each}
			{/snippet}
		</Slider.Root>
	</div>
{/snippet}

{#snippet numberToggle({
	value,
	setValue,
	min,
	max,
	step = 1,
	label,
	suffix = "",
	info,
	display,
}: {
	value: number;
	setValue: (v: number) => void;
	min: number;
	max: number;
	step?: number;
	label: string;
	suffix?: string;
	info?: string;
	display?: string;
})}
	{@const prev = Math.max(min, value - step)}
	{@const next = Math.min(max, value + step)}
	{@const getBind = () => String(value)}
	{@const setBind = (v: string) => setValue(Number(v))}
	<label class="flex items-center gap-3">
		<span class="type-sans-sm">{label}</span>
		{#if info}
			<span class="type-sans-sm text-muted-foreground">{info}</span>
		{/if}
		<div
			class="h-input rounded-card-sm border-border bg-background-alt shadow-mini flex items-center gap-x-0.5 border px-[4px] py-1"
		>
			<button
				aria-label={`decrease ${label}`}
				onclick={() => setValue(prev)}
				class="rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex px-3 h-10 items-center justify-center transition-all active:scale-[0.98] text-sm"
			>
				−
			</button>
			<span
				class="rounded-9px bg-background-alt inline-flex px-3 h-10 items-center justify-center text-sm"
			>
				{display ?? `${value}${suffix}`}
			</span>
			<button
				aria-label={`increase ${label}`}
				onclick={() => setValue(next)}
				class="rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex px-3 h-10 items-center justify-center transition-all active:scale-[0.98] text-sm"
			>
				+
			</button>
		</div>
	</label>
{/snippet}

<section class="space-y-6 p-6">
	<div class="fixed bottom-6 right-6 z-50">
		<Popover.Root open>
			<Popover.Trigger class="type-sans-sm underline cursor-pointer">Settings</Popover.Trigger>
			<Popover.Content side="top" class="bg-white p-6 max-h-[80vh] overflow-y-auto">
				<div class="grid grid-cols-[auto_1fr] items-start gap-6">
					<!-- First column: non-slider controls stacked -->
					<div class="grid gap-4 content-start">
						<label class="flex items-center gap-3">
							<span class="type-sans-sm">Font</span>
							<div
								class="h-input rounded-card-sm border-border bg-background-alt shadow-mini flex items-center gap-x-0.5 border px-[4px] py-1"
							>
                <button
                  aria-label="Univers"
                  value="UNI"
                  data-state={font === "UNI" ? "on" : "off"}
                  onclick={() => (font = "UNI")}
                  class="rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex px-3 h-10 items-center justify-center transition-all active:scale-[0.98] text-sm"
                  >Univers</button
                >
                <button
                  aria-label="Berkeley Mono"
                  value="BM"
                  data-state={font === "BM" ? "on" : "off"}
                  onclick={() => (font = "BM")}
                  class="rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex px-3 h-10 items-center justify-center transition-all active:scale-[0.98] text-sm"
                  >Berkeley Mono</button
                >
								<div class="grid gap-3">
									<button
										class="rounded-9px bg-muted text-foreground inline-flex px-3 h-10 items-center justify-center text-sm"
										onclick={applyToRoute}
									>
										Apply to route
									</button>
								</div>
							</div>
						</label>

						<label class="flex items-center gap-2">
							<input type="checkbox" bind:checked={gridOn} />
							<span class="type-sans-sm">Show grid (minors + major)</span>
						</label>

						{@render numberToggle({
							value: rhythm,
							setValue: (v) => (rhythm = v),
							min: 1,
							max: 64,
							step: 1,
							label: "Rhythm",
							suffix: "px",
						})}

						{#if font === "UNI"}
							{@render numberToggle({
								value: uniSize,
								setValue: (v) => (uniSize = v),
								min: 8,
								max: 64,
								step: 1,
								label: "Base size",
								suffix: "px",
							})}
							{@render numberToggle({
								value: uniUnits,
								setValue: (v) => (uniUnits = v),
								min: 1,
								max: 12,
								step: 1,
								label: "Line height (units × rhythm)",
								display: `${uniLeading}px`,
							})}
							<label class="flex items-center gap-2">
								<input type="checkbox" bind:checked={uniItalic} />
								<span class="type-sans-sm">Italic (if available)</span>
							</label>
						{:else}
							{@render numberToggle({
								value: bmSize,
								setValue: (v) => (bmSize = v),
								min: 8,
								max: 64,
								step: 1,
								label: "Base size",
								suffix: "px",
							})}
							{@render numberToggle({
								value: bmUnits,
								setValue: (v) => (bmUnits = v),
								min: 1,
								max: 12,
								step: 1,
								label: "Line height (units × rhythm)",
								display: `${bmLeading}px`,
							})}
						{/if}
					</div>

					<!-- Slider columns: unified across fonts (weight, stretch/width, slant, tracking) -->
					<div class="grid grid-cols-4 items-start gap-6">
						<!-- Weight -->
						<div class="[grid-row:1/-1] min-w-[180px]">
							<div class="type-sans-sm text-muted-foreground mb-1">Weight</div>
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
								{@render slider({
									value: font === "UNI" ? uniWeight : bmWght,
									setValue: (v) => (font === "UNI" ? (uniWeight = v) : (bmWght = v)),
									availableValues: font === "UNI" ? allUniWeights : ([100, 900] as const),
									steps: font === "UNI" ? 100 : 10,
									formatThumbLabel: font === "UNI" ? undefined : (v) => `wght: ${v}`,
									formatLabel:
										font === "UNI"
											? (w) => (currentUniWeights.includes(w) ? String(w) : undefined)
											: (v) => (v % 150 === 0 ? String(v) : undefined),
								})}
							</div>
						</div>
						<!-- Stretch (UNI) / Width (BM) -->
						<div class="[grid-row:1/-1] min-w-[180px]">
							<div class="type-sans-sm text-muted-foreground mb-1">
								{font === "UNI" ? "Stretch" : "Width"}
							</div>
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
								{@render slider({
									value: font === "UNI" ? uniStretchIdx : bmWdth,
									setValue: (v) => (font === "UNI" ? (uniStretchIdx = v) : (bmWdth = v)),
									availableValues:
										font === "UNI"
            ? Array.from({ length: UNI_STRETCH_DEFS.length }, (_, i) => i)
											: ([60, 100] as const),
									steps: font === "UNI" ? undefined : 1,
									formatLabel:
										font === "UNI"
            ? (i) => UNI_STRETCH_DEFS[i]?.value
											: (v) => (v % 10 === 0 ? `${v}%` : undefined),
								})}
							</div>
						</div>
						<!-- Slant (BM only) -->
						<div class="[grid-row:1/-1] min-w-[180px]">
							<div class="type-sans-sm text-muted-foreground mb-1">Slant</div>
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
								{@render slider({
									value: bmSlnt,
									setValue: (v) => (bmSlnt = v),
									availableValues: [-16, 0],
									steps: 1,
									formatThumbLabel: (v) => `slnt: ${v}°`,
									formatLabel: (v) => (v % 4 === 0 ? `${v}°` : undefined),
									disabled: font === "UNI",
								})}
							</div>
						</div>
						<!-- Tracking -->
						<div class="[grid-row:1/-1] min-w-[180px]">
							<div class="type-sans-sm text-muted-foreground mb-1">Tracking</div>
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
								{@render slider({
									value: font === "UNI" ? uniTrackingIdx : bmTrackingIdx,
									setValue: (v) => (font === "UNI" ? (uniTrackingIdx = v) : (bmTrackingIdx = v)),
									availableValues: Array.from({ length: trackingDefs.length }, (_, i) => i),
									formatLabel: (i) => trackingDefs[i]?.name,
								})}
							</div>
						</div>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>

	<header>
		{#if font === "UNI"}
			<h1 class={`uni-type-lg font-sans uni-axes`}>Body Text Test Preview</h1>
			<p class={`uni-type-sm font-sans uni-axes`}>
				Focused test page for vertical sliders and rhythm.
			</p>
		{:else}
			<h1 class="bm-type-lg font-mono bm-axes">Body Text Test Preview</h1>
			<p class="bm-type-sm font-mono bm-axes">Focused test page for vertical sliders and rhythm.</p>
		{/if}
	</header>

	{#if font === "UNI"}
		<article class="space-y-4">
			<p
				class={`uni-type-base font-sans uni-axes ${gridClass}`}
				style={`--leading-units: ${uniUnits}`}
			>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<p
				class={`uni-type-base font-sans uni-axes ${gridClass}`}
				style={`--leading-units: ${uniUnits}; margin-top: calc(var(--type-rhythm) * 2)`}
			>
				Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
				pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
				mollit anim id est laborum.
			</p>
		</article>
	{:else}
		<article class="space-y-4">
			<p
				class={`bm-type-base font-mono bm-axes ${gridClass}`}
				style={`--leading-units: ${bmUnits}`}
			>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<p
				class={`bm-type-base font-mono bm-axes ${gridClass}`}
				style={`--leading-units: ${bmUnits}; margin-top: calc(var(--type-rhythm) * 2)`}
			>
				Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
				pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
				mollit anim id est laborum.
			</p>
		</article>
	{/if}
</section>

<style>
	/* Local utilities for test page, driven by CSS vars set via config/applyVars or local $effect */

	/* UNI sizing */
	.uni-type-xs {
		font-size: var(--sans-text-xs);
		line-height: var(--sans-leading-xs);
	}
	.uni-type-sm {
		font-size: var(--sans-text-sm);
		line-height: var(--sans-leading-sm);
	}
	.uni-type-base {
		font-size: var(--sans-text-base);
		line-height: var(--sans-leading-base);
	}
	.uni-type-md {
		font-size: var(--sans-text-md);
		line-height: var(--sans-leading-md);
	}
	.uni-type-lg {
		font-size: var(--sans-text-lg);
		line-height: var(--sans-leading-lg);
	}

	/* Berkeley (mono) sizing */
	.bm-type-xs {
		font-size: var(--mono-text-xs);
		line-height: var(--mono-leading-xs);
	}
	.bm-type-sm {
		font-size: var(--mono-text-sm);
		line-height: var(--mono-leading-sm);
	}
	.bm-type-base {
		font-size: var(--mono-text-base);
		line-height: var(--mono-leading-base);
	}
	.bm-type-md {
		font-size: var(--mono-text-md);
		line-height: var(--mono-leading-md);
	}
	.bm-type-lg {
		font-size: var(--mono-text-lg);
		line-height: var(--mono-leading-lg);
	}

	/* Axes hooks */
	.uni-axes {
		font-weight: var(--sans-weight);
		font-stretch: var(--sans-stretch);
		font-style: var(--sans-style, normal);
		letter-spacing: var(--sans-tracking);
	}
	.bm-axes {
		font-weight: var(--mono-wght);
		font-stretch: var(--mono-stretch);
		font-variation-settings: "slnt" var(--mono-slnt);
		letter-spacing: var(--mono-tracking);
	}
</style>
