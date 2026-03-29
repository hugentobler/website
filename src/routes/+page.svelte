<script lang="ts">
	import { ElementSize, useMousePosition } from "runed";
	import { dev } from "$app/environment";
	import VisitorFeed from "$lib/components/VisitorFeed.svelte";
	import LondonTelephone from "./home/london-telephone-josef-müller-brockmann.jpg?enhanced";
	import Portrait from "./home/noguchi.png?enhanced";

	// Window dimensions for layout calculations
	let innerWidth = $state(0);
	let innerHeight = $state(0);

	// Device orientation for mobile tilt (hover: none devices)
	type DOEWithPermission = typeof DeviceOrientationEvent & {
		requestPermission?: () => Promise<"granted" | "denied">;
	};

	let orientationX = $state(0);
	let orientationY = $state(0);
	let hasOrientation = $state(false);
	let betaBaseline = $state<number | null>(null);
	let orientationPermission = $state<"prompt" | "granted" | "denied" | "unsupported">("prompt");
	const isTouchDevice = $derived(
		typeof matchMedia !== "undefined" && matchMedia("(hover: none)").matches,
	);

	// Throttle orientation events to one update per animation frame
	let orientationFrame = 0;
	function handleOrientation(e: DeviceOrientationEvent) {
		if (e.gamma == null || e.beta == null) return;
		cancelAnimationFrame(orientationFrame);
		orientationFrame = requestAnimationFrame(() => {
			if (e.gamma == null || e.beta == null) return;
			// Calibrate neutral tilt from first reading (user's natural hold angle)
			if (betaBaseline === null) betaBaseline = e.beta;
			hasOrientation = true;
			// gamma: left-right tilt (-90..90) → map to -1..1
			orientationX = Math.max(-1, Math.min(1, e.gamma / 45));
			// beta: offset from user's natural hold angle → map to -1..1
			orientationY = Math.max(-1, Math.min(1, (e.beta - (betaBaseline ?? 0)) / 30));
		});
	}

	function startListening() {
		window.addEventListener("deviceorientation", handleOrientation);
	}

	async function requestOrientationPermission() {
		const DOE = DeviceOrientationEvent as DOEWithPermission;
		if (typeof DOE.requestPermission !== "function") return;
		try {
			const result = await DOE.requestPermission();
			orientationPermission = result;
			if (result === "granted") startListening();
		} catch {
			orientationPermission = "denied";
		}
	}

	$effect(() => {
		if (!isTouchDevice) return;
		if (typeof DeviceOrientationEvent === "undefined") {
			orientationPermission = "unsupported";
			return;
		}
		const DOE = DeviceOrientationEvent as DOEWithPermission;
		if (typeof DOE.requestPermission === "function") {
			orientationPermission = "prompt";
		} else {
			orientationPermission = "granted";
			startListening();
		}
		return () => {
			window.removeEventListener("deviceorientation", handleOrientation);
			cancelAnimationFrame(orientationFrame);
		};
	});

	// CSS --baseline (uses vw, changes with viewport width)
	let baseline = $state(24);
	$effect(() => {
		void innerWidth;
		baseline =
			parseFloat(
				getComputedStyle(document.documentElement).getPropertyValue(
					"--baseline",
				),
			) || 24;
	});

	// Poster element, size tracking, and cursor-driven 3D tilt
	let poster = $state<HTMLDivElement>();
	const mouse = useMousePosition(() => poster);
	const size = new ElementSize(() => poster);
	const cursorX = $derived(
		isTouchDevice && hasOrientation
			? orientationX
			: size.width
				? (mouse.elementX / size.width) * 2 - 1
				: 0,
	);
	const cursorY = $derived(
		isTouchDevice && hasOrientation
			? orientationY
			: size.height
				? (mouse.elementY / size.height) * 2 - 1
				: 0,
	);

	// Layout measurement — JS polyfill for style() container queries
	// Future: @container style(--toolbar-beside: true)
	let asideEl = $state<HTMLElement>();
	let toolbarEl = $state<HTMLDivElement>();
	const asideSize = new ElementSize(() => asideEl);
	const toolbarSize = new ElementSize(() => toolbarEl);

	// Poster's natural width (without toolbar inset) — stable reference to avoid feedback loops
	// Mirrors CSS: min((100svh - baseline * 3) / sqrt(2), 100vw - baseline * 2)
	const naturalPosterW = $derived(
		Math.min(
			(innerHeight - baseline * 3) / Math.SQRT2,
			innerWidth - baseline * 2,
		),
	);

	const measured = $derived(asideSize.width > 0);
	// Page is stacked when viewport can't fit two grid columns
	const stacked = $derived(
		innerWidth < 2 * (naturalPosterW + baseline * 2) + baseline,
	);
	const posterInset = $derived(stacked ? toolbarSize.height : 0);

	let showInspo = $state(false);
