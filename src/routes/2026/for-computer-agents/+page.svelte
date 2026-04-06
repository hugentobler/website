<script lang="ts">
	import PageFooter from "$lib/components/PageFooter.svelte";
	import Content, { frontmatter } from "$lib/markdown/bowtie.md";
</script>

<svelte:head>
	<title>{frontmatter?.title ?? "For Computer Agents"}</title>
</svelte:head>

<div class="page">
	<main class="content sans type-sm" data-t8r-root>
		<Content />
	</main>
	<PageFooter />
</div>

<style>
	.page {
		--primary: var(--color-charcoal-900);
		--secondary: var(--color-charcoal-400);
		display: grid;
		grid-template-rows: 1fr auto;
		min-height: 100svh;
		color: var(--primary);

		::selection {
			color: white;
			background-color: var(--primary);
		}
	}

	.content {
		max-width: calc(var(--baseline) * 44);
		padding: var(--baseline);
	}

	.page > :global(footer) {
		padding: var(--baseline);
	}
</style>
