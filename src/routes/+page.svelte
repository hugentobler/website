<script lang="ts">
	import { ElementSize, useMousePosition } from "runed";
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
		class="poster font-sans"
		bind:this={poster}
		style:--cursor-x={cursorX}
		style:--cursor-y={cursorY}
		style:--recess={2.5}
	>
		<div class="recess">
			<div class="row" style:--indent={-40}>
				<p>Lorem Lorem Lorem <em>A</em> Lorem</p>
			</div>
			<div class="row" style:--indent={-14}>
				<p>Lorem <em>Technologist</em> Lorem</p>
			</div>
			<div class="row" style:--indent={-5}>
				<p>Lorem <em>In Pursuit</em> Lorem</p>
			</div>
			<div class="row" style:--indent={5}>
				<p>Lorem <em>Of The</em> Lorem</p>
			</div>
			<div class="row" style:--indent={-15}>
				<p>Lorem <em>Evergreen</em> Lorem</p>
			</div>
			<div class="row" style:--indent={0}><p>Lorem A Lorem</p></div>
			<div class="row" style:--indent={0}><p>Lorem A Lorem</p></div>
			<div class="row" style:--indent={0}><p>Lorem A Lorem</p></div>
			<div class="row" style:--indent={0}><p>Lorem A Lorem</p></div>
			<div class="img">
				<enhanced:img
					src={Portrait}
					alt="Christopher Hugentobler in Noguchi Garden"
				/>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.page-container {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100svh;
		perspective: 800px;
	}

	/* 3D tilt: --cursor-x/y (-1..1) drive rotation, clamped to --tilt */
	.poster {
		--accent: oklch(56.97% 0.1394 41.7);
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

		.img {
			position: absolute;
			right: 0;
			bottom: 0;
			/* Span ~4 of 9 rows */
			height: calc(4 / 9 * 100%);

			@media (hover: hover) {
				--shift: 0.8%;
				translate: calc(var(--cursor-x) * var(--shift))
					calc(var(--cursor-y) * var(--shift));
				transition: translate 300ms ease-out;
			}

			img {
				width: auto;
				height: 100%;
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
		display: flex;
		align-items: center;
		font-size: 8cqh;
		font-weight: 300;
		font-stretch: condensed;
		line-height: 1;
		text-indent: calc(var(--indent, 0) * 1cqw);
		text-transform: uppercase;
		white-space: nowrap;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);

		em {
			font-style: normal;
			color: var(--accent);
		}

		p {
			transform: translateY(1cqh);
		}
	}
</style>
