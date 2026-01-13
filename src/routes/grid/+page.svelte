<script lang="ts">
	import Bowtie, { frontmatter } from "$lib/markdown/bowtie.md";
</script>

<div class="page">
	<Bowtie />
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
