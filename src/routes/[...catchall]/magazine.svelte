<script lang="ts">
  import type { MarkdownLayoutProps } from '$lib/types';

  let { children, title, updated } = $props() as MarkdownLayoutProps;
</script>

<article class="@container prose max-w-none">
  <header>
    <h1>
      {title}
    </h1>
    <span>
      {updated}
    </span>
  </header>

  <div>
    {@render children()}
  </div>

  <footer></footer>
</article>
