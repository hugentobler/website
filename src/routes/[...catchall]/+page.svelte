<script lang="ts">
  let { data } = $props();
</script>

<span>{data.frontmatter.title}</span>
<span>{data.frontmatter.count}</span>
<span>{data.frontmatter.color}</span>
<ul>
  {#each data.frontmatter.list as item}
    <li>{item}</li>
  {/each}
</ul>

<div class="prose">
  <data.content />
</div>
