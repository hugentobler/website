<script lang="ts">
	import type { MarkdocModule } from "markdoc-svelte";
	import { page } from "$app/state";
	import { HeadingTracker } from "$lib/actions/activeHeading.svelte";
	import { sentenceHighlights } from "$lib/actions/sentenceHighlights";
	import PageFooter from "$lib/components/PageFooter.svelte";
	import Toc from "$lib/components/Toc.svelte";
	import type { TocEntry } from "./+page";

	let { data }: { data: { markdown: MarkdocModule; toc: TocEntry[] } } = $props();

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

	// TOC is opt-out: every post shows one unless the frontmatter
	// explicitly disables it via `toc: false`. Posts without any h2/h3
	// headings get an empty toc array and nothing renders either.
	const tocEnabled = $derived(frontmatter?.toc !== false && data.toc.length > 0);

	const tracker = new HeadingTracker();
	let drawerOpen = $state(false);

	$effect(() => {
		if (!tocEnabled) return;
		const ids = data.toc.map((entry) => entry.id);
		tracker.start(ids);
		return () => tracker.stop();
	});

	const nextEntry = $derived(data.toc.find((entry) => entry.id === tracker.next) ?? null);
	const atEnd = $derived(tocEnabled && tracker.next === null && tracker.active !== null);
	// The mobile header only surfaces h2-level headings — h3s are too
	// granular for a single-line "next section" affordance.
	const nextH2 = $derived.by(() => {
		if (atEnd) return null;
		const nextIdx = data.toc.findIndex((e) => e.id === tracker.next);
		if (nextIdx >= 0) {
			return data.toc.slice(nextIdx).find((e) => e.level === 2) ?? null;
		}
		return data.toc.find((e) => e.level === 2) ?? null;
	});
	const headerLabel = $derived(
		atEnd ? "Back to top" : (nextH2?.title ?? "")
	);
	const headerArrow = $derived(atEnd ? "↑" : "→");
	const headerHref = $derived(atEnd ? "#top" : `#${nextH2?.id ?? ""}`);

	function closeDrawer() {
		drawerOpen = false;
	}

	function toggleDrawer() {
		drawerOpen = !drawerOpen;
	}

	function handleHeaderNavClick(event: MouseEvent) {
		if (atEnd) {
			event.preventDefault();
			window.scrollTo({ behavior: "smooth", top: 0 });
		}
	}
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

