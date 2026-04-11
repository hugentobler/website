<script lang="ts">
	let { n }: { n: number } = $props();
</script>

<sup class="citation" id="cite-{n}-ref"><a href="#cite-{n}" onclick={(e) => {
	e.preventDefault();
	document.getElementById(`cite-${n}`)?.scrollIntoView({ behavior: 'smooth' });
}}><span class="mono">{n}</span></a></sup>

<style>
	.citation {
		font-size: 0.75em;
		line-height: 0;
		scroll-margin-top: calc(var(--baseline) * 3);

		a {
			font-weight: 600;
			color: var(--secondary, currentColor);
			text-decoration: none;

			&:hover {
				color: var(--primary, currentColor);
			}
		}
	}
</style>
