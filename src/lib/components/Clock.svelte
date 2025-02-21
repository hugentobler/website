<script lang="ts">
  import { SvelteDate } from 'svelte/reactivity';

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
    class="wheel relative h-12 w-4 transform-3d"
    style="--current: {currentDigit}; --length: {length};"
  >
    {#each Array.from({ length }, (_, i) => i) as digit, i}
      <span style="--index: {i}" class="absolute top-1/2 left-1/2 backface-hidden">{digit}</span>
    {/each}
  </span>
{/snippet}

<div class="flex items-center perspective-midrange">
  {@render wheel(10, 0)}
  {@render wheel(2, 0)}
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
  .wheel {
    span {
      transform: translate(-50%, -50%) rotateX(36deg * var(--index));
    }
  }
</style>
