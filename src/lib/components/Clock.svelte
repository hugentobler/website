<!-- inspiration: https://x.com/jh3yy/status/1842302009992675474 -->
<!-- can set clock height from parent element using css variable -->
<script lang="ts">
  import { SvelteDate } from 'svelte/reactivity';

  // record start time and set initial date values
  const date = new SvelteDate();
  const startTime = Date.now();
  date.setTime(startTime);
  let initialSeconds = date.getSeconds();
  let initialMinutes = date.getMinutes();
  let initialHours = date.getHours();

  // these states drive wheels' rotation transform
  let secondsOnes = $state(initialSeconds % 10);
  let secondsTens = $state(Math.floor(initialSeconds / 10));
  let minutesOnes = $state(initialMinutes % 10);
  let minutesTens = $state(Math.floor(initialMinutes / 10));
  let hoursOnes = $state(initialHours % 10);
  let hoursTens = $state(Math.floor(initialHours / 10));

  // actual time since start - always updated
  let totalSeconds = $state(0);

  // visual rotation time - updated when not paused
  let rotationSeconds = $state(0);

  // pause clock on hover or focus
  let isPaused = $state(false);

  $effect(() => {
    // event listener is attached to the first / highest level element with the class 'clock'
    const clockContainer = document.getElementsByClassName('clock')[0];

    const startPause = () => {
      isPaused = true;
    };

    const endPause = () => {
      isPaused = false;
      // catchup rotation time to actual time when resumed
      rotationSeconds = totalSeconds;
    };

    // mouse and focus events
    const events = [
      ['mouseenter', startPause],
      ['mouseleave', endPause]
      // ['focus', startPause],
      // ['blur', endPause]
    ] as const;

    // touch events with passive option
    const touchEvents = [
      ['touchstart', startPause],
      ['touchend', endPause],
      ['touchcancel', endPause]
    ] as const;

    // add all listeners
    events.forEach(([event, handler]) => {
      clockContainer.addEventListener(event, handler);
    });

    touchEvents.forEach(([event, handler]) => {
      clockContainer.addEventListener(event, handler, { passive: true });
    });

    // clean ups
    return () => {
      events.forEach(([event, handler]) => {
        clockContainer.removeEventListener(event, handler);
      });
      touchEvents.forEach(([event, handler]) => {
        clockContainer.removeEventListener(event, handler);
      });
    };
  });

  // update clock every second
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

      // update rotation time only when not paused
      if (!isPaused) rotationSeconds = totalSeconds;

      // use rotation time to transform wheels so they remain frozen when paused
      // ensure the wheel rolls forwards over time
      secondsOnes = initialSeconds + rotationSeconds;
      secondsTens = Math.floor((initialSeconds + rotationSeconds) / 10);
      const totalMinutes = initialMinutes + Math.floor((initialSeconds + rotationSeconds) / 60);
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
    class="relative h-[calc(var(--height)*1.25)] w-[1.1ch] -rotate-x-[calc(var(--rotation)*1deg)] tabular-nums transition-transform duration-500 ease-out transform-3d"
    style="--rotation: {(current * 360) /
      length}; --length: {length}; --radius: calc(var(--height) * 1.25 / sin(36deg) * -1);"
  >
    {#each Array.from({ length }, (_, i) => i) as digit, i (digit)}
      <span
        class="absolute top-1/2 left-1/2 text-(length:--height) leading-none
        backface-hidden"
        style="--index: {i}; transform: translate(-50%, -50%) rotateX(calc(360deg/var(--length)*var(--index))) translateZ(calc(var(--radius) * -1));"
        >{digit}</span
      >
    {/each}
  </span>
{/snippet}

<div
  class="clock relative grid h-[calc(var(--height)*2)] grid-flow-col content-center gap-px font-mono"
  style="--height: var(--clock-height, 1.125rem); mask: linear-gradient(#0000 calc(var(--height) * 0.2), #000 calc(50% - calc(var(--height) * 0.3)) calc(50% + calc(var(--height) * 0.3)), #0000 calc(100% - calc(var(--height) * 0.2)));"
>
  <!-- hours tens place -->
  {@render wheel(3, hoursTens)}
  <!-- hours ones place -->
  {@render wheel(10, hoursOnes)}
  <span class="flex items-center text-(length:--height) leading-none">:</span>
  <!-- minutes tens place -->
  {@render wheel(6, minutesTens)}
  <!-- minutes ones place -->
  {@render wheel(10, minutesOnes)}
  <span class="flex items-center text-(length:--height) leading-none">:</span>
  <!-- seconds tens place -->
  {@render wheel(6, secondsTens)}
  <!-- seconds ones place -->
  {@render wheel(10, secondsOnes)}
</div>
