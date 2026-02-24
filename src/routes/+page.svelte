<script lang="ts">
	const POSTER_TEXT_ROWS = 9;
	const POSTER_CLIP_RECESS = 2.5; // percent of poster dimensions
	const FILLER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";

	import { ElementSize, useMousePosition } from "runed";

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
	>
		<div class="recess" style:--recess={`${POSTER_CLIP_RECESS}%`}>
			{#each Array(POSTER_TEXT_ROWS) as _, i}
				<div data-row={i} class="row"><p>{FILLER}</p></div>
			{/each}
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
		display: grid;
		place-items: center;
		width: min(calc(100svw - 6rem), calc((100svh - 6rem) / sqrt(2)));
		aspect-ratio: calc(1 / sqrt(2));
		overflow: clip;
		background-color: gray;
		transform: rotateX(var(--rx)) rotateY(var(--ry));
		transition: transform 300ms ease-out;
		will-change: transform;
	}

	/* Grid slightly larger than poster, centered, edges clipped for a recessed look.
	   Container-aware typesetting: container-type: size enables cqh units below */
	.recess {
		width: calc(100% + var(--recess) * 2);
		height: calc(100% + var(--recess) * 2);
		container-type: size;
		display: grid;
		grid-auto-rows: 1fr;
	}

	/* Container-aware typesetting: font-size and optical adjustment scale with container height */
	.row {
		display: flex;
		align-items: center;
		font-size: 8cqh;
		line-height: 1;
		text-transform: uppercase;
		white-space: nowrap;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);

		p {
			transform: translateY(1cqh);
		}
	}
</style>
