<script lang="ts">
  let { data } = $props();
</script>

<span>Posts</span>

<ul>
  {#each data.frontmatters as frontmatter}
    <a href="/{frontmatter.slug}">{frontmatter.title}</a>
  {/each}
</ul>
