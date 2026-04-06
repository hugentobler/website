<script lang="ts">
	import DecoratedLink from "$lib/components/DecoratedLink.svelte";
	import VisitorFeed from "$lib/components/VisitorFeed.svelte";
</script>

<footer class="sans type-sm">
	<p class="visitors">
		Last visitor from
		<VisitorFeed>
			{#snippet children({ city, country })}
				{#if city}{city}, {country}{/if}
			{/snippet}
		</VisitorFeed>
	</p>
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
