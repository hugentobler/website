<script module lang="ts">
  import type { Snippet } from 'svelte';

  // Map layout names to snippets
  const navbars: Record<string, Snippet> = {
    // @ts-expect-error - Snippet is assigned before declaration
    default: all,
    // @ts-expect-error - Snippet is assigned before declaration
    magazine: magazine
  };

  // Get the correct navbar with fallback to default
  export const getNavbar = (name: string = 'default'): Snippet => {
    return navbars[name] || navbars.default;
  };
</script>

{#snippet all()}
  <ul>
    <li>
      <a href="/">Default</a>
    </li>
  </ul>
{/snippet}

{#snippet magazine()}
  <ul>
    <li>
      <a href="/">Yay</a>
    </li>
  </ul>
{/snippet}
