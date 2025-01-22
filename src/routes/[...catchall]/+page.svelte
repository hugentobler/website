<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.frontmatter.title}</title>
  <meta name="description" content={data.frontmatter.description} />
</svelte:head>

<!-- 
  Each child page defines it's own custom layout
  Main is a container query parent
-->
<main class="@container absolute inset-0 h-[100svh]">
  <data.content />
</main>
