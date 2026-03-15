<script lang="ts">
	import Typesetter from "$lib/typesetter";

	let { data } = $props<{ data: { scenario: string } }>();

	type Scenario = {
		cols: number;
		height: number;
		label: string;
		width: number;
	};

	const scenarios = {
		default: {
			cols: 4,
			height: 640,
			label: "Default 4-col",
			width: 960,
		},
		narrow: {
			cols: 2,
			height: 640,
			label: "Narrow 2-col",
			width: 480,
		},
		short: {
			cols: 4,
			height: 360,
			label: "Short height",
			width: 960,
		},
		wide: {
			cols: 6,
			height: 720,
			label: "Wide 6-col",
			width: 1200,
		},
	} as const satisfies Record<string, Scenario>;

	type ScenarioKey = keyof typeof scenarios;

	const resolveScenarioKey = (value: string): ScenarioKey => {
		const candidate = value as ScenarioKey;
		return Object.hasOwn(scenarios, candidate) ? candidate : "default";
	};

	const scenarioKey = $derived.by(() => resolveScenarioKey(data.scenario));
	const scenario = $derived.by(() => scenarios[scenarioKey]);

	const heroSvg =
		"<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>" +
		"<rect width='1200' height='800' fill='#c7c7c7'/>" +
		"<circle cx='400' cy='300' r='180' fill='#9f9f9f'/>" +
		"</svg>";
	const portraitSvg =
		"<svg xmlns='http://www.w3.org/2000/svg' width='600' height='900'>" +
		"<rect width='600' height='900' fill='#bdbdbd'/>" +
		"<rect x='80' y='120' width='440' height='660' fill='#9a9a9a'/>" +
		"</svg>";
	const heroSrc = `data:image/svg+xml;utf8,${encodeURIComponent(heroSvg)}`;
	const portraitSrc = `data:image/svg+xml;utf8,${encodeURIComponent(portraitSvg)}`;
</script>

<div class="harness" data-scenario={scenarioKey}>
	<nav class="scenario-nav" aria-label="Typesetter scenarios">
		{#each Object.entries(scenarios) as [key, entry]}
			<a
				class="scenario-link"
				href={`?scenario=${key}`}
				data-active={key === scenarioKey ? "true" : undefined}
			>
				{entry.label}
			</a>
		{/each}
	</nav>

	<div class="viewport" style:width={`${scenario.width}px`} style:height={`${scenario.height}px`}>
		<Typesetter height={`${scenario.height}px`} cols={scenario.cols} debug={false}>
			<h1 data-fixture="heading-1">System baseline typesetter fixture</h1>
			<p data-fixture="paragraph-1">
				A first paragraph to anchor line wrapping. The goal is to keep this copy neutral while still
				forcing a few lines to wrap across different container widths.
			</p>
			<img
				data-fixture="image-wide"
				data-t8r-span="3"
				src={heroSrc}
				width="1200"
				height="800"
				alt="Wide placeholder"
				loading="eager"
			>
			<p data-fixture="paragraph-2">
				A second paragraph placed after an override-span image. This should still flow predictably
				and keep baseline snapping consistent across browsers.
			</p>
			<h2 data-fixture="heading-2">Secondary heading for flow groups</h2>
			<p data-fixture="paragraph-3">
				Shorter copy provides another flow node and exercises grouping logic when space is tight.
				Resize scenarios should always keep this content in bounds.
			</p>
			<figure data-fixture="figure" data-t8r-span="4">
				<img src={portraitSrc} width="600" height="900" alt="Portrait placeholder" loading="eager">
				<figcaption>Figure caption copy to add a multi-line block.</figcaption>
			</figure>
			<p data-fixture="paragraph-4">
				Final paragraph to close the fixture and ensure the typesetter continues grouping flow nodes
				after override-span elements.
			</p>
			<h3 data-fixture="heading-3">Tertiary heading sample</h3>
			<p data-fixture="paragraph-5">
				One more paragraph to ensure the layout has enough content to paginate or wrap in shorter
				viewport scenarios.
			</p>
		</Typesetter>
	</div>
</div>

<style>
	.harness {
		display: grid;
		gap: 16px;
		padding: 24px;
		color: #1a1a1a;
		background: #f5f4ef;
	}

	.scenario-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		font-size: 14px;
	}

	.scenario-link {
		padding: 6px 12px;
		color: inherit;
		text-decoration: none;
		background: #ffffff;
		border: 1px solid #b7b7b7;
		border-radius: 999px;
	}

	.scenario-link[data-active='true'] {
		font-weight: 600;
		background: #e0ded7;
		border-color: #333333;
	}

	.viewport {
		--baseline: 24px;
		overflow: hidden;
		font-family: system-ui, sans-serif;
		font-size: 16px;
		line-height: 1.5;
		background: #ffffff;
		border: 1px solid #c9c6bf;
	}

	.viewport :global(h1),
	.viewport :global(h2),
	.viewport :global(h3),
	.viewport :global(p),
	.viewport :global(figcaption) {
		margin: 0 0 12px;
	}

	.viewport :global(h1) {
		font-size: 2.25rem;
		line-height: 1.15;
	}

	.viewport :global(h2) {
		font-size: 1.5rem;
		line-height: 1.2;
	}

	.viewport :global(h3) {
		font-size: 1.2rem;
		line-height: 1.25;
	}

	.viewport :global(img) {
		display: block;
		width: 100%;
		height: auto;
	}

	.viewport :global(figure) {
		margin: 0 0 16px;
	}
</style>
