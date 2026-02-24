<script lang="ts">
	const POSTER_TEXT_ROWS = 9;
	const POSTER_CLIP_RECESS = "2.5%"; // container-aware: scales with poster size
	const FILLER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
</script>

<div class="page-container">
	<div class="poster font-sans">
		<div class="recess" style:--recess={POSTER_CLIP_RECESS}>
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
	}

	/* Poster constrains the aspect ratio and clips the recess */
	.poster {
		display: grid;
		place-items: center;
		width: min(calc(100svw - 6rem), calc((100svh - 6rem) / sqrt(2)));
		aspect-ratio: calc(1 / sqrt(2));
		overflow: clip;
		background-color: gray;
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
