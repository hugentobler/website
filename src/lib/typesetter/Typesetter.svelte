<!-- @component
    Render typeset content
-->

<script lang="ts">
	import { AnimationFrames } from "runed";
	import type { Snippet } from "svelte";
	import { onMount } from "svelte";
	import { browser, dev } from "$app/environment";
	import { resizeObserver } from "$lib/attachments/resizeObserver";
	import type { PlacedNode } from "$lib/typesetter";
	import { BASELINE_VAR, measureNodes, placeNodesOnPages } from "$lib/typesetter";

	// Props
	let {
		children,
		cols: colsProp = 4,
		debug = false,
		height,
	}: {
		children: Snippet;
		/**
		 * number of columns in the grid
		 */
		cols?: number;
		/**
		 * dev-only debug styling for the source element
		 */
		debug?: boolean;
		/**
		 * css height that typesetter grid shall fill
		 */
		height: string;
	} = $props();

	// Config
	const resizeFpsLimit = 30;
	const defaultColSpan = 2;
	const isDebug = $derived.by(() => dev && debug);
	const baselineFallbackRem = 1.5;
	const baselineFallbackPx = 24;

	// State
	let root = $state({
		hPx: 0,
		padXPx: baselineFallbackPx,
		padYPx: baselineFallbackPx,
		wPx: 0,
	});
	let rootEl: HTMLElement | null = null;
	let baselinePx = $state(baselineFallbackPx);
	let sourceEl: HTMLElement | null = null;
	let pendingEntry: ResizeObserverEntry | null = null;
	let hasPendingResize = false;
	let pages = $state<PlacedNode[][]>([]);

	// Flags
	let didWarnMissingHeight = false;

	// Read baseline from CSS once and convert to px for JS-only layout math.
	const readBaselinePx = (element: HTMLElement): number => {
		const rootFontSize =
			Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
		const defaultPx = rootFontSize * baselineFallbackRem;
		const computed = getComputedStyle(element);
		const rawValue = computed.getPropertyValue(BASELINE_VAR).trim();
		if (!rawValue) return defaultPx;
		if (rawValue.endsWith("px")) {
			const value = Number.parseFloat(rawValue);
			return Number.isFinite(value) ? value : defaultPx;
		}
		if (rawValue.endsWith("rem")) {
			const remValue = Number.parseFloat(rawValue);
			if (!Number.isFinite(remValue)) return defaultPx;
			return remValue * rootFontSize;
		}
		const fallback = Number.parseFloat(rawValue);
		return Number.isFinite(fallback) ? fallback : defaultPx;
	};

	// Sync CSS baseline into JS state so padding + grid math stay aligned.
	const applyBaseline = (): void => {
		if (!browser || !rootEl) return;
		const nextBaseline = readBaselinePx(rootEl);
		if (!Number.isFinite(nextBaseline)) return;
		baselinePx = nextBaseline;
		root.padXPx = nextBaseline;
		root.padYPx = nextBaseline;
	};

	// Resize handling
	// TODO: Consider skipping recompute when size doesn't change to reduce reflow work.
	const applyResize = (entry: ResizeObserverEntry): void => {
		const { width, height } = entry.contentRect;
		root.wPx = Math.max(0, Math.floor(width));
		root.hPx = Math.max(0, Math.floor(height));
		if ((root.hPx === 0 || root.wPx === 0) && !didWarnMissingHeight) {
			didWarnMissingHeight = true;
			const message =
				"Typesetter measured zero height. Ensure the `height` prop resolves to a non-zero value.";
			if (dev) {
				console.warn(message);
			} else {
				throw new Error(message);
			}
		}
		applyBaseline();
	};
	// Attach this callback to the root element to track size changes
	const onRootResize = (entry: ResizeObserverEntry): void => {
		pendingEntry = entry;
		hasPendingResize = true;
	};

	// Single grid page bounds (px).
	// Page grid rows derive from baseline rhythm + available height.
	// Derived
	let pageGrid = $derived.by(() => {
		const rowGapPx = 1 * baselinePx,
			rowHeiPx = 5 * baselinePx,
			colGapPx = 1 * baselinePx;
		const cols = Math.max(1, Math.floor(Number.isFinite(colsProp) ? colsProp : 4));
		const hPx = Math.max(0, root.hPx - 2 * root.padYPx);
		const wPx = Math.max(0, root.wPx - 2 * root.padXPx);
		const totalColGap = Math.max(0, cols - 1) * colGapPx;
		const colWidPx = cols > 0 ? (wPx - totalColGap) / cols : 0;
		const rows = Math.max(1, Math.floor((hPx + rowGapPx) / (rowHeiPx + rowGapPx)));
		return {
			colGapPx,
			cols,
			colWidPx,
			hPx,
			rowGapPx,
			rowHeiPx,
			rows,
			wPx,
		};
	});

	const ready = $derived.by(() => pages.length > 0);

	// Effects
	$effect(() => {
		if (!browser) return;
		if (!sourceEl) return;
		if (root.wPx === 0 || root.hPx === 0) return;

		const measuredNodes = measureNodes(
			sourceEl,
			pageGrid.rowGapPx,
			pageGrid.rowHeiPx,
			pageGrid.cols,
			pageGrid.colGapPx,
			pageGrid.colWidPx,
			defaultColSpan,
		);

		pages = placeNodesOnPages(
			measuredNodes,
			pageGrid.cols,
			pageGrid.rows,
			pageGrid.rowGapPx,
			pageGrid.rowHeiPx,
		);
	});

	// Lifecycle
	onMount(() => {
		if (browser) {
			applyBaseline();
			new AnimationFrames(
				() => {
					if (!hasPendingResize || !pendingEntry) return;
					hasPendingResize = false;
					applyResize(pendingEntry);
				},
				{ fpsLimit: () => resizeFpsLimit },
			);
		}
	});
