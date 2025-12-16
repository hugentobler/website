<script lang="ts">
	import {
		AnimatedNumber,
		Button,
		ButtonGroup,
		Checkbox,
		Output,
		Slider,
		ToggleGroup,
	} from "$lib/components/ui";
	import { FONTS, type FontId, getBaseline, type Size, TYPE_SCALES } from "$lib/typography";
	import {
		BER_SLANT_RANGE,
		BER_WEIGHT_RANGE,
		BER_WIDTH_RANGE,
		getCenterValue,
		pxToRem,
		rangeValues,
		SAMPLE_TEXT,
		UNI_STRETCH,
		UNI_STRETCH_WEIGHTS,
		UNI_WEIGHTS,
	} from "./config";

	// =============================================================================
	// Constants
	// =============================================================================

	const fonts = Object.entries(FONTS) as [FontId, string][];
	const sizes = Object.keys(TYPE_SCALES.sans) as Size[];
	const PREVIEW_ROWS = 3;

	// Default values for font variation controls
	const DEFAULT_UNI_STRETCH_IDX = 1; // "condensed"
	const DEFAULT_UNI_WEIGHT = getCenterValue(UNI_STRETCH_WEIGHTS[UNI_STRETCH[1]]);
	const DEFAULT_BER_WIDTH = getCenterValue(rangeValues(BER_WIDTH_RANGE));
	const DEFAULT_BER_WEIGHT = getCenterValue(rangeValues(BER_WEIGHT_RANGE));
	const DEFAULT_BER_SLANT = BER_SLANT_RANGE.max;

	// =============================================================================
	// State
	// =============================================================================

	let settings = $state({
		typeScales: structuredClone(TYPE_SCALES),
		activeFont: "sans" as FontId,
		// Univers variation controls
		uniStretchIdx: DEFAULT_UNI_STRETCH_IDX,
		uniWeight: DEFAULT_UNI_WEIGHT,
		uniItalic: false,
		// Berkeley Mono variation controls
		berWidth: DEFAULT_BER_WIDTH,
		berWeight: DEFAULT_BER_WEIGHT,
		berSlant: DEFAULT_BER_SLANT,
	});

	// =============================================================================
	// Derived state
	// =============================================================================

	// Baseline = base.lineHeight (derived from active font)
	const baseline = $derived(settings.typeScales[settings.activeFont].base.lineHeight);

	// Active Univers stretch value
	const currentStretch = $derived(
		UNI_STRETCH[Math.max(0, Math.min(settings.uniStretchIdx, UNI_STRETCH.length - 1))]
	);

	// Allowed weights for the active stretch
	const validWeights = $derived(UNI_STRETCH_WEIGHTS[currentStretch] as readonly number[]);

	// Font variation settings for text preview
	const previewFontSettings = $derived(
		settings.activeFont === "sans"
			? {
					fontFamily: FONTS.sans,
					fontStretch: currentStretch,
					fontWeight: settings.uniWeight,
					fontStyle: settings.uniItalic ? "italic" : "normal",
					fontVariationSettings: undefined,
				}
			: {
					fontFamily: FONTS.mono,
					fontStretch: undefined,
					fontWeight: undefined,
					fontStyle: undefined,
					fontVariationSettings: `"wdth" ${settings.berWidth}, "wght" ${settings.berWeight}, "slnt" ${settings.berSlant}`,
				}
	);

	// =============================================================================
	// Helpers
	// =============================================================================

	/** Format baseline multiple (e.g., "2×" or "0.79×") */
	function formatMultiple(lineHeight: number): string {
		const multiple = lineHeight / baseline;
		if (multiple === 1) return "1× (baseline)";
		if (Number.isInteger(multiple)) return `${multiple}×`;
		return `${multiple.toFixed(2)}×`;
	}

	// =============================================================================
	// Effects
	// =============================================================================

	// Clamp Univers weight when stretch changes
	$effect(() => {
		if (!validWeights.includes(settings.uniWeight)) {
			settings.uniWeight = validWeights.reduce((prev, curr) =>
				Math.abs(curr - settings.uniWeight) < Math.abs(prev - settings.uniWeight) ? curr : prev
			);
		}
	});

	// =============================================================================
	// Actions
	// =============================================================================

	function updateTypeScale(
		font: FontId,
		size: Size,
		field: "fontSize" | "lineHeight",
		value: number
	) {
		settings.typeScales[font][size][field] = value;
	}
</script>

<!-- =============================================================================
     Type Scale Preview Grid
     ============================================================================= -->
<div
	class="m-5 grid auto-rows-min grid-cols-[var(--type-baseline)_1fr] divide-x divide-black *:border-black md:grid-cols-[repeat(2,var(--type-baseline)_1fr)] xl:grid-cols-[repeat(3,var(--type-baseline)_1fr)] [&>*:last-child]:border-r"
	style:--baseline="{baseline}px"
