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
  class="absolute inset-x-0 bottom-0 z-30 mx-auto flex h-(--navbar-height) max-w-[calc(var(--container-5xl)*2)] items-center overflow-hidden bg-(--background) text-base leading-none text-(--foreground) inset-shadow-sm lg:text-xl dark:bg-(--background-dark) dark:text-(--foreground-dark)"
>
  {@render navbar()}
</nav>

<!--
  Each child page may have it's own custom layout
  Main is a container query parent
-->
<main
  class="@container absolute inset-0 mx-auto h-[100svh] max-w-[calc(var(--container-5xl)*2)] bg-(--background) dark:bg-(--background-dark)"
>
  <data.content />
</main>
