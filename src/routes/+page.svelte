<script lang="ts">
	import { ElementSize, useMousePosition } from "runed";
	import VisitorFeed from "$lib/components/VisitorFeed.svelte";
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
</script>

<div class="page-container">
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
				<div style:--indent={18}>for the unorthodox</div>
			</div>
			<div class="row" style:--indent={-10}>
				<p>Circularity Los Angeles</p>
				<div style:--indent={12}>and for industry</div>
			</div>
			<div class="row" style:--indent={-5}>
				<p>Seed Agency Boundary</p>
			</div>
			<div class="row" style:--indent={-6}>
				<p>Commons Hong Kong</p>
			</div>
			<div class="img">
				<enhanced:img
					src={Portrait}
					alt="Christopher Hugentobler in Noguchi Garden"
				/>
				<enhanced:img src={Portrait} alt="" aria-hidden="true" />
			</div>
		</div>
	</div>
	<VisitorFeed>
		{#snippet children({ total, city, country })}
			<div class="visitor-feed sans type-xs">
				{#if total}{total.toLocaleString()} visitors{/if}
				{#if total && city} · {/if}
				{#if city}Latest from {city}, {country}{/if}
			</div>
		{/snippet}
	</VisitorFeed>
</div>

<style>
	.page-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100svh;
		perspective: 800px;
	}

	.visitor-feed {
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
		--accent: oklch(56.97% 0.1394 41.7);
		--fuscous: oklch(41.59% 0.0132 95.38);
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
		width: min(calc(100svw - 6rem), calc((100svh - 6rem) / sqrt(2)));
		aspect-ratio: calc(1 / sqrt(2));
		overflow: clip;
		background-color: oklch(85.85% 0.0315 96.92);
		@media (hover: hover) {
			transform: rotateX(var(--rx)) rotateY(var(--ry));
			transition: transform 300ms ease-out;
			will-change: transform;
		}

		.img :global {
			position: absolute;
			right: 0;
			bottom: 0;
			z-index: 1;
			/* Span ~4 of 9 rows */
			height: calc(4 / 9 * 100%);

			overflow: hidden;

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
					filter: drop-shadow(0 1000px 0 oklch(85.85% 0.0315 96.92));
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
			bottom: 0cqh;
			font-size: 3cqh;
			font-weight: 400;
			font-stretch: normal;
			color: var(--accent);
			text-indent: calc(var(--indent, 0) * 1cqw);
			text-transform: lowercase;
		}

		p {
			transform: translateY(1cqh);
		}

		p:has(+ div) {
			transform: translateY(-0.75cqh);
		}
	}
</style>
