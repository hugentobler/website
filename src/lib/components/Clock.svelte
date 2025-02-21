<script lang="ts">
  import { SvelteDate } from 'svelte/reactivity';

  // clock height can be customised
  let { height = 1.25 } = $props();

  // record start time
  const date = new SvelteDate();
  const startTime = Date.now();
  date.setTime(startTime);

  // initialise cumulative counters
  let initialSeconds = date.getSeconds();
  let initialMinutes = date.getMinutes();
  let initialHours = date.getHours();
  let secondsOnes = $state(initialSeconds);
  let secondsTens = $state(Math.floor(initialSeconds / 10));
  let minutesOnes = $state(initialMinutes);
  let minutesTens = $state(Math.floor(initialMinutes / 10));
  let hoursOnes = $state(initialHours);
  let hoursTens = $state(Math.floor(initialHours / 10));

  // update every second
  $effect(() => {
    const interval = setInterval(() => {
      const now = date.setTime(Date.now());
      console.log(date.getHours(), date.getMinutes(), date.getSeconds());
      const elapsed = Math.floor((now - startTime) / 1000);

      secondsOnes = initialSeconds + elapsed;
      secondsTens = Math.floor((initialSeconds + elapsed) / 10);
      minutesOnes = initialMinutes + Math.floor(elapsed / 60);
      minutesTens = Math.floor((initialMinutes + Math.floor(elapsed / 60)) / 10);
      hoursOnes = initialHours + Math.floor(elapsed / 3600);
      hoursTens = Math.floor((initialHours + Math.floor(elapsed / 3600)) / 10);
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

{#snippet wheel(length: number, current: number)}
  <span
    class="relative h-[calc(var(--height)*1.25)] -rotate-x-[calc(var(--rotation)*1deg)] tabular-nums transition-transform transform-3d"
    style="--rotation: {(current * 360) /
      length}; --length: {length}; --radius: calc(var(--height) * 1.25 / sin(36deg) * -1);"
  >
    {#each Array.from({ length }, (_, i) => i) as digit, i}
      <span
        class="absolute top-1/2 left-1/2 text-(length:--height) leading-none backface-hidden"
        style="--index: {i}; transform: translate(-50%, -50%) rotateX(calc(360deg/var(--length)*var(--index))) translateZ(calc(var(--radius) * -1));"
        >{digit}</span
      >
    {/each}
  </span>
{/snippet}

<div
  class="relative grid h-[calc(var(--height)*2)] grid-cols-[repeat(6,var(--height))] content-center font-mono"
  style="--height: {height}rem; mask: linear-gradient(#0000 0.25rem, #000 calc(50% - 0.35rem) calc(50% + 0.35rem), #0000 calc(100% - 0.25rem));"
>
  <!-- minutes tens place -->
  {@render wheel(6, minutesTens)}
  <!-- minutes ones place -->
  {@render wheel(10, minutesOnes)}
  <span>:</span>
  <!-- seconds tens place -->
  {@render wheel(6, secondsTens)}
  <!-- seconds ones place -->
  {@render wheel(10, secondsOnes)}
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
