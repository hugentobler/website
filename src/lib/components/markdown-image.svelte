<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements';

  let { src, ...rest }: HTMLImgAttributes = $props();
</script>

{#if src}
  <enhanced:img {src} {...rest} />
{/if}

<!-- INPROGRESS: MOVED IMAGES FROM STATIC TO LIB FOLDER TO TRY TO USE ENHANCED:IMG BUT SO FAR IS NO T WORKING -->