</script>

<svelte:window
	bind:innerWidth
	bind:innerHeight
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

<div
	class="page"
	style:--poster-inset="{posterInset}px"
	data-stacked={stacked || undefined}
	class:measured
>
	<main>
		<VisitorFeed>
			{#snippet children({ total, city, country })}
				<div class="visitors sans type-xs">
					{#if total && dev}{total.toLocaleString()} visitors{/if}
					{#if total && city}
						·
					{/if}
					{#if city}Latest from {city}, {country}{/if}
				</div>
			{/snippet}
		</VisitorFeed>
		<p class="placeholder">
			Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod
			tempor incididunt ut labore et dolore magna aliqua.
		</p>
		<p class="placeholder">
			Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut
			aliquip ex ea commodo consequat.
		</p>
		<p class="placeholder">
			Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
			dolore eu fugiat nulla pariatur.
		</p>
	</main>
	<footer>
		<p class="placeholder">Footer content</p>
	</footer>
	<aside bind:this={asideEl}>
		<button
			type="button"
			class="poster expanded"
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
			class:has-orientation={hasOrientation}
			bind:this={poster}
			style:--cursor-x={cursorX}
			style:--cursor-y={cursorY}
			style:--recess={2.4}
		>
			{#if orientationPermission === "prompt"}
				<button
					type="button"
					class="orientation-prompt"
					aria-label="Enable motion tilt effect"
					onclick={requestOrientationPermission}
				></button>
			{/if}
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
						src={Portrait}
						alt="Christopher Hugentobler in Noguchi Garden"
					/>
					<enhanced:img src={Portrait} alt="" aria-hidden="true" />
				</div>
			</div>
		</div>
		<div class="toolbar" bind:this={toolbarEl}>
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
		   --poster-inset (set by JS) reserves space for the toolbar when below the poster.
		   3 baselines = top padding + bottom padding + flex gap */
		--poster-w: min(
			(100svh - var(--baseline) * 3 - var(--poster-inset, 0px)) / sqrt(2),
			100vw - var(--baseline) * 2
		);
		display: grid;
		grid-template-rows: 1fr auto;
		grid-template-columns: 1fr auto;
		gap: var(--baseline);
		height: 100svh;
		opacity: 0;

		&.measured {
			opacity: 1;
		}

		&[data-stacked] {
			--thumbnail-scale: 3;
			grid-template-rows: auto;
			grid-template-columns: 1fr;
			height: auto;
		}
	}

	main {
		grid-row: 1;
		grid-column: 1;
		min-height: 0;
		overflow: auto;
		background-color: black;
	}

	footer {
		grid-row: 2;
		grid-column: 1;

		:global([data-stacked]) & {
			grid-row: auto;
			grid-column: auto;
			order: 3;
		}
	}

	aside {
		position: relative;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		grid-row: 1 / -1;
		grid-column: 2;
		gap: var(--baseline);
		align-content: end;
		align-items: end;
		padding: var(--baseline);
		perspective: 800px;

		:global([data-stacked]) & {
			flex-direction: column;
			flex-wrap: nowrap;
			grid-row: auto;
			grid-column: auto;
			align-content: normal;
			align-items: start;
			order: 2;
		}
	}

	.placeholder {
		padding: 1rem;
		color: oklch(50% 0 0 / 0.3);
	}

	.visitors {
		margin-top: 1rem;
		overflow: hidden;
		text-overflow: ellipsis;
		font-weight: 400;
		color: oklch(41.59% 0.0132 95.38 / 0.5);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	/* 3D tilt: --cursor-x/y (-1..1) drive rotation, clamped to --tilt */
	.poster {
		--accent: oklch(59.65% 0.1557 40.96);
		--fuscous: oklch(41.59% 0.0132 95.38);
		--tana: oklch(89.92% 0.0314 94.92);
		--tilt: 8deg;
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

		.orientation-prompt {
			position: absolute;
			inset: 0;
			z-index: 2;
			padding: 0;
			cursor: pointer;
			background: none;
			border: none;
			opacity: 0;
		}

		@media (hover: hover) {
			transform: rotateX(var(--rx)) rotateY(var(--ry));
			transition: transform 300ms ease-out;
			will-change: transform;
		}
		@media (hover: none) {
			&.has-orientation {
				transform: rotateX(var(--rx)) rotateY(var(--ry));
				transition: transform 150ms ease-out;
				will-change: transform;
			}
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
				transition-duration: 150ms;
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

	.expanded {
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

		:global([data-stacked]) & {
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
</style>
