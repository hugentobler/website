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

<article bind:this={article} class="relative scroll-timeline-y lg:scroll-timeline-x">
  <div id="top" class="absolute top-0"></div>
  <ScrollIndicator class="scroll-indicator top-0 animate-fade-in" direction="up" href="#top" />
  <div class="col-span-8 col-start-3 lg:h-full">
    <h1>{title}</h1>
    <span class="[writing-mode:vertical-rl] md:[writing-mode:unset]">{updated}</span>
  </div>
  <div
    class="relative col-span-8 col-start-3 row-start-2 first-letter:float-left first-letter:mt-1 first-letter:-mb-6 first-letter:text-8xl first-letter:leading-none first-letter:font-stretch-condensed"
  >
    {@render children()}
    <div id="bottom" class="absolute bottom-0"></div>
  </div>

  <footer></footer>
  <ScrollIndicator
    class="scroll-indicator bottom-0 animate-fade-in"
    direction="down"
    href="#bottom"
  />
</article>

<style lang="postcss">
  @reference "../../app.css";

  article {
    /* Layout */
    height: calc(100svh - var(--navbar-height));
    margin-bottom: var(--navbar-height);

    /* Typography */
    @apply prose max-w-none text-pretty dark:text-(--foreground-dark);
    orphans: 1;
    widows: 2;
    :global(p) {
      max-width: 64ch;
    }

    /* Grid */
    @apply grid grid-cols-11 lg:block;

    /* Columns */
    --x-spacer: theme('spacing.4');
    columns: auto;
    padding: 0 var(--x-spacer);

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
      padding-top: var(--x-spacer);
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
    @apply sticky inset-x-16 z-30 col-span-11 flex h-8 justify-center lg:hidden;
  }
</style>
