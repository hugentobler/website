<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.frontmatter.title}</title>
  <meta name="description" content={data.frontmatter.description} />
</svelte:head>

<data.content />
