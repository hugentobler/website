<script lang="ts">
	import { onMount } from "svelte";
	import Markdown from "$lib/markdown/bowtie.md";
	import Typesetter from "./Typesetter.svelte";

	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});
</script>

{#snippet content()}
	<Markdown />
{/snippet}

<div style="height: 100dvh; width: 100%;">
	{#if hydrated}
		<Typesetter>
			{@render content()}
		</Typesetter>
	{:else}
		{@render content()}
	{/if}
</div>