<div class="viewport" data-toc-open={drawerOpen}>
	<div class="shell">
		<div class="page">
			<header class="header sans type-sm">
				<div class="header-row">
					<a class="header-pill header-home" href="/">
						<span class="pill-label">Home</span>
					</a>
					{#if tocEnabled && headerLabel}
						<div class="header-pill header-group" role="group" aria-label="Reading navigation">
							<a class="pill-button header-next-link" href={headerHref} onclick={handleHeaderNavClick}>
								<span class="pill-arrow" aria-hidden="true">{headerArrow}</span>
								<span class="pill-label">{headerLabel}</span>
							</a>
							<button class="pill-button toc-toggle" type="button" onclick={toggleDrawer} aria-expanded={drawerOpen} aria-controls="toc-drawer" aria-label={drawerOpen ? "Close table of contents" : "Open table of contents"}>
								<svg class="toc-icon" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<rect x="0.75" y="0.75" width="14.5" height="14.5" stroke="currentColor" stroke-width="1.5" fill="none" />
									<rect class="toc-icon-bar" x="11.5" y="4" width="1.5" height="8" fill="currentColor" />
								</svg>
							</button>
						</div>
					{/if}
				</div>
				{#if tocEnabled}
					<div class="header-toc">
						<Toc toc={data.toc} active={tracker.active} />
					</div>
				{/if}
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
	</div>
	{#if tocEnabled}
		<button
			class="drawer-backdrop"
			type="button"
			aria-label="Close table of contents"
			tabindex={drawerOpen ? 0 : -1}
			onclick={closeDrawer}
		></button>
		<aside id="toc-drawer" class="drawer sans" aria-hidden={!drawerOpen}>
			<Toc toc={data.toc} active={tracker.active} onnavigate={closeDrawer} />
		</aside>
	{/if}
</div>

<style>
	.viewport {
		position: relative;
		overflow-x: clip;
	}

	.shell {
		transition: transform 250ms ease;
	}

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
		min-width: 0;
		padding: var(--baseline);
		white-space: nowrap;
	}

	.header {
		--foreground: var(--primary);
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		grid-column: 1;
		gap: var(--baseline);
		align-self: start;
		max-height: 100svh;
		color: var(--secondary);

		:global(a:hover), :global(a:focus) {
			color: var(--primary);
		}

		@media (max-width: 60rem) {
			z-index: 5;
			gap: calc(var(--baseline) / 2);
			max-height: none;
			background-color: white;
		}
	}

	.header-row {
		display: flex;
		flex-direction: row;
		gap: 2px;
		align-items: center;
		justify-content: space-between;
		min-width: 0;
	}

	.header-pill {
		display: inline-flex;
		gap: 2px;
		align-items: stretch;
		overflow: hidden;
		color: var(--secondary);
		text-decoration: none;
		border-radius: 4px;
	}

	.header-home {
		flex: 0 0 auto;
	}

	.header-group {
		display: none;
		flex: 0 1 auto;
		min-width: 0;
		margin-left: auto;
	}

	.pill-button,
	.header-home {
		display: inline-flex;
		gap: 0.5ch;
		align-items: center;
		padding: 0.4em 0.625em;
		font: inherit;
		color: inherit;
		letter-spacing: -0.01em;
		text-decoration: none;
		cursor: pointer;
		background-color: var(--color-charcoal-50);
		border: none;
		transition: background-color 150ms ease, color 150ms ease;

		@media (min-width: 60.0625rem) {
			background-color: white;
		}
	}

	.pill-button {
		flex: 0 1 auto;
		min-width: 0;
	}

	.header-next-link {
		font-stretch: condensed;
	}

	.pill-arrow {
		flex: 0 0 auto;
		font-variant-numeric: tabular-nums;
	}

	.pill-label {
		flex: 0 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.header-home:hover,
	.header-home:focus-visible,
	.pill-button:hover,
	.pill-button:focus-visible {
		color: var(--primary);
		background-color: var(--color-charcoal-100);

		@media (min-width: 60.0625rem) {
			background-color: white;
		}

	}

	.toc-toggle {
		flex: 0 0 auto;
		padding: 0 0.75em;
	}

	.toc-icon {
		display: block;
	}

	.toc-icon-bar {
		transform: translateX(0);
		transform-origin: center;
		transform-box: fill-box;
		transition: transform 250ms ease;
	}

	.viewport[data-toc-open="true"] .toc-icon-bar {
		transform: translateX(-8.5px);
	}

	.header-toc {
		display: block;
		max-width: calc(var(--baseline) * 12);
		min-height: 0;
		overflow-y: auto;
	}

	@media (max-width: 60rem) {
		.header-group {
			display: flex;
		}

		.header-toc {
			display: none;
		}
	}

	.footer {
		position: sticky;
		bottom: 0;
		z-index: 1;
		grid-column: 1;
		align-self: end;
		background-color: var(--color-charcoal-50);

		@media (max-width: 60rem) {
			position: static;
			background-color: transparent;
		}
	}

	.drawer {
		--drawer-width: min(22rem, 85vw);
		--primary: var(--color-charcoal-900);
		--secondary: var(--color-charcoal-400);
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 10;
		display: none;
		flex-direction: column;
		width: var(--drawer-width);
		padding: var(--baseline);
		overflow-y: auto;
		color: var(--secondary);
		background-color: white;
		border-left: 1px solid var(--color-charcoal-100);
		mask-image: linear-gradient(to bottom, black calc(100% - var(--baseline) * 2), transparent);
		transform: translateX(100%);
		transition: transform 250ms ease;
	}

	.drawer-backdrop {
		position: fixed;
		inset: 0;
		z-index: 9;
		display: none;
		padding: 0;
		cursor: default;
		background: transparent;
		border: none;
	}

	@media (max-width: 60rem) {
		.drawer {
			display: flex;
		}

		.drawer-backdrop {
			display: block;
			pointer-events: none;
		}

		.viewport[data-toc-open="true"] .drawer {
			transform: translateX(0);
		}

		.viewport[data-toc-open="true"] .shell {
			transform: translateX(calc(-1 * var(--drawer-width, min(22rem, 85vw))));
		}

		.viewport[data-toc-open="true"] .drawer-backdrop {
			pointer-events: auto;
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
			scroll-margin-top: calc(var(--baseline) * 2);

			@media (max-width: 60rem) {
				scroll-margin-top: calc(var(--baseline) * 4);
			}
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

		:global(table) {
			width: 100%;
			margin: var(--baseline) 0;
			font-size: var(--type-sm);
			line-height: var(--leading-sm);
			border-collapse: collapse;
		}

		:global(th), :global(td) {
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
