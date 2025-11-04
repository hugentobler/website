<script lang="ts">
	import { Button, Checkbox, Output, Popover, Slider, ToggleGroup } from "$lib/components/ui";
	import {
		BER_SLANT_RANGE,
		BER_WEIGHT_RANGE,
		BER_WIDTH_RANGE,
		FONTS,
		getCenterValue,
		rangeValues,
		UNI_STRETCH,
		UNI_STRETCH_WEIGHTS,
		UNI_WEIGHTS,
	} from "$lib/typography/config";
	import {
		calculateLineBoxHeight,
		calculateLineHeight,
		DEFAULT_BASE_GRID_UNIT,
		DEFAULT_TYPE_SCALE,
		getTypeSizes,
		SAMPLE_TEXT,
		type TypeSize,
	} from "$lib/typography/type-scale";

	type FontKey = keyof typeof FONTS;
	const fonts = Object.entries(FONTS) as [FontKey, string][];

	// Base grid unit
	let baseGridUnit = $state(DEFAULT_BASE_GRID_UNIT);

	// Number of vertical rhythm rows to preview
	let previewRows = $state(3);

	// Type scale state (mutable copy of default scale)
	let typeScale = $state(structuredClone(DEFAULT_TYPE_SCALE));

	// Derived: ordered type sizes and grid columns
	const typeSizes = $derived(getTypeSizes());
	const gridCols = $derived(`auto ${typeSizes.map(() => "1fr").join(" ")}`);

	// Font toggle (allow empty)
	let activeFont = $state<FontKey | "">("UNI");
	let activeFontHistory = $state<FontKey>("UNI");
	$effect(() => {
		if (activeFont !== "") activeFontHistory = activeFont as FontKey;
	});

	// Derived UI state
	const selectedFont = $derived(activeFont === "" ? activeFontHistory : activeFont);
	const slidersDisabled = $derived(activeFont === "");

	// Slider states
	let UniStretchIdx = $state<number>(1);
	let UniWeight = $state<number>(getCenterValue(UNI_STRETCH_WEIGHTS[UNI_STRETCH[1]]));
	let UniItalic = $state<boolean>(false);
	let BerWidth = $state<number>(getCenterValue(rangeValues(BER_WIDTH_RANGE)));
	let BerWeight = $state<number>(getCenterValue(rangeValues(BER_WEIGHT_RANGE)));
	let BerSlant = $state<number>(BER_SLANT_RANGE.max);

	// Allowed weights for the active stretch; clamp weight on stretch change
	const activeStretch = $derived(
		UNI_STRETCH[Math.max(0, Math.min(UniStretchIdx, UNI_STRETCH.length - 1))]
	);
	const allowedWeights = $derived(UNI_STRETCH_WEIGHTS[activeStretch] as readonly number[]);
	$effect(() => {
		if (!allowedWeights.includes(UniWeight)) {
			UniWeight = allowedWeights.reduce((prev, curr) =>
				Math.abs(curr - UniWeight) < Math.abs(prev - UniWeight) ? curr : prev
			);
		}
	});

	// Custom anchor for popover
	let anchorElement = $state<HTMLElement>();

	// Helper to update a specific size in the type scale
	function updateTypeScale(
		size: TypeSize,
		field: "fontSize" | "lineUnits" | "rows",
		value: number
	) {
		typeScale[size][field] = value;
	}

	// Derived: font variation settings for specimens
	const fontVariationSettings = $derived(
		selectedFont === "UNI"
			? {
					fontFamily: FONTS.UNI,
					fontStretch: activeStretch,
					fontWeight: UniWeight,
					fontStyle: UniItalic ? "italic" : "normal",
					fontVariationSettings: undefined,
				}
			: {
					fontFamily: FONTS.BER,
					fontStretch: undefined,
					fontWeight: undefined,
					fontStyle: undefined,
					fontVariationSettings: `"wdth" ${BerWidth}, "wght" ${BerWeight}, "slnt" ${BerSlant}`,
				}
	);
</script>

