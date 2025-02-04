<script module lang="ts">
  import type { Snippet } from 'svelte';

  import Clock from '$lib/components/Clock.svelte';
  import { getNextTheme, toggleTheme } from '$lib/theme.svelte';

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
  <button class="flex h-full grow items-center">
    <a class="uppercase font-stretch-expanded" href="/">Blog</a>
  </button>
  <div class="flex grow justify-between uppercase font-stretch-condensed">
    <span>Los Angeles</span>
    <Clock />
    <button on:click={() => toggleTheme()}>
      <span class="sr-only">Toggle theme</span>
      <span class="uppercase font-stretch-condensed">{getNextTheme()}</span>
    </button>
  </div>
{/snippet}
