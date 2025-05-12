<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>{data.markdoc.frontmatter?.title ?? 'Undefined title'}</title>
</svelte:head>

<div class="prose"><data.markdoc.default /></div>
