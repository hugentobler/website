<!--
1. Import Markdown SvelteComponent
2. Based on number of rows, we are able to chunk text into a grid area, since there is a shared baseline height
-->


<script lang="ts">
	import Markdown, { frontmatter } from "$lib/markdown/bowtie.md";
</script>

<div class="page">
	<Markdown />
</div>

<style>
    .page {
        display: grid;
        grid-template-areas: "a a";
        height: 100dvh;
		padding: 4rem;
		overflow: hidden;
	}
</style>
