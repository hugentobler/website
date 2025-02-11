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
  <button class="col-span-8 m-px flex items-center rounded-lg bg-white">
    <a
      class="flex h-full w-full items-center justify-center text-xl leading-0 uppercase font-stretch-expanded"
      href="/"
    >
      <span class="translate-y-1">Blog</span>
    </a>
  </button>
  <div class="col-span-4 m-px flex items-center justify-center rounded-lg bg-slate-50">
    <span class="translate-y-1 text-xl leading-0 uppercase font-stretch-ultra-condensed"
      >Los Angeles</span
    >
  </div>
  <div class="col-span-4 m-px flex items-center justify-center rounded-lg bg-slate-50">
    <span class="translate-y-1 text-xl leading-0 uppercase font-stretch-ultra-condensed"
      ><Clock /></span
    >
  </div>
  <button
    on:click={() => toggleTheme()}
    class="col-span-4 m-px flex items-center justify-center rounded-lg bg-slate-100 hover:cursor-pointer"
  >
    <span class="sr-only">Toggle theme</span>
    <span class="translate-y-1 text-xl leading-0 uppercase font-stretch-ultra-condensed">
      ‣{getNextTheme()}
    </span>
  </button>

  <!-- <button class="flex h-full grow items-center">
    <a class="flex h-full items-center uppercase font-stretch-expanded" href="/">
      <span class="translate-y-1">Blog</span>
    </a>
  </button> -->
  <!-- <div class="flex h-full grow items-center uppercase font-stretch-ultra-condensed">
    <span class="translate-y-1">Los Angeles</span>
  </div> -->
  <!-- <div class="flex h-full grow items-center uppercase font-stretch-ultra-condensed">
    <span class="translate-y-1"><Clock /></span>
  </div> -->
  <!-- <button
    on:click={() => toggleTheme()}
    class="flex h-full flex-col justify-center hover:cursor-pointer"
  >
    <span class="sr-only">Toggle theme</span>
    <span class="w-full translate-y-1 text-right uppercase font-stretch-ultra-condensed">
      ‣{getNextTheme()}
    </span>

    <span class="invisible h-0 uppercase font-stretch-ultra-condensed" aria-hidden="true">
      ‣System
    </span>
  </button> -->
  <!-- <div class="w-4"></div> -->
{/snippet}