<div class="my-5 w-full overflow-x-scroll pb-4">
	<!-- Type scale controls row -->
	<div
		class="grid"
		style:grid-template-columns="auto repeat({typeSizes.length}, 1fr {baseGridUnit * 12}px)"
	>
		<div class="w-24" style:grid-column="1"></div>
		{#each typeSizes as size, i}
			{@const scale = typeScale[size]}
			{@const colStart = 2 + i * 2}
			{@const colEnd = colStart + 1}
			<div class="flex w-72 flex-col gap-2 pl-3" style:grid-column="{colStart} / {colEnd}">
				<div class="text-sm font-medium uppercase">{size}</div>
				<!-- Font Size Control -->
				<div class="flex items-center gap-2">
					<Button
						class="h-6 w-6 text-xs"
						onclick={() => updateTypeScale(size, "fontSize", scale.fontSize - 1)}
						aria-label="Decrease font size"
					>
						−
					</Button>
					<Output class="w-12 text-center">
						{scale.fontSize}px
					</Output>
					<Button
						class="h-6 w-6 text-xs"
						onclick={() => updateTypeScale(size, "fontSize", scale.fontSize + 1)}
						aria-label="Increase font size"
					>
						+
					</Button>
				</div>
				<!-- Line Units Control -->
				<div class="flex items-center gap-2">
					<Button
						class="h-6 w-6 text-xs"
						onclick={() => updateTypeScale(size, "lineUnits", Math.max(1, scale.lineUnits - 1))}
						aria-label="Decrease line units"
					>
						−
					</Button>
					<Output class="w-12 text-center">
						{scale.lineUnits}u
					</Output>
					<Button
						class="h-6 w-6 text-xs"
						onclick={() => updateTypeScale(size, "lineUnits", scale.lineUnits + 1)}
						aria-label="Increase line units"
					>
						+
					</Button>
				</div>
				<!-- Calculated values -->
				<div class="text-muted-foreground text-xs">
					<div>
						LH: {calculateLineHeight(scale.fontSize, scale.lineUnits, baseGridUnit).toFixed(3)}
					</div>
				</div>
			</div>
		{/each}
	</div>
	<!-- Preview grid -->
	<div
		class="grid grid-flow-col"
		style:grid-template-columns="auto repeat({typeSizes.length}, 1fr {baseGridUnit * 12}px)"
		style:grid-template-rows="repeat({previewRows}, {baseGridUnit * 12}px)"
	>
		<div class="row-span-full w-24" style:grid-column="1">Preview</div>
		{#each typeSizes as size, i}
			{@const scale = typeScale[size]}
			{@const totalRows = scale.rows * previewRows}
			{@const colStart = 2 + i * 2}
			{@const colEnd = colStart + 1}
			<div
				class="relative row-span-full w-72 overflow-clip border-x border-x-(--color-charcoal-300) pl-3"
				style:grid-column="{colStart} / {colEnd}"
			>
				<div class="grid h-full" style:grid-template-rows="repeat({totalRows}, 1fr)">
					{#each Array(totalRows) as _}
						<div class="border-t border-(--color-charcoal-300) last-of-type:border-b"></div>
					{/each}
				</div>
				<div
					class="absolute inset-0 pl-3"
					style:font-size="{scale.fontSize}px"
					style:line-height={calculateLineHeight(scale.fontSize, scale.lineUnits, baseGridUnit)}
					style:font-family={fontVariationSettings.fontFamily}
					style:font-stretch={fontVariationSettings.fontStretch}
					style:font-weight={fontVariationSettings.fontWeight}
					style:font-style={fontVariationSettings.fontStyle}
					style:font-variation-settings={fontVariationSettings.fontVariationSettings}
				>
					{Array(totalRows + 1)
						.fill(`${SAMPLE_TEXT}.`)
						.join(" ")}
				</div>
			</div>
		{/each}
		{#each Array(previewRows) as _, rowIndex}
			<div
				class="col-span-full border-t border-dashed border-(--color-raspberry-300)"
				class:border-b={rowIndex === previewRows - 1}
				style:grid-row={rowIndex + 1}
			></div>
		{/each}
	</div>
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
					style:line-height={calculateLineHeight(scale.fontSize, scale.lineUnits, baseGridUnit)}
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

<!-- Global Grid Unit Control -->
<div class="bg-muted/50 container mx-auto mt-8 max-w-4xl rounded-lg border p-4">
	<div class="flex items-center gap-4">
		<label for="base-grid-unit" class="text-sm font-medium">Base Grid Unit:</label>
		<input
			id="base-grid-unit"
			type="number"
			bind:value={baseGridUnit}
			min="1"
			max="20"
			step="1"
			class="border-input bg-background w-20 rounded border px-2 py-1 text-sm"
		/>
		<span class="text-muted-foreground text-sm">px</span>
	</div>
</div>

<!-- Anchor element at bottom center -->
<div class="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
	<div
		bind:this={anchorElement}
		class="bg-muted text-muted-foreground rounded-full px-4 py-2 text-sm font-medium shadow-md"
	>
		Anchor Point
	</div>
</div>

<div class="fixed right-6 bottom-6 z-50">
	<Popover open side="top" customAnchor={anchorElement}>
		{#snippet trigger()}
			Trigger (opens above anchor)
		{/snippet}
		<div class="grid grid-cols-3 grid-rows-[auto_minmax(12rem,1fr)] gap-4">
			<div>
				<ToggleGroup
					bind:value={activeFont}
					options={fonts.map(([value, label]) => ({ value, label }))}
				/>
			</div>
			{#if selectedFont === "UNI"}
				<div class="row-start-2 flex flex-col items-center gap-2">
					<p>Stretch</p>
					<Slider
						orientation="vertical"
						bind:value={UniStretchIdx}
						step={UNI_STRETCH.map((_, i) => i)}
						tickLabels={UNI_STRETCH}
						disabled={slidersDisabled}
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
						bind:value={UniWeight}
						tickLabels={UNI_WEIGHTS.map((w) => (allowedWeights.includes(w) ? w : undefined))}
						disabled={slidersDisabled}
						hideThumbLabels
					/>
				</div>
				<div class="row-start-2 flex items-center gap-2">
					<Checkbox bind:checked={UniItalic} label="Italic" />
				</div>
			{/if}
			{#if selectedFont === "BER"}
				{@const weightValues = rangeValues(BER_WEIGHT_RANGE)}
				{@const slantValues = rangeValues(BER_SLANT_RANGE)}
				<div class="row-start-2 flex flex-col items-center gap-2">
					<p>Width</p>
					<Slider
						orientation="vertical"
						bind:value={BerWidth}
						min={BER_WIDTH_RANGE.min}
						max={BER_WIDTH_RANGE.max}
						step={BER_WIDTH_RANGE.step}
						tickLabels={rangeValues(BER_WIDTH_RANGE)}
						disabled={slidersDisabled}
						hideThumbLabels
					/>
				</div>
				<div class="row-start-2 flex flex-col items-center gap-2">
					<p>Weight</p>
					<Slider
						orientation="vertical"
						bind:value={BerWeight}
						min={BER_WEIGHT_RANGE.min}
						max={BER_WEIGHT_RANGE.max}
						step={BER_WEIGHT_RANGE.step}
						tickLabels={weightValues.map((w, i) =>
							i === 0 || i === weightValues.length - 1 ? w : undefined
						)}
						disabled={slidersDisabled}
					/>
				</div>
				<div class="row-start-2 flex flex-col items-center gap-2">
					<p>Slant</p>
					<Slider
						orientation="vertical"
						bind:value={BerSlant}
						min={BER_SLANT_RANGE.min}
						max={BER_SLANT_RANGE.max}
						step={BER_SLANT_RANGE.step}
						tickLabels={slantValues.map((w, i) =>
							i === 0 || i === slantValues.length - 1 ? w : undefined
						)}
						disabled={slidersDisabled}
					/>
				</div>
			{/if}
		</div>
	</Popover>
</div>
