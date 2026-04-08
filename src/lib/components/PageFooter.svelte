<script lang="ts">
	import { page } from "$app/state";
	import DecoratedLink from "$lib/components/DecoratedLink.svelte";
	import VisitorFeed from "$lib/components/VisitorFeed.svelte";
</script>

<footer class="sans type-sm">
	<VisitorFeed path={page.url.pathname} city={page.data.visitor.city} country={page.data.visitor.country}>
		{#snippet children({ city, country })}
			<p class="visitors">Last visitor from {city}, {country}</p>
		{/snippet}
	</VisitorFeed>
	<p>
		<DecoratedLink
			target="_blank"
			href="https://github.com/hugentobler/website/blob/master/LICENSE"
			>Open source</DecoratedLink
		>
	</p>
	<p>
		<DecoratedLink
			target="_blank"
			href="https://www.instagram.com/globehunter"
			>Instagram</DecoratedLink
		>
	</p>
	<p>
		<DecoratedLink
			target="_blank"
			href="https://linkedin.com/in/hugentobler"
			>LinkedIn</DecoratedLink
		>
	</p>
</footer>

<style>
	footer {
		--foreground: var(--primary);
		color: var(--secondary);

		p {
			padding-top: var(--snap-sm);
		}

		:global(a:hover), :global(a:focus) {
			color: var(--primary);
		}
	}

	.visitors {
		min-height: 1lh;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
