<!-- Build-time process images with @sveltejs/enhanced-img and render a component -->

<script lang="ts">
	const imageModules = import.meta.glob(
		"$lib/images/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp,svg}",
		{
			eager: true,
			query: {
				enhanced: true,
				format: "webp",
			},
		},
	) as Record<string, { default: string }>;

	const { src, alt, ...restProps } = $props();

	 // If src matches any imported image, render it
	const matchingPath = Object.keys(imageModules).find((path) => path.endsWith(src));
	const image = matchingPath ? imageModules[matchingPath].default : undefined;
</script>

{#if image}
	<figure data-t8r-span="3">
		<enhanced:img src={image} {alt} {...restProps} />
		{#if alt}
			<figcaption>
				{alt}
			</figcaption>
		{/if}
	</figure>
{:else}
    <!--TODO: handle missing image propertly-->
    {console.warn(`Image not found for "${src}"`)}
{/if}
