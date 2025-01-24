<!-- Shuding's scroll indicator -->
<!-- https://x.com/shuding_/status/1698176794124578923 -->

<script lang="ts">
  let {
    direction,
    href,
    class: className
  } = $props<{
    direction: 'up' | 'down';
    href: string;
    class?: string;
  }>();

  const paths = {
    up: 'M213.66 165.66a8 8 0 0 1-11.32 0L128 91.31l-74.34 74.35a8 8 0 0 1-11.32-11.32l80-80a8 8 0 0 1 11.32 0l80 80a8 8 0 0 1 0 11.32Z',
    down: 'm213.66 101.66l-80 80a8 8 0 0 1-11.32 0l-80-80a8 8 0 0 1 11.32-11.32L128 164.69l74.34-74.35a8 8 0 0 1 11.32 11.32Z'
  };
</script>

<div class={className}>
  <a
    {href}
    aria-label={direction}
    class="flex w-full animate-scroll-timeline items-center justify-center bg-(--page-background)/80 dark:bg-neutral-900/80 {direction ===
    'down'
      ? '[animation-direction:reverse] [animation-range:calc(100%-100svh)_100%]'
      : '[animation-direction:normal] [animation-range:entry_0%_exit_100svh]'}"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 256 256"
      class="size-5"
    >
      <path fill="currentColor" d={paths[direction as keyof typeof paths]} />
    </svg>
  </a>
</div>
