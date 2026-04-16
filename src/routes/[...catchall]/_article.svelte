<script lang="ts">
	import type { MarkdocModule } from "markdoc-svelte";
	import { page } from "$app/state";
	import { sentenceHighlights } from "$lib/actions/sentenceHighlights";
	import DecoratedLink from "$lib/components/DecoratedLink.svelte";
	import PageFooter from "$lib/components/PageFooter.svelte";

	let { data }: { data: { markdown: MarkdocModule } } = $props();

	const frontmatter = $derived(data.markdown.frontmatter);
	const Content = $derived(data.markdown.default);
	const title = $derived(frontmatter?.title ?? "Untitled");
	const metatitle = $derived(frontmatter?.description
		? `${frontmatter.title} - ${frontmatter.description}`
		: frontmatter?.title);
	const pubDate = $derived(frontmatter?.published
		? new Date(`${frontmatter.published}T00:00:00`)
		: null);
	const formattedDate = $derived(pubDate?.toLocaleDateString("en-US", { month: "short", year: "numeric" }));
	const ogDescription = $derived(`Christopher Hugentobler 姚思陶 – ${formattedDate}`);
</script>

<svelte:head>
	<title>{metatitle}</title>
	<meta name="description" content={ogDescription} />
	<meta property="og:title" content={metatitle} />
	<meta property="og:description" content={ogDescription} />
	<meta property="og:image" content="{page.url.origin}{page.url.pathname}/og.png" />
	<meta property="og:url" content="{page.url.origin}{page.url.pathname}" />
	<meta property="og:type" content="article" />
	<meta property="article:author" content="{page.url.origin}" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="page">
	<header class="header sans type-sm">
		<span class="arrow">←</span>
		<DecoratedLink href="/">Home</DecoratedLink>
	</header>
	<main class="content sans" use:sentenceHighlights={{ slug: page.url.pathname }}>
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
		/* Fixed sidebar width so the footer's "Last visitor from …" line
		   cannot reflow the grid when the client heartbeat updates it.
		   Previously this was `min-content`, which sized the column to the
		   widest visitor string and caused layout shift on each poll. The
		   existing `.visitors` CSS (white-space: nowrap; text-overflow:
		   ellipsis) now actually kicks in for long names. */
		--sidebar-w: 18rem;
		display: grid;
		grid-template-rows: auto 1fr auto;
		grid-template-columns: var(--sidebar-w) 1fr;
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
			padding-bottom: 50svh;
		}
	}

	.content {
		grid-row: 1 / -1;
		grid-column: 2;
		/* Allow scrollable children (.table-scroll) to clip their intrinsic
		   min-content width instead of bubbling it up through the grid
		   track and forcing the column wider than the viewport. */
		min-width: 0;
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
			text-wrap: pretty;
		}

		:global(p) {
			text-indent: 3ch;
		}

		/* Subtitle convention: a fully-italicized paragraph sitting
		   directly after the article title reads as a dedication or
		   note to the reader, so it sits flush and in the secondary
		   color. The next paragraph then acts as the real first
		   paragraph and keeps its indent. */
		:global(h1 + p:has(em:only-child)) {
			color: var(--secondary);
			text-indent: 0;
		}

		:global(h1 + p:has(em:only-child) + p) {
			text-indent: 3ch;
		}

		:global(ol), :global(ul) {
			padding-left: 3ch;
			margin-top: var(--baseline);
			margin-bottom: var(--baseline);
		}

		:global(li) + :global(li) {
			margin-top: calc(var(--baseline) / 2);
		}

		:global(ol) {
			list-style-type: none;
			counter-reset: item;
		}

		:global(ul) {
			list-style-type: disc;
		}

		:global(ol) > :global(li) {
			position: relative;
			counter-increment: item;
		}

		:global(ol) > :global(li)::before {
			position: absolute;
			right: 100%;
			padding-right: 0.5ch;
			font-family: var(--font-mono);
			font-size: var(--type-sm);
			font-weight: 500;
			font-feature-settings: "tnum";
			content: counter(item) ".";
		}

		/* Citations component renders its own native ::marker; suppress
		   the counter ::before and restore native list-style there. */
		:global(.citations) :global(ol) {
			list-style-type: decimal;
		}

		:global(.citations) :global(li)::before {
			content: none;
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
		:global(svg) :global(p),
		:global(.citations) :global(p),
		:global(.citations) :global(li) {
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

		:global(.table-scroll) {
			margin: var(--baseline) 0;
			overflow-x: auto;
		}

		:global(.table-scroll) :global(table) {
			width: max-content;
			min-width: 100%;
			font-size: var(--type-sm);
			line-height: var(--leading-sm);
			border-collapse: collapse;
		}

		:global(th), :global(td) {
			max-width: 32ch;
			padding: calc(var(--baseline) / 4) calc(var(--baseline) / 2);
			vertical-align: top;
			text-align: left;
			text-indent: 0;
			border-bottom: 1px solid var(--color-charcoal-100);
		}

		:global(th) {
			font-weight: 600;
			border-bottom-color: var(--primary);
		}

		:global(td) :global(br) {
			display: none;
		}

		:global(td) :global(br ~ .sentence),
		:global(td) :global(.sentence:has(+ br)) {
			display: block;
		}

		:global(td) :global(.sentence:has(+ br)) {
			margin-bottom: calc(var(--baseline) / 2);
		}

		:global(.sentence) {
			--crowd-warmth: 0;
			--hover-boost: 0;
			--warmth: max(var(--crowd-warmth), var(--hover-boost));
			padding: 1px 0;
			cursor: pointer;
			background-color: color-mix(
				in oklch,
				transparent,
				oklch(0.92 0.15 90) calc(var(--warmth) * 100%)
			);
			border-radius: 2px;
			transition: background-color 150ms ease;
		}

		:global(.sentence:hover) {
			--hover-boost: 0.15;
		}

		:global(.sentence[data-own]) {
			text-decoration: underline;
			text-decoration-thickness: 1.5px;
			text-decoration-color: oklch(0.75 0.15 90);
			text-underline-offset: 2px;
		}
	}
</style>
