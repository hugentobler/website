<script lang="ts">
let grid = $state<string>("baseline-grid-4x");
let rhythm = $state<number>(6);

// Sans t-shirt scale
let sansTextXs = $state<number>(13);
let sansUnitsXs = $state<number>(3);
let sansLeadingXs = $derived(rhythm * sansUnitsXs);
let sansTextSm = $state<number>(15);
let sansUnitsSm = $state<number>(4);
let sansLeadingSm = $derived(rhythm * sansUnitsSm);
let sansTextBase = $state<number>(17);
let sansUnitsBase = $state<number>(4);
let sansLeadingBase = $derived(rhythm * sansUnitsBase);
let sansTextMd = $state<number>(20);
let sansUnitsMd = $state<number>(5);
let sansLeadingMd = $derived(rhythm * sansUnitsMd);
let sansTextLg = $state<number>(24);
let sansUnitsLg = $state<number>(6);
let sansLeadingLg = $derived(rhythm * sansUnitsLg);

// Mono t-shirt scale
let monoTextXs = $state<number>(13);
let monoUnitsXs = $state<number>(3);
let monoLeadingXs = $derived(rhythm * monoUnitsXs);
let monoTextSm = $state<number>(15);
let monoUnitsSm = $state<number>(4);
let monoLeadingSm = $derived(rhythm * monoUnitsSm);
let monoTextBase = $state<number>(16);
let monoUnitsBase = $state<number>(4);
let monoLeadingBase = $derived(rhythm * monoUnitsBase);
let monoTextMd = $state<number>(19);
let monoUnitsMd = $state<number>(5);
let monoLeadingMd = $derived(rhythm * monoUnitsMd);
let monoTextLg = $state<number>(23);
let monoUnitsLg = $state<number>(6);
let monoLeadingLg = $derived(rhythm * monoUnitsLg);

// Axes state
let sansWeight = $state<number>(400);
let sansStretch = $state<string>('normal');
let sansTracking = $state<string>('0em');

let monoWght = $state<number>(400);
let monoStretch = $state<string>('100%');
let monoSlnt = $state<string>('0deg');
let monoTracking = $state<string>('0em');

$effect(() => {
	const r = document.documentElement;
	r.style.setProperty("--rhythm", `${rhythm}px`);
	// Sans variables
	r.style.setProperty("--sans-text-xs", `${sansTextXs}px`);
	r.style.setProperty("--sans-leading-xs", `${sansLeadingXs}px`);
	r.style.setProperty("--sans-text-sm", `${sansTextSm}px`);
	r.style.setProperty("--sans-leading-sm", `${sansLeadingSm}px`);
	r.style.setProperty("--sans-text-base", `${sansTextBase}px`);
	r.style.setProperty("--sans-leading-base", `${sansLeadingBase}px`);
	r.style.setProperty("--sans-text-md", `${sansTextMd}px`);
	r.style.setProperty("--sans-leading-md", `${sansLeadingMd}px`);
	r.style.setProperty("--sans-text-lg", `${sansTextLg}px`);
	r.style.setProperty("--sans-leading-lg", `${sansLeadingLg}px`);
	// Mono variables
	r.style.setProperty("--mono-text-xs", `${monoTextXs}px`);
	r.style.setProperty("--mono-leading-xs", `${monoLeadingXs}px`);
	r.style.setProperty("--mono-text-sm", `${monoTextSm}px`);
	r.style.setProperty("--mono-leading-sm", `${monoLeadingSm}px`);
	r.style.setProperty("--mono-text-base", `${monoTextBase}px`);
	r.style.setProperty("--mono-leading-base", `${monoLeadingBase}px`);
	r.style.setProperty("--mono-text-md", `${monoTextMd}px`);
	r.style.setProperty("--mono-leading-md", `${monoLeadingMd}px`);
	r.style.setProperty("--mono-text-lg", `${monoTextLg}px`);
	r.style.setProperty("--mono-leading-lg", `${monoLeadingLg}px`);
	// Axes variables
	r.style.setProperty('--sans-weight', `${sansWeight}`);
	r.style.setProperty('--sans-stretch', `${sansStretch}`);
	r.style.setProperty('--sans-tracking', `${sansTracking}`);
	r.style.setProperty('--mono-wght', `${monoWght}`);
	r.style.setProperty('--mono-stretch', `${monoStretch}`);
	r.style.setProperty('--mono-slnt', `${monoSlnt}`);
	r.style.setProperty('--mono-tracking', `${monoTracking}`);
});

const gridOptions = $state([
	{ label: "Off", value: "" },
	{ label: "Minors (1×)", value: "baseline-grid-1x" },
	{ label: "Major (leading units)", value: "baseline-grid-major" },
]);

