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
  <!-- <div class="w-4"></div> -->
  <button class="col-span-11 m-px flex items-center rounded-lg bg-white md:col-span-8">
    <a
      class="flex h-full w-full items-center justify-center text-xl leading-0 uppercase font-stretch-expanded"
      href="/"
    >
      <span class="translate-y-1">Blog</span>
    </a>
  </button>
  <div
    class="col-span-7 m-px flex items-center justify-center rounded-lg bg-slate-50 md:col-span-8"
  >
    <span class="translate-y-1 text-xl leading-0 uppercase font-stretch-ultra-condensed"
      >Los Angeles</span
    >
  </div>
  <div
    class="col-span-7 m-px flex items-center justify-center rounded-lg bg-slate-50 md:col-span-8"
  >
    <span class="translate-y-1 text-xl leading-0 uppercase font-stretch-ultra-condensed"
      ><Clock /></span
    >
  </div>
  <button
    on:click={() => toggleTheme()}
    class="col-span-7 col-end-33 m-px flex items-center justify-center rounded-lg bg-slate-100 hover:cursor-pointer md:col-span-8"
  >
    <span class="sr-only">Toggle theme</span>
    <span class="translate-y-1 text-xl leading-0 uppercase font-stretch-ultra-condensed">
      ‣{getNextTheme()}
    </span>
  </button>
{/snippet}
