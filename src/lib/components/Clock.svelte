<script lang="ts">
  import { SvelteDate } from 'svelte/reactivity';

  let date = new SvelteDate();

  const pad = (n: number) => (n < 10 ? '0' + n : n);

  $effect(() => {
    const interval = setInterval(() => {
      date.setTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });
</script>

{date.getHours()}:{pad(date.getMinutes())}:{pad(date.getSeconds())}
