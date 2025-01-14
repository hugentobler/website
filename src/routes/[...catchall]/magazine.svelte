<script lang="ts">
  import type { MarkdownLayoutProps } from '$lib/types';
  import { onMount } from 'svelte';
  import ScrollIndicator from '$lib/components/ScrollIndicator.svelte';

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

<article bind:this={article} class="scroll-timeline-y md:scroll-timeline-x">
  <div id="top"></div>
  <ScrollIndicator class="scroll-indicator top-0" direction="up" href="#top" />
  <header>
    <h1>
      {title}
    </h1>
    <span>
      {updated}
    </span>
  </header>

  {@render children()}

  <footer></footer>
  <ScrollIndicator class="scroll-indicator bottom-0" direction="down" href="#bottom" />
  <div id="bottom"></div>
</article>

<style lang="postcss">
  @import 'tailwindcss/theme' theme(reference);
  @plugin "@tailwindcss/typography";

  article {
    /* Layout */
    @apply relative h-full;

    /* Typography */
    @apply prose max-w-none text-pretty;
    orphans: 1;
    widows: 2;
    :global(p) {
      max-width: 64ch;
    }

    /* Columns */
    --spacer: theme('spacing.16');
    columns: auto;
    padding: 0 var(--spacer);

    @media (width >= theme(--breakpoint-lg)) {
      --visible-columns: 2;
      column-gap: var(--spacer);
      /* container query width relies on parent container class */
      columns: calc(
        min(
          65ch,
          (100cqw - var(--spacer) * 2 - (var(--spacer) * (var(--visible-columns) - 1))) /
            var(--visible-columns)
        )
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

  :global(.scroll-indicator) {
    @apply sticky inset-x-16 z-30 flex h-4 justify-center lg:hidden;
  }
</style>
