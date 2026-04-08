<script lang="ts">
	import createPanzoom from "panzoom";
	import { onMount } from "svelte";

	const { src, alt = "" }: { src: string; alt?: string } = $props();

	const svgModules = import.meta.glob("$lib/images/*.svg", {
		eager: true,
		query: "?raw",
	}) as Record<string, { default: string }>;

	const matchingPath = Object.keys(svgModules).find((path) =>
		path.endsWith(src),
	);
	const raw = matchingPath ? svgModules[matchingPath].default : undefined;

	let viewport: HTMLElement;

	onMount(() => {
		const target = viewport.querySelector("svg");
		if (!target) return;

		const instance = createPanzoom(target, {
			maxZoom: 5,
			minZoom: 0.5,
			smoothScroll: false,
		});

		return () => instance.dispose();
	});
</script>

<figure>
	<div class="viewport" role="img" aria-label={alt} bind:this={viewport}>
		{#if raw}
			{@html raw}
		{/if}
	</div>
	{#if alt}
		<figcaption>{alt}</figcaption>
	{/if}
</figure>

<style>
	.viewport {
		overflow: hidden;
		cursor: grab;
		border: 1px dotted var(--secondary, #ccc);
		border-radius: 4px;

		&:active {
			cursor: grabbing;
		}

		:global(svg) {
			box-sizing: border-box;
			display: block;
			width: 100%;
			height: auto;
			padding: var(--baseline);
		}

		/* Override typesetter rules that clobber tldraw's inlined font sizes
		   inside foreignObject. There's probably a better solution in future. */
		:global(svg foreignObject *) {
			font-size: inherit;
		}
	}
</style>
