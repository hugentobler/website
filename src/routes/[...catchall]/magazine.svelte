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
  <div class="col-span-8 col-start-3 pt-16 lg:h-full lg:pt-0">
    <h1>{title}</h1>
    <span class="hidden font-stretch-condensed lg:block">{updated}</span>
  </div>
  <div class="col-start-1 row-start-3 flex justify-end lg:hidden">
    <span
      class="leading-none font-stretch-condensed [writing-mode:vertical-rl] lg:[writing-mode:unset]"
      >{updated}</span
    >
  </div>
  <div
    class="relative col-span-8 col-start-3 first-letter:float-left first-letter:mt-1 first-letter:mr-2 first-letter:-mb-6 first-letter:text-8xl first-letter:leading-none first-letter:font-stretch-ultra-condensed"
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
    @apply prose max-w-none text-pretty text-(--foreground) dark:text-(--foreground-dark);
    @apply prose-headings:font-normal prose-headings:tracking-tight prose-headings:font-stretch-condensed;
    @apply prose-h1:text-5xl;
    @apply prose-h2:text-4xl;
    @apply prose-h3:text-3xl;
    @apply prose-p:max-w-[64ch] prose-p:text-base prose-p:first:mt-0;
    @apply prose-ol:list-outside prose-ol:ps-0 prose-ol:marker:text-[0.8em] prose-ol:marker:text-current prose-ol:marker:font-stretch-expanded prose-ul:list-outside prose-ul:list-['+_'] prose-ul:ps-0 prose-ul:marker:pr-2 prose-ul:marker:text-[0.8em] prose-ul:marker:text-current prose-ul:marker:font-stretch-expanded prose-li:ps-0;
    @apply prose-blockquote:-ml-5 prose-blockquote:border-s-2 prose-blockquote:border-s-(--primary) prose-blockquote:ps-5 prose-blockquote:[&_p]:text-xl/6 prose-blockquote:[&_p]:tracking-tight;
    orphans: 1;
    widows: 2;

    /* Grid */
    @apply grid grid-cols-11 lg:block;

    /* Columns */
    --x-spacer: theme('spacing.4');
    columns: auto;
    @apply py-0 lg:px-(--x-spacer);

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

    @media (width >= theme(--breakpoint-2xl)) {
      --visible-columns: 3;
    }

    @media (width >= theme(--breakpoint-4xl)) {
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
