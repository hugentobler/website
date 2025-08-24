<script lang="ts">
import type { LayoutProps } from "./$types";

let { children }: LayoutProps = $props();
</script>

<nav>
  <h1>My Library</h1>
  <ul>
    <li>Home</li>
    <li>Resume</li>
    <li>Typography</li>
  </ul>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
</nav>

<main>
  {@render children()}
</main>

<style lang="postcss">
  @reference "../../app.css";

  nav {
    @apply grid grid-cols-[2fr_1fr_1fr] gap-4;
  }

  main {
    @apply border-y border-black;
  }
</style>
