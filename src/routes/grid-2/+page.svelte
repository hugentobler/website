<script lang="ts">
	import { onMount } from "svelte";
	import Markdown from "$lib/markdown/bowtie.md";
	import Typesetter from "./Typesetter.svelte";
	import TypesetterFlow from "./TypesetterFlow.svelte";

	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});
</script>

{#snippet content()}
	<Markdown />
{/snippet}

<div class="typesetter-compare">
	{#if hydrated}
		<!-- <div class="typesetter-pane">
			<Typesetter>
				{@render content()}
			</Typesetter>
		</div> -->
		<div class="typesetter-pane">
			<TypesetterFlow>
				{@render content()}
			</TypesetterFlow>
		</div>
	{:else}
		{@render content()}
	{/if}
</div>

<style>
	.typesetter-compare {
		display: grid;
		grid-template-columns: 1fr;
		gap: 24px;
		width: 100%;
		min-height: 100dvh;
		padding: 16px;
	}

	.typesetter-pane {
		height: 100dvh;
		overflow: auto;
	}

	@media (min-width: 960px) {
		.typesetter-compare {
			grid-template-columns: 1fr 1fr;
			align-items: stretch;
		}
	}
</style>