>
	{#each sizes as size}
		{@const scale = settings.typeScales[settings.activeFont][size]}
		{@const position = sizes.indexOf(size)}
		{@const isBase = size === "base"}

		<!-- Spacer column (baseline width) -->
		<div>
			<div class="h-40"></div>
			<div
				class="divide-y divide-black *:border-dotted [&>*:first-child]:border-t [&>*:last-child]:border-b"
			>
				{#each Array(PREVIEW_ROWS) as _}
					<div style:height="calc(var(--baseline) * 4)"></div>
				{/each}
			</div>
		</div>

		<!-- Typography column -->
		<div class="flex flex-col">
			<!-- Header with size info -->
			<div class="flex h-40 flex-col p-4" class:bg-amber-50={isBase}>
				<div class="flex items-center gap-2">
					<p class="text-sm font-medium uppercase">{size}</p>
					{#if isBase}
						<span class="rounded bg-amber-200 px-1.5 py-0.5 text-xs">anchor</span>
					{/if}
				</div>
				<p class="text-xs text-gray-600">{FONTS[settings.activeFont]}</p>

				<!-- Metrics display -->
				<div class="mt-1 text-xs">
					<div class="font-mono">
						<span class="text-gray-500">px:</span>
						{scale.fontSize} / {scale.lineHeight}
						<span class="text-gray-400">({formatMultiple(scale.lineHeight)})</span>
					</div>
					<div class="font-mono text-gray-600">
						<span class="text-gray-400">rem:</span>
						{pxToRem(scale.fontSize).toFixed(3)} / {(scale.lineHeight / scale.fontSize).toFixed(3)}
					</div>
				</div>

				<!-- Controls -->
				<div class="mt-auto flex gap-2">
					<!-- Font Size -->
					<ButtonGroup>
						<Button
							class="size-6 text-lg font-light"
							onclick={() =>
								updateTypeScale(settings.activeFont, size, "fontSize", scale.fontSize - 1)}
							aria-label="Decrease font size"
						>
							−
						</Button>
						<Output class="h-6 px-2">
							<AnimatedNumber class="text-sm" value={scale.fontSize} />
						</Output>
						<Button
							class="size-6 text-lg font-light"
							onclick={() =>
								updateTypeScale(settings.activeFont, size, "fontSize", scale.fontSize + 1)}
							aria-label="Increase font size"
						>
							+
						</Button>
					</ButtonGroup>
					<!-- Line Height -->
					<ButtonGroup>
						<Button
							class="size-6 text-lg font-light"
							onclick={() =>
								updateTypeScale(
									settings.activeFont,
									size,
									"lineHeight",
									Math.max(1, scale.lineHeight - 1)
								)}
							aria-label="Decrease line height"
						>
							−
						</Button>
						<Output class="h-6 px-2">
							<AnimatedNumber class="text-sm" value={scale.lineHeight} />
						</Output>
						<Button
							class="size-6 text-lg font-light"
							onclick={() =>
								updateTypeScale(settings.activeFont, size, "lineHeight", scale.lineHeight + 1)}
							aria-label="Increase line height"
						>
							+
						</Button>
					</ButtonGroup>
				</div>
			</div>

			<!-- Text preview area -->
			<div
				class="relative divide-y divide-black *:border-dotted [&>*:first-child]:border-t [&>*:last-child]:border-b"
			>
				{#each Array(PREVIEW_ROWS) as _}
					<div style:height="calc(var(--baseline) * 4)" class="relative">
						<!-- Sub-grid lines -->
						<div class="absolute inset-0 left-4 divide-y divide-black *:border-dashed">
							{#each Array(position + 2) as _}
								<div style:height={`calc(var(--baseline) * 4 / ${position + 2})`}></div>
							{/each}
						</div>
					</div>
				{/each}
				<!-- Text preview -->
				<div
					class="absolute inset-0 left-4 overflow-hidden"
					style:font-size="{scale.fontSize}px"
					style:line-height={scale.lineHeight / scale.fontSize}
					style:font-family={previewFontSettings.fontFamily}
					style:font-stretch={previewFontSettings.fontStretch}
					style:font-weight={previewFontSettings.fontWeight}
					style:font-style={previewFontSettings.fontStyle}
					style:font-variation-settings={previewFontSettings.fontVariationSettings}
				>
					{SAMPLE_TEXT.concat(" ").repeat((position + 1) * 4)}
				</div>
			</div>
		</div>
	{/each}

	<!-- Controls Panel (6th grid item) -->
	<div>
		<div class="h-40"></div>
		<div
			class="divide-y divide-black *:border-dotted [&>*:first-child]:border-t [&>*:last-child]:border-b"
		>
			{#each Array(PREVIEW_ROWS) as _}
				<div style:height="calc(var(--baseline) * 4)"></div>
			{/each}
		</div>
	</div>

	<div class="flex flex-col gap-4 border-y border-black p-4">
		<p class="text-sm font-medium uppercase">Controls</p>

		<!-- Baseline display (derived, read-only) -->
		<div class="flex flex-col gap-1">
			<p class="text-xs font-medium">Baseline (= base.lineHeight)</p>
			<div class="font-mono text-sm">
				{baseline}px
			</div>
		</div>

		<!-- Font Toggle -->
		<div>
			<ToggleGroup
				bind:value={settings.activeFont}
				options={fonts.map(([value, label]) => ({ value, label }))}
			/>
		</div>

		<!-- Font Variation Sliders -->
		<div class="flex-1">
			{#if settings.activeFont === "sans"}
				<div class="flex h-full gap-4">
					<div class="flex flex-col items-center gap-2">
						<p class="text-xs font-medium">Stretch</p>
						<Slider
							orientation="vertical"
							bind:value={settings.uniStretchIdx}
							step={UNI_STRETCH.map((_, i) => i)}
							tickLabels={UNI_STRETCH}
							hideThumbLabels
							class="h-full"
						/>
					</div>
					<div class="flex flex-col items-center gap-2">
						<p class="text-xs font-medium">Weight</p>
						<Slider
							orientation="vertical"
							min={UNI_WEIGHTS[0]}
							max={UNI_WEIGHTS[UNI_WEIGHTS.length - 1]}
							step={[...UNI_WEIGHTS]}
							bind:value={settings.uniWeight}
							tickLabels={UNI_WEIGHTS.map((w) => (validWeights.includes(w) ? w : undefined))}
							hideThumbLabels
							class="h-full"
						/>
					</div>
					<div class="flex items-end">
						<Checkbox bind:checked={settings.uniItalic} label="Italic" />
					</div>
				</div>
			{/if}
			{#if settings.activeFont === "mono"}
				{@const weightValues = rangeValues(BER_WEIGHT_RANGE)}
				{@const slantValues = rangeValues(BER_SLANT_RANGE)}
				<div class="flex h-full gap-4">
					<div class="flex flex-col items-center gap-2">
						<p class="text-xs font-medium">Width</p>
						<Slider
							orientation="vertical"
							bind:value={settings.berWidth}
							min={BER_WIDTH_RANGE.min}
							max={BER_WIDTH_RANGE.max}
							step={BER_WIDTH_RANGE.step}
							tickLabels={rangeValues(BER_WIDTH_RANGE)}
							hideThumbLabels
							class="h-full"
						/>
					</div>
					<div class="flex flex-col items-center gap-2">
						<p class="text-xs font-medium">Weight</p>
						<Slider
							orientation="vertical"
							bind:value={settings.berWeight}
							min={BER_WEIGHT_RANGE.min}
							max={BER_WEIGHT_RANGE.max}
							step={BER_WEIGHT_RANGE.step}
							tickLabels={weightValues.map((w, i) =>
								i === 0 || i === weightValues.length - 1 ? w : undefined
							)}
							class="h-full"
						/>
					</div>
					<div class="flex flex-col items-center gap-2">
						<p class="text-xs font-medium">Slant</p>
						<Slider
							orientation="vertical"
							bind:value={settings.berSlant}
							min={BER_SLANT_RANGE.min}
							max={BER_SLANT_RANGE.max}
							step={BER_SLANT_RANGE.step}
							tickLabels={slantValues.map((w, i) =>
								i === 0 || i === slantValues.length - 1 ? w : undefined
							)}
							class="h-full"
						/>
					</div>
				</div>
			{/if}
		</div>

		<!-- Credit -->
		<a href="https://www.daybreak.studio/writing/adaline-typography" class="text-xs text-gray-500">
			Inspired by Daybreak Studio
		</a>
	</div>
</div>

<!-- =============================================================================
     Real Layout Test
     ============================================================================= -->
<div class="gap-baseline relative m-5 mt-16 grid grid-cols-[1fr_2fr] border-t border-black pt-8">
	<!-- Baseline grid overlay -->
	<div
		class="pointer-events-none absolute inset-0 pt-8"
		style:background-image="repeating-linear-gradient( to bottom, transparent, transparent {baseline -
			1}px, rgba(0, 0, 0, 0.1) {baseline - 1}px, rgba(0, 0, 0, 0.1) {baseline}px )"
	></div>

	<!-- Left: Header -->
	<div>
		<h2 class="type-lg font-sans">A new approach to typography</h2>
	</div>

	<!-- Right: Body text -->
	<div>
		<p class="type-base font-sans">
			Typography serves language, not the convenience of a system. The strongest type systems are
			specific, opinionated, and crafted with care for the context they serve. For many designers,
			typography is a first love. In the pages of design books and type manuals, the environment
			feels steady. Columns, baselines, and margins hold firm.
		</p>
	</div>
</div>
