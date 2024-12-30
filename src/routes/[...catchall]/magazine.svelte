<script lang="ts">
  import type { MarkdownLayoutProps } from '$lib/types';

  let { children, title, updated } = $props() as MarkdownLayoutProps;
</script>

<article
  class="
  scroll-timeline-y md:scroll-timeline-x relative grid h-full w-full
       grid-cols-11 gap-y-8 overflow-x-hidden
       overflow-y-scroll scroll-smooth [orphans:1] md:block
       md:gap-x-8 md:overflow-x-scroll md:overflow-y-hidden md:scroll-auto
       md:py-8
       md:[column-width:calc((99vw-6rem)/2)]
       lg:[column-width:calc((99vw-8rem)/3)]
       2xl:[column-width:calc(80rem/3)]
"
>
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
