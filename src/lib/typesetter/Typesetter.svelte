<!-- @component
    Render typeset content
-->

<script lang="ts">
	/**
	 * Definitions
	 * - children: snippet content to render/measure.
	 * - ro: resize observer attachment for measuring container size.
	 * - ghost: offscreen measurement container.
	 * - page: measured container dimensions (wPx, hPx, margins).
	 * - pageGrid: derived grid metrics (cols, row height/gap, col gap, widths, rows).
	 * - pages: PlacedNode[][] output of placement.
	 * - CSS vars on [data-t8r]: --base, --page-w, --page-h, --grid-col-gap, --grid-w.
	 * - CSS vars per page: --grid-cols, --grid-row-h, --grid-row-gap.
	 * - CSS vars per item: --col-start, --col-span, --row-start, --row-span.
	 */
	import { AnimationFrames } from "runed";
	import type { Snippet } from "svelte";
	import { onMount } from "svelte";
	import { browser, dev } from "$app/environment";
	import { resizeObserver } from "$lib/attachments/resizeObserver";
	import type { PlacedNode } from "$lib/typesetter";
	import { measureNodes, BASELINE_PX as PX, placeNodesOnPages } from "$lib/typesetter";

	let { children, height } : {
	    children: Snippet;
		/**
		 * css height that typesetter grid shall fill
		 */
        height: string;
	} = $props();

	// Component defaults
	const resizeFpsLimit = 30;
	const defaultColSpan = 2;

	// Root
	// Store rendered root dimensions (px).
	let root = $state({ hPx: 0, padXPx: PX, padYPx: PX, wPx: 0 });

	console.log($state.snapshot(root))

	// TODO: Consider skipping recompute when size doesn't change to reduce reflow work.
	let didWarnMissingHeight = false;
	let didWarnServerRender = false;
	let sourceEl: HTMLElement | null = null;
	let pendingEntry: ResizeObserverEntry | null = null;
	let hasPendingResize = false;

	const applyResize = (entry: ResizeObserverEntry): void => {
		const { width, height } = entry.contentRect;
		root.wPx = Math.max(0, Math.floor(width));
		root.hPx = Math.max(0, Math.floor(height));
		if ((root.hPx === 0 || root.wPx === 0) && !didWarnMissingHeight) {
			didWarnMissingHeight = true;
			const message =
				"Typesetter requires a non-zero parent height. Set an explicit height on the parent.";
			if (dev) {
				console.warn(message);
			} else {
				throw new Error(message);
			}
		}

		console.log($state.snapshot(root))

	};
	// Attach this callback to the root element to track size changes
	const onRootResize = (entry: ResizeObserverEntry): void => {
		pendingEntry = entry;
		hasPendingResize = true;
	};

	// Single grid page bounds (px).
	// Page grid rows derive from baseline rhythm + available height.
	let pageGrid = $derived.by(() => {
		const rowGapPx = 1 * PX,
			rowHeiPx = 5 * PX,
			colGapPx = 1 * PX;
		const cols = 4;
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

	// Paginated grid output: each entry is one grid page of placed nodes.
	let pages = $state<PlacedNode[][]>([]);
	const ready = $derived.by(() => pages.length > 0);
	// const ready = false;

	$effect(() => {
		if (!browser) {
			if (!didWarnServerRender) {
				didWarnServerRender = true;
				console.warn("Typesetter should be gated to client-only rendering.");
			}
			return;
		}
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

	onMount(() => {
		if (browser) {
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
    	data-t8r-root
    	data-t8r-ready={ready || undefined}
    	{@attach resizeObserver(onRootResize)}
    	style:--base={`${PX}px`}
    	style:--w={`${root.wPx}px`}
    	style:--h={`${root.hPx}px`}
    	style:--px={`${root.padXPx}px`}
    	style:--py={`${root.padYPx}px`}
    	style:--cols={`${pageGrid.cols}`}
    	style:--col-gap={`${pageGrid.colGapPx}px`}
    	style:--col-span={`${defaultColSpan}`}
    	style:--grid-w={`${pageGrid.wPx}px`}
    >
        <div data-t8r-source bind:this={sourceEl}>
            {@render children()}
        </div>
    	<!-- <div data-t8r-source aria-hidden={ready}>
    		<div data-t8r-source-content bind:this={sourceEl}>{@render children()}</div>
    	</div> -->
    	{#if ready}
    		<div data-t8r-pages aria-hidden={!ready}>
    			<!-- Rendered pages live here; vertical flow is the default. -->
    			{#each pages as pageItems, pageIndex (pageIndex)}
    				<div
    					data-t8r-page
    					style:--grid-cols={pageGrid.cols}
    					style:--grid-row-h={`${pageGrid.rowHeiPx}px`}
    					style:--grid-row-gap={`${pageGrid.rowGapPx}px`}
    				>
    					{#each pageItems as item (item.id)}
    						<div
    							data-t8r-item
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
		position: relative;
		width: 100%;
		height: 100%; /* root takes full height of parent */
		padding: 0;
		margin: 0;
		overflow: auto;
		line-height: var(--base); /* TODO: move line height into content */
	}

	[data-t8r-source] {
	    position: absolute;
		top: var(--py);
		left: var(--px);
		width: calc(
            ((100% - ((var(--cols, 1) - 1) * var(--col-gap, 0px))) / var(--cols, 1))
            * var(--col-span, 1)
            + ((var(--col-span, 1) - 1) * var(--col-gap, 0px))
            - var(--px)
        ); /* width of --col-span columns including internal gaps */
	    /*padding: var(--py) var(--px);*/
		margin: 0;
	}
/*
	[data-t8r-source-content] {
		box-sizing: border-box;
		padding: var(--py, 16px) var(--px, 16px);
	}*/

	[data-t8r-root][data-t8r-ready] [data-t8r-source] {
		/*position: absolute;*/
		/*top: 0;*/
		/*left: -9999px;*/
		/*left: 0;*/
		color: orange;
		/*visibility: hidden;*/
		/*width: var(--grid-w, auto);*/
		/*padding: 0;*/
		/*margin-right: 0;
		margin-left: 0;*/
		pointer-events: none;
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
		/*border: 1px solid black;*/
		outline: 1px solid black;
	}

	[data-t8r-item] {
		grid-row: var(--row-start) / span var(--row-span);
		grid-column: var(--col-start) / span var(--col-span);
		outline: 1px dashed green;
	}
</style>
