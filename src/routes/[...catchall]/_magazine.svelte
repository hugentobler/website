<script lang="ts">
  import { onMount } from 'svelte';

  import { SvelteDate } from 'svelte/reactivity';

  import Image from '$lib/components/markdown-image.svelte';
  import ScrollIndicator from '$lib/components/scroll-indicator.svelte';
  import type { MarkdocPageProps } from '$lib/markdoc/types';

  import Page from './+page.svelte';

  let { components, data } = $props() as MarkdocPageProps;
  let { frontmatter } = data;
  const updatedDate = new SvelteDate(frontmatter.updated).toISOString().split('T')[0];

  // Extend the default components for this dynamic layout
  components = {
    ...components,
    img: Image
  };

  // Watch article element scrolling
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
  <div class="col-span-26 col-start-5 pt-16 lg:ml-12 lg:h-full lg:pt-0">
    <h1>{frontmatter.title}</h1>
    <span class="hidden font-mono font-medium font-stretch-condensed lg:block">{updatedDate}</span>
  </div>
  <div class="col-start-2 row-start-3 flex translate-y-1 lg:hidden">
    <span
      class="font-mono leading-none font-medium font-stretch-condensed [writing-mode:vertical-rl] lg:[writing-mode:unset]"
      >{updatedDate}</span
    >
  </div>
  <div
    class="relative col-span-26 col-start-5 first-letter:float-left first-letter:mt-1 first-letter:mr-1 first-letter:-mb-6 first-letter:text-8xl first-letter:leading-none first-letter:font-stretch-ultra-condensed lg:ml-12"
  >
    <Page {components} {data} />
    <div id="bottom" class="absolute bottom-0"></div>
  </div>
  <!-- <footer></footer> -->
  <ScrollIndicator
    class="scroll-indicator bottom-0 animate-fade-in"
    direction="down"
    href="#bottom"
  />
</article>

<style lang="postcss">
  @reference "../../app.css";

  article {
    /* grid */
    --x-spacer: theme('spacing.4');
    @apply grid grid-cols-32 lg:block;
    @apply lg:mx-(--x-spacer) lg:py-[calc(var(--x-spacer)*2)];

    /* layout */
    height: calc(100svh - var(--navbar-height) - var(--x-spacer) / 2);
    margin-bottom: var(--navbar-height);

    /* columns */
    columns: auto;
    @media (width >= theme(--breakpoint-lg)) {
      --visible-columns: 2;
      /* no column gap, instead we set margin on child columns so we can have floating list numbers and bullets */
      column-gap: 0;
      /* container query width relies on parent container class */
      columns: calc(min(65ch, (100cqw - var(--x-spacer) * 2) / var(--visible-columns))) !important;
    }
    @media (width >= theme(--breakpoint-2xl)) {
      --visible-columns: 3;
    }
    @media (width >= theme(--breakpoint-3xl)) {
      --visible-columns: 4;
    }

    /* typography */
    @apply prose max-w-none text-pretty text-(--foreground);
    @apply prose-headings:font-normal prose-headings:tracking-tight prose-headings:text-(--foreground) prose-headings:font-stretch-condensed;
    @apply prose-h1:text-5xl;
    @apply prose-h2:text-4xl;
    @apply prose-h3:text-3xl;
    @apply prose-p:max-w-[64ch] prose-p:text-base prose-p:first:mt-0;
    @apply prose-ol:list-outside prose-ol:ps-0 prose-ol:marker:text-[0.8em] prose-ol:marker:text-current prose-ol:marker:font-stretch-expanded prose-ul:list-outside prose-ul:list-['+_'] prose-ul:ps-0 prose-ul:marker:pr-2 prose-ul:marker:text-[0.8em] prose-ul:marker:text-current prose-ul:marker:font-stretch-expanded prose-li:ps-0;
    @apply prose-a:text-(--foreground);
    @apply prose-blockquote:-ml-5 prose-blockquote:border-s-2 prose-blockquote:border-s-(--primary) prose-blockquote:ps-5 prose-blockquote:text-(--foreground) prose-blockquote:[&_p]:text-xl/6 prose-blockquote:[&_p]:tracking-tight;
    orphans: 1;
    widows: 2;

    /* scrollbars */
    @apply overflow-x-hidden overflow-y-scroll lg:overflow-x-scroll! lg:overflow-y-hidden!;
    @apply scroll-smooth lg:scroll-auto!;
  }

  :global(.scroll-indicator) {
    @apply sticky inset-x-16 z-30 col-span-32 flex h-8 justify-center lg:hidden;
  }
</style>
