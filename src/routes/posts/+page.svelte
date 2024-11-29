<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<span>Posts</span>

<ul>
  {#each data.posts as post}
    <a href="/{post.slug}">{post.title}</a>
  {/each}
</ul>
