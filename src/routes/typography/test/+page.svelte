<script lang="ts">
	import { Popover, Slider } from "bits-ui";

	// === Global ===
	let fontMode = $state<"sans" | "mono">("sans");
	let gridOn = $state<boolean>(true);
	let gridClass = $derived(gridOn ? "baseline-grid-major" : "");
	let rhythm = $state<number>(6);

	// === Sans: Typography Tokens ===
	let sansSize = $state<number>(17);
	let sansUnits = $state<number>(4);
	let sansLeading = $derived(rhythm * sansUnits);

	// === Univers: Stretch ===
	const sansStretchDefs = [
		{ value: "ultra-condensed", weights: [200, 300, 400] },
		{ value: "condensed", weights: [300, 400, 600] },
		{ value: "normal", weights: [300, 400, 600] },
		{ value: "expanded", weights: [400] },
	] as const;
	type SansStretch = (typeof sansStretchDefs)[number]["value"];
	let sansStretchIdx = $state<number>(2);
	let sansStretch = $derived<SansStretch>(sansStretchDefs[sansStretchIdx].value);
	const currentSansWeights = $derived<readonly number[]>(sansStretchDefs[sansStretchIdx].weights);

	// === Univers: Weights ===
	const allSansWeights = $derived<readonly number[]>(
		Array.from(new Set(sansStretchDefs.flatMap((d) => d.weights))).sort((a, b) => a - b)
	);
	let sansWeight = $state<number>(400);

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
	let sansTrackingIdx = $state<number>(2);

	let sansItalic = $state<boolean>(false);

	// === Mono: Controls (Berkeley Mono Variable) ===
	let monoSize = $state<number>(16);
	let monoUnits = $state<number>(4);
	let monoLeading = $derived(rhythm * monoUnits);
	let monoWght = $state<number>(400);
	let monoWdth = $state<number>(100); // percent 60..100
	let monoSlnt = $state<number>(0); // deg -16..0
	let monoTrackingIdx = $state<number>(2); // default to 'normal'

	$effect(() => {
		const r = document.documentElement;
		r.style.setProperty("--rhythm", `${rhythm}px`);

		// apply base tokens
		r.style.setProperty("--sans-text-base", `${sansSize}px`);
		r.style.setProperty("--sans-leading-base", `${sansLeading}px`);
		r.style.setProperty("--mono-text-base", `${monoSize}px`);
		r.style.setProperty("--mono-leading-base", `${monoLeading}px`);

		// no clamping; allow any 100-step weight within min/max

		// map tracking indices to em values
		const sansTrackingEm = `${trackingDefs[Math.min(sansTrackingIdx, trackingDefs.length - 1)].em}em`;
		const monoTrackingEm = `${trackingDefs[Math.min(monoTrackingIdx, trackingDefs.length - 1)].em}em`;

		r.style.setProperty("--sans-weight", `${sansWeight}`);
		r.style.setProperty("--sans-stretch", `${sansStretch}`);
		r.style.setProperty("--sans-style", sansItalic ? "italic" : "normal");
		r.style.setProperty("--sans-tracking", sansTrackingEm);

		r.style.setProperty("--mono-wght", `${monoWght}`);
		r.style.setProperty("--mono-stretch", `${monoWdth}%`);
		r.style.setProperty("--mono-slnt", `${monoSlnt}`);
		r.style.setProperty("--mono-tracking", monoTrackingEm);
	});

	function inc(val: number, by = 1) {
		return val + by;
	}
	function dec(val: number, by = 1) {
		return Math.max(0, val - by);
	}
</script>


