<script lang="ts">
  import { SvelteDate } from 'svelte/reactivity';

  let { height = 1.25 } = $props();

  const date = new SvelteDate();
  // const pad = (n: number) => (n < 10 ? '0' + n : n);

  $effect(() => {
    const interval = setInterval(() => {
      date.setTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

{#snippet wheel(length: number, currentDigit: number)}
  <span
    class="wheel relative h-[calc(var(--height)*1.25)] -rotate-x-[calc(360deg/var(--length)*var(--current))] tabular-nums transition-transform transform-3d"
    style="--current: {currentDigit}; --length: {length}; --radius: calc(var(--height) * 1.25 / sin(36deg) * -1);"
  >
    {#each Array.from({ length }, (_, i) => i) as digit, i}
      <span
        class="absolute top-1/2 left-1/2 text-(length:--height) leading-none"
        style="--index: {i}; transform: translate(-50%, -50%) rotateX(calc(360deg/var(--length)*var(--index))) translateZ(calc(var(--radius) * -1));"
        >{digit}</span
      >
    {/each}
  </span>
{/snippet}

<div class="wheels relative h-[calc(var(--height)*2)] font-mono" style="--height: {height}rem">
  {@render wheel(6, 0)}
  {@render wheel(10, 0)}
</div>

<!-- <div class="flex perspective-midrange">
  {#key pad(date.getMinutes())}
    <span class="inline-block animate-flip-in backface-hidden transform-3d">
      {pad(date.getMinutes())}
    </span>
  {/key}
  <span>:</span>
  {#key pad(date.getSeconds())}
    <span class="h-4 animate-flip-in backface-hidden transform-3d">
      {pad(date.getSeconds())}
    </span>
  {/key}
  {date.getHours()}:{pad(date.getMinutes())}:{pad(date.getSeconds())}
</div> -->

<style lang="postcss">
  .wheels {
    --label: 1.25;
    /* --wheel-width: calc(var(--label) * 0.65rem); */
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, var(--height));
    /* height: calc(var(--label) * 2rem); */
    align-content: center;
    mask: linear-gradient(
      #0000 0.25rem,
      #000 calc(50% - 0.35rem) calc(50% + 0.35rem),
      #0000 calc(100% - 0.25rem)
    );
  }
  .wheel {
    span {
      /* --radius: calc(var(--label) * 1.25 / sin(36deg) * -1rem); */
      /* transform: translate(-50%, -50%) rotateX(calc(36deg * var(--index)))
        translateZ(calc(var(--radius) * -1)); */
      display: grid;
      place-items: center;
      /* position: absolute;
      top: 50%;
      left: 50%; */
      backface-visibility: hidden;
    }
  }
</style>
