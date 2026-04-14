<script lang="ts">
	import type { Snippet } from "svelte";
	import DecoratedLink from "./DecoratedLink.svelte";

	let { n, children }: { n: number; children: Snippet } = $props();
</script>

<li id="cite-{n}">
	{@render children()}
	<DecoratedLink class="back" href="#cite-{n}-ref" onclick={(e) => {
		e.preventDefault();
		document.getElementById(`cite-${n}-ref`)?.scrollIntoView({ behavior: 'smooth' });
	}}><span class="mono arrow">↑</span></DecoratedLink>
</li>

<style>
	:global(.back) {
		--foreground: var(--secondary, currentColor);
		margin-left: 0.5ch;
		font-size: var(--type-md);
		font-weight: 450;
		font-stretch: 66%;
	}

	.arrow {
		font-weight: 500;
		font-stretch: expanded;
	}
</style>
