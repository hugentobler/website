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
  <button
    class="group col-span-11 m-px flex items-center rounded-lg bg-zinc-50 inset-shadow-sm inset-shadow-zinc-600/40 hover:inset-shadow-none md:col-span-8"
  >
    <a
      class="flex h-full w-full items-center justify-center text-xl leading-0 text-(--foreground) uppercase font-stretch-expanded"
      href="/"
    >
      <span class="translate-y-1 group-hover:translate-x-px">Blog</span>
    </a>
  </button>
  <button
    class="group col-span-6 m-px hidden rounded-lg bg-zinc-100 inset-shadow-sm inset-shadow-zinc-600/40 hover:inset-shadow-none md:col-span-8 lg:col-span-6 lg:flex"
  >
    <a
      href="#top"
      class="flex h-full w-full translate-y-1 items-center justify-center text-xl leading-0 text-(--foreground) uppercase font-stretch-ultra-condensed group-hover:translate-x-px"
    >
      top
    </a>
  </button>
  <div
    class="col-span-7 m-px flex items-center justify-center rounded-lg bg-zinc-100 md:col-span-8 lg:col-span-6"
  >
    <span
      class="translate-y-1 text-xl leading-0 text-(--background-dark)/50 uppercase font-stretch-ultra-condensed"
      >Los Angeles</span
    >
  </div>
  <div
    class="col-span-7 m-px flex items-center justify-center rounded-lg bg-zinc-100 md:col-span-8 lg:col-span-6"
  >
    <span
      class="translate-y-1 text-xl leading-0 text-(--background-dark)/50 uppercase font-stretch-ultra-condensed"
      ><Clock /></span
    >
  </div>
  <button
    on:click={() => toggleTheme()}
    class="col-span-7 col-end-33 m-px flex items-center justify-center rounded-lg bg-zinc-100 inset-shadow-sm inset-shadow-zinc-600/40 hover:cursor-pointer hover:inset-shadow-none md:col-span-8 lg:col-span-6"
  >
    <span class="sr-only">Toggle theme</span>
    <span
      class="translate-y-1 text-xl leading-0 text-(--foreground) uppercase font-stretch-ultra-condensed"
    >
      ‣{getNextTheme()}
    </span>
  </button>
{/snippet}
