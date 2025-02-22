<!-- Inspiration: https://x.com/jh3yy/status/1842302009992675474 -->

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
  let secondsOnes = $state(initialSeconds % 10);
  let secondsTens = $state(Math.floor(initialSeconds / 10));
  let minutesOnes = $state(initialMinutes % 10);
  let minutesTens = $state(Math.floor(initialMinutes / 10));
  let hoursOnes = $state(initialHours % 10);
  let hoursTens = $state(Math.floor(initialHours / 10));

  let totalSeconds = $state(0);

  // update every second
  $effect(() => {
    const interval = setInterval(() => {
      date.setTime(Date.now());
      const currentSeconds = date.getSeconds();
      const currentMinutes = date.getMinutes();
      const currentHours = date.getHours();

      // calculate how many seconds have actually elapsed since start
      totalSeconds =
        currentSeconds +
        currentMinutes * 60 +
        currentHours * 3600 -
        (initialSeconds + initialMinutes * 60 + initialHours * 3600);
      if (totalSeconds < 0) totalSeconds += 24 * 3600; // handle day wraparound

      // update digits with continuous rotation based on actual elapsed time
      secondsOnes = initialSeconds + totalSeconds;
      secondsTens = Math.floor((initialSeconds + totalSeconds) / 10);
      const totalMinutes = initialMinutes + Math.floor((initialSeconds + totalSeconds) / 60);
      minutesOnes = totalMinutes % 10;
      minutesTens = Math.floor(totalMinutes / 10);
      const totalHours = initialHours + Math.floor(totalMinutes / 60);
      hoursOnes = totalHours % 10;
      hoursTens = Math.floor(totalHours / 10);
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

{#snippet wheel(length: number, current: number)}
  <span
    class="relative h-[calc(var(--height)*1.25)] -rotate-x-[calc(var(--rotation)*1deg)] tabular-nums transition-transform duration-500 ease-out transform-3d"
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
  class="relative grid h-[calc(var(--height)*2)] grid-cols-[repeat(2,calc(var(--height)*0.4))_auto_repeat(2,calc(var(--height)*0.4))_auto_repeat(2,calc(var(--height)*0.4))] content-center font-mono"
  style="--height: {height}rem; mask: linear-gradient(#0000 0.25rem, #000 calc(50% - 0.35rem) calc(50% + 0.35rem), #0000 calc(100% - 0.25rem));"
>
  <!-- hours tens place -->
  {@render wheel(3, hoursTens)}
  <!-- hours ones place -->
  {@render wheel(10, hoursOnes)}
  <span>:</span>
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
