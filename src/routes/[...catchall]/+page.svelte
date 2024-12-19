<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.frontmatter.title}</title>
</svelte:head>

<span>{data.frontmatter.description}</span>

<div class="prose">
  <data.content />
</div>

<style>
  span {
    color: green;
  }
</style>
