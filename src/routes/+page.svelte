<script lang="ts">
	import { ElementSize, useMousePosition } from "runed";
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

<div class="page-container">
	<div class="left">
		<VisitorFeed>
			{#snippet children({ total, city, country })}
				<div class="visitor-feed sans type-xs">
					{#if total}{total.toLocaleString()} visitors{/if}
					{#if total && city}
						·
					{/if}
					{#if city}Latest from {city}, {country}{/if}
				</div>
			{/snippet}
		</VisitorFeed>
	</div>
	<div class="right">
		{#if showInspo}
			<button
				type="button"
				class="poster inspo-full"
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
					<div class="img">
						<enhanced:img
							src={Portrait}
							alt="Christopher Hugentobler in Noguchi Garden"
						/>
						<enhanced:img src={Portrait} alt="" aria-hidden="true" />
					</div>
				</div>
			</div>
		{/if}
		<div class="inspo-bar">
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
				class="inspo"
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
	.page-container {
		display: grid;
		grid-template-columns: 1fr auto;
		height: 100svh;
	}

	.left {
		/* placeholder */
	}

	.right {
		--padding-top: calc(1 * var(--baseline));
		--padding-bottom: calc(4 * var(--baseline));
		display: flex;
		flex-direction: column;
		gap: var(--baseline);
		align-items: end;
		padding: var(--padding-top) var(--baseline) var(--padding-bottom);
		perspective: 800px;
	}

	.inspo-full {
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

	.inspo-bar {
		display: flex;
		gap: var(--baseline);
	}

	.inspo {
		padding: 0;
		cursor: zoom-in;
		background: none;
		border: none;

		:global(img) {
			width: auto;
			height: auto;
			max-height: calc(var(--baseline) * 2);
			filter: grayscale();
			&:hover {
				filter: none;
			}
		}
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
		/*--accent: oklch(56.97% 0.1394 41.7);*/
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
		/*background-color: oklch(85.85% 0.0315 96.92);*/
		background-color: var(--tana);
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
			font-weight: 600;
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
</style>
