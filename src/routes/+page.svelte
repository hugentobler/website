<script lang="ts">
	import { ElementSize, useMousePosition } from "runed";
	import { flushSync } from "svelte";
	import PageFooter from "$lib/components/PageFooter.svelte";
	import LondonTelephone from "./home/london-telephone-josef-müller-brockmann.jpg?enhanced";
	import MyPortrait from "./home/noguchi.png?enhanced";

	// Poster element, size tracking, and cursor-driven 3D tilt (desktop).
	// On touch devices, scroll-driven CSS animation handles tilt instead.
	let poster = $state<HTMLDivElement>();
	const mouse = useMousePosition(() => poster);
	const size = new ElementSize(() => poster);
	const cursorX = $derived(
		size.width ? (mouse.elementX / size.width) * 2 - 1 : 0,
	);
	const cursorY = $derived(
		size.height ? (mouse.elementY / size.height) * 2 - 1 : 0,
	);

	let showInspo = $state(false);
	let writingIndex = $state(0);
	let writingVisible = $state(false);
	let writingBg = $state<HTMLDivElement>();

	function onWritingEnter(i: number, e: MouseEvent) {
		if (!writingVisible && writingBg) {
			const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
			const fromAbove = e.clientY < rect.top + rect.height / 2;

			writingBg.style.setProperty('transition', 'none');
			writingIndex = fromAbove ? i - 1 : i + 1;
			flushSync();
			writingBg.offsetHeight;
			writingBg.style.removeProperty('transition');
		}
		writingIndex = i;
		writingVisible = true;
	}

	const thumbs = import.meta.glob('./home/*.{svg,png}', { eager: true, import: 'default', query: '?url' }) as Record<string, string>;
	const thumb = (name: string) => {
		const base = `./home/${name.toLowerCase().replace(/\s+/g, '-')}`;
		return thumbs[`${base}.svg`] ?? thumbs[`${base}.png`];
	};

	const writings = [
		{
			description: "Everything changes except what didn't",
			href: "/2026/pragmatists-guide-to-ai",
			title: "Pragmatist's Guide to AI",
			year: 2026,
		},
		{
			description: "Bigger than coding agents",
			href: "/2026/feeding-computer-agents",
			title: "Feeding Computer Agents",
			year: 2026,
		},
		{
			description: "Build the feedback loop",
			href: "/2025/durable-ai-initiatives",
			title: "Durable AI Initiatives",
			year: 2025,
		},
	];

	const projects = [
		{
			headline: "Hawker-centre hackathon for 100 hungry AI tinkerers",
			name: "Inter-faces",
			thumb: {h: 60},
			year: 2024
		},
		{ headline: "Un-gatekeeping circular materials for design and manufacturing", name: "Macre", thumb: { h: 50 }, year: 2023 },
		{ headline: "Open supplier sourcing marketplace for sustainable products", name: "pokayoke", thumb: { w: 95 }, year: 2022 },
		{ headline: "Prospecting software for targeting ecommerce sellers", name: "Moonwalk", thumb: { h: 40 }, year: 2022 },
		{
			headline: "$1m software devshop, 100 founders network",
			name: "Inspect Element",
			thumb: {h: 45},
			year: 2021
		},
		{ headline: "Outdoor expeditions that stretch the comfort zone", name: "FoundLost", thumb: { h: 55 }, year: 2020 },
		{ headline: "Digital literacy courses for knowledge workers", name: "sofasoda", thumb: { h: 45, intrinsic: 96 }, year: 2019 },
		{ headline: "Tutor matchmaker for 3m students, $50m raised", name: "Snapask", thumb: { w: 45 }, year: 2016 },
		{
			headline: "Dating app for intrepid wagies",
			name: "TAB",
			thumb: {intrinsic: 374, w: 45 },
			year: 2015
		},
		{
			headline: "$1m donated, 100k alums in human trafficking fight",
			name: "24 Hour Race",
			thumb: {h: 55, intrinsic: 128},
			year: 2014
		},
	];
</script>

<!-- Click outside the inspiration poster to close it -->
<svelte:window
	onpointerdown={(e) => {
		if (
			showInspo &&
			!(e.target as Element).closest(
				"a, button, input, select, textarea, p, span, li",
			)
		) {
			showInspo = false;
		}
	}}
