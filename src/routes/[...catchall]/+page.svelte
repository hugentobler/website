<script lang="ts">
  import Render from '$lib/markdoc/render.svelte';
  import type { MarkdocPageProps } from '$lib/markdoc/types';

  // let { components = {}, data }: MarkdocPageProps = $props();
  // const { frontmatter, component } = data;
  const { data } = $props();
  const { component, slug } = data;
</script>

<svelte:head>
  <!-- <title>{frontmatter.title}</title>
  <meta name="description" content={frontmatter.description} /> -->
</svelte:head>

<!-- <Render children={content.children} {components} /> -->
<svelte:component this={component} />
