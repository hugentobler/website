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
    <a class="flex h-full items-center uppercase font-stretch-expanded" href="/">
      <span class="translate-y-1">Blog</span>
    </a>
  </button>
  <div
    class="flex h-full grow items-center justify-between text-base leading-none uppercase font-stretch-ultra-condensed"
  >
    <span class="translate-y-1">Los Angeles</span>
    <span class="translate-y-1"><Clock /></span>
    <button on:click={() => toggleTheme()} class="h-full">
      <span class="sr-only">Toggle theme</span>
      <span class="inline-block translate-y-1 uppercase font-stretch-ultra-condensed"
        >‣{getNextTheme()}</span
      >
    </button>
  </div>
{/snippet}
