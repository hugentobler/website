<script lang="ts">
  import type { MarkdownLayoutProps } from '$lib/types';

  let { children, title, updated } = $props() as MarkdownLayoutProps;
</script>

<article>
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

<style lang="postcss">
  @import 'tailwindcss/theme' theme(reference);

  article {
    /* Layout */
    @apply h-full;

    /* Typography */
    @apply text-pretty;
    orphans: 1;
    widows: 2;

    /* Columns */
    @media (width >= theme(--breakpoint-md)) {
      --visible-columns: 2;
      column-gap: theme('spacing.8');
      columns: calc(
        (100cqw - (theme('spacing.8') * 2)) / var(--visible-columns)
      ); /* Parent container class required */
    }

    @media (width >= theme(--breakpoint-lg)) {
      --visible-columns: 3;
    }

    /* Scrollbars */
    @apply overflow-x-hidden overflow-y-scroll md:overflow-x-scroll md:overflow-y-hidden;
    @apply scroll-smooth md:scroll-auto;
  }
</style>
