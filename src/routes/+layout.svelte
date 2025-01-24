<script lang="ts">
  import { setThemeFromPreference } from '$lib/theme.svelte';

  import { browser } from '$app/environment';

  import '../app.css';

  let { children } = $props();

  if (browser) {
    setThemeFromPreference();
  }
</script>

{@render children()}
