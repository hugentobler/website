<script lang="ts">
	import { Popover, Slider, ToggleGroup } from "bits-ui";

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
	const uniStretchDefs = [
		{ value: "ultra-condensed", weights: [200, 300, 400] },
		{ value: "condensed", weights: [300, 400, 600] },
		{ value: "normal", weights: [300, 400, 600] },
		{ value: "expanded", weights: [400] },
	] as const;
	type UniStretch = (typeof uniStretchDefs)[number]["value"];
	let uniStretchIdx = $state<number>(2);
	let uniStretch = $derived<UniStretch>(uniStretchDefs[uniStretchIdx].value);
	const currentUniWeights = $derived<readonly number[]>(uniStretchDefs[uniStretchIdx].weights);

	// === UNI: Weights ===
	const allUniWeights = $derived<readonly number[]>(
		Array.from(new Set(uniStretchDefs.flatMap((d) => d.weights))).sort((a, b) => a - b)
	);
	let uniWeight = $state<number>(400);

	// === Tracking ===
	// Tailwind-like tracking steps
	const trackingDefs = [
		{ name: "tighter", em: -0.05 },
		{ name: "tight", em: -0.025 },
		{ name: "normal", em: 0 },
		{ name: "wide", em: 0.025 },
		{ name: "wider", em: 0.05 },
		{ name: "widest", em: 0.1 },
	] as const;
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
		r.style.setProperty("--rhythm", `${rhythm}px`);

		// apply base tokens
		r.style.setProperty("--sans-text-base", `${uniSize}px`);
		r.style.setProperty("--sans-leading-base", `${uniLeading}px`);
		r.style.setProperty("--mono-text-base", `${bmSize}px`);
		r.style.setProperty("--mono-leading-base", `${bmLeading}px`);

		// no clamping; allow any 100-step weight within min/max

		// map tracking indices to em values
		const sansTrackingEm = `${trackingDefs[Math.min(uniTrackingIdx, trackingDefs.length - 1)].em}em`;
		const monoTrackingEm = `${trackingDefs[Math.min(bmTrackingIdx, trackingDefs.length - 1)].em}em`;

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
            disabled={disabled}
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
    suffix = '',
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
        <ToggleGroup.Root
            bind:value={getBind, setBind}
            type="single"
            class="h-input rounded-card-sm border-border bg-background-alt shadow-mini flex items-center gap-x-0.5 border px-[4px] py-1"
        >
            <ToggleGroup.Item
                aria-label={`decrease ${label}`}
                value={String(prev)}
                onclick={() => setValue(prev)}
                class="rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex px-3 h-10 items-center justify-center transition-all active:scale-[0.98] text-sm"
            >
                −
            </ToggleGroup.Item>
            <span
                class="rounded-9px bg-background-alt inline-flex px-3 h-10 items-center justify-center text-sm"
            >
                {display ?? `${value}${suffix}`}
            </span>
            <ToggleGroup.Item
                aria-label={`increase ${label}`}
                value={String(next)}
                onclick={() => setValue(next)}
                class="rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex px-3 h-10 items-center justify-center transition-all active:scale-[0.98] text-sm"
            >
                +
            </ToggleGroup.Item>
        </ToggleGroup.Root>
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
                            <ToggleGroup.Root bind:value={font} type="single" class="h-input rounded-card-sm border-border bg-background-alt shadow-mini flex items-center gap-x-0.5 border px-[4px] py-1">
                                <ToggleGroup.Item aria-label="Univers" value="UNI" class="rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex px-3 h-10 items-center justify-center transition-all active:scale-[0.98] text-sm">Univers</ToggleGroup.Item>
                                <ToggleGroup.Item aria-label="Berkeley Mono" value="BM" class="rounded-9px bg-background-alt hover:bg-muted active:bg-dark-10 data-[state=on]:bg-muted data-[state=off]:text-foreground-alt data-[state=on]:text-foreground active:data-[state=on]:bg-dark-10 inline-flex px-3 h-10 items-center justify-center transition-all active:scale-[0.98] text-sm">Berkeley Mono</ToggleGroup.Item>
                            </ToggleGroup.Root>
                        </label>

                        <label class="flex items-center gap-2">
                            <input type="checkbox" bind:checked={gridOn} />
                            <span class="type-sans-sm">Show grid (minors + major)</span>
                        </label>

                        {@render numberToggle({ value: rhythm, setValue: (v) => (rhythm = v), min: 1, max: 64, step: 1, label: 'Rhythm', suffix: 'px' })}

                        {#if font === "UNI"}
                            {@render numberToggle({ value: uniSize, setValue: (v) => (uniSize = v), min: 8, max: 64, step: 1, label: 'Base size', suffix: 'px' })}
                            {@render numberToggle({ value: uniUnits, setValue: (v) => (uniUnits = v), min: 1, max: 12, step: 1, label: 'Line height (units × rhythm)', display: `${uniLeading}px` })}
                            <label class="flex items-center gap-2">
                                <input type="checkbox" bind:checked={uniItalic} />
                                <span class="type-sans-sm">Italic (if available)</span>
                            </label>
                        {:else}
                            {@render numberToggle({ value: bmSize, setValue: (v) => (bmSize = v), min: 8, max: 64, step: 1, label: 'Base size', suffix: 'px' })}
                            {@render numberToggle({ value: bmUnits, setValue: (v) => (bmUnits = v), min: 1, max: 12, step: 1, label: 'Line height (units × rhythm)', display: `${bmLeading}px` })}
                        {/if}
                    </div>

                    <!-- Slider columns: unified across fonts (weight, stretch/width, slant, tracking) -->
                    <div class="grid grid-cols-4 items-start gap-6">
                        <!-- Weight -->
                        <div class="[grid-row:1/-1] min-w-[180px]">
                            <div class="type-sans-sm text-muted-foreground mb-1">Weight</div>
                            <div class="grid grid-cols-[auto_1fr] gap-3 items-center">
                                {@render slider({
                                    value: font === 'UNI' ? uniWeight : bmWght,
                                    setValue: (v) => (font === 'UNI' ? (uniWeight = v) : (bmWght = v)),
                                    availableValues: font === 'UNI' ? allUniWeights : ([100, 900] as const),
                                    steps: font === 'UNI' ? 100 : 10,
                                    formatThumbLabel: font === 'UNI' ? undefined : (v) => `wght: ${v}`,
                                    formatLabel:
                                        font === 'UNI'
                                            ? (w) => (currentUniWeights.includes(w) ? String(w) : undefined)
                                            : (v) => (v % 150 === 0 ? String(v) : undefined),
                                })}
                            </div>
                        </div>
                        <!-- Stretch (UNI) / Width (BM) -->
                        <div class="[grid-row:1/-1] min-w-[180px]">
                            <div class="type-sans-sm text-muted-foreground mb-1">{font === 'UNI' ? 'Stretch' : 'Width'}</div>
                            <div class="grid grid-cols-[auto_1fr] gap-3 items-center">
                                {@render slider({
                                    value: font === 'UNI' ? uniStretchIdx : bmWdth,
                                    setValue: (v) => (font === 'UNI' ? (uniStretchIdx = v) : (bmWdth = v)),
                                    availableValues:
                                        font === 'UNI'
                                            ? Array.from({ length: uniStretchDefs.length }, (_, i) => i)
                                            : ([60, 100] as const),
                                    steps: font === 'UNI' ? undefined : 1,
                                    formatLabel:
                                        font === 'UNI'
                                            ? (i) => uniStretchDefs[i]?.value
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
                                    disabled: font === 'UNI',
                                })}
                            </div>
                        </div>
                        <!-- Tracking -->
                        <div class="[grid-row:1/-1] min-w-[180px]">
                            <div class="type-sans-sm text-muted-foreground mb-1">Tracking</div>
                            <div class="grid grid-cols-[auto_1fr] gap-3 items-center">
                                {@render slider({
                                    value: font === 'UNI' ? uniTrackingIdx : bmTrackingIdx,
                                    setValue: (v) => (font === 'UNI' ? (uniTrackingIdx = v) : (bmTrackingIdx = v)),
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
		<h1 class="type-sans-lg font-sans">Body Text Test Preview</h1>
		<p class="type-sans-sm font-sans">Focused test page for vertical sliders and rhythm.</p>
	</header>

	{#if font === "UNI"}
		<article class="space-y-4">
			<p
				class={`type-sans-base font-sans axes-sans ${gridClass}`}
				style={`--leading-units: ${uniUnits}`}
			>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<p
				class={`type-sans-base font-sans axes-sans ${gridClass}`}
				style={`--leading-units: ${uniUnits}; margin-top: calc(var(--rhythm) * 2)`}
			>
				Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
				pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
				mollit anim id est laborum.
			</p>
		</article>
	{:else}
		<article class="space-y-4">
			<p
				class={`type-mono-base font-mono axes-mono ${gridClass}`}
				style={`--leading-units: ${bmUnits}`}
			>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<p
				class={`type-mono-base font-mono axes-mono ${gridClass}`}
				style={`--leading-units: ${bmUnits}; margin-top: calc(var(--rhythm) * 2)`}
			>
				Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
				pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
				mollit anim id est laborum.
			</p>
		</article>
	{/if}
</section>
