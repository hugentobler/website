<!--
@component [layout]
Renders a dynamic layout if a valid layout name is defined in the frontmatter. Otherwise, renders the default layout.
-->

<script lang="ts">
  import type { Component } from 'svelte';

  import DecoratedLink from '$lib/components/decorated-link.svelte';
  import { getNavbar } from '$lib/components/navbars.svelte';
  import type { MarkdocPageData } from '$lib/markdoc/types';

  import { page } from '$app/state';

  import Page from './+page.svelte';

  // Access frontmatter from child page data
  const data = page.data as MarkdocPageData;
  const { frontmatter } = data;

  // Get the correct navbar, fallsback to default
  const navbar = getNavbar(frontmatter.layout);

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
Directly renders the page component with the default components.
-->
{#snippet DefaultLayout()}
  <span>I am the default layout!</span>
  <Page {components} {data} />
{/snippet}

<!--
  Each child page may have it's own custom navbar
-->
<nav
  class="fixed inset-x-0 bottom-0 z-30 mx-auto grid h-(--navbar-height) max-w-[calc(var(--container-5xl)*2)] grid-cols-32"
>
  {@render navbar()}
</nav>

<!--
  Each child page may have it's own custom layout
  <main> is a container query parent
-->
<main
  class="@container absolute inset-0 mx-auto h-[100svh] max-w-[calc(var(--container-5xl)*2)] bg-(--background)"
>
  <!--
  Render the imported layout if it exists, or the default layout if it doesn't.
  The dynamic layout is passed the page data but we let the layout extend the components.
  -->
  {#await importLayout then DynamicLayout}
    {#if DynamicLayout}
      <DynamicLayout {components} {data} />
    {:else}
      {@render DefaultLayout()}
    {/if}
  {:catch}
    {@render DefaultLayout()}
  {/await}
</main>