function inc(val: number, by = 1) {
	return val + by;
}

function dec(val: number, by = 1) {
	return Math.max(0, val - by);
}
</script>

<section class="space-y-6 p-6 rounded-lg bg-white/70 dark:bg-black/30">
	<div class="flex flex-wrap items-end gap-4">
		<label class="flex items-center gap-2">
			<span class="type-sm font-sans">Grid</span>
			<select bind:value={grid} class="type-sm font-sans border rounded px-2 py-1 bg-white/80 dark:bg-black/30">
				{#each gridOptions as g}
					<option value={g.value}>{g.label}</option>
				{/each}
			</select>
		</label>

		<label class="flex items-center gap-2">
			<span class="type-sm font-sans">Rhythm (px)</span>
			<input type="number" min="1" bind:value={rhythm} class="type-sm font-sans border rounded px-2 py-1 w-20 bg-white/80 dark:bg-black/30" />
			<div class="flex gap-1">
			<button class="type-sm px-2 py-1 border rounded" onclick={() => (rhythm = dec(rhythm))}>−1</button>
			<button class="type-sm px-2 py-1 border rounded" onclick={() => (rhythm = inc(rhythm))}>+1</button>
			</div>
		</label>

    <label class="flex items-center gap-2">
        <span class="type-sm font-sans">Sans base (px)</span>
        <input type="number" min="8" bind:value={sansTextBase} class="type-sm font-sans border px-2 py-1 w-24 bg-white/80 dark:bg-black/30" />
        <div class="flex gap-1">
            <button class="type-sm px-2 py-1 border" onclick={() => (sansTextBase = dec(sansTextBase))}>−1</button>
            <button class="type-sm px-2 py-1 border" onclick={() => (sansTextBase = inc(sansTextBase))}>+1</button>
        </div>
    </label>

    <label class="flex items-center gap-2">
        <span class="type-sm font-sans">Sans leading units</span>
        <input type="number" min="1" bind:value={sansUnitsBase} class="type-sm font-sans border px-2 py-1 w-20 bg-white/80 dark:bg-black/30" />
    </label>

    <label class="flex items-center gap-2">
        <span class="type-sm font-sans">Mono base (px)</span>
        <input type="number" min="8" bind:value={monoTextBase} class="type-sm font-sans border px-2 py-1 w-24 bg-white/80 dark:bg-black/30" />
        <div class="flex gap-1">
            <button class="type-sm px-2 py-1 border" onclick={() => (monoTextBase = dec(monoTextBase))}>−1</button>
            <button class="type-sm px-2 py-1 border" onclick={() => (monoTextBase = inc(monoTextBase))}>+1</button>
        </div>
    </label>

    <label class="flex items-center gap-2">
        <span class="type-sm font-sans">Mono leading units</span>
        <input type="number" min="1" bind:value={monoUnitsBase} class="type-sm font-sans border px-2 py-1 w-20 bg-white/80 dark:bg-black/30" />
    </label>


		<!-- Sans axes controls -->
		<label class="flex items-center gap-2">
			<span class="type-sm font-sans">Sans weight</span>
			<input type="number" min="300" max="600" step="100" bind:value={sansWeight} class="type-sm font-sans border px-2 py-1 w-24 bg-white/80 dark:bg-black/30" />
		</label>
		<label class="flex items-center gap-2">
			<span class="type-sm font-sans">Sans stretch</span>
			<select bind:value={sansStretch} class="type-sm font-sans border px-2 py-1 bg-white/80 dark:bg-black/30">
				<option value="normal">normal</option>
				<option value="condensed">condensed</option>
				<option value="expanded">expanded</option>
				<option value="ultra-condensed">ultra-condensed</option>
			</select>
		</label>
		<label class="flex items-center gap-2">
			<span class="type-sm font-sans">Sans tracking</span>
			<input type="text" bind:value={sansTracking} class="type-sm font-sans border px-2 py-1 w-24 bg-white/80 dark:bg-black/30" placeholder="e.g. 0.02em" />
		</label>

		<!-- Mono axes controls -->
		<label class="flex items-center gap-2">
			<span class="type-sm font-sans">Mono weight</span>
			<input type="number" min="100" max="900" step="50" bind:value={monoWght} class="type-sm font-sans border px-2 py-1 w-24 bg-white/80 dark:bg-black/30" />
		</label>
		<label class="flex items-center gap-2">
			<span class="type-sm font-sans">Mono width</span>
			<input type="text" bind:value={monoStretch} class="type-sm font-sans border px-2 py-1 w-20 bg-white/80 dark:bg-black/30" placeholder="60%–100%" />
		</label>
		<label class="flex items-center gap-2">
			<span class="type-sm font-sans">Mono slant</span>
			<input type="text" bind:value={monoSlnt} class="type-sm font-sans border px-2 py-1 w-20 bg-white/80 dark:bg-black/30" placeholder="-16deg–0deg" />
		</label>
		<label class="flex items-center gap-2">
			<span class="type-sm font-sans">Mono tracking</span>
			<input type="text" bind:value={monoTracking} class="type-sm font-sans border px-2 py-1 w-24 bg-white/80 dark:bg-black/30" placeholder="e.g. 0.02em" />
		</label>

	</div>
	<header>
		<h1 class="type-lg font-sans font-bold">Type Scale Preview</h1>
		<p class="type-sm font-sans">Tune base size, leading, and rhythm visually.</p>
	</header>

    

    <article class="space-y-4">
        <h3 class="type-sans-md font-sans font-bold">Body copy (Sans)</h3>
        <p class={`type-sans-base font-sans ${grid}`} style={`--leading-units: ${sansUnitsBase}`}>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
			ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat.
		</p>
        <p class={`type-sans-base font-sans ${grid}`} style={`--leading-units: ${sansUnitsBase}`}>
			Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
			pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
			mollit anim id est laborum.
		</p>
    </article>

    <article class="space-y-4">
        <h3 class="type-mono-md font-mono font-bold">Body copy (Mono)</h3>
        <p class={`type-mono-base font-mono ${grid}`} style={`--leading-units: ${monoUnitsBase}`}>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
			ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat.
		</p>
        <p class={`type-mono-base font-mono ${grid}`} style={`--leading-units: ${monoUnitsBase}`}>
			Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
			pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
			mollit anim id est laborum.
		</p>
    </article>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class={`${grid} axes-sans`} style={`--leading-units: ${sansUnitsBase}`}>
            <h2 class="type-sans-md font-sans font-semibold">Sans (Univers)</h2>
            <p class="type-sans-xs font-sans axes-sans">XS — The quick brown fox jumps over the lazy dog 0123456789</p>
            <p class="type-sm font-sans">{sansTextXs}px / {sansLeadingXs}px ({sansUnitsXs}u)</p>
            <p class="type-sans-sm font-sans axes-sans">SM — The quick brown fox jumps over the lazy dog 0123456789</p>
            <p class="type-sm font-sans">{sansTextSm}px / {sansLeadingSm}px ({sansUnitsSm}u)</p>
            <p class="type-sans-base font-sans axes-sans">BASE — The quick brown fox jumps over the lazy dog 0123456789</p>
            <p class="type-sm font-sans">{sansTextBase}px / {sansLeadingBase}px ({sansUnitsBase}u)</p>
            <p class="type-sans-md font-sans axes-sans">MD — The quick brown fox jumps over the lazy dog 0123456789</p>
            <p class="type-sm font-sans">{sansTextMd}px / {sansLeadingMd}px ({sansUnitsMd}u)</p>
            <p class="type-sans-lg font-sans axes-sans">LG — The quick brown fox jumps over the lazy dog 0123456789</p>
            <p class="type-sm font-sans">{sansTextLg}px / {sansLeadingLg}px ({sansUnitsLg}u)</p>
        </div>

        <div class={`${grid} axes-mono`} style={`--leading-units: ${monoUnitsBase}`}>
            <h2 class="type-mono-md font-mono font-semibold">Mono (Berkeley Mono)</h2>
            <p class="type-mono-xs font-mono axes-mono">XS — The quick brown fox jumps over the lazy dog 0123456789</p>
            <p class="type-sm font-sans">{monoTextXs}px / {monoLeadingXs}px ({monoUnitsXs}u)</p>
            <p class="type-mono-sm font-mono axes-mono">SM — The quick brown fox jumps over the lazy dog 0123456789</p>
            <p class="type-sm font-sans">{monoTextSm}px / {monoLeadingSm}px ({monoUnitsSm}u)</p>
            <p class="type-mono-base font-mono axes-mono">BASE — The quick brown fox jumps over the lazy dog 0123456789</p>
            <p class="type-sm font-sans">{monoTextBase}px / {monoLeadingBase}px ({monoUnitsBase}u)</p>
            <p class="type-mono-md font-mono axes-mono">MD — The quick brown fox jumps over the lazy dog 0123456789</p>
            <p class="type-sm font-sans">{monoTextMd}px / {monoLeadingMd}px ({monoUnitsMd}u)</p>
            <p class="type-mono-lg font-mono slashed-zero axes-mono">LG — The quick brown fox jumps over the lazy dog 0123456789</p>
            <p class="type-sm font-sans">{monoTextLg}px / {monoLeadingLg}px ({monoUnitsLg}u)</p>
        </div>
    </div>
</section>
