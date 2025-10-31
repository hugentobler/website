<script lang="ts">
	import { Checkbox, Popover, Slider, ToggleGroup } from "$lib/components/ui";
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
		DEFAULT_TYPE_SCALES,
		SAMPLE_TEXT,
		TYPE_LEVEL_LABELS,
		type TypeLevel,
		type TypeScale,
	} from "$lib/typography/type-scale";

	type FontKey = keyof typeof FONTS;
	const fonts = Object.entries(FONTS) as [FontKey, string][];
	const typeLevels: TypeLevel[] = ["h1", "h2", "h3", "p", "small"];

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

	// Type scale state (one for each font)
	let uniTypeScale = $state<TypeScale>({ ...DEFAULT_TYPE_SCALES.UNI });
	let berTypeScale = $state<TypeScale>({ ...DEFAULT_TYPE_SCALES.BER });

	// Derived: active type scale based on selected font
	const activeTypeScale = $derived(selectedFont === "UNI" ? uniTypeScale : berTypeScale);

	// Derived: font variation settings for specimens
	const fontVariationSettings = $derived(
		selectedFont === "UNI"
			? {
					// For Univers, we use stretch and weight
					// Note: Univers uses font-stretch CSS property, not wdth axis
					fontFamily: FONTS.UNI,
					fontStretch: activeStretch,
					fontWeight: UniWeight,
					fontStyle: UniItalic ? "italic" : "normal",
					fontVariationSettings: undefined,
				}
			: {
					// For Berkeley Mono, we use variable font axes
					fontFamily: FONTS.BER,
					fontStretch: undefined,
					fontWeight: undefined,
					fontStyle: undefined,
					fontVariationSettings: `"wdth" ${BerWidth}, "wght" ${BerWeight}, "slnt" ${BerSlant}`,
				}
	);
</script>

<!-- Type Specimens Display -->
<div class="container mx-auto max-w-4xl p-8">
	<div class="space-y-8">
		{#each typeLevels as level}
			{@const scale = activeTypeScale[level]}
			<div class="flex items-baseline gap-4">
				<span class="text-muted-foreground w-16 shrink-0 text-sm font-medium">
					{TYPE_LEVEL_LABELS[level]}
				</span>
				<p
					style:font-size="{scale.fontSize}px"
					style:line-height={scale.lineHeight}
					style:font-family={fontVariationSettings.fontFamily}
					style:font-stretch={fontVariationSettings.fontStretch}
					style:font-weight={fontVariationSettings.fontWeight}
					style:font-style={fontVariationSettings.fontStyle}
					style:font-variation-settings={fontVariationSettings.fontVariationSettings}
				>
					{SAMPLE_TEXT}
				</p>
			</div>
		{/each}
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
