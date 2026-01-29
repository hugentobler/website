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
	import type { Snippet } from "svelte";
	import { browser } from "$app/environment";
	import { resizeObserver } from "$lib/attachments/resizeObserver";
	import type { PlacedNode } from "$lib/typesetter";
	import { measureNodes, BASELINE_PX as PX, placeNodesOnPages } from "$lib/typesetter";

	let { children }: { children: Snippet } = $props();

	let didWarnMissingHeight = false;
	let didWarnServerRender = false;
	// Attach this callback to the root element to track size changes
	const onRootResize = (entry: ResizeObserverEntry): void => {
		const { width, height } = entry.contentRect;
		page.wPx = Math.max(0, Math.floor(width));
		page.hPx = Math.max(0, Math.floor(height));
		if ((page.hPx === 0 || page.wPx === 0) && !didWarnMissingHeight) {
			didWarnMissingHeight = true;
			console.warn("Typesetter requires explicit parent dimensions.");
		}
	};

	// Ghost: renders children once for measurement before grid placement.
	let ghost: HTMLElement | null = null;

	// Single grid page bounds (px).
	// Page grid rows derive from baseline rhythm + available height.
	let page = $state({ hPx: 0, marginXPx: PX, marginYPx: PX, wPx: 0 });
	let pageGrid = $derived.by(() => {
		const rowGapPx = 1 * PX,
			rowHeiPx = 5 * PX,
			colGapPx = 1 * PX;
		const cols = 4;
		const hPx = Math.max(0, page.hPx - 2 * PX);
		const wPx = Math.max(0, page.wPx - 2 * page.marginXPx);
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

	$effect(() => {
		if (!browser) {
			if (!didWarnServerRender) {
				didWarnServerRender = true;
				console.warn("Typesetter should be gated to client-only rendering.");
			}
			return;
		}
		if (!ghost) return;
		if (page.wPx === 0 || page.hPx === 0) return;

		const defaultColSpan = 2;
		const measuredNodes = measureNodes(
			ghost,
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
</script>

<section
	data-t8r
	{@attach resizeObserver(onRootResize)}
	style:--base={`${PX}px`}
	style:--page-w={`${page.wPx}px`}
	style:--page-h={`${page.hPx}px`}
	style:--page-mx={`${page.marginXPx}px`}
	style:--page-my={`${page.marginYPx}px`}
	style:--grid-col-gap={`${pageGrid.colGapPx}px`}
	style:--grid-w={`${pageGrid.wPx}px`}
>
	<!-- Use page dimensions so measurement matches the visible output. -->
	<div data-t8r-ghost bind:this={ghost}>{@render children()}</div>
	<div data-t8r-pages>
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
</section>

<style>
	[data-t8r] {
		width: 100%;
		height: 100%;
	}

	[data-t8r-ghost] {
		position: fixed;
		top: 0;
		left: -9999px;
		visibility: hidden;
		width: var(--grid-w, auto);
		padding: 0;
		line-height: var(--base, 1.5rem); /* TODO: move line height into content?? */
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
		column-gap: var(--grid-col-gap, 0px);
		width: var(--page-w, 100%);
		height: var(--page-h, auto);
		padding: var(--page-my, 0px) var(--page-mx, 0px);
		line-height: var(--base, 1.5rem); /* TODO: move line height into content */
		border: 1px solid black;
	}

	[data-t8r-item] {
		grid-row: var(--row-start) / span var(--row-span);
		grid-column: var(--col-start) / span var(--col-span);
	}
</style>
