<script lang="ts">
  import { SvelteDate } from 'svelte/reactivity';

  const date = new SvelteDate();
  const pad = (n: number) => (n < 10 ? '0' + n : n);

  $effect(() => {
    const interval = setInterval(() => {
      date.setTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

<div class="flex perspective-midrange">
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
  <!-- {date.getHours()}:{pad(date.getMinutes())}:{pad(date.getSeconds())} -->
</div>
