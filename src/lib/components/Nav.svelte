<script lang="ts">
  import type { Snippet } from 'svelte';

  let { renderNav } = $props<{
    renderNav: Snippet;
  }>();
</script>

<nav class="bg-gray-800 p-4 text-white">
  {@render renderNav()}
</nav>
