<script lang="ts">
  import { onMount } from 'svelte';

  import ScrollIndicator from '$lib/components/ScrollIndicator.svelte';
  import type { MarkdownLayoutProps } from '$lib/types';

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

<div id="top"></div>
<article bind:this={article} class="">
  <!-- <ScrollIndicator class="scroll-indicator top-0" direction="up" href="#top" /> -->
  <!-- <div class="col-span-8 col-start-3">
    <h1>{title}</h1>
  </div> -->
  <!-- <div class="col-span-8 col-start-3 row-start-2">
    <span>{updated}</span>
  </div> -->
  <!-- <div class="col-span-8 col-start-3 row-start-2"> -->
  {@render children()}
  <!-- </div> -->

  <footer></footer>
  <!-- <ScrollIndicator class="scroll-indicator bottom-0" direction="down" href="#bottom" /> -->
</article>
<div id="bottom"></div>

<style lang="postcss">
  @reference "../../app.css";

  article {
    /* Layout */
    --y-spacer: theme('spacing.8');
    /* position: relative; */
    height: calc(100svh - var(--navbar-height));
    margin-bottom: var(--navbar-height);

    /* Typography */
    /* @apply prose max-w-none text-pretty;
    orphans: 1;
    widows: 2;
    :global(p) {
      max-width: 64ch;
    } */

    /* Grid */
    /* @apply grid grid-cols-11 lg:block; */

    /* Columns */
    --x-spacer: theme('spacing.4');
    columns: auto;
    padding: var(--x-spacer);

    @media (width >= theme(--breakpoint-lg)) {
      --x-spacer: theme('spacing.16');
      --visible-columns: 2;
      column-gap: var(--x-spacer);
      /* container query width relies on parent container class */
      columns: calc(
        min(
          65ch,
          (100cqw - var(--x-spacer) * 2 - (var(--x-spacer) * (var(--visible-columns) - 1))) /
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
