<script lang="ts">
  import { onMount } from 'svelte';

  import { SvelteDate } from 'svelte/reactivity';

  import DecoratedLink from '$lib/components/DecoratedLink.svelte';
  import ScrollIndicator from '$lib/components/ScrollIndicator.svelte';

  import type { PageProps } from './$types';
  import Page from './+page.svelte';

  let { data } = $props() as PageProps;
  let { frontmatter, headings } = data.markdown;

  // Filter h2 headings
  const filteredHeadings = headings?.filter((heading) => heading.level == 2) ?? [];

  const updatedDate = frontmatter?.updated
    ? new SvelteDate(frontmatter.updated).toISOString().split('T')[0]
    : '';

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
  <div class="col-span-26 col-start-5 pt-8 lg:h-full lg:pt-0">
    <h1
      class="!mb-5 !text-6xl !tracking-normal text-balance uppercase !font-stretch-ultra-condensed sm:!text-7xl lg:!m-0 xl:!text-8xl"
    >
      {frontmatter?.title ?? 'Untitled'}
    </h1>
    <span
      class="mt-2 hidden font-mono text-sm font-semibold tracking-[0.5em] font-stretch-ultra-expanded lg:block"
      >{updatedDate}</span
    >
    {#if filteredHeadings.length > 0}
      <ol class="toc">
        {#each filteredHeadings as heading (heading.id)}
          <li class=" flex-1 !text-base">
            <span class="line-clamp-2 text-pretty">
              <DecoratedLink class="!text-(--foreground)/70" href={`#${heading.id}`}>
                {heading.title}
              </DecoratedLink>
            </span>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
  <div class="col-start-2 row-start-3 flex translate-y-1 lg:hidden">
    <span
      class="font-mono text-xs leading-none font-semibold tracking-[0.5em] font-stretch-ultra-expanded [writing-mode:vertical-rl] lg:[writing-mode:unset]"
      >{updatedDate}</span
    >
  </div>
  <div
    class="relative col-span-26 col-start-5 first-letter:float-left first-letter:-mt-4 first-letter:mr-4 first-letter:-mb-1 first-letter:-ml-4 first-letter:font-mono first-letter:text-8xl first-letter:leading-none first-letter:font-semibold first-letter:italic first-letter:font-stretch-ultra-condensed lg:ml-12"
  >
    <Page {data} />
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
    --x-spacer: theme('spacing.10');
    @apply grid grid-cols-32 lg:block;
    @apply lg:mx-(--x-spacer) lg:pt-[calc(var(--x-spacer)*2)] lg:pb-[calc(var(--x-spacer)*3)];

    /* layout */
    height: calc(100svh - var(--navbar-height));
    @media (width >= theme(--breakpoint-lg)) {
      height: calc(100svh - var(--navbar-height) - var(--x-spacer) / 2);
    }
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
    @media (width >= theme(--breakpoint-4xl)) {
      --visible-columns: 4;
    }

    /* typography */
    @apply prose max-w-none text-pretty text-(--foreground);
    @apply prose-headings:font-normal prose-headings:tracking-tight prose-headings:text-(--foreground) prose-headings:font-stretch-condensed;
    @apply prose-h2:mt-10 prose-h2:mb-5 prose-h2:break-inside-avoid-column prose-h2:text-5xl prose-h2:font-light prose-h2:tracking-tighter prose-h2:text-balance prose-h2:font-stretch-condensed sm:prose-h2:text-6xl xl:prose-h2:text-7xl;
    @apply prose-h3:text-3xl prose-h3:tracking-normal prose-h3:uppercase prose-h3:font-stretch-ultra-condensed sm:prose-h3:text-4xl xl:prose-h3:text-5xl;
    @apply prose-p:text-base/7 prose-p:tracking-tight prose-p:text-(--foreground) prose-p:[orphans:2] prose-p:first:mt-0 lg:prose-p:max-w-[50ch] lg:prose-p:text-lg/7 2xl:prose-p:text-xl/8;
    @apply prose-em:font-stretch-condensed;
    @apply prose-ol:list-outside prose-ol:ps-0 prose-ol:marker:text-[0.85em] prose-ol:marker:font-medium prose-ol:marker:text-current prose-ol:marker:font-stretch-expanded prose-ul:list-outside prose-ul:list-['+_'] prose-ul:ps-0 prose-ul:marker:pr-2 prose-ul:marker:text-[0.85em] prose-ul:marker:text-current prose-ul:marker:font-stretch-expanded prose-li:ps-0 prose-li:text-base/7 prose-li:tracking-tight prose-li:text-(--foreground) lg:prose-li:text-lg/7 2xl:prose-li:text-xl/8;
    @apply prose-a:text-(--foreground);
    @apply prose-blockquote:-mr-4 prose-blockquote:-ml-10 prose-blockquote:break-inside-avoid-column prose-blockquote:rounded-lg prose-blockquote:border-s-3 prose-blockquote:border-s-(--foreground)/75 prose-blockquote:bg-(--foreground)/5 prose-blockquote:p-5 prose-blockquote:text-(--foreground) lg:prose-blockquote:-mx-5 prose-blockquote:[&_p]:m-0 prose-blockquote:[&_p]:text-2xl prose-blockquote:[&_p]:font-stretch-condensed sm:prose-blockquote:[&_p]:text-3xl xl:prose-blockquote:[&_p]:text-4xl;
    @apply prose-figure:-mr-4 prose-figure:-ml-10 prose-figure:break-inside-avoid-column prose-figure:rounded-lg prose-figure:bg-(--foreground)/5 prose-figure:p-5 lg:prose-figure:-mx-5;
    @apply prose-figcaption:-mb-2 prose-figcaption:text-center prose-figcaption:text-base prose-figcaption:text-(--foreground)/75 prose-figcaption:font-stretch-condensed sm:prose-figcaption:text-lg xl:prose-figcaption:text-xl;

    /* scrollbars */
    @apply overflow-x-hidden overflow-y-scroll lg:overflow-x-scroll! lg:overflow-y-hidden!;
    @apply scroll-smooth lg:scroll-auto!;

    .toc {
      @apply right-(--x-spacer) bottom-[calc(var(--x-spacer)*2)] left-(--x-spacer) mx-auto mt-0 mb-10 max-w-[calc(var(--container-5xl)*2)] justify-between gap-5 lg:fixed lg:flex 3xl:px-(--x-spacer);
      @apply marker:text-(--foreground)/70 lg:!list-inside;
    }
  }

  :global(.scroll-indicator) {
    @apply sticky inset-x-16 z-30 col-span-32 flex h-8 justify-center lg:hidden;
  }
</style>
