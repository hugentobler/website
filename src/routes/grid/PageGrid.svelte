<script lang="ts">
	import type { Snippet } from "svelte";
	import type { LayoutItem, MeasuredBlock } from "./layout";
	import { measureBlocks, paginateBlocks } from "./layout";

	type Props = {
		children: Snippet;
		columnsPerPage?: number;
		totalGridColumns?: number;
		imageColSpan?: number;
		lineHeight?: number;
		rows?: number;
		pagePadding?: string;
		pageGap?: string;
	};

	let measureEl: HTMLDivElement | null = null; // off-screen element for accurate line wrapping
	let columnEl: HTMLDivElement | null = null; // visible column for size reference

	let {
		children,
		columnsPerPage = 2,
		totalGridColumns = 6,
		imageColSpan = 4,
		lineHeight = 20,
		rows = 9,
		pagePadding = "4rem",
		pageGap = "2rem",
	}: Props = $props();

	const columnSpan = totalGridColumns / columnsPerPage;
	const clampedImageSpan = Math.min(imageColSpan, totalGridColumns);

	let resizeTimer: ReturnType<typeof setTimeout> | null = null;
	let columnRect = $state<DOMRect | null>(null);
	let cachedLayoutKey = "";
	let cachedBlocks: MeasuredBlock[] = [];
	let pages = $state<LayoutItem[][]>([[]]);
	let rowsPerPage = $state(0);

	$effect(() => {
		if (!columnEl) return;

		// Watch the visible column so layout recalculates when its size changes.
		columnRect = columnEl.getBoundingClientRect();
		const observer = new ResizeObserver(() => {
			if (resizeTimer) clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				if (!columnEl) return;
				columnRect = columnEl.getBoundingClientRect();
			}, 50);
		});

		observer.observe(columnEl);

		return () => {
			observer.disconnect();
			if (resizeTimer) clearTimeout(resizeTimer);
		};
	});

	$effect(() => {
		if (!measureEl || !columnRect) return;

		// Use the visible column as the source of truth for width/height.
		const maxLinesPerColumn = Math.max(1, Math.floor(columnRect.height / lineHeight));
		rowsPerPage = maxLinesPerColumn;
		measureEl.style.width = `${columnRect.width}px`;

		const layoutKey = `${columnRect.width}-${lineHeight}-${columnsPerPage}-${totalGridColumns}-${clampedImageSpan}`;
		// Cache measured blocks unless the column width or line height changes.
		if (layoutKey !== cachedLayoutKey) {
			cachedBlocks = measureBlocks(measureEl, lineHeight, columnSpan, clampedImageSpan);
			cachedLayoutKey = layoutKey;
		}

		pages = paginateBlocks(cachedBlocks, totalGridColumns, rowsPerPage);
	});
</script>

<div
	class="pages"
	style={`--column-span: ${columnSpan}; --line-height: ${lineHeight}px; --rows: ${rowsPerPage || rows}; --page-padding: ${pagePadding}; --page-gap: ${pageGap}; --grid-gap: 1rem; --total-grid-columns: ${totalGridColumns};`}
>
	{#each pages as page, pageIndex}
		<div class="page" data-page={pageIndex}>
			{#if pageIndex === 0}
				<div class="sizer" bind:this={columnEl} aria-hidden="true"></div>
			{/if}
			{#each page as item}
				<div
					class={`item item--${item.kind}`}
					style={`grid-column: ${item.colStart} / span ${item.colSpan}; grid-row: ${item.rowStart} / span ${item.rowSpan};`}
				>
					{@html item.html}
				</div>
			{/each}
		</div>
	{/each}

	<div class="measure" bind:this={measureEl}>
		{@render children()}
	</div>
</div>

<style>
	.pages {
		display: grid;
		gap: var(--page-gap);
	}

	.page {
		display: grid;
		grid-template-columns: repeat(var(--total-grid-columns), minmax(0, 1fr));
		grid-template-rows: repeat(var(--rows), var(--line-height));
		gap: var(--grid-gap);
		height: 100dvh;
		padding: var(--page-padding);
		overflow: hidden;
		align-content: start;
		position: relative;
	}

	.sizer {
		position: absolute;
		top: var(--page-padding);
		left: var(--page-padding);
		width: calc(
			(
					(100% - (var(--grid-gap) * (var(--total-grid-columns) - 1)) -
							(var(--page-padding) * 2)) /
						var(--total-grid-columns)
				) *
				var(--column-span) +
				(var(--grid-gap) * (var(--column-span) - 1))
		);
		height: calc(100% - (var(--page-padding) * 2));
		visibility: hidden;
		pointer-events: none;
	}

	.item {
		line-height: var(--line-height);
	}

	.item :global(p) {
		margin: 0; /* remove margin from height calculation */
	}

	.measure {
		position: absolute;
		top: 0;
		left: -10000px;
		visibility: hidden;
		line-height: var(--line-height);
	}
</style>
