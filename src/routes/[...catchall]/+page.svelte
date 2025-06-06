<script lang="ts">
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>{data.markdown.frontmatter?.title ?? 'Undefined title'}</title>
</svelte:head>

<div class="prose"><data.markdown.default /></div>
