<script lang="ts">
  import { setupTheme } from '$lib/theme.svelte';

  import { browser } from '$app/environment';

  import '../app.css';

  let { children } = $props();

  if (browser) {
    setupTheme();
  }
</script>

<svelte:head>
  <!-- Set initial theme in head to avoid FOUC -->
  <script>
    // Initial theme is either in localStorage or system preference
    document.documentElement.dataset.theme =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia(`(prefers-color-scheme: dark)`).matches)
        ? 'dark'
        : 'light';
  </script>

  <!-- Preconnect to CDN -->
  <link rel="preconnect" href="https://cdn.hugentobler.xyz" crossorigin="anonymous" />
</svelte:head>

{@render children()}

<style lang="postcss">
  @reference "../app.css";

  :global(body) {
    @apply bg-(--background) text-(--foreground);
  }
</style>
