<!--
1. Import Markdown SvelteComponent
2. Based on number of rows, we are able to chunk text into a grid area, since there is a shared baseline height
-->


<script lang="ts">
	import Markdown from "$lib/markdown/bowtie.md";
	import PageGrid from "./PageGrid.svelte";
</script>

<PageGrid columnsPerPage={2} totalGridColumns={6} lineHeight={20} rows={9}>
	<Markdown />
</PageGrid>
