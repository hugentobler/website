<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const { frontmatters } = data;
</script>

<span>Posts</span>

<ul>
  {#each frontmatters as frontmatter}
    <a href="/{frontmatter.slug}">{frontmatter.title}</a>
  {/each}
</ul>