</script>

<div style:height>
	<section
		bind:this={rootEl}
		data-t8r-root
		data-t8r-ready={ready || undefined}
		data-t8r-debug={isDebug || undefined}
		{@attach resizeObserver(onRootResize)}
		style:--w={`${root.wPx}px`}
		style:--h={`${root.hPx}px`}
		style:--px={`${root.padXPx}px`}
		style:--py={`${root.padYPx}px`}
		style:--cols={`${pageGrid.cols}`}
		style:--col-gap={`${pageGrid.colGapPx}px`}
		style:--col-span={`${defaultColSpan}`}
		style:--grid-w={`${pageGrid.wPx}px`}
	>
		<!-- Off-screen source element for measuring layout -->
		<div data-t8r-source bind:this={sourceEl}>{@render children()}</div>
		<!-- Rendered paginated grid -->
		{#if ready}
			<div data-t8r-pages aria-hidden={!ready}>
				{#each pages as pageItems, pageIndex (pageIndex)}
					<div
						data-t8r-page
						data-t8r-cols={pageGrid.cols}
						data-t8r-rows={pageGrid.rows}
						style:--grid-cols={pageGrid.cols}
						style:--grid-row-h={`${pageGrid.rowHeiPx}px`}
						style:--grid-row-gap={`${pageGrid.rowGapPx}px`}
					>
						{#each pageItems as item (item.id)}
							<div
								data-t8r-item
								data-t8r-id={item.id}
								data-t8r-col-start={item.gridColStart}
								data-t8r-col-span={item.gridColSpan}
								data-t8r-row-start={item.gridRowStart}
								data-t8r-row-span={item.gridRowSpan}
								style:--col-start={item.gridColStart}
								style:--col-span={item.gridColSpan}
								style:--row-start={item.gridRowStart}
								style:--row-span={item.gridRowSpan}
							>
								{@html item.html}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<style>
	[data-t8r-root] {
		--t8r-baseline: var(--type-baseline, 1.5rem);
		position: relative;
		width: 100%;
		height: 100%; /* root takes full height of parent */
		padding: 0;
		margin: 0;
		overflow: auto;
	}

	[data-t8r-source] {
		position: absolute;
		top: var(--py);
		left: var(--px);
		width: calc(
			((100% - ((var(--cols, 1) - 1) * var(--col-gap, 0px))) / var(--cols, 1)) *
			var(--col-span, 1) +
			((var(--col-span, 1) - 1) * var(--col-gap, 0px)) -
			var(--px)
		); /* width of --col-span columns including internal gaps */
		padding: 0;
		margin: 0;
	}

	[data-t8r-root][data-t8r-ready]:not([data-t8r-debug]) [data-t8r-source] {
		position: fixed;
		top: 0;
		left: -9999px;
		visibility: hidden;
		pointer-events: none;
	}

	[data-t8r-root][data-t8r-debug] [data-t8r-source] {
		color: red;
		opacity: 0.5;
	}

	[data-t8r-pages] {
		display: flex;
		flex-direction: column;
	}

	[data-t8r-page] {
		display: grid;
		grid-template-columns: repeat(var(--grid-cols, 1), minmax(0, 1fr));
		grid-auto-rows: var(--grid-row-h, 1.5rem);
		row-gap: var(--grid-row-gap, 0px);
		column-gap: var(--col-gap, 0px);
		width: var(--w, 100%);
		height: var(--h, auto);
		padding: var(--py, 0px) var(--px, 0px);
	}

	[data-t8r-item] {
		grid-row: var(--row-start) / span var(--row-span);
		grid-column: var(--col-start) / span var(--col-span);
	}

	[data-t8r-root][data-t8r-debug] [data-t8r-page] {
		outline: 1px solid black;
	}

	[data-t8r-root][data-t8r-debug] [data-t8r-item] {
		outline: 1px dashed green;
	}
</style>
