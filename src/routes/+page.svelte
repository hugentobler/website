<script lang="ts">
	import { ElementSize, useMousePosition } from "runed";
	import { dev } from "$app/environment";
	import VisitorFeed from "$lib/components/VisitorFeed.svelte";
	import LondonTelephone from "./home/london-telephone-josef-müller-brockmann.jpg?enhanced";
	import Portrait from "./home/noguchi.png?enhanced";

	// Poster size and cursor position
	let poster = $state<HTMLDivElement>();
	const mouse = useMousePosition(() => poster);
	const size = new ElementSize(() => poster);

	// Cursor position normalized to -1..1 from poster center, fed to CSS for 3D tilt
	const cursorX = $derived(
		size.width ? (mouse.elementX / size.width) * 2 - 1 : 0,
	);
	const cursorY = $derived(
		size.height ? (mouse.elementY / size.height) * 2 - 1 : 0,
	);

	let showInspo = $state(false);
</script>

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
	<div class="left">
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
	</div>
	<div class="right">
		{#if showInspo}
			<button
				type="button"
				class="poster expanded"
				onclick={() => (showInspo = false)}
			>
				<enhanced:img
					src={LondonTelephone}
					alt="London Telephone poster by Josef Müller-Brockmann"
				/>
			</button>
		{:else}
			<div
				class="poster sans"
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
							src={Portrait}
							alt="Christopher Hugentobler in Noguchi Garden"
						/>
						<enhanced:img src={Portrait} alt="" aria-hidden="true" />
					</div>
				</div>
			</div>
		{/if}
		<div class="toolbar">
			{#if showInspo}
				<p
					class="sans type-base"
					style:font-stretch="condensed"
					style:font-weight="normal"
				>
					<span style:font-weight="bold">London Telephone</span>, 1957<br
					/>Josef Müller-Brockmann (1914–96)
				</p>
			{/if}
			<button
				type="button"
				class="thumbnail"
				onclick={() => (showInspo = !showInspo)}
			>
				<enhanced:img
					src={LondonTelephone}
					alt="London Telephone poster by Josef Müller-Brockmann"
				/>
			</button>
		</div>
	</div>
</div>

<style>
	.page {
		--padding-top: calc(1 * var(--baseline));
		--padding-bottom: calc(4 * var(--baseline));
		--poster-w: calc(
			(100svh - var(--padding-top) - var(--padding-bottom)) / sqrt(2)
		);
		display: flex;
		flex-wrap: wrap;
	}

	.left {
		flex: 1 1 var(--poster-w);
		background-color: black;
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

	.right {
		display: flex;
		flex-direction: column;
		gap: var(--baseline);
		align-items: end;
		padding: var(--padding-top) var(--baseline) var(--padding-bottom);
		perspective: 800px;
		@media (width < 48rem) {
			flex-direction: row;
			width: 100%;
		}
	}

	/* 3D tilt: --cursor-x/y (-1..1) drive rotation, clamped to --tilt */
	.poster {
		--accent: oklch(59.65% 0.1557 40.96);
		--fuscous: oklch(41.59% 0.0132 95.38);
		--tana: oklch(89.92% 0.0314 94.92);
		--tilt: 3deg;
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
		height: calc(100svh - var(--padding-top) - var(--padding-bottom));
		aspect-ratio: calc(1 / sqrt(2));
		overflow: clip;
		background-color: var(--tana);
		@media (width < 48rem) {
			width: 100%;
			height: auto;
		}
		@media (hover: hover) {
			transform: rotateX(var(--rx)) rotateY(var(--ry));
			transition: transform 300ms ease-out;
			will-change: transform;
		}

		.portrait :global {
			position: absolute;
			right: 0;
			bottom: 0;
			z-index: 1;
			/* Span ~4 of 9 rows */
			height: calc(4 / 9 * 100%);
			overflow: hidden;
			pointer-events: none;

			@media (hover: hover) {
				--shift: 0.8%;
				translate: calc(var(--cursor-x) * var(--shift))
					calc(var(--cursor-y) * var(--shift));
				transition: translate 300ms ease-out;
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

	.toolbar {
		display: flex;
		flex-shrink: 0;
		gap: var(--baseline);
	}

	.thumbnail {
		height: calc(var(--baseline) * 2);
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
