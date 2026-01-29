<script lang="ts">
	import { onMount } from "svelte";
	import Markdown from "$lib/markdown/bowtie.md";
	import Typesetter from "$lib/typesetter";

	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});
</script>

{#snippet content()}
	<Markdown />
{/snippet}

{#if hydrated}
	<div class="typesetter-pane">
		<Typesetter>{@render content()}</Typesetter>
	</div>
{:else}
	{@render content()}
{/if}

<style>
	.typesetter-pane {
		width: 100%;
		height: 100dvh;
		padding: 16px;
		overflow: auto;
	}
</style>
