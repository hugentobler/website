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
</svelte:head>

{@render children()}
