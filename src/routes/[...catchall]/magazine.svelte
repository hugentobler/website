<script lang="ts">
  import type { MarkdownLayoutProps } from '$lib/types';
  import { onMount } from 'svelte';

  let { children, title, updated } = $props() as MarkdownLayoutProps;
  let article: HTMLElement;

  onMount(() => {
    // Horizontal scroll listener
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      article.scrollLeft += event.deltaY + event.deltaX;
    };

    // Observe article scroll style to add/remove horizontal scroll listener
    const observer = new ResizeObserver(() => {
      const overflowX = window.getComputedStyle(article).overflowX;
      if (overflowX === 'scroll') {
        window.addEventListener('wheel', handleWheel, { passive: false });
      } else {
        window.removeEventListener('wheel', handleWheel);
      }
    });
    observer.observe(article);

    // Cleanup
    return () => {
      window.removeEventListener('wheel', handleWheel);
      observer.disconnect();
    };
  });
</script>

<article bind:this={article}>
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
    @media (width >= theme(--breakpoint-lg)) {
      --visible-columns: 2;
      column-gap: theme('spacing.8');
      /* container query width relies on parent container class */
      columns: calc(
        (100cqw - (theme('spacing.8') * (var(--visible-columns) - 1))) / var(--visible-columns)
      );
    }

    @media (width >= theme(--breakpoint-xl)) {
      --visible-columns: 3;
    }

    @media (width >= theme(--breakpoint-2xl)) {
      --visible-columns: 4;
    }

    /* Scrollbars */
    @apply overflow-x-hidden overflow-y-scroll lg:overflow-x-scroll lg:overflow-y-hidden;
    @apply scroll-smooth lg:scroll-auto;
  }
</style>
