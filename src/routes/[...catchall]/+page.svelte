<script lang="ts">
  import { getNavbar } from '$lib/components/Navbars.svelte';

  import type { PageProps } from './$types';

  // Receive data prop from load function
  let { data }: PageProps = $props();
  // Get the layout name from frontmatter
  let layout = data.frontmatter.layout;
  // Get the correct navbar, fallsback to default
  let navbar = getNavbar(layout);
</script>

<svelte:head>
  <title>{data.frontmatter.title}</title>
  <meta name="description" content={data.frontmatter.description} />
</svelte:head>

<!-- 
  Each child page may have it's own custom navbar
-->
<nav
  class="absolute inset-x-0 bottom-0 z-30 flex h-(--navbar-height) items-center bg-white px-3 dark:bg-black dark:text-white"
>
  {@render navbar()}
</nav>

<!-- 
  Each child page may have it's own custom layout
  Main is a container query parent
-->
<main class="@container absolute inset-0 h-[100svh] bg-(--page-background)">
  <data.content />
</main>
