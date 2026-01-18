<script lang="ts">
	import type { Snippet } from "svelte";
	import type { Attachment } from "svelte/attachments";
	import type { LayoutItem } from "./typesetter";
	import { DEFAULT_CONFIG, measureBlocks, paginateBlocks } from "./typesetter";

	/**
	 * ResizeObserver attachment that re-runs if the callback reference changes.
	 */
	const ro = (callback: (entry: ResizeObserverEntry) => void): Attachment => (node) => {
		const ro = new ResizeObserver(([entry]) => callback(entry));
		ro.observe(node);
		return () => ro.disconnect();
	};

	// Ghost - renders content as single page, content dimensions can be measured
	let ghost: HTMLElement | null = null;
	// Page dimensions
	let page = $state({ h: 0, w: 0 });
	let didWarnMissingHeight = false;
	let pages = $state<LayoutItem[][]>([]);
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

	const { children } = $props<{
		children: Snippet;
	}>();

	$effect(() => {
		if (!ghost) return;
		if (page.w === 0 || page.h === 0) return;
		const measured = measureBlocks(ghost);
		pages = paginateBlocks(measured);
	});
</script>

<section
	data-typesetter
	{@attach ro(onRootResize)}
	style:--typesetter-page-w={`${page.w}px`}
	style:--typesetter-page-h={`${page.h}px`}
	style:--typesetter-grid-cols={DEFAULT_CONFIG.pageGridCols}
	style:--typesetter-line-height={`${DEFAULT_CONFIG.baseLineHeightPx}px`}
>
	<!-- Use page dimensions so measurement matches the visible output. -->
	<div data-typesetter-ghost bind:this={ghost}>{@render children()}</div>
	<div data-typesetter-pages>
		<!-- Rendered pages live here; vertical flow is the default. -->
		{#each pages as pageItems, pageIndex (pageIndex)}
			<div data-typesetter-page>
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
		line-height: var(--typesetter-line-height, 1.5rem);
		width: var(--typesetter-page-w, auto);
		height: var(--typesetter-page-h, auto);
		pointer-events: none;
	}

	[data-typesetter-pages] {
		display: flex;
		flex-direction: column;
	}

	[data-typesetter-page] {
		/* Pages match the Typesetter container by default. */
		display: grid;
		grid-template-columns: repeat(var(--typesetter-grid-cols, 1), minmax(0, 1fr));
		line-height: var(--typesetter-line-height, 1.5rem);
		grid-auto-rows: var(--typesetter-line-height, 1.5rem);
		width: var(--typesetter-page-w, 100%);
		height: var(--typesetter-page-h, auto);
	}

	[data-typesetter-item] {
		grid-column: var(--typesetter-col-start) / span var(--typesetter-col-span);
		grid-row: var(--typesetter-row-start) / span var(--typesetter-row-span);
	}
</style>
