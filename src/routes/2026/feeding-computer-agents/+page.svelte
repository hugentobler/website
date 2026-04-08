<script lang="ts">
	import { page } from "$app/state";
	import DecoratedLink from "$lib/components/DecoratedLink.svelte";
	import PageFooter from "$lib/components/PageFooter.svelte";

	import Content, { frontmatter } from "$lib/markdown/feeding-computer-agents.md";
	import raw from "$lib/markdown/feeding-computer-agents.md?raw";

	const title = frontmatter?.title ?? "Feeding Computer Agents";
	const metatitle = `${frontmatter?.title} - ${frontmatter?.description}`;
	const description = raw
		.replace(/---[\s\S]*?---/, "") // strip frontmatter
		.replace(/[#*>[\]()_~`]/g, "") // strip markdown syntax
		.replace(/\s+/g, " ") // collapse whitespace
		.trim()
		.split(/\s+/)
		.slice(0, 120)
		.join(" ");
</script>

<svelte:head>
	<title>{metatitle}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={metatitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="{page.url.origin}/2026/feeding-computer-agents/og.png" />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:type" content="article" />
	<meta property="article:author" content="{page.url.origin}" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="page">
	<header class="header sans type-sm">
		<span class="arrow">←</span>
		<DecoratedLink href="/">More</DecoratedLink>
	</header>
	<main class="content sans">
		<time class="date mono">{frontmatter?.published}</time>
		<h1>{title}</h1>
		<Content />
	</main>
	<footer class="footer sans type-sm">
		<PageFooter />
	</footer>
</div>

<style>
	.page {
		--primary: var(--color-charcoal-900);
		--secondary: var(--color-charcoal-400);
		display: grid;
		grid-template-rows: auto 1fr auto;
		grid-template-columns: min-content 1fr;
		min-height: 100svh;
		color: var(--primary);

		::selection {
			color: white;
			background-color: var(--primary);
		}

		@media (max-width: 60rem) {
			grid-template-columns: 1fr;
		}
	}

	.header, .footer {
		padding: var(--baseline);
		white-space: nowrap;
	}

	.header {
		--foreground: var(--primary);
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: row;
		grid-column: 1;
		gap: 0.25em;
		align-items: center;
		align-self: start;
		color: var(--secondary);

		:global(a:hover), :global(a:focus) {
			color: var(--primary);
		}

		@media (max-width: 60rem) {
			position: static;
		}
	}

	.footer {
		position: sticky;
		bottom: 0;
		grid-column: 1;
		align-self: end;

		@media (max-width: 60rem) {
			position: static;
		}
	}

	.content {
		grid-row: 1 / -1;
		grid-column: 2;
		max-width: calc(var(--baseline) * 36);
		padding: calc(var(--baseline) * 2) calc(var(--baseline) * 3);
		margin: var(--baseline) 0;
		font-size: var(--type-base);
		line-height: var(--leading-base);
		letter-spacing: -0.01em;
		background-color: white;

		@media (max-width: 60rem) {
			grid-row: auto;
			grid-column: auto;
			padding: calc(var(--baseline) * 2) var(--baseline);
			margin: 0;
		}

		:global(h1), :global(h2), :global(h3), :global(h4), :global(h5), :global(h6),
		:global(p), :global(li), :global(blockquote) {
			padding-bottom: var(--snap, 0px);
			margin: 0;
		}

		:global(h2), :global(h3), :global(h4), :global(h5), :global(h6) {
			letter-spacing: -0.01em;
		}

		:global(h1), :global(h2), :global(h3), :global(h4), :global(h5), :global(h6) {
			margin-bottom: var(--baseline);
		}

		:global(h1) {
			--snap: var(--snap-2xl);
			font-size: var(--type-2xl);
			font-weight: 300;
			font-stretch: extra-condensed;
			line-height: var(--leading-2xl);
		}

		:global(h2) {
			--snap: var(--snap-lg);
			font-size: var(--type-xl);
			font-weight: 300;
			font-stretch: extra-condensed;
			line-height: var(--leading-xl);
		}

		:global(h3) {
			--snap: var(--snap-base);
			font-size: var(--type-base);
			font-weight: 600;
			line-height: var(--leading-base);
		}

		:global(p), :global(li) {
			--snap: var(--snap-base);
			font-size: var(--type-base);
			line-height: var(--leading-base);
			text-indent: 3ch;
			text-wrap: pretty;
		}

		:global(em) {
			font-stretch: condensed;
		}

		:global(figure) {
			padding: var(--baseline);
			margin: calc(var(--baseline) * 2) calc(-1 * var(--baseline));
			background-color: var(--color-charcoal-50);
		}

		:global(figcaption) {
			margin-top: calc(var(--baseline) / 2);
			font-size: var(--type-base);
			font-weight: 600;
			line-height: var(--leading-base);
			text-align: center;
			text-wrap: balance;
		}

		:global(blockquote) {
			--snap: var(--snap-lg);
			padding: var(--baseline);
			margin: var(--baseline) calc(-1 * var(--baseline));
			font-size: var(--type-lg);
			line-height: var(--leading-lg);
			background-color: var(--color-charcoal-50);
		}

		:global(p) + :global(p) {
			margin-top: var(--baseline);
		}

		:global(p) + :global(p),
		:global(blockquote) :global(p),
		:global(svg) :global(p) {
			text-indent: 0;
		}

		:global(blockquote) :global(em) {
			font-size: var(--type-md);
			line-height: var(--leading-md);
		}

		.date {
			display: block;
			padding-bottom: var(--baseline);
			font-size: var(--type-sm);
			font-weight: 450;
			font-stretch: 66%;
			line-height: var(--leading-sm);
			color: var(--secondary);
		}

		:global(h1):not(:first-child), :global(h2):not(:first-child),
		:global(h3):not(:first-child), :global(h4):not(:first-child),
		:global(h5):not(:first-child), :global(h6):not(:first-child) {
			margin-top: var(--baseline);
		}
	}

</style>
