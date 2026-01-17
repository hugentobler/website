<!--
1. Import Markdown SvelteComponent
2. Based on number of rows, we are able to chunk text into a grid area, since there is a shared baseline height
-->


<script lang="ts">
	import Markdown from "$lib/markdown/bowtie.md";

	let measureEl: HTMLDivElement | null = null; // off-screen element for accurate line wrapping
	let columnEl: HTMLDivElement | null = null; // visible column for size reference

	const columnsCount = 2;
	const totalGridColumns = 6;
	const columnSpan = totalGridColumns / columnsCount;
	const lineHeight = 20;

	let columns = $state<string[][]>(
		Array.from({ length: columnsCount }, () => [] as string[]),
	);
	let resizeTimer: ReturnType<typeof setTimeout> | null = null;
	let columnRect = $state<DOMRect | null>(null);
	let cachedLayoutKey = "";
	let cachedBlocks: { html: string; lines: number }[] = [];

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
		const maxLines = Math.max(1, Math.floor(columnRect.height / lineHeight));
		measureEl.style.width = `${columnRect.width}px`;

		const layoutKey = `${columnRect.width}-${lineHeight}`;
		// Cache measured blocks unless the column width or line height changes.
		if (layoutKey !== cachedLayoutKey) {
			// Measure top-level blocks only (paragraphs, headings, lists, etc.).
			const blocks = Array.from(measureEl.querySelectorAll(":scope > *")) as HTMLElement[];
			cachedBlocks = blocks.map((block) => {
				const height = block.getBoundingClientRect().height;
				const lines = Math.max(1, Math.ceil(height / lineHeight));
				return { html: block.outerHTML, lines };
			});
			cachedLayoutKey = layoutKey;
		}

		const nextColumns: string[][] = Array.from({ length: columnsCount }, () => []);
		let columnIndex = 0;
		let usedLines = 0;

		for (const block of cachedBlocks) {
			// Fill columns top-to-bottom, left-to-right; stop when all columns are full.
			if (usedLines + block.lines > maxLines) {
				if (columnIndex < columnsCount - 1) {
					columnIndex += 1;
					usedLines = 0;
				} else {
					break;
				}
			}

			nextColumns[columnIndex].push(block.html);
			usedLines += block.lines;
		}

		columns = nextColumns;
	});
</script>

<div class="page" style={`--column-span: ${columnSpan};`}>
	<div class="column" bind:this={columnEl}>
		{@html columns[0]?.join("") ?? ""}
	</div>
	{#each columns.slice(1) as column}
		<div class="column">
			{@html column.join("")}
		</div>
	{/each}

	<div class="measure" bind:this={measureEl}>
		<Markdown />
	</div>
</div>

<style>
	.page {
		display: grid;
		--line-height: 20px;
		--rows: 9;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		grid-template-rows: repeat(var(--rows), minmax(0, 1fr));
		gap: 1rem;
		height: 100dvh;
		padding: 4rem;
		overflow: hidden;
	}

	.column {
		grid-row: 1 / span var(--rows);
		grid-column: span var(--column-span);
		height: 100%;
		line-height: var(--line-height);
	}

	.column :global(p) {
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
