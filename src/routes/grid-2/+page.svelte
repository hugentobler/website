<script lang="ts">
	import Markdown from "$lib/markdown/bowtie.md";
	import Typesetter from "./Typesetter.svelte";
</script>

{#snippet content()}
	<Markdown />
{/snippet}

<div style="padding: 4rem; height: 100dvh; width: 100%;">
    <Typesetter>
    	{@render content()}
    </Typesetter>
</div>
