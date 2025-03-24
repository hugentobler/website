<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements';

  const { src, ...rest }: HTMLImgAttributes = $props();
  const image = '$lib/images/${src}.jpg';

  // const images = import.meta.glob('$lib/images/*.{jpg,png}', { eager: true });
  // const imported = images[`./${src}?enhanced`];

  // const image = await import(`$lib/images/${src}?enhanced`);

  // console.log('image', image);
</script>

{#if src}
  <img src={image} {...rest} />
{/if}

<!-- INPROGRESS: MOVED IMAGES FROM STATIC TO LIB FOLDER TO TRY TO USE ENHANCED:IMG BUT SO FAR IS NO T WORKING -->
