<script lang="ts">
  // import Render from '$lib/markdoc/render.svelte';
  // import type { MarkdocPageProps } from '$lib/markdoc/types';
  // let { components = {}, data }: MarkdocPageProps = $props();
  // const { frontmatter, component } = data;
  const { data } = $props();
  // const { component, slug } = data;
</script>

<svelte:head>
  <title>{data.frontmatter.title} - {data.frontmatter.description}</title>
  <meta name="description" content={data.frontmatter.description} />
</svelte:head>

<!-- <Render children={content.children} {components} /> -->
<!-- <svelte:component this={content} /> -->
<data.content />
