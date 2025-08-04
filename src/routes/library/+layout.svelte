<script lang="ts">
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();
</script>

<nav class="grid grid-cols-[2fr_1fr_1fr] gap-4">
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
    @apply border-b border-b-black;
  }
</style>
