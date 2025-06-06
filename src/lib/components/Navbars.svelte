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
    class="col-span-11 m-px flex items-center rounded-lg bg-zinc-50 inset-shadow-sm inset-shadow-zinc-600/40 hover:inset-shadow-none md:col-span-8 dark:bg-zinc-800 dark:inset-shadow-zinc-950/40"
    tabindex="-1"
  >
    <a
      class="group flex h-full w-full items-center justify-center rounded-lg text-lg leading-0 text-(--foreground) uppercase font-stretch-expanded focus:inset-ring-2 focus:outline-none lg:text-xl"
      href="/content"
    >
      <span
        class="flex h-full translate-y-1 items-center group-hover:translate-x-px group-focus:translate-x-px"
        >Blog</span
      >
    </a>
  </button>
  <button
    class="col-span-6 m-px hidden rounded-lg bg-zinc-100 inset-shadow-sm inset-shadow-zinc-600/40 hover:inset-shadow-none md:col-span-8 lg:col-span-6 lg:flex dark:bg-zinc-700 dark:inset-shadow-zinc-950/40"
    tabindex="-1"
  >
    <a
      href="#top"
      class="group flex h-full w-full items-center justify-center rounded-lg text-lg leading-0 text-(--foreground) uppercase font-stretch-ultra-condensed focus:inset-ring-2 focus:outline-none lg:text-xl"
    >
      <span
        class="flex h-full translate-y-1 items-center group-hover:translate-x-px group-focus:translate-x-px"
        >Top</span
      >
    </a>
  </button>
  <div
    class="col-span-7 m-px flex items-center justify-center rounded-lg bg-zinc-100 md:col-span-8 lg:col-span-6 dark:bg-zinc-700"
  >
    <span
      class="flex h-full translate-y-1 items-center text-lg leading-0 uppercase font-stretch-ultra-condensed invert-50 lg:text-xl"
      >Los Angeles</span
    >
  </div>
  <div
    class="clock col-span-7 m-px flex items-center justify-center rounded-lg bg-zinc-100 hover:cursor-wait md:col-span-8 lg:col-span-6 dark:bg-zinc-700"
  >
    <span
      class="flex h-full translate-y-px items-center font-medium font-stretch-ultra-condensed invert-50 supports-font-variation-settings:font-semibold"
    >
      <Clock />
    </span>
  </div>
  <button
    on:click={() => toggleTheme()}
    class="group col-span-7 col-end-33 m-px flex items-center justify-center rounded-lg bg-zinc-100 inset-shadow-sm inset-shadow-zinc-600/40 hover:cursor-pointer hover:inset-shadow-none focus:inset-shadow-none focus:inset-ring-2 focus:outline-none md:col-span-8 lg:col-span-6 dark:bg-zinc-700 dark:inset-shadow-zinc-950/40"
  >
    <span class="sr-only">Toggle theme</span>
    <span
      class="translate-y-1 text-lg leading-0 text-(--foreground) uppercase font-stretch-ultra-condensed group-hover:translate-x-px group-focus:translate-x-px lg:text-xl"
    >
      ‣{getNextTheme()}
    </span>
  </button>
{/snippet}