{#snippet slider({
	value,
	setValue,
	availableValues,
	steps,
	formatLabel,
    formatThumbLabel,
}: {
	value: number;
	setValue: (v: number) => void;
	availableValues: readonly number[];
	steps?: number | number[];
	formatLabel?: (value: number) => string | undefined;
    formatThumbLabel?: (value: number) => string | undefined;
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
					<Slider.ThumbLabel index={0} position="right" class="bg-muted text-foreground ml-5 rounded-md px-2 py-1 text-sm">
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

<section class="space-y-6 p-6">
	<div class="fixed top-6 right-6 z-50">
		<Popover.Root open>
			<Popover.Trigger class="type-sans-sm underline cursor-pointer">Settings</Popover.Trigger>
			<Popover.Content side="top" class="bg-white p-6 w-[420px] max-h-[80vh] overflow-y-auto">
				<!-- Global controls -->
				<div class="flex flex-wrap items-end gap-4">
					<label class="flex items-center gap-2">
						<span class="type-sans-sm">Font</span>
						<select
							bind:value={fontMode}
							class="type-sans-sm border px-2 py-1 bg-white/80 dark:bg-black/30"
						>
							<option value="sans">Sans (Univers)</option>
							<option value="mono">Mono (Berkeley Mono)</option>
						</select>
					</label>

					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={gridOn} />
						<span class="type-sans-sm">Show grid (minors + major)</span>
					</label>

					<label class="flex items-center gap-2">
						<span class="type-sans-sm">Rhythm (px)</span>
						<input
							type="number"
							min="1"
							bind:value={rhythm}
							class="type-sans-sm border px-2 py-1 w-20 bg-white/80 dark:bg-black/30"
						/>
						<div class="flex gap-1">
							<button class="type-sans-sm px-2 py-1 border" onclick={() => (rhythm = dec(rhythm))}
								>−1</button
							>
							<button class="type-sans-sm px-2 py-1 border" onclick={() => (rhythm = inc(rhythm))}
								>+1</button
							>
						</div>
					</label>
				</div>

				<!-- Per-font controls -->
				{#if fontMode === "sans"}
					<div class="flex flex-wrap items-end gap-4 mt-4">
						<label class="flex items-center gap-2">
							<span class="type-sans-sm">Base size (px)</span>
							<input
								type="number"
								min="8"
								bind:value={sansSize}
								class="type-sans-sm border px-2 py-1 w-24 bg-white/80 dark:bg-black/30"
							/>
							<div class="flex gap-1">
								<button
									class="type-sans-sm px-2 py-1 border"
									onclick={() => (sansSize = dec(sansSize))}>−1</button
								>
								<button
									class="type-sans-sm px-2 py-1 border"
									onclick={() => (sansSize = inc(sansSize))}>+1</button
								>
							</div>
						</label>
						<label class="flex items-center gap-2">
							<span class="type-sans-sm">Leading (units)</span>
							<input
								type="number"
								min="1"
								bind:value={sansUnits}
								class="type-sans-sm border px-2 py-1 w-20 bg-white/80 dark:bg-black/30"
							/>
						</label>

						<div class="grid grid-cols-3 gap-4 w-full">
							<!-- Stretch -->
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
								{@render slider({
									value: sansStretchIdx,
									setValue: (v) => (sansStretchIdx = v),
									availableValues: Array.from({ length: sansStretchDefs.length }, (_, i) => i),
									formatLabel: (i) => sansStretchDefs[i]?.value,
								})}
							</div>
							<!-- Weight (numeric values, step 100; hide labels when not available) -->
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
								{@render slider({
									value: sansWeight,
									setValue: (v) => (sansWeight = v),
									availableValues: allSansWeights,
									formatLabel: (w) => (currentSansWeights.includes(w) ? String(w) : undefined),
									steps: 100,
								})}
							</div>
							<!-- Tracking (Tailwind steps) -->
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
								{@render slider({
									value: sansTrackingIdx,
									setValue: (v) => (sansTrackingIdx = v),
									availableValues: Array.from({ length: trackingDefs.length }, (_, i) => i),
									formatLabel: (i) => trackingDefs[i]?.name,
								})}
							</div>
						</div>

						<label class="flex items-center gap-2">
							<input type="checkbox" bind:checked={sansItalic} />
							<span class="type-sans-sm">Italic (if available)</span>
						</label>
					</div>
				{:else}
					<div class="flex flex-wrap items-end gap-4 mt-4">
						<label class="flex items-center gap-2">
							<span class="type-sans-sm">Base size (px)</span>
							<input
								type="number"
								min="8"
								bind:value={monoSize}
								class="type-sans-sm border px-2 py-1 w-24 bg-white/80 dark:bg-black/30"
							/>
							<div class="flex gap-1">
								<button
									class="type-sans-sm px-2 py-1 border"
									onclick={() => (monoSize = dec(monoSize))}>−1</button
								>
								<button
									class="type-sans-sm px-2 py-1 border"
									onclick={() => (monoSize = inc(monoSize))}>+1</button
								>
							</div>
						</label>
						<label class="flex items-center gap-2">
							<span class="type-sans-sm">Leading (units)</span>
							<input
								type="number"
								min="1"
								bind:value={monoUnits}
								class="type-sans-sm border px-2 py-1 w-20 bg-white/80 dark:bg-black/30"
							/>
						</label>

						<div class="grid grid-cols-4 gap-4 w-full">
							<!-- Mono weight -->
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
					{@render slider({
						value: monoWght,
						setValue: (v) => (monoWght = v),
						availableValues: [100, 900],
						steps: 10,
						formatThumbLabel: (v) => `wght: ${v}`,
						formatLabel: (v) => (v % 150 === 0 ? String(v) : undefined),
					})}
					</div>
					<!-- Mono width -->
					<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
					{@render slider({
						value: monoWdth,
						setValue: (v) => (monoWdth = v),
						availableValues: [60, 100],
						steps: 1,
						formatThumbLabel: (v) => `wdth: ${v}%`,
						formatLabel: (v) => (v % 10 === 0 ? `${v}%` : undefined),
					})}
					</div>
					<!-- Mono slant -->
					<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
					{@render slider({
						value: monoSlnt,
						setValue: (v) => (monoSlnt = v),
						availableValues: [-16, 0],
						steps: 1,
						formatThumbLabel: (v) => `slnt: ${v}°`,
						formatLabel: (v) => (v % 4 === 0 ? `${v}°` : undefined),
					})}
					</div>
					<!-- Mono tracking (Tailwind steps) -->
					<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
						{@render slider({
							value: monoTrackingIdx,
							setValue: (v) => (monoTrackingIdx = v),
							availableValues: Array.from({ length: trackingDefs.length }, (_, i) => i),
							formatLabel: (i) => trackingDefs[i]?.name,
						})}
					</div>
						</div>
					</div>
				{/if}
			</Popover.Content>
		</Popover.Root>
	</div>

	<header>
		<h1 class="type-sans-lg font-sans">Body Text Test Preview</h1>
		<p class="type-sans-sm font-sans">Focused test page for vertical sliders and rhythm.</p>
	</header>

	{#if fontMode === "sans"}
		<article class="space-y-4">
			<p
				class={`type-sans-base font-sans axes-sans ${gridClass}`}
				style={`--leading-units: ${sansUnits}`}
			>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<p
				class={`type-sans-base font-sans axes-sans ${gridClass}`}
				style={`--leading-units: ${sansUnits}; margin-top: calc(var(--rhythm) * 2)`}
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
				style={`--leading-units: ${monoUnits}`}
			>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<p
				class={`type-mono-base font-mono axes-mono ${gridClass}`}
				style={`--leading-units: ${monoUnits}; margin-top: calc(var(--rhythm) * 2)`}
			>
				Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
				pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
				mollit anim id est laborum.
			</p>
		</article>
	{/if}
</section>
