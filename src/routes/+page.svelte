<script lang="ts">
	import { ElementSize, useMousePosition } from "runed";
	import DecoratedLink from "$lib/components/DecoratedLink.svelte";
	import VisitorFeed from "$lib/components/VisitorFeed.svelte";
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

	const projects = [
		{ headline: "Insurance for the underserved", name: "Mātū", year: 2024 },
		{
			headline: "Circular economy material passport",
			name: "Cambium",
			year: 2023,
		},
		{
			headline: "Decentralized education marketplace",
			name: "Tōkō",
			year: 2023,
		},
		{
			headline: "Supply chain transparency platform",
			name: "Meridian",
			year: 2022,
		},
		{
			headline: "Community resource sharing network",
			name: "Pūkeko",
			year: 2021,
		},
		{ headline: "Regenerative forestry analytics", name: "Kauri", year: 2020 },
		{ headline: "Open source design system", name: "Whetū", year: 2019 },
		{ headline: "Algorithmic decision auditing", name: "Tātai", year: 2018 },
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

<div class="page">
	<main class="sans" data-t8r-root>
		<h1 class="nameplate">
			Christopher Hugentobler <span lang="zh">姚思陶</span>
		</h1>
		<p class="type-lg">
			Technologist pursuing the evergreen at the intersection of design,
			economics, and circularity.
		</p>
		{#each projects as project}
			<article class="project">
				<div class="project-image">
					<enhanced:img src={LondonTelephone} alt={project.name} />
				</div>
				<h3 class="project-name">{project.name}</h3>
				<p class="project-desc">{project.headline}</p>
				<time class="project-year">{project.year}</time>
			</article>
		{/each}
	</main>
	<footer class="sans type-md">
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
	</footer>
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
				<p class="caption sans type-base">
					<span style:font-weight="bold">London Telephone</span>, 1957<br
					/>Josef Müller-Brockmann (1914–96)
				</p>
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
</div>

<style>
	.page {
		/* Poster width: height-derived vs width-derived, whichever is smaller.
		   2 baselines = aside top + bottom padding */
		--poster-w: min(
			(100svh - var(--baseline) * 2) / sqrt(2),
			100vw - var(--baseline) * 2
		);
		display: grid;
		grid-template-rows: 1fr auto;
		grid-template-columns: 1fr auto;
		gap: var(--baseline);
		min-height: 100svh;

		/* Stacked when viewport aspect ratio ≤ sqrt(2) — the point where
		   two poster-width columns no longer fit side by side */
		@media (max-aspect-ratio: 1.414) {
			--poster-w: min(100svh / sqrt(2), 100vw - var(--baseline) * 2);
			--thumbnail-scale: 3;
			grid-template-rows: auto;
			grid-template-columns: 1fr;
		}
	}

	main {
		display: grid;
		grid-row: 1;
		grid-column: 1;
		grid-auto-rows: calc(var(--baseline) * 4);
		padding: var(--baseline);
		container-type: inline-size;
	}

	footer {
		grid-row: 2;
		grid-column: 1;
		padding: 0 var(--baseline) var(--baseline);
		font-weight: 300;
		font-stretch: condensed;

		@media (max-aspect-ratio: 1.414) {
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
		perspective: 800px;

		@media (max-aspect-ratio: 1.414) {
			position: static;
			flex-direction: column;
			flex-wrap: nowrap;
			grid-row: auto;
			grid-column: auto;
			align-content: normal;
			align-items: start;
			order: 2;
			height: auto;
		}
	}

	.nameplate {
		overflow: clip;
		font-size: min(var(--type-2xl), 6.5cqi);
		font-weight: bold;
		font-stretch: expanded;
		line-height: var(--leading-2xl);
		letter-spacing: -0.06em;
		white-space: nowrap;

		[lang="zh"] {
			font-family: "PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif;
			font-size: 0.7em;
			vertical-align: 0.05em;
		}
	}

	.visitors {
		min-height: 1lh;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
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

		p {
			text-box: cap alphabetic;
		}

		p:has(+ div) {
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
		padding: 0.5em 0.75em;
		font-weight: normal;
		font-stretch: condensed;
		background-color: oklch(100% 0 0 / 0.85);

		@media (max-aspect-ratio: 1.414) {
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

	/* Project list entries — each spans 2 baseline-grid rows (8 baselines) */
	.project {
		display: grid;
		grid-template-rows: auto auto;
		grid-template-columns: calc(var(--baseline) * 5) 1fr auto;
		grid-row: span 2;
		column-gap: var(--baseline);
		align-content: center;
	}

	/* Reset typesetter auto-sizing inside project entries */
	.project :is(h3, p, time) {
		--t8r-snap: 0;
		padding-bottom: 0;
		margin-top: 0;
	}

	.project-image {
		grid-row: 1 / -1;
		overflow: hidden;

		:global(picture) {
			display: block;
			width: 100%;
			height: 100%;
		}

		:global(img) {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	.project-name {
		align-self: end;
		font-size: var(--type-base);
		font-weight: bold;
		line-height: var(--leading-base);
	}

	.project-desc {
		align-self: start;
		font-size: var(--type-sm);
		font-weight: 300;
		font-stretch: condensed;
		line-height: var(--leading-sm);
	}

	.project-year {
		grid-row: 1 / -1;
		align-self: center;
		font-size: var(--type-sm);
		font-weight: 300;
		font-stretch: condensed;
		line-height: var(--leading-sm);
	}
</style>
