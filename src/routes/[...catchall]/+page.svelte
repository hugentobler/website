<script lang="ts">
  import { getNavbar } from '$lib/components/Navbars.svelte';

  import type { PageProps } from './$types';

  // Receive data from load function via the data prop
  let { data }: PageProps = $props();
  // Get the layout name from the frontmatter
  let layout = data.frontmatter.layout;
  // Get the correct navbar with fallback to default
  let navbar = getNavbar(layout);
</script>

<svelte:head>
  <title>{data.frontmatter.title}</title>
  <meta name="description" content={data.frontmatter.description} />
</svelte:head>

<!-- 
  Each child page may have it's own custom navbar
-->
<nav>
  {@render navbar()}
</nav>

<!-- 
  Each child page may have it's own custom layout
  Main is a container query parent
-->
<main class="@container absolute inset-0 h-[100svh]">
  <data.content />
</main>
