<!-- Enhanced image component that works with @sveltejs/enhanced-img build-time processing -->

<script lang="ts">
  const imageModules = import.meta.glob(
    '$lib/images/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}',
    {
      eager: true,
      query: {
        enhanced: true
      }
    }
  ) as Record<string, { default: string }>;

  const { src, alt, ...restProps } = $props();

  const matchingPath = Object.keys(imageModules).find((path) => path.endsWith(src));
  const image = matchingPath ? imageModules[matchingPath].default : undefined;
</script>

{#if image}
  <figure>
    <enhanced:img src={image} {alt} {...restProps} />
    {#if alt}
      <figcaption>
        {alt}
      </figcaption>
    {/if}
  </figure>
{:else}
  <div class="text-red-500">Image not found: {src}</div>
{/if}
