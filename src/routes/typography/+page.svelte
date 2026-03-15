<script lang="ts">
	import { browser } from "$app/environment";
	import { Checkbox, Slider, ToggleGroup } from "$lib/components/ui";
	import {
		FLUID_VIEWPORT,
		FONTS,
		type FontId,
		type Size,
		TYPE_SCALES,
		TYPE_SCALES_MIN,
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

	const DEFAULT_UNI_STRETCH_IDX = 1;
	const DEFAULT_UNI_WEIGHT = getCenterValue(
		UNI_STRETCH_WEIGHTS[UNI_STRETCH[1]],
	);
	const DEFAULT_BER_WIDTH = getCenterValue(rangeValues(BER_WIDTH_RANGE));
	const DEFAULT_BER_WEIGHT = getCenterValue(rangeValues(BER_WEIGHT_RANGE));
	const DEFAULT_BER_SLANT = BER_SLANT_RANGE.max;

	// =============================================================================
	// State
	// =============================================================================

	let settings = $state({
		activeFont: "sans" as FontId,
		berSlant: DEFAULT_BER_SLANT,
		berWeight: DEFAULT_BER_WEIGHT,
		berWidth: DEFAULT_BER_WIDTH,
		uniItalic: false,
		uniStretchIdx: DEFAULT_UNI_STRETCH_IDX,
		uniWeight: DEFAULT_UNI_WEIGHT,
	});

	let viewportWidth = $state(browser ? window.innerWidth : 1440);
	let rootFontSizePx = $state(16);

	// =============================================================================
	// Fluid type helpers
	// =============================================================================

	const interpolation = $derived(
		Math.max(
			0,
			Math.min(
				1,
				(viewportWidth - FLUID_VIEWPORT.min) /
					(FLUID_VIEWPORT.max - FLUID_VIEWPORT.min),
			),
		),
	);

	const lerp = (min: number, max: number) => min + (max - min) * interpolation;

	const fmt = (v: number, d = 2) =>
		v
			.toFixed(d)
			.replace(/(\.\d*?)0+$/, "$1")
			.replace(/\.$/, "");

	// =============================================================================
	// Grid-lock detection
	// =============================================================================

	function getGridLock(
		fontId: FontId,
		size: Size,
	): { locked: boolean; multiple: number } {
		const scale = TYPE_SCALES[fontId];
		const scaleMin = TYPE_SCALES_MIN[fontId];
		const bl = scale.base.lineHeight;
		const blMin = scaleMin?.base?.lineHeight ?? bl;
		const lh = scale[size].lineHeight;
		const lhMin = scaleMin?.[size]?.lineHeight ?? lh;

		const multMax = lh / bl;
		const multMin = lhMin / blMin;
		const roundedMax = Math.round(multMax);
		const roundedMin = Math.round(multMin);

		const epsilon = 0.001;
		if (
			roundedMax > 0 &&
			Math.abs(multMax - roundedMax) < epsilon &&
			Math.abs(multMin - roundedMin) < epsilon &&
			roundedMax === roundedMin
		) {
			return { locked: true, multiple: roundedMax };
		}
		return { locked: false, multiple: multMax };
	}

	// =============================================================================
	// Resolved values (computed from interpolation, not DOM)
	// =============================================================================

	const resolved = $derived.by(() => {
		const font = settings.activeFont;
		const scale = TYPE_SCALES[font];
		const scaleMin = TYPE_SCALES_MIN[font];
		const isFluid = scaleMin !== undefined;

		const baselineRem = isFluid
			? lerp(scaleMin.base.lineHeight, scale.base.lineHeight)
			: scale.base.lineHeight;

		const sizeEntries = sizes.map((size) => {
			const max = scale[size];
			const min = scaleMin?.[size] ?? max;
			const lock = getGridLock(font, size);

			const fontSizeRem = isFluid
				? lerp(min.fontSize, max.fontSize)
				: max.fontSize;
			const lineHeightRem = lock.locked
				? baselineRem * lock.multiple
				: isFluid
					? lerp(min.lineHeight, max.lineHeight)
					: max.lineHeight;

			return [
				size,
				{
					fontSizePx: fontSizeRem * rootFontSizePx,
					fontSizeRem,
					isFluid,
					lineHeightPx: lineHeightRem * rootFontSizePx,
					lineHeightRem,
					locked: lock.locked,
					maxFs: max.fontSize,
					maxLh: max.lineHeight,
					minFs: min.fontSize,
					minLh: min.lineHeight,
					multiple: lock.multiple,
				},
			] as const;
		});

		return {
			baseline: { px: baselineRem * rootFontSizePx, rem: baselineRem },
			sizes: Object.fromEntries(sizeEntries) as Record<
				Size,
				(typeof sizeEntries)[number][1]
			>,
		};
	});

	// =============================================================================
	// Font variation settings
	// =============================================================================

	const currentStretch = $derived(
		UNI_STRETCH[
			Math.max(0, Math.min(settings.uniStretchIdx, UNI_STRETCH.length - 1))
		],
	);
	const validWeights = $derived(
		UNI_STRETCH_WEIGHTS[currentStretch] as readonly number[],
	);

	const fontVariation = $derived(
		settings.activeFont === "sans"
			? {
					fontStretch: currentStretch,
					fontStyle: settings.uniItalic ? "italic" : "normal",
					fontVariationSettings: undefined,
					fontWeight: settings.uniWeight,
				}
			: {
					fontStretch: undefined,
					fontStyle: undefined,
					fontVariationSettings: `"wdth" ${settings.berWidth}, "wght" ${settings.berWeight}, "slnt" ${settings.berSlant}`,
					fontWeight: undefined,
				},
	);

	const fontUtilityClass = $derived(
		settings.activeFont === "sans" ? "sans" : "mono",
	);

	// =============================================================================
	// Effects
	// =============================================================================

	$effect(() => {
		if (!browser) return;
		const computed = Number.parseFloat(
			getComputedStyle(document.documentElement).fontSize,
		);
		rootFontSizePx = Number.isFinite(computed) ? computed : 16;
	});

	$effect(() => {
		if (!validWeights.includes(settings.uniWeight)) {
			settings.uniWeight = validWeights.reduce((prev, curr) =>
				Math.abs(curr - settings.uniWeight) <
				Math.abs(prev - settings.uniWeight)
					? curr
					: prev,
			);
		}
	});
</script>

<svelte:window onresize={() => (viewportWidth = window.innerWidth)} />

<!-- =============================================================================
     Viewport Readout
     ============================================================================= -->
<div class="readout">
	<span>
		<span class="muted">viewport</span>
		{viewportWidth}px
	</span>
	<span>
		<span class="muted">fluid</span>
		{fmt(interpolation * 100, 0)}%
	</span>
	<span>
		<span class="muted">baseline</span>
		{fmt(resolved.baseline.rem, 3)}rem ({fmt(resolved.baseline.px)}px)
	</span>
</div>

<!-- =============================================================================
     Type Scale Preview Grid
     ============================================================================= -->
<div class="scale-grid">
	{#each sizes as size}
		{@const r = resolved.sizes[size]}
		{@const isBase = size === "base"}
		{@const linesPerRow = Math.round(
			(4 * resolved.baseline.rem) / r.lineHeightRem,
		)}

		<!-- Spacer column (baseline width) -->
		<div>
			<div class="header-spacer"></div>
			<div class="grid-rows">
				{#each Array(PREVIEW_ROWS) as _}
					<div class="grid-row"></div>
				{/each}
			</div>
		</div>

		<!-- Typography column -->
		<div class="type-col">
			<!-- Header with size info -->
			<div class="header" class:anchor-bg={isBase}>
				<div class="header-title">
					<p class="size-name">{size}</p>
					{#if isBase}
						<span class="badge badge-anchor">anchor</span>
					{:else if r.locked}
						<span class="badge badge-locked">{r.multiple}× locked</span>
					{:else}
						<span class="badge badge-clamp">clamp</span>
					{/if}
				</div>
				<p class="font-name">{FONTS[settings.activeFont]}</p>

				<!-- Resolved values (live) -->
				<div class="metrics">
					<div class="metric-row">
						<span class="muted">px:</span>
						{fmt(r.fontSizePx)} / {fmt(r.lineHeightPx)}
						<span class="muted">
							({fmt(r.lineHeightRem / resolved.baseline.rem, 2)}×)
						</span>
					</div>
					<div class="metric-row dim">
						<span class="muted">rem:</span>
						{fmt(r.fontSizeRem, 3)} / {fmt(r.lineHeightRem, 3)}
					</div>
				</div>

				<!-- Min → Max range -->
				{#if r.isFluid}
					<div class="range">
						{#if Math.abs(r.minFs - r.maxFs) > 0.0001}
							<div>fs: {fmt(r.minFs, 3)} → {fmt(r.maxFs, 3)}</div>
						{:else}
							<div>fs: {fmt(r.maxFs, 3)} (fixed)</div>
						{/if}
						{#if r.locked}
							<div>lh: {r.multiple}× baseline</div>
						{:else if Math.abs(r.minLh - r.maxLh) > 0.0001}
							<div>lh: {fmt(r.minLh, 3)} → {fmt(r.maxLh, 3)}</div>
						{:else}
							<div>lh: {fmt(r.maxLh, 3)} (fixed)</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Text preview area -->
			<div class="preview-area">
				{#each Array(PREVIEW_ROWS) as _}
					<div class="grid-row preview-row">
						<!-- Sub-grid lines -->
						<div class="sub-grid {fontUtilityClass}">
							{#each Array(linesPerRow) as _}
								<div style:height={`var(--leading-${size})`}></div>
							{/each}
						</div>
					</div>
				{/each}
				<!-- Text preview -->
				<div
					class="preview-text {fontUtilityClass}"
					style:font-size={`var(--type-${size})`}
					style:line-height={`var(--leading-${size})`}
					style:font-stretch={fontVariation.fontStretch}
					style:font-weight={fontVariation.fontWeight}
					style:font-style={fontVariation.fontStyle}
					style:font-variation-settings={fontVariation.fontVariationSettings}
				>
					{SAMPLE_TEXT.concat(" ").repeat(linesPerRow * 4)}
				</div>
			</div>
		</div>
	{/each}

	<!-- Controls Panel (spacer + controls) -->
	<div>
		<div class="header-spacer"></div>
		<div class="grid-rows">
			{#each Array(PREVIEW_ROWS) as _}
				<div class="grid-row"></div>
			{/each}
		</div>
	</div>

	<div class="controls">
		<p class="controls-title">Controls</p>

		<!-- Font Toggle -->
		<div>
			<ToggleGroup
				bind:value={settings.activeFont}
				options={fonts.map(([value, label]) => ({ value, label }))}
			/>
		</div>

		<!-- Font Variation Sliders -->
		<div class="sliders">
			{#if settings.activeFont === "sans"}
				<div class="slider-group">
					<div class="slider-col">
						<p class="slider-label">Stretch</p>
						<Slider
							orientation="vertical"
							bind:value={settings.uniStretchIdx}
							step={UNI_STRETCH.map((_, i) => i)}
							tickLabels={UNI_STRETCH}
							hideThumbLabels
							style="height: 100%"
						/>
					</div>
					<div class="slider-col">
						<p class="slider-label">Weight</p>
						<Slider
							orientation="vertical"
							min={UNI_WEIGHTS[0]}
							max={UNI_WEIGHTS[UNI_WEIGHTS.length - 1]}
							step={[...UNI_WEIGHTS]}
							bind:value={settings.uniWeight}
							tickLabels={UNI_WEIGHTS.map((w) =>
								validWeights.includes(w) ? w : undefined,
							)}
							hideThumbLabels
							style="height: 100%"
						/>
					</div>
					<div class="slider-col-end">
						<Checkbox bind:checked={settings.uniItalic} label="Italic" />
					</div>
				</div>
			{/if}
			{#if settings.activeFont === "mono"}
				{@const weightValues = rangeValues(BER_WEIGHT_RANGE)}
				{@const slantValues = rangeValues(BER_SLANT_RANGE)}
				<div class="slider-group">
					<div class="slider-col">
						<p class="slider-label">Width</p>
						<Slider
							orientation="vertical"
							bind:value={settings.berWidth}
							min={BER_WIDTH_RANGE.min}
							max={BER_WIDTH_RANGE.max}
							step={BER_WIDTH_RANGE.step}
							tickLabels={rangeValues(BER_WIDTH_RANGE)}
							hideThumbLabels
							style="height: 100%"
						/>
					</div>
					<div class="slider-col">
						<p class="slider-label">Weight</p>
						<Slider
							orientation="vertical"
							bind:value={settings.berWeight}
							min={BER_WEIGHT_RANGE.min}
							max={BER_WEIGHT_RANGE.max}
							step={BER_WEIGHT_RANGE.step}
							tickLabels={weightValues.map((w, i) =>
								i === 0 || i === weightValues.length - 1 ? w : undefined,
							)}
							style="height: 100%"
						/>
					</div>
					<div class="slider-col">
						<p class="slider-label">Slant</p>
						<Slider
							orientation="vertical"
							bind:value={settings.berSlant}
							min={BER_SLANT_RANGE.min}
							max={BER_SLANT_RANGE.max}
							step={BER_SLANT_RANGE.step}
							tickLabels={slantValues.map((w, i) =>
								i === 0 || i === slantValues.length - 1 ? w : undefined,
							)}
							style="height: 100%"
						/>
					</div>
				</div>
			{/if}
		</div>

		<!-- Credit -->
		<a
			href="https://www.daybreak.studio/writing/adaline-typography"
			class="credit"
		>
			Inspired by Daybreak Studio
		</a>
	</div>
</div>

<!-- =============================================================================
     Real Layout Test
     ============================================================================= -->
<div class="layout-test">
	<!-- Baseline grid overlay -->
	<div class="baseline-grid layout-test-overlay"></div>

	<!-- Left: Header -->
	<div>
		<h2 class="type-lg sans">A new approach to typography</h2>
	</div>

	<!-- Right: Body text -->
	<div>
		<p class="type-base sans">
			Typography serves language, not the convenience of a system. The strongest
			type systems are specific, opinionated, and crafted with care for the
			context they serve. For many designers, typography is a first love. In the
			pages of design books and type manuals, the environment feels steady.
			Columns, baselines, and margins hold firm.
		</p>
	</div>
</div>

<style>
	/* =============================================================================
	   Viewport Readout
	   ============================================================================= */

	.readout {
		display: flex;
		gap: 1.5rem;
		align-items: center;
		padding: 0.5rem 1.25rem;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		line-height: 1.25rem;
		border-bottom: 1px solid black;
	}

	.muted {
		color: #9ca3af;
	}

	/* =============================================================================
	   Type Scale Preview Grid
	   ============================================================================= */

	.scale-grid {
		display: grid;
		grid-template-columns: var(--baseline) 1fr;
		grid-auto-rows: min-content;
		margin: 1.25rem;

		& > * {
			border-color: black;
			border-right: 0;
			border-left: 1px solid black;
		}

		& > *:last-child {
			border-right: 1px solid black;
		}

		@media (min-width: 768px) {
			grid-template-columns: repeat(2, var(--baseline) 1fr);
		}
		@media (min-width: 1280px) {
			grid-template-columns: repeat(3, var(--baseline) 1fr);
		}
		@media (min-width: 1536px) {
			grid-template-columns: repeat(4, var(--baseline) 1fr);
		}
	}

	/* --- Shared grid row pattern --- */

	.header-spacer {
		height: 10rem;
	}

	.grid-rows {
		& > *:first-child {
			border-top: 1px dotted black;
		}
		& > * {
			border-bottom: 1px dotted black;
		}
	}

	.grid-row {
		height: calc(var(--baseline) * 4);
	}

	/* --- Typography column --- */

	.type-col {
		display: flex;
		flex-direction: column;
	}

	/* --- Header card --- */

	.header {
		display: flex;
		flex-direction: column;
		height: 10rem;
		padding: 1rem;
	}

	.anchor-bg {
		background-color: #fffbeb;
	}

	.header-title {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.size-name {
		font-size: 0.875rem;
		font-weight: 500;
		text-transform: uppercase;
	}

	.badge {
		padding: 0.125rem 0.375rem;
		font-size: 0.75rem;
		line-height: 1rem;
		border-radius: 0.25rem;
	}

	.badge-anchor {
		background-color: #fde68a;
	}

	.badge-locked {
		color: #166534;
		background-color: #dcfce7;
	}

	.badge-clamp {
		color: #1e40af;
		background-color: #dbeafe;
	}

	.font-name {
		font-size: 0.75rem;
		color: #4b5563;
	}

	/* --- Metrics --- */

	.metrics {
		margin-top: 0.25rem;
		font-size: 0.75rem;
		line-height: 1rem;
	}

	.metric-row {
		font-family: var(--font-mono);
	}

	.metric-row.dim {
		color: #4b5563;
	}

	.range {
		margin-top: auto;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		line-height: 1rem;
		color: #9ca3af;
	}

	/* --- Preview area --- */

	.preview-area {
		position: relative;

		& > .preview-row:first-child {
			border-top: 1px dotted black;
		}
		& > .preview-row {
			border-bottom: 1px dotted black;
		}
	}

	.preview-row {
		position: relative;
	}

	.sub-grid {
		position: absolute;
		inset: 0;
		left: 1rem;

		& > * {
			border-top: 1px dashed black;
		}
		& > *:first-child {
			border-top: none;
		}
	}

	.preview-text {
		position: absolute;
		inset: 0;
		left: 1rem;
		overflow: hidden;
	}

	/* =============================================================================
	   Controls Panel
	   ============================================================================= */

	.controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		border-top: 1px solid black;
		border-bottom: 1px solid black;
	}

	.controls-title {
		font-size: 0.875rem;
		font-weight: 500;
		text-transform: uppercase;
	}

	.sliders {
		flex: 1;
	}

	.slider-group {
		display: flex;
		gap: 1rem;
		height: 100%;
	}

	.slider-col {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}

	.slider-col-end {
		display: flex;
		align-items: flex-end;
	}

	.slider-label {
		font-size: 0.75rem;
		font-weight: 500;
	}

	.credit {
		font-size: 0.75rem;
		color: #6b7280;
	}

	/* =============================================================================
	   Real Layout Test
	   ============================================================================= */

	.layout-test {
		position: relative;
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: var(--baseline);
		padding-top: 2rem;
		margin: 1.25rem;
		margin-top: 4rem;
		border-top: 1px solid black;
	}

	.layout-test-overlay {
		position: absolute;
		inset: 0;
		padding-top: 2rem;
		pointer-events: none;
	}
</style>
