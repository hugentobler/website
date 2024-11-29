<script lang="ts">
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
</script>

<span>{data.metadata.title}</span>
<span>{data.metadata.count}</span>
<span>{data.metadata.color}</span>
<ul>
  {#each data.metadata.list as item}
    <li>{item}</li>
  {/each}
</ul>

<div class="prose">
  <data.content />
</div>
