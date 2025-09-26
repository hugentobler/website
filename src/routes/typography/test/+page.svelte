<script lang="ts">
	import { Popover, Slider } from "bits-ui";

	// Global state
	let fontMode = $state<"sans" | "mono">("sans");
	let gridOn = $state<boolean>(true);
	let gridClass = $derived(gridOn ? "baseline-grid-major" : "");
	let rhythm = $state<number>(6);

	// Sans controls (Univers)
	let sansSize = $state<number>(17);
	let sansUnits = $state<number>(4);
	let sansLeading = $derived(rhythm * sansUnits);
	const sansStretchDefs = [
		{ value: "ultra-condensed", weights: [200, 300, 400] },
		{ value: "condensed", weights: [300, 400, 600] },
		{ value: "normal", weights: [300, 400, 600] },
		{ value: "expanded", weights: [400] },
	] as const;
	type SansStretch = (typeof sansStretchDefs)[number]["value"];
	let sansStretchIdx = $state<number>(2);
	let sansStretch = $derived<SansStretch>(sansStretchDefs[sansStretchIdx].value);
	let sansWeight = $state<number>(400); // constrained via stretch
	let sansTracking = $state<number>(0); // percent (-5..10) -> em
	let sansItalic = $state<boolean>(false);

	const currentSansWeights = $derived<readonly number[]>(sansStretchDefs[sansStretchIdx].weights);

	function formatStretchLabel(v: SansStretch) {
		return v
			.split("-")
			.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
			.join("-");
	}

	// Mono controls (Berkeley Mono Variable)
	let monoSize = $state<number>(16);
	let monoUnits = $state<number>(4);
	let monoLeading = $derived(rhythm * monoUnits);
	let monoWght = $state<number>(400);
	let monoWdth = $state<number>(100); // percent 60..100
	let monoSlnt = $state<number>(0); // deg -16..0
	let monoTracking = $state<number>(0); // percent -5..10 -> em

	$effect(() => {
		const r = document.documentElement;
		r.style.setProperty("--rhythm", `${rhythm}px`);

		// apply base tokens
		r.style.setProperty("--sans-text-base", `${sansSize}px`);
		r.style.setProperty("--sans-leading-base", `${sansLeading}px`);
		r.style.setProperty("--mono-text-base", `${monoSize}px`);
		r.style.setProperty("--mono-leading-base", `${monoLeading}px`);

		// constrain weight to available options for current stretch
		const opts = currentSansWeights;
		if (!opts.includes(sansWeight)) {
			const snap = opts.reduce(
				(p, c) => (Math.abs(c - sansWeight) < Math.abs(p - sansWeight) ? c : p),
				opts[0]
			);
			sansWeight = snap;
		}

		const sansTrackingEm = `${(sansTracking / 100).toFixed(3)}em`;
		const monoTrackingEm = `${(monoTracking / 100).toFixed(3)}em`;

		r.style.setProperty("--sans-weight", `${sansWeight}`);
		r.style.setProperty("--sans-stretch", `${sansStretch}`);
		r.style.setProperty("--sans-style", sansItalic ? "italic" : "normal");
		r.style.setProperty("--sans-tracking", sansTrackingEm);

		r.style.setProperty("--mono-wght", `${monoWght}`);
		r.style.setProperty("--mono-stretch", `${monoWdth}%`);
		r.style.setProperty("--mono-slnt", `${monoSlnt}deg`);
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
	labels,
}: {
	value: number;
	setValue: (v: number) => void;
	availableValues: readonly number[];
	labels?: Record<number, string>;
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
			{step}
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
				{#each tickItems as { index, value } (index)}
					<Slider.Tick {index} class="dark:bg-background/20 bg-background z-1 h-2 w-[1px]" />
					<Slider.TickLabel
						{index}
						class="text-muted-foreground data-bounded:text-foreground ml-5 text-sm font-medium leading-none"
						position="right">{labels?.[value] ?? value}</Slider.TickLabel
					>
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
									labels: Object.fromEntries(
										sansStretchDefs.map((def, i) => [i, formatStretchLabel(def.value)])
									),
								})}
							</div>
							<!-- Weight -->
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
								{@render slider({
									value: sansWeight,
									setValue: (v) => (sansWeight = v),
									availableValues: currentSansWeights,
								})}
							</div>
							<!-- Tracking -->
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
								{@render slider({
									value: sansTracking,
									setValue: (v) => (sansTracking = v),
									availableValues: Array.from({ length: 16 }, (_, i) => i - 5),
									labels: {
										[-5]: "-0.05em",
										[0]: "0em",
										[10]: "0.10em",
									},
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
									availableValues: Array.from({ length: 17 }, (_, i) => 100 + i * 50),
								})}
							</div>
							<!-- Mono width -->
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
								{@render slider({
									value: monoWdth,
									setValue: (v) => (monoWdth = v),
									availableValues: Array.from({ length: 41 }, (_, i) => 60 + i),
									labels: {
										[60]: "60%",
										[80]: "80%",
										[100]: "100%",
									},
								})}
							</div>
							<!-- Mono slant -->
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
								{@render slider({
									value: monoSlnt,
									setValue: (v) => (monoSlnt = v),
									availableValues: Array.from({ length: 17 }, (_, i) => -16 + i),
									labels: {
										[-16]: "-16°",
										[-8]: "-8°",
										[0]: "0°",
									},
								})}
							</div>
							<!-- Mono tracking -->
							<div class="grid grid-cols-[auto_1fr] gap-3 items-center">
								{@render slider({
									value: monoTracking,
									setValue: (v) => (monoTracking = v),
									availableValues: Array.from({ length: 16 }, (_, i) => i - 5),
									labels: {
										[-5]: "-0.05em",
										[0]: "0em",
										[10]: "0.10em",
									},
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
