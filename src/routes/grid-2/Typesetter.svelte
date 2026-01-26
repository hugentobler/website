<script lang="ts">
	import type { Snippet } from "svelte";
	import type { Attachment } from "svelte/attachments";
	import { browser } from "$app/environment";
	import type { PlacedNode } from "./typesetter";
	import {
		BASELINE_PX,
		groupNodes,
		measureNodes,
		placeNodesOnPages,
		TEXT_COL_SPAN,
	} from "./typesetter";

	/**
	 * ResizeObserver attachment that re-runs if the callback reference changes.
	 */
	const ro =
		(callback: (entry: ResizeObserverEntry) => void): Attachment =>
		(node) => {
			const ro = new ResizeObserver(([entry]) => callback(entry));
			ro.observe(node);
			return () => ro.disconnect();
		};

	// Ghost - renders content as single Page so content dimensions can be measured
	let ghost: HTMLElement | null = null;
	// Page dimensions
	let page = $state({ h: 0, marginX: BASELINE_PX, marginY: BASELINE_PX, w: 0 });
	let didWarnMissingHeight = false;
	let didWarnServerRender = false;
	// Attach callback to root element, observe root dimensions.
	const onRootResize = (entry: ResizeObserverEntry): void => {
		const { width, height } = entry.contentRect;
		page.w = Math.max(0, Math.floor(width));
		page.h = Math.max(0, Math.floor(height));
		if ((page.h === 0 || page.w === 0) && !didWarnMissingHeight) {
			didWarnMissingHeight = true;
			console.warn("Typesetter requires explicit parent dimensions.");
		}
	};

	// Page grid dimensions: subtract grid margins from page height
	let pageGridRowGapPx = BASELINE_PX * 1;
	let pageGridRowHeightPx = BASELINE_PX * 5;
	let pageGridColGapPx = BASELINE_PX * 1;
	let pageGrid = $derived.by(() => {
		const cols = 4;
		const h = Math.max(0, page.h - BASELINE_PX * 2);
		const w = Math.max(0, page.w - page.marginX * 2);
		const totalColGap = Math.max(0, cols - 1) * pageGridColGapPx;
		const colWidth = cols > 0 ? (w - totalColGap) / cols : 0;
		const textSpanWidth =
			colWidth * TEXT_COL_SPAN + Math.max(0, TEXT_COL_SPAN - 1) * pageGridColGapPx;
		const rows = Math.max(
			1,
			Math.floor((h + pageGridRowGapPx) / (pageGridRowHeightPx + pageGridRowGapPx)),
		);
		return {
			cols,
			h,
			colWidth,
			rows,
			textSpanWidth,
			w,
		};
	});

	let pages = $state<PlacedNode[][]>([]);
	const { children } = $props<{
		children: Snippet;
	}>();

	$effect(() => {
		if (!browser) {
			if (!didWarnServerRender) {
				didWarnServerRender = true;
				console.warn("Typesetter should be gated to client-only rendering.");
			}
			return;
		}
		if (!ghost) return;
		if (page.w === 0 || page.h === 0) return;
		// Measure node dimensions using ghost
		const measuredNodes = measureNodes(
			ghost,
			pageGridRowGapPx,
			pageGridRowHeightPx,
			pageGrid.cols,
			pageGridColGapPx,
			pageGrid.colWidth,
		);

		const groupedNodes = groupNodes(
			measuredNodes,
			pageGrid.rows,
			pageGridRowGapPx,
			pageGridRowHeightPx,
		);

		pages = placeNodesOnPages(groupedNodes, pageGrid.cols, pageGrid.rows);
	});
</script>

<section
	data-typesetter
	{@attach ro(onRootResize)}
	style:--typesetter-baseline={`${BASELINE_PX}px`}
	style:--typesetter-baseline-w={`${pageGrid.textSpanWidth}px`}
	style:--typesetter-page-w={`${page.w}px`}
	style:--typesetter-page-h={`${page.h}px`}
	style:--typesetter-page-marginX={`${page.marginX}px`}
	style:--typesetter-page-marginY={`${page.marginY}px`}
	style:--typesetter-page-grid-col-gap={`${pageGridColGapPx}px`}
	style:--typesetter-page-grid-w={`${pageGrid.w}px`}
>
	<!-- Use page dimensions so measurement matches the visible output. -->
	<div data-typesetter-ghost bind:this={ghost}>{@render children()}</div>
	<div data-typesetter-pages>
		<!-- Rendered pages live here; vertical flow is the default. -->
		{#each pages as pageItems, pageIndex (pageIndex)}
			<div
				data-typesetter-page
				style:--typesetter-page-grid-cols={pageGrid.cols}
				style:--typesetter-page-grid-row-h={`${pageGridRowHeightPx}px`}
				style:--typesetter-page-grid-row-gap={`${pageGridRowGapPx}px`}
			>
				{#each pageItems as item (item.id)}
					<div
						data-typesetter-item
						style:--typesetter-col-start={item.gridColStart}
						style:--typesetter-col-span={item.gridColSpan}
						style:--typesetter-row-start={item.gridRowStart}
						style:--typesetter-row-span={item.gridRowSpan}
					>
						{@html item.html}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</section>

<style>
	[data-typesetter] {
		width: 100%;
		height: 100%;
	}

	[data-typesetter-ghost] {
		position: fixed;
		top: 0;
		left: -9999px;
		visibility: hidden;
		width: var(--typesetter-page-grid-w, auto);
		padding: 0;
		line-height: var(--typesetter-baseline, 1.5rem); /* TODO: move line height into content?? */
		pointer-events: none;
	}

	[data-typesetter-pages] {
		display: flex;
		flex-direction: column;
	}

	[data-typesetter-page] {
		display: grid;
		grid-template-columns: repeat(var(--typesetter-page-grid-cols, 1), minmax(0, 1fr));
		grid-auto-rows: var(--typesetter-page-grid-row-h, 1.5rem);
		row-gap: var(--typesetter-page-grid-row-gap, 0px);
		column-gap: var(--typesetter-page-grid-col-gap, 0px);
		width: var(--typesetter-page-w, 100%);
		height: var(--typesetter-page-h, auto);
		padding: var(--typesetter-page-marginY, 0px) var(--typesetter-page-marginX, 0px);
		line-height: var(--typesetter-baseline, 1.5rem); /* TODO: move line height into content */
        border: 1px solid black;
	}

	[data-typesetter-item] {
		grid-row: var(--typesetter-row-start) / span var(--typesetter-row-span);
		grid-column: var(--typesetter-col-start) / span var(--typesetter-col-span);
	}
</style>
