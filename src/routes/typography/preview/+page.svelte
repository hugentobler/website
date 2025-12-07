<script lang="ts">
	import {
		AnimatedNumber,
		Button,
		ButtonGroup,
		Checkbox,
		Output,
		Popover,
		Slider,
		ToggleGroup,
	} from "$lib/components/ui";
	import {
		BASELINE,
		FONTS,
		type FontId,
		type FontScale,
		type Size,
		TYPE_SCALES,
	} from "$lib/typography";
	import {
		BER_SLANT_RANGE,
		BER_WEIGHT_RANGE,
		BER_WIDTH_RANGE,
		getCenterValue,
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
	// State - Core editable data
	// =============================================================================

	let config = $state({
		baseline: BASELINE,
		typeScales: structuredClone(TYPE_SCALES),
	});

	// =============================================================================
	// State - UI controls
	// =============================================================================

	let ui = $state({
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

	// Popover state
	let anchorElement = $state<HTMLElement>();
	let popoverOpen = $state(true);

	// =============================================================================
	// Derived state
	// =============================================================================

	// Active Univers stretch value (clamped to valid range)
	const activeStretch = $derived(
		UNI_STRETCH[Math.max(0, Math.min(ui.uniStretchIdx, UNI_STRETCH.length - 1))]
	);

	// Allowed weights for the active stretch
	const allowedWeights = $derived(UNI_STRETCH_WEIGHTS[activeStretch] as readonly number[]);

	// Font variation settings for text preview
	const fontVariationSettings = $derived(
		ui.activeFont === "sans"
			? {
					fontFamily: FONTS.sans,
					fontStretch: activeStretch,
					fontWeight: ui.uniWeight,
					fontStyle: ui.uniItalic ? "italic" : "normal",
					fontVariationSettings: undefined,
				}
			: {
					fontFamily: FONTS.mono,
					fontStretch: undefined,
					fontWeight: undefined,
					fontStyle: undefined,
					fontVariationSettings: `"wdth" ${ui.berWidth}, "wght" ${ui.berWeight}, "slnt" ${ui.berSlant}`,
				}
	);

	// =============================================================================
	// Effects
	// =============================================================================

	// Clamp Univers weight when stretch changes
	$effect(() => {
		if (!allowedWeights.includes(ui.uniWeight)) {
			ui.uniWeight = allowedWeights.reduce((prev, curr) =>
				Math.abs(curr - ui.uniWeight) < Math.abs(prev - ui.uniWeight) ? curr : prev
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
		console.log(`[updateTypeScale] Before:`, config.typeScales[font][size][field]);

		// Direct mutation should work in Svelte 5 with $state
		config.typeScales[font][size][field] = value;

		console.log(`[updateTypeScale] After:`, config.typeScales[font][size][field]);
		console.log(
			`[updateTypeScale] Full state:`,
			JSON.stringify(config.typeScales[font][size], null, 2)
		);
	}
</script>

<!-- Responsive grid: 1 col mobile, 2 tablet, 3 desktop -->
<!-- Each set is: baseline spacer + 1fr typography column -->
<div
	class="m-5 grid auto-rows-min grid-cols-[var(--baseline)_1fr] divide-x divide-black *:border-black md:grid-cols-[repeat(2,var(--baseline)_1fr)] xl:grid-cols-[repeat(3,var(--baseline)_1fr)] [&>*:last-child]:border-r"
	style:--baseline="{config.baseline}px"
>
	{#each sizes as size}
		{@const scale = config.typeScales[ui.activeFont][size]}
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
				<p>{size}</p>
				<p>Font Name</p>
				<div class="flex justify-between">
					<p>{scale.fontSize} / {scale.lineHeight}</p>
					<div class="mt-auto flex gap-2">
						<!-- Font Size Control -->
						<ButtonGroup>
							<Button
								class="size-6 text-lg font-light"
								onclick={() => updateTypeScale(ui.activeFont, size, "fontSize", scale.fontSize - 1)}
								aria-label="Decrease font size"
							>
								−
							</Button>
							<Output class="h-6 px-2">
								<AnimatedNumber class="text-sm" value={scale.fontSize} />
							</Output>
							<Button
								class="size-6 text-lg font-light"
								onclick={() => updateTypeScale(ui.activeFont, size, "fontSize", scale.fontSize + 1)}
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
										ui.activeFont,
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
									updateTypeScale(ui.activeFont, size, "lineHeight", scale.lineHeight + 1)}
								aria-label="Increase line height"
							>
								+
							</Button>
						</ButtonGroup>
					</div>
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
					style:font-family={fontVariationSettings.fontFamily}
					style:font-stretch={fontVariationSettings.fontStretch}
					style:font-weight={fontVariationSettings.fontWeight}
					style:font-style={fontVariationSettings.fontStyle}
					style:font-variation-settings={fontVariationSettings.fontVariationSettings}
				>
					{SAMPLE_TEXT.concat(" ").repeat(10)}
				</div>
			</div>
		</div>
	{/each}
</div>

<!-- <div class="grid w-full grid-rows-2 overflow-x-auto">
	<div class="grid" style:grid-template-columns={gridCols} style:gap="{baseGridUnit * 12}px">
		<div class="w-24"></div>
		{#each typeSizes as size}
			{@const scale = typeScale[size]}
			<div class="flex flex-col gap-2 pl-3">
				<div class="text-sm font-medium uppercase">{size}</div>
				<div class="flex items-center gap-2">
					<label for="{size}-fontSize" class="text-xs">Size:</label>
					<input
						id="{size}-fontSize"
						type="number"
						value={scale.fontSize}
						onchange={(e) => updateTypeScale(size, "fontSize", Number(e.currentTarget.value))}
						min="8"
						max="96"
						step="1"
						class="border-input bg-background w-16 rounded border px-2 py-1 text-xs"
					/>
					<span class="text-muted-foreground text-xs">px</span>
				</div>
				<div class="flex items-center gap-2">
					<label for="{size}-lineUnits" class="text-xs">Units:</label>
					<input
						id="{size}-lineUnits"
						type="number"
						value={scale.lineUnits}
						onchange={(e) => updateTypeScale(size, "lineUnits", Number(e.currentTarget.value))}
						min="1"
						max="20"
						step="1"
						class="border-input bg-background w-16 rounded border px-2 py-1 text-xs"
					/>
				</div>
				<div class="flex items-center gap-2">
					<label for="{size}-rows" class="text-xs">Rows:</label>
					<input
						id="{size}-rows"
						type="number"
						value={scale.rows}
						onchange={(e) => updateTypeScale(size, "rows", Number(e.currentTarget.value))}
						min="1"
						max="10"
						step="1"
						class="border-input bg-background w-16 rounded border px-2 py-1 text-xs"
					/>
				</div>
				<div class="text-muted-foreground text-xs">
					<div>Line: {calculateLineBoxHeight(scale.lineUnits, baseGridUnit)}px</div>
					<div>
						LH: {calculateLineHeight(scale.fontSize, scale.lineUnits, baseGridUnit).toFixed(3)}
					</div>
				</div>
			</div>
		{/each}
	</div>
	<div
		class="box-content grid border-collapse border-t border-b border-dashed border-(--color-raspberry-300)"
		style:grid-template-columns={gridCols}
		style:height="{baseGridUnit * 12}px"
		style:gap="{baseGridUnit * 12}px"
	>
		<div class="w-24">Repetition Unit</div>
		{#each typeSizes as size}
			{@const scale = typeScale[size]}
			<div class="relative -my-px w-72 overflow-clip border-x border-x-(--color-charcoal-200) pl-3">
				<div
					class="grid h-full divide-y divide-(--color-charcoal-300) overflow-hidden border-y border-y-(--color-charcoal-300)"
					style:grid-template-rows="repeat({scale.rows}, 1fr)"
				>
					{#each Array(scale.rows) as _}
						<div></div>
					{/each}
				</div>
				<div
					class="absolute inset-0 pl-3"
					style:font-size="{scale.fontSize}px"
					style:line-height={scale.lineHeight / scale.fontSize}
					style:font-family={fontVariationSettings.fontFamily}
					style:font-stretch={fontVariationSettings.fontStretch}
					style:font-weight={fontVariationSettings.fontWeight}
					style:font-style={fontVariationSettings.fontStyle}
					style:font-variation-settings={fontVariationSettings.fontVariationSettings}
				>
					{SAMPLE_TEXT}
					{SAMPLE_TEXT}
					{SAMPLE_TEXT}
				</div>
			</div>
		{/each}
	</div>
</div> -->

<!-- Baseline Grid Control -->
<div class="bg-muted/50 container mx-auto mt-8 max-w-4xl rounded-lg border p-4">
	<div class="flex items-center gap-4">
		<label for="baseline" class="text-sm font-medium">Baseline Grid:</label>
		<input
			id="baseline"
			type="number"
			bind:value={config.baseline}
			min="12"
			max="144"
			step="6"
			class="border-input bg-background w-20 rounded border px-2 py-1 text-sm"
		/>
		<span class="text-muted-foreground text-sm">px</span>
		<span class="text-muted-foreground ml-4 text-xs">The vertical measure all text aligns to</span>
	</div>
</div>

<!-- Anchor element at bottom center -->
<!-- Debug: Active Font Display -->
<div class="fixed right-6 bottom-6 z-50 rounded border bg-white p-4 shadow-lg">
	<div class="font-mono text-sm">
		<div>Active Font: {ui.activeFont}</div>
		<div>Base fontSize: {config.typeScales[ui.activeFont].base.fontSize}px</div>
		<div>Base lineHeight: {config.typeScales[ui.activeFont].base.lineHeight}px</div>
	</div>
	<div class="mt-2">
		<select bind:value={ui.activeFont} class="border p-1">
			{#each fonts as [value, label]}
				<option {value}>{label}</option>
			{/each}
		</select>
	</div>
</div>

<!-- POPOVER DISABLED FOR DEBUGGING -->
<!--
<div class="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
	<div
		bind:this={anchorElement}
		class="bg-muted text-muted-foreground rounded-full px-4 py-2 text-sm font-medium shadow-md"
	>
		Anchor Point
	</div>
</div>

<div class="fixed right-6 bottom-6 z-50">
	<Popover bind:open={popoverOpen} side="top" customAnchor={anchorElement}>
		{#snippet trigger()}
			Trigger (opens above anchor)
		{/snippet}
		<div class="grid grid-cols-3 grid-rows-[auto_minmax(12rem,1fr)] gap-4">
			<div>
				<ToggleGroup
					bind:value={ui.activeFont}
					options={fonts.map(([value, label]) => ({ value, label }))}
				/>
			</div>
			{#if ui.activeFont === "sans"}
				<div class="row-start-2 flex flex-col items-center gap-2">
					<p>Stretch</p>
					<Slider
						orientation="vertical"
						bind:value={ui.uniStretchIdx}
						step={UNI_STRETCH.map((_, i) => i)}
						tickLabels={UNI_STRETCH}
						hideThumbLabels
					/>
				</div>
				<div class="row-start-2 flex flex-col items-center gap-2">
					<p>Weight</p>
					<Slider
						orientation="vertical"
						min={UNI_WEIGHTS[0]}
						max={UNI_WEIGHTS[UNI_WEIGHTS.length - 1]}
						step={[...UNI_WEIGHTS]}
						bind:value={ui.uniWeight}
						tickLabels={UNI_WEIGHTS.map((w) => (allowedWeights.includes(w) ? w : undefined))}
						hideThumbLabels
					/>
				</div>
				<div class="row-start-2 flex items-center gap-2">
					<Checkbox bind:checked={ui.uniItalic} label="Italic" />
				</div>
			{/if}
			{#if ui.activeFont === "mono"}
				{@const weightValues = rangeValues(BER_WEIGHT_RANGE)}
				{@const slantValues = rangeValues(BER_SLANT_RANGE)}
				<div class="row-start-2 flex flex-col items-center gap-2">
					<p>Width</p>
					<Slider
						orientation="vertical"
						bind:value={ui.berWidth}
						min={BER_WIDTH_RANGE.min}
						max={BER_WIDTH_RANGE.max}
						step={BER_WIDTH_RANGE.step}
						tickLabels={rangeValues(BER_WIDTH_RANGE)}
						hideThumbLabels
					/>
				</div>
				<div class="row-start-2 flex flex-col items-center gap-2">
					<p>Weight</p>
					<Slider
						orientation="vertical"
						bind:value={ui.berWeight}
						min={BER_WEIGHT_RANGE.min}
						max={BER_WEIGHT_RANGE.max}
						step={BER_WEIGHT_RANGE.step}
						tickLabels={weightValues.map((w, i) =>
							i === 0 || i === weightValues.length - 1 ? w : undefined
						)}
					/>
				</div>
				<div class="row-start-2 flex flex-col items-center gap-2">
					<p>Slant</p>
					<Slider
						orientation="vertical"
						bind:value={ui.berSlant}
						min={BER_SLANT_RANGE.min}
						max={BER_SLANT_RANGE.max}
						step={BER_SLANT_RANGE.step}
						tickLabels={slantValues.map((w, i) =>
							i === 0 || i === slantValues.length - 1 ? w : undefined
						)}
					/>
				</div>
			{/if}
		</div>
	</Popover>
</div>
-->
