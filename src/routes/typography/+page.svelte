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
	import { BASELINE, FONTS, type FontId, type Size, TYPE_SCALES } from "$lib/typography";
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
	// State - All preview settings (nothing exports, just for testing)
	// =============================================================================

	let settings = $state({
		// Type scale settings
		baseline: BASELINE,
		typeScales: structuredClone(TYPE_SCALES),
		// Active font
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

	// Active Univers stretch value (clamped to valid range)
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
					previewFontSettings: undefined,
				}
			: {
					fontFamily: FONTS.mono,
					fontStretch: undefined,
					fontWeight: undefined,
					fontStyle: undefined,
					previewFontSettings: `"wdth" ${settings.berWidth}, "wght" ${settings.berWeight}, "slnt" ${settings.berSlant}`,
				}
	);

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
		console.log(`[updateTypeScale] font=${font}, size=${size}, field=${field}, value=${value}`);
		console.log(`[updateTypeScale] Before:`, settings.typeScales[font][size][field]);

		// Direct mutation should work in Svelte 5 with $state
		settings.typeScales[font][size][field] = value;

		console.log(`[updateTypeScale] After:`, settings.typeScales[font][size][field]);
		console.log(
			`[updateTypeScale] Full state:`,
			JSON.stringify(settings.typeScales[font][size], null, 2)
		);
	}
</script>

<!-- Responsive grid: 1 col mobile, 2 tablet, 3 desktop -->
<!-- Each set is: baseline spacer + 1fr typography column -->
<div
	class="m-5 grid auto-rows-min grid-cols-[var(--baseline)_1fr] divide-x divide-black *:border-black md:grid-cols-[repeat(2,var(--baseline)_1fr)] xl:grid-cols-[repeat(3,var(--baseline)_1fr)] [&>*:last-child]:border-r"
	style:--baseline="{settings.baseline}px"
>
	{#each sizes as size}
		{@const scale = settings.typeScales[settings.activeFont][size]}
		{@const position = sizes.indexOf(size)}

		<!-- Spacer column -->
		<div>
			<div class="h-40"></div>
			<div
				class="divide-y divide-black *:border-dotted [&>*:first-child]:border-t [&>*:last-child]:border-b"
			>
				{#each Array(PREVIEW_ROWS) as _}
					<div style:height="{BASELINE}px"></div>
				{/each}
			</div>
		</div>

		<!-- Typography column -->
		<div class="flex flex-col">
			<div class="flex h-40 flex-col p-4">
				<p class="text-sm font-medium uppercase">{size}</p>
				<p class="text-xs text-gray-600">{FONTS[settings.activeFont]}</p>
				<div class="mt-1 text-xs">
					<div class="font-mono">
						<span class="text-gray-500">px:</span>
						{scale.fontSize} / {scale.lineHeight}
					</div>
					<div class="font-mono text-gray-600">
						<span class="text-gray-400">rem:</span>
						{pxToRem(scale.fontSize).toFixed(3)} / {(scale.lineHeight / scale.fontSize).toFixed(3)}
					</div>
				</div>
				<div class="mt-auto flex gap-2">
					<!-- Font Size Control -->
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
					<!-- Line Height Control -->
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
			<div
				class="relative divide-y divide-black *:border-dotted [&>*:first-child]:border-t [&>*:last-child]:border-b"
			>
				{#each Array(PREVIEW_ROWS) as _}
					<div style:height="{BASELINE}px" class="relative">
						<!-- Grid lines (behind) -->
						<div class="absolute inset-0 left-4 divide-y divide-black *:border-dashed">
							{#each Array(position + 2) as _}
								<div style:height="{BASELINE / (position + 2)}px"></div>
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
					style:font-variation-settings={previewFontSettings.previewFontSettings}
				>
					{SAMPLE_TEXT.concat(" ").repeat((position + 1) * 4)}
				</div>
			</div>
		</div>
	{/each}

	<!-- Font Controls (6th item) -->
	<!-- Spacer column -->
	<div>
		<div class="h-40"></div>
		<div
			class="divide-y divide-black *:border-dotted [&>*:first-child]:border-t [&>*:last-child]:border-b"
		>
			{#each Array(PREVIEW_ROWS) as _}
				<div style:height="{BASELINE}px"></div>
			{/each}
		</div>
	</div>

	<!-- Controls column -->
	<div class="flex flex-col gap-4 border-y border-black p-4">
		<p class="text-sm font-medium uppercase">Controls</p>

		<!-- Baseline Grid Control -->
		<div class="flex flex-col gap-2">
			<p class="text-xs font-medium">Baseline Grid</p>
			<ButtonGroup>
				<Button
					class="size-6 text-lg font-light"
					onclick={() => (settings.baseline = Math.max(6, settings.baseline - 6))}
					aria-label="Decrease baseline"
				>
					−
				</Button>
				<Output class="h-6 px-2">
					<AnimatedNumber class="text-sm" value={settings.baseline} />
				</Output>
				<Button
					class="size-6 text-lg font-light"
					onclick={() => (settings.baseline = Math.min(144, settings.baseline + 6))}
					aria-label="Increase baseline"
				>
					+
				</Button>
			</ButtonGroup>
		</div>

		<!-- Font Toggle -->
		<div>
			<ToggleGroup
				bind:value={settings.activeFont}
				options={fonts.map(([value, label]) => ({ value, label }))}
			/>
		</div>

		<!-- Sliders -->
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
		<a href="https://www.daybreak.studio/writing/adaline-typography">Daybreak Studio</a>
	</div>
</div>

<!-- =============================================================================
     Real Layout Test: Header + Body with baseline grid
     ============================================================================= -->
<div class="relative m-5 mt-16 grid grid-cols-[1fr_2fr] gap-baseline border-t border-black pt-8">
	<!-- Baseline grid overlay -->
	<div
		class="pointer-events-none absolute inset-0 pt-8"
		style:background-image="repeating-linear-gradient(
			to bottom,
			transparent,
			transparent calc(var(--spacing-baseline) - 1px),
			rgba(0, 0, 0, 0.1) calc(var(--spacing-baseline) - 1px),
			rgba(0, 0, 0, 0.1) var(--spacing-baseline)
		)"
	></div>

	<!-- Left: Header -->
	<div>
		<h2 class="font-sans type-lg">A new approach to typography</h2>
	</div>

	<!-- Right: Body text -->
	<div>
		<p class="font-sans type-base">
			Typography serves language, not the convenience of a system. The strongest type systems are
			specific, opinionated, and crafted with care for the context they serve. For many designers,
			typography is a first love. In the pages of design books and type manuals, the environment
			feels steady. Columns, baselines, and margins hold firm.
		</p>
	</div>
</div>
