<!--
@component [layout]
Renders a dynamic layout if a valid layout name is defined in the frontmatter. Otherwise, renders the default layout.
-->

<script lang="ts">
  import type { Component } from 'svelte';

  import DecoratedLink from '$lib/components/DecoratedLink.svelte';
  import type { MarkdocPageData } from '$lib/markdoc/types';

  import { page } from '$app/state';

  import type { LayoutProps } from './$types';
  import Page from './+page.svelte';

  let { children } = $props() as LayoutProps;
  // Access frontmatter from child page data
  const data = page.data as MarkdocPageData;
  const { frontmatter } = data;

  // Import the layout from the same folder as the current file
  // Rollup prefers specifying a filename pattern when importing from the same folder https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
  let importLayout = frontmatter.layout
    ? import(`./_${frontmatter.layout}.svelte`)
        .then((m): Component => m.default)
        .catch((error) => {
          console.error(`Error loading layout: "${frontmatter.layout}"`, error);
          return null;
        })
    : null;

  // Set default components for all layouts
  const components = {
    a: DecoratedLink
  };
</script>

<!--
Default layout if no layout is defined in the frontmatter.
-->
{#snippet DefaultLayout()}
  <span>I am the default layout!</span>
  <Page {components} {data} />
{/snippet}

<!--
Renders the imported layout if it exists, or the default layout if it doesn't
-->
{#await importLayout then DynamicLayout}
  {#if DynamicLayout}
    <DynamicLayout {data}>
      {@render children()}
    </DynamicLayout>
  {:else}
    {@render DefaultLayout()}
  {/if}
{:catch}
  {@render DefaultLayout()}
{/await}
