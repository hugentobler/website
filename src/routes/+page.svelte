<script lang="ts">
	const POSTER_TEXT_ROWS = 9;
	const POSTER_CLIP_RECESS = "1.5rem";
	const FILLER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit";
</script>

<div class="page-container">
	<div class="poster font-sans">
		<div class="recess" style:--recess={POSTER_CLIP_RECESS}>
			{#each Array(POSTER_TEXT_ROWS) as _, i}
				<div class="row">{FILLER}</div>
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

	/* Grid slightly larger than poster, centered, edges clipped for a recessed look */
	.recess {
		width: calc(100% + var(--recess) * 2);
		height: calc(100% + var(--recess) * 2);
		container-type: size;
		display: grid;
		grid-auto-rows: 1fr;
	}

	.row {
		padding-top: 3rem;
		padding-left: 3rem;
		font-size: var(--type-lg);
		line-height: var(--leading-lg);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}
</style>
