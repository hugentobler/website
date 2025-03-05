<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements';

  let { src, ...rest }: HTMLImgAttributes = $props();
  src = '/images/' + src;
</script>

<img {src} {...rest} />
