<script lang="ts">
	import type { TocEntry } from "../../routes/[...catchall]/+page";

	type Props = {
		toc: TocEntry[];
		active: string | null;
		onnavigate?: () => void;
	};

	let { toc, active, onnavigate }: Props = $props();

	const MIN_LINES = 4;
	const MAX_LINES = 9;
	const LINE_PITCH = 5;
	const maxChars = $derived(Math.max(1, ...toc.map((e) => e.chars)));

	function lineCount(chars: number): number {
		const ratio = chars / maxChars;
		const n = Math.round(MIN_LINES + ratio * (MAX_LINES - MIN_LINES));
		return Math.max(MIN_LINES, Math.min(MAX_LINES, n));
	}

	function handleClick() {
		onnavigate?.();
	}
</script>

<nav class="toc sans type-sm" aria-label="Table of contents">
	<ol class="list">
		{#each toc as entry (entry.id)}
			{@const count = lineCount(entry.chars)}
			{@const isActive = active === entry.id}
			<li
				class="item"
				data-active={isActive}
				data-level={entry.level}
				style="height: {count * LINE_PITCH}px"
			>
				<a href="#{entry.id}" onclick={handleClick}>{entry.title}</a>
			</li>
		{/each}
	</ol>
</nav>

<style>
	.toc {
		position: relative;
		display: flex;
		flex-direction: column;
		color: var(--secondary);
	}

	.list {
		display: flex;
		flex-direction: column;
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.item {
		position: relative;
		display: flex;
		align-items: start;
		padding-left: calc(2ch + 0.75ch);
		background: repeating-linear-gradient(
			to bottom,
			currentColor 0px,
			currentColor 1px,
			transparent 1px,
			transparent 5px
		) no-repeat left top / 2ch 100%;
	}

	.item[data-level="3"] {
		padding-left: calc(4ch + 0.75ch);
		background:
			linear-gradient(currentColor 0px, currentColor 1px, transparent 1px)
				no-repeat left top / 4ch 1px,
			repeating-linear-gradient(
				to bottom,
				currentColor 0px,
				currentColor 1px,
				transparent 1px,
				transparent 5px
			) no-repeat left top / 2ch 100%;
	}

	.item a {
		overflow: hidden;
		text-overflow: ellipsis;
		color: inherit;
		white-space: nowrap;
		text-decoration: none;
		transition: color 150ms ease;
	}

	.item a:hover,
	.item a:focus-visible {
		color: var(--primary);
	}

	.item[data-active="true"] {
		color: var(--primary);
	}

	/* Fallback indicator */
	.item[data-active="true"]::before {
		position: absolute;
		top: 0;
		bottom: 0;
		left: -6px;
		width: 2px;
		content: "";
		background-color: var(--primary);
	}

	@supports (anchor-name: --a) {
		.item[data-active="true"] {
			anchor-name: --toc-active;
		}

		.item[data-active="true"]::before {
			display: none;
		}

		.toc::after {
			position: absolute;
			left: -6px;
			width: 2px;
			content: "";
			background-color: var(--primary);
			position-anchor: --toc-active;
			top: anchor(top);
			height: anchor-size(height);
			transition:
				top 200ms ease,
				height 200ms ease;
		}
	}
</style>
