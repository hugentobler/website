<script lang="ts">
import type { PageProps } from "./$types";

let { data }: PageProps = $props();
const { content } = data;
</script>

<h1>Posts</h1>

<ul>
  {#each content as item, i (item.slug)}
    <li class={"item-" + i}>
      <a href="/{item.slug}">
        <h2>{item.frontmatter?.title || item.slug}</h2>
        {#if item.frontmatter?.description}
          <span>{item.frontmatter.description}</span>
        {/if}
        {#if item.frontmatter?.published}
          <span>{new Date(item.frontmatter.published).getFullYear()}</span>
        {/if}
      </a>
    </li>
  {/each}
</ul>
