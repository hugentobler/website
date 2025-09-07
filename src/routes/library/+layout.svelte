<script lang="ts">
import type { LayoutProps } from "./$types";
let { children }: LayoutProps = $props();
</script>

{@render children()}

<style lang="postcss">
  /* Library route: override global theme variables using CSS layers */
  @layer overrides {
    :global(:root) {
      --background: var(--color-slate-50);
      --foreground: var(--color-slate-900);
      --primary: var(--color-indigo-600);
    }

    :global([data-theme='dark']) {
      --background: var(--color-slate-900);
      --foreground: var(--color-slate-100);
      --primary: var(--color-indigo-400);
    }
  }
</style>