/>

<svelte:head>
	<title>Christopher Hugentobler 姚思陶</title>
	<meta name="description" content="Economist by training, operator by necessity, creative-engineer by vocation." />
	<meta property="og:title" content="Christopher Hugentobler 姚思陶" />
	<meta property="og:description" content="Economist by training, operator by necessity, creative-engineer by vocation." />
	<meta property="og:type" content="website" />
</svelte:head>

<div class="page">
	<main class="sidebar sans type-sm">
		<p class="name">Christopher Hugentobler <span lang="zh">姚思陶</span></p>
		<span class="subheader">About</span>
		<p>Economist by training, operator by necessity, creative-engineer by vocation.</p>
		<span class="subheader">Affairs</span>
		<div>
			<p>Computer agents</p>
			<p>Smarter health insurance</p>
		</div>
		<span class="subheader">Abode</span>
		<p>Long Beach</p>
		<!-- <span class="subheader">Agenda</span>
		<p>Abundance</p> -->
	</main>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<section
		class="writing sans type-sm"
		onmouseleave={() => (writingVisible = false)}
	>
		<span class="subheader">Writing</span>
		<div class="list">
			<div
				class="bg"
				class:visible={writingVisible}
				style:--index={writingIndex}
				bind:this={writingBg}
			></div>
			{#each writings as article, i}
				<a
					class="item"
					href={article.href}
					tabindex="0"
					onmouseenter={(e) => onWritingEnter(i, e)}
					onfocus={() => { writingIndex = i; writingVisible = true; }}
					onblur={() => (writingVisible = false)}
				>
					<div class="text">
						<p class="title">{article.title}</p>
						<p class="description">{article.description}</p>
					</div>
					<time class="year mono">{article.year}</time>
				</a>
			{/each}
		</div>
	</section>
	<section class="archives sans type-sm">
		<span class="subheader">Archives</span>
		{#each projects.slice(0, Math.ceil(projects.length / 2)) as project}
			<div
				class="archive"
				role="button"
				tabindex="0"
				onclick={(e) => {
					const el = e.currentTarget;
					const headline = el.querySelector('.headline') as HTMLElement | null;
					if (headline && headline.scrollWidth <= headline.clientWidth) return;
					el.classList.toggle('expanded');
					if (el.classList.contains('expanded')) {
						setTimeout(() => el.classList.remove('expanded'), 900);
					}
				}}
				onkeydown={(e) => {
					if (e.key !== 'Enter') return;
					const el = e.currentTarget;
					const headline = el.querySelector('.headline') as HTMLElement | null;
					if (headline && headline.scrollWidth <= headline.clientWidth) return;
					el.classList.toggle('expanded');
					if (el.classList.contains('expanded')) {
						setTimeout(() => el.classList.remove('expanded'), 900);
					}
				}}
			>
				<div class="thumb">
					{#if thumb(project.name)}
						<!-- intrinsic width/height tells the browser the aspect ratio so it can
						     reserve space before load (CLS fix). Only needed for PNGs — SVG
						     thumbs are inlined as data URIs with a viewBox, so the browser
						     already knows their dimensions. -->
						<img
							src={thumb(project.name)}
							alt={project.name}
							width={project.thumb?.intrinsic}
							height={project.thumb?.intrinsic}
							style:height={project.thumb?.h ? `${project.thumb.h}%` : undefined}
							style:width={project.thumb?.w ? `${project.thumb.w}%` : undefined}
						/>
					{/if}
				</div>
				<div class="text">
					<p class="name">{project.name}</p>
					<p class="headline">{project.headline}</p>
				</div>
				<time class="year mono">{project.year}</time>
			</div>
		{/each}
	</section>
	<section class="archives archives-bottom sans type-sm">
		<span class="subheader stacked-only">Archives continued</span>
		{#each projects.slice(Math.ceil(projects.length / 2)) as project}
			<div
				class="archive"
				role="button"
				tabindex="0"
				onclick={(e) => {
					const el = e.currentTarget;
					const headline = el.querySelector('.headline') as HTMLElement | null;
					if (headline && headline.scrollWidth <= headline.clientWidth) return;
					el.classList.toggle('expanded');
					if (el.classList.contains('expanded')) {
						setTimeout(() => el.classList.remove('expanded'), 900);
					}
				}}
				onkeydown={(e) => {
					if (e.key !== 'Enter') return;
					const el = e.currentTarget;
					const headline = el.querySelector('.headline') as HTMLElement | null;
					if (headline && headline.scrollWidth <= headline.clientWidth) return;
					el.classList.toggle('expanded');
					if (el.classList.contains('expanded')) {
						setTimeout(() => el.classList.remove('expanded'), 900);
					}
				}}
			>
				<div class="thumb">
					{#if thumb(project.name)}
						<!-- intrinsic width/height tells the browser the aspect ratio so it can
						     reserve space before load (CLS fix). Only needed for PNGs — SVG
						     thumbs are inlined as data URIs with a viewBox, so the browser
						     already knows their dimensions. -->
						<img
							src={thumb(project.name)}
							alt={project.name}
							width={project.thumb?.intrinsic}
							height={project.thumb?.intrinsic}
							style:height={project.thumb?.h ? `${project.thumb.h}%` : undefined}
							style:width={project.thumb?.w ? `${project.thumb.w}%` : undefined}
						/>
					{/if}
				</div>
				<div class="text">
					<p class="name">{project.name}</p>
					<p class="headline">{project.headline}</p>
				</div>
				<time class="year mono">{project.year}</time>
			</div>
		{/each}
	</section>
	<aside>
		<button
			type="button"
			class="poster inspo"
			class:hidden={!showInspo}
			aria-label="Close expanded poster"
			onclick={() => (showInspo = false)}
		>
			<enhanced:img
				src={LondonTelephone}
				alt="London Telephone poster by Josef Müller-Brockmann"
			/>
		</button>
		<div
			class="poster sans"
			class:hidden={showInspo}
			bind:this={poster}
			style:--cursor-x={cursorX}
			style:--cursor-y={cursorY}
			style:--recess={2.4}
		>
			<div class="recess">
				<div class="row" style:--indent={-10}>
					<p>Hong Kong <em>A</em> Economics</p>
				</div>
				<div class="row" style:--indent={-23}>
					<p>Inspect <em>Technologist</em> Element</p>
				</div>
				<div class="row" style:--indent={-5}>
					<p>Taipei <em>In Pursuit</em> Curiosity</p>
				</div>
				<div class="row" style:--indent={-15}>
					<p>Insurance <em>Of The</em> Access</p>
				</div>
				<div class="row" style:--indent={-15}>
					<p>Long <em>Evergreen</em> Material</p>
				</div>
				<div class="row" style:--indent={-15}>
					<p>High Surplus Education</p>
					<div style:--indent={12}>for the unorthodox</div>
				</div>
				<div class="row" style:--indent={-10}>
					<p>Circularity Los Angeles</p>
					<div style:--indent={8}>and for industry</div>
				</div>
				<div class="row" style:--indent={-5}>
					<p>Seed Agency Boundary</p>
				</div>
				<div class="row" style:--indent={-6}>
					<p>Commons Hong Kong</p>
				</div>
				<div class="portrait">
					<enhanced:img
						src={MyPortrait}
						alt="Christopher Hugentobler in Noguchi Garden"
					/>
					<enhanced:img src={MyPortrait} alt="" aria-hidden="true" />
				</div>
			</div>
		</div>
		<div class="toolbar">
			{#if showInspo}
				<div class="caption sans type-sm">
					<p><span style:font-weight="bold">London Telephone</span>, <span class="mono">1957</span></p>
					<p>Josef Müller-Brockmann <span class="mono">(1914–96)</span></p>
				</div>
			{/if}
			<button
				type="button"
				class="thumbnail"
				aria-label="London Telephone by Josef Müller-Brockmann"
				onclick={() => (showInspo = !showInspo)}
			>
				<enhanced:img
					src={LondonTelephone}
					alt="London Telephone poster by Josef Müller-Brockmann"
				/>
			</button>
		</div>
	</aside>
	<PageFooter />
</div>

<style>
	.page {
		--label-w: 7ch;
		--primary: var(--color-charcoal-900);
		--secondary: var(--color-charcoal-400);

		/* Poster width: height-derived vs width-derived, whichever is smaller.
		   2 baselines = aside top + bottom padding */
		--poster-w: min(
			(100svh - var(--baseline) * 2) / sqrt(2),
			100vw - var(--baseline) * 2
		);
		display: grid;
		grid-template-rows: auto auto auto 1fr auto;
		grid-template-columns: 1fr auto;
		gap: calc(var(--baseline) * 2);
		min-height: 100svh;
		color: var(--primary);

		::selection {
			color: white;
			background-color: var(--primary);
		}

		/* Stacked when viewport is narrower than 1.65:1 aspect ratio */
		@media (max-aspect-ratio: 1.65) {
			--label-w: 6ch;
			--poster-w: min(100svh / sqrt(2), 100vw - var(--baseline) * 2);
			--thumbnail-scale: 3;
			grid-template-rows: auto;
			grid-template-columns: 1fr;
		}
	}

	.sidebar {
		box-sizing: content-box;
		display: grid;
		grid-template-columns: var(--label-w) 1fr;
		grid-row: 1;
		grid-column: 1;
		gap: var(--baseline);
		align-content: start;
		align-self: start;
		width: var(--poster-w);
		padding: var(--baseline) var(--baseline) 0;
	}

	.sidebar .name {
		grid-column: 1 / -1;
		font-weight: normal;
		font-stretch: expanded;
		color: var(--secondary);
		text-transform: uppercase;

		[lang="zh"] {
			font-family: "M PLUS 1 Variable", "PingFang SC", "Noto Sans SC", "Microsoft YaHei",
				sans-serif;
			font-weight: 400;
			font-stretch: unset;
			white-space: nowrap;
		}
	}

	.subheader {
		padding-top: var(--snap-sm);
		font-stretch: condensed;
		color: var(--secondary);
	}

	.stacked-only {
		display: none;

		@media (max-aspect-ratio: 1.65) {
			display: block;
		}
	}

	.writing {
		box-sizing: content-box;
		display: flex;
		flex-direction: column;
		grid-row: 2;
		grid-column: 1;
		gap: var(--baseline);
		width: var(--poster-w);
		padding: 0 var(--baseline);

		@media (max-aspect-ratio: 1.65) {
			grid-row: auto;
			grid-column: auto;
		}

		.list {
			--item-h: calc(var(--baseline) * 2);
			--gap: var(--baseline);
			position: relative;
			display: flex;
			flex-direction: column;
			gap: var(--gap);
		}

		.bg {
			--inset: var(--baseline);
			position: absolute;
			top: 0;
			right: calc(-1 * var(--inset));
			left: calc(-1 * var(--inset));
			height: calc(var(--item-h) + var(--inset));
			margin-top: calc(-0.5 * var(--inset));
			pointer-events: none;
			background-color: white;
			opacity: 0;
			transform: translateY(calc(var(--index) * (var(--item-h) + var(--gap))));
			transition: transform 200ms ease-out, opacity 150ms ease-out;

			&.visible {
				opacity: 1;
			}

			@media not (max-aspect-ratio: 1.65) {
				--inset: calc(0.5 * var(--baseline));
			}
		}

		.item {
			position: relative;
			z-index: 1;
			display: grid;
			grid-template-columns: 1fr auto;
			gap: var(--baseline);
			align-items: center;
			height: var(--item-h);
			color: inherit;
			text-decoration: none;
			cursor: pointer;
			outline: none;
		}

		.text {
			min-width: 0;
		}

		.title {
			font-weight: normal;
		}

		.description {
			overflow: hidden;
			text-overflow: ellipsis;
			font-stretch: condensed;
			color: var(--secondary);
			white-space: nowrap;
		}

		.year {
			color: var(--secondary);
		}
	}

	.writing .item,
	.archives .archive {
		&:focus-visible {
			outline: none;

			&::before {
				position: absolute;
				inset: calc(-0.25 * var(--baseline)) calc(-0.5 * var(--baseline));
				pointer-events: none;
				content: '';
				border: 1px solid var(--primary);
			}
		}
	}

	:global(.mono) {
		font-size: var(--type-sm);
		font-weight: 450;
		font-stretch: 66%;
		line-height: var(--leading-sm);
	}

	.archives {
		box-sizing: content-box;
		display: flex;
		flex-direction: column;
		grid-row: 3;
		grid-column: 1;
		gap: var(--baseline);
		width: var(--poster-w);
		padding: 0 var(--baseline);

		@media (max-aspect-ratio: 1.65) {
			grid-row: auto;
			grid-column: auto;
		}

		.thumb {
			display: flex;
			align-items: center;
			align-self: flex-start;
			justify-content: center;
			height: calc(var(--baseline) * 2);
			overflow: hidden;

			img {
				max-height: 100%;
				object-fit: contain;
			}
		}

		.text {
			min-width: 0;
		}

		.name {
			font-weight: normal;
		}

		.headline {
			overflow: hidden;
			text-overflow: ellipsis;
			font-stretch: condensed;
			color: var(--secondary);
			white-space: nowrap;
		}

		.year {
			color: var(--secondary);
		}

		.archive {
			position: relative;
			display: grid;
			grid-template-columns: var(--label-w) 1fr auto;
			gap: var(--baseline);
			align-items: center;
			height: calc(var(--baseline) * 2);

			&:global(.expanded) {
				grid-template-columns: var(--label-w) 1fr;

				.year {
					display: none;
				}

				.headline {
					text-overflow: unset;
					white-space: normal;
				}
			}
		}
	}

	.archives-bottom {
		grid-row: 4;

		@media (max-aspect-ratio: 1.65) {
			grid-row: auto;
			order: 2;
		}
	}

	.page > :global(footer) {
		grid-row: 5;
		grid-column: 1;
		padding: var(--baseline);

		@media (max-aspect-ratio: 1.65) {
			grid-row: auto;
			grid-column: auto;
			order: 3;
			padding-bottom: 50svh;
		}
	}

	aside {
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		grid-row: 1 / -1;
		grid-column: 2;
		gap: var(--baseline);
		align-content: end;
		align-items: end;
		height: 100svh;
		padding: var(--baseline);
		padding-left: calc(3 * var(--baseline));
		background-color: white;
		perspective: 800px;

		@media (max-aspect-ratio: 1.65) {
			position: static;
			flex-direction: column;
			flex-wrap: nowrap;
			grid-row: auto;
			grid-column: auto;
			align-content: normal;
			align-items: start;
			order: 1;
			height: auto;
			padding-left: var(--baseline);
		}
	}

	/* Scroll-driven tilt for touch/no-hover devices.
	   Poster tilts forward/back as it scrolls through the viewport. */
	@keyframes scroll-tilt {
		from {
			transform: rotateX(var(--tilt));
		}
		to {
			transform: rotateX(calc(-1 * var(--tilt)));
		}
	}
	@keyframes scroll-shift {
		from {
			translate: 0 calc(-1 * var(--shift));
		}
		to {
			translate: 0 var(--shift);
		}
	}

	/* 3D tilt: cursor-driven on desktop, scroll-driven on touch */
	.poster {
		--accent: oklch(59.65% 0.1557 40.96);
		--fuscous: oklch(41.59% 0.0132 95.38);
		--tana: oklch(89.92% 0.0314 94.92);
		--tilt: 3deg;
		position: relative;
		display: grid;
		place-items: center;
		height: calc(var(--poster-w) * sqrt(2));
		aspect-ratio: calc(1 / sqrt(2));
		overflow: clip;
		background-color: var(--tana);

		&.hidden {
			position: absolute;
			visibility: hidden;
			pointer-events: none;
		}

		@media (hover: hover) {
			--rx: clamp(
				calc(-1 * var(--tilt)),
				calc(var(--cursor-y) * -1 * var(--tilt)),
				var(--tilt)
			);
			--ry: clamp(
				calc(-1 * var(--tilt)),
				calc(var(--cursor-x) * var(--tilt)),
				var(--tilt)
			);
			transform: rotateX(var(--rx)) rotateY(var(--ry));
			transition: transform 300ms ease-out;
			will-change: transform;
		}
		@media (hover: none) {
			--tilt: 12deg;
			animation: scroll-tilt linear;
			animation-timeline: view();
			animation-range: cover;
		}

		.portrait :global {
			--shift: 0.8%;
			position: absolute;
			right: 0;
			bottom: 0;
			z-index: 1;
			/* Span ~4 of 9 rows */
			height: calc(4 / 9 * 100%);
			overflow: hidden;
			pointer-events: none;
			translate: calc(var(--cursor-x) * var(--shift))
				calc(var(--cursor-y) * var(--shift));
			transition: translate 300ms ease-out;

			@media (hover: none) {
				animation: scroll-shift linear;
				animation-timeline: view();
				animation-range: cover;
			}

			/* Transparent image tinting via drop-shadow offset trick
			   https://oliverspies.blog/articles/using-mix-blend-mode-with-partly-transparent-images */
			img {
				width: auto;
				height: 100%;
			}

			picture:first-child img {
				position: relative;
				mix-blend-mode: multiply;
			}

			picture:last-child {
				position: absolute;
				inset: 0;
				z-index: -1;

				img {
					filter: drop-shadow(
						0 1000px 0 oklch(from var(--tana) calc(l + 0.3) c h)
					);
					transform: translateY(-1000px);
				}
			}
		}
	}

	/* Grid slightly larger than poster, centered, edges clipped for a recessed look.
	   Container-aware typesetting: container-type: size enables cqh units below */
	.recess {
		position: relative;
		display: grid;
		grid-auto-rows: 1fr;
		width: calc(100% + var(--recess) * 1% * 2);
		height: calc(100% + var(--recess) * 1% * 2);
		container-type: size;
		user-select: none;
	}

	/* Container-aware typesetting: font-size and optical adjustment scale with container height */
	.row {
		position: relative;
		display: flex;
		align-items: center;
		font-size: 8cqh;
		font-weight: 300;
		font-stretch: condensed;
		line-height: 1;
		color: var(--fuscous);
		text-indent: calc(var(--indent, 0) * 1cqw);
		text-transform: uppercase;
		white-space: nowrap;
		border-bottom: 0.2cqh solid var(--fuscous);

		em {
			font-style: normal;
			color: var(--accent);
		}

		> div {
			position: absolute;
			bottom: -0.5cqh;
			font-size: 3cqh;
			font-weight: 400;
			font-stretch: expanded;
			color: var(--accent);
			text-indent: calc(var(--indent, 0) * 1cqw);
			text-transform: lowercase;
		}

		& p {
			text-box: cap alphabetic;
		}

		& p:has(+ div) {
			transform: translateY(-0.75cqh);
		}
	}

	.inspo {
		padding: 0;
		overflow: hidden;
		cursor: zoom-out;
		background: none;
		border: none;

		:global(picture) {
			width: 100%;
			height: 100%;
		}

		:global(img) {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.caption {
		position: absolute;
		right: var(--baseline);
		bottom: calc(
			var(--baseline) * 2 + var(--baseline) * var(--thumbnail-scale, 2)
		);
		display: flex;
		flex-direction: column;
		justify-content: center;
		height: calc(2.4 * var(--baseline));
		padding: 0 calc(var(--baseline) / 3);
		font-weight: normal;
		font-stretch: condensed;
		background-color: white;

		:global(.mono) {
			font-weight: 450;
		}

		@media (max-aspect-ratio: 1.65) {
			position: static;
			order: 1;
			padding: 0;
			background-color: transparent;
		}
	}

	.toolbar {
		display: flex;
		gap: var(--baseline);
		align-items: start;
	}

	.thumbnail {
		height: calc(var(--baseline) * var(--thumbnail-scale, 2));
		padding: 0;
		cursor: zoom-in;
		background: none;
		border: none;

		:global(picture) {
			display: block;
			height: 100%;
		}

		:global(img) {
			width: auto;
			height: 100%;
			filter: grayscale();
			&:hover {
				filter: none;
			}
		}
	}

	:global(.type-sm) p {
		padding-top: var(--snap-sm);
		letter-spacing: -0.01em;
	}
</style>
