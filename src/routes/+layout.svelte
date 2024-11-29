<script lang="ts">
  import "../app.css";
  let { children } = $props();
</script>

<nav>
  <a href="/">Home</a>
  <a href="/content">Content</a>
</nav>

{@render children()}
