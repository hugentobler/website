<!--
@component [layout]
Renders a dynamic layout if a valid layout name is defined in the frontmatter. Otherwise, renders the article layout.
-->

<script lang="ts">
import type { MarkdocModule } from "markdoc-svelte";
import type { Component } from "svelte";
import { page } from "$app/state";
// import { getNavbar } from "$lib/components/Navbars.svelte";

import Article from "./_article.svelte";

// Access frontmatter from child page data
const data = page.data as { markdown: MarkdocModule; visitor: { city: string | null; country: string | null } };
const { frontmatter } = data.markdown;

// Get the correct navbar, fallsback to default
// const navbar = getNavbar(frontmatter?.layout);

// Import the layout from the same folder as the current file
// Rollup prefers specifying a filename pattern when importing from the same folder https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
let importLayout = frontmatter?.layout
	? import(`./_${frontmatter.layout}.svelte`)
			.then((m): Component => m.default)
			.catch((error) => {
				console.error(`Error loading layout: "${frontmatter?.layout}"`, error);
				return null;
			})
	: null;
</script>

<!--
  Each child page may have it's own custom navbar
-->
<!-- <nav
  class="fixed inset-x-1 bottom-0 z-30 mx-auto flex h-(--navbar-height) max-w-[calc(var(--container-5xl)*2)] gap-1 py-1"
>
  {@render navbar()}
</nav> -->

<!--
  Each child page may have it's own custom layout
-->
{#await importLayout then DynamicLayout}
  {#if DynamicLayout}
    <DynamicLayout {data} />
  {:else}
    <Article {data} />
  {/if}
{:catch _}
  <Article {data} />
{/await}
