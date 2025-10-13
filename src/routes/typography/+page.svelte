<script lang="ts">
import { ToggleGroup } from "$lib/components/ui";
import { FONTS } from "$lib/typography/config";
let fontMode = $state<'sans' | 'mono'>('sans');
let gridOn = $state<boolean>(true);
let gridClass = $derived(gridOn ? 'baseline-grid-major' : '');
let rhythm = $state<number>(6);

// Sans controls (Univers)
let sansSize = $state<number>(17);
let sansUnits = $state<number>(4);
let sansLeading = $derived(rhythm * sansUnits);
let sansWeight = $state<number>(400); // 300 | 400 | 600
let sansStretch = $state<string>('normal'); // normal | condensed | expanded | ultra-condensed
let sansTracking = $state<string>('0em');

// Mono controls (Berkeley Mono Variable)
let monoSize = $state<number>(16);
let monoUnits = $state<number>(4);
let monoLeading = $derived(rhythm * monoUnits);
let monoWght = $state<number>(400);
let monoWdth = $state<string>('100%'); // 60%–100%
let monoSlnt = $state<string>('0deg'); // -16deg–0deg
let monoTracking = $state<string>('0em');

// Paragraph spacing in rhythm units (applies to second paragraph)
let paraUnits = $state<number>(2);

$effect(() => {
	const r = document.documentElement;
	r.style.setProperty('--type-rhythm', `${rhythm}px`);
	// apply base tokens
	r.style.setProperty('--sans-text-base', `${sansSize}px`);
	r.style.setProperty('--sans-leading-base-units', `${sansUnits}`);
	r.style.setProperty('--mono-text-base', `${monoSize}px`);
	r.style.setProperty('--mono-leading-base-units', `${monoUnits}`);
	// axes
	r.style.setProperty('--sans-weight', `${sansWeight}`);
	r.style.setProperty('--sans-stretch', `${sansStretch}`);
	r.style.setProperty('--sans-tracking', `${sansTracking}`);
	r.style.setProperty('--mono-wght', `${monoWght}`);
	r.style.setProperty('--mono-stretch', `${monoWdth}`);
	r.style.setProperty('--mono-slnt', `${monoSlnt}`);
	r.style.setProperty('--mono-tracking', `${monoTracking}`);
});

function inc(val: number, by = 1) { return val + by; }
function dec(val: number, by = 1) { return Math.max(0, val - by); }

const fontEntries = Object.entries(FONTS).map(([key, label]) => ({
	key,
	label,
	mode: key === 'UNI' ? 'sans' : 'mono',
}));
</script>

<section class="space-y-6 p-6 bg-white/70 dark:bg-black/30">
	<!-- Global controls -->
	<div class="flex flex-wrap items-end gap-4">
		<label class="flex items-center gap-2">
			<span class="type-sans-sm">Font</span>
			<select bind:value={fontMode} class="type-sans-sm border px-2 py-1 bg-white/80 dark:bg-black/30">
				<option value="sans">Sans (Univers)</option>
				<option value="mono">Mono (Berkeley Mono)</option>
			</select>
		</label>

			<ToggleGroup
				bind:value={fontMode}
				type="single"
				options={fontEntries.map((f) => ({ value: f.mode, label: f.label }))}
			/>

		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={gridOn} />
			<span class="type-sans-sm">Show grid (minors + major)</span>
		</label>

		<label class="flex items-center gap-2">
			<span class="type-sans-sm">Rhythm (px)</span>
			<input type="number" min="1" bind:value={rhythm} class="type-sans-sm border px-2 py-1 w-20 bg-white/80 dark:bg-black/30" />
			<div class="flex gap-1">
				<button class="type-sans-sm px-2 py-1 border" onclick={() => (rhythm = dec(rhythm))}>−1</button>
				<button class="type-sans-sm px-2 py-1 border" onclick={() => (rhythm = inc(rhythm))}>+1</button>
			</div>
		</label>
	</div>

	<!-- Per-font controls -->
	{#if fontMode === 'sans'}
		<div class="flex flex-wrap items-end gap-4">
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Base size (px)</span>
				<input type="number" min="8" bind:value={sansSize} class="type-sans-sm border px-2 py-1 w-24 bg-white/80 dark:bg-black/30" />
				<div class="flex gap-1">
					<button class="type-sans-sm px-2 py-1 border" onclick={() => (sansSize = dec(sansSize))}>−1</button>
					<button class="type-sans-sm px-2 py-1 border" onclick={() => (sansSize = inc(sansSize))}>+1</button>
				</div>
			</label>
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Leading (units)</span>
				<input type="number" min="1" bind:value={sansUnits} class="type-sans-sm border px-2 py-1 w-20 bg-white/80 dark:bg-black/30" />
			</label>
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Weight</span>
				<select bind:value={sansWeight} class="type-sans-sm border px-2 py-1 bg-white/80 dark:bg-black/30">
					<option value={300}>300</option>
					<option value={400}>400</option>
					<option value={600}>600</option>
				</select>
			</label>
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Stretch</span>
				<select bind:value={sansStretch} class="type-sans-sm border px-2 py-1 bg-white/80 dark:bg-black/30">
					<option value="normal">normal</option>
					<option value="condensed">condensed</option>
					<option value="expanded">expanded</option>
					<option value="ultra-condensed">ultra-condensed</option>
				</select>
			</label>
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Tracking</span>
				<input type="text" bind:value={sansTracking} class="type-sans-sm border px-2 py-1 w-24 bg-white/80 dark:bg-black/30" placeholder="e.g. 0.02em" />
			</label>
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Paragraph spacing (units)</span>
				<input type="number" min="0" bind:value={paraUnits} class="type-sans-sm border px-2 py-1 w-20 bg-white/80 dark:bg-black/30" />
			</label>
		</div>
	{:else}
		<div class="flex flex-wrap items-end gap-4">
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Base size (px)</span>
				<input type="number" min="8" bind:value={monoSize} class="type-sans-sm border px-2 py-1 w-24 bg-white/80 dark:bg-black/30" />
				<div class="flex gap-1">
					<button class="type-sans-sm px-2 py-1 border" onclick={() => (monoSize = dec(monoSize))}>−1</button>
					<button class="type-sans-sm px-2 py-1 border" onclick={() => (monoSize = inc(monoSize))}>+1</button>
				</div>
			</label>
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Leading (units)</span>
				<input type="number" min="1" bind:value={monoUnits} class="type-sans-sm border px-2 py-1 w-20 bg-white/80 dark:bg-black/30" />
			</label>
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Weight</span>
				<input type="number" min="100" max="900" step="50" bind:value={monoWght} class="type-sans-sm border px-2 py-1 w-24 bg-white/80 dark:bg-black/30" />
			</label>
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Width</span>
				<input type="text" bind:value={monoWdth} class="type-sans-sm border px-2 py-1 w-20 bg-white/80 dark:bg-black/30" placeholder="60%–100%" />
			</label>
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Slant</span>
				<input type="text" bind:value={monoSlnt} class="type-sans-sm border px-2 py-1 w-20 bg-white/80 dark:bg-black/30" placeholder="-16deg–0deg" />
			</label>
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Tracking</span>
				<input type="text" bind:value={monoTracking} class="type-sans-sm border px-2 py-1 w-24 bg-white/80 dark:bg-black/30" placeholder="e.g. 0.02em" />
			</label>
			<label class="flex items-center gap-2">
				<span class="type-sans-sm">Paragraph spacing (units)</span>
				<input type="number" min="0" bind:value={paraUnits} class="type-sans-sm border px-2 py-1 w-20 bg-white/80 dark:bg-black/30" />
			</label>
		</div>
	{/if}

	<header>
		<h1 class="uni-type-lg font-sans">Body Text Preview</h1>
		<p class="uni-type-sm font-sans">Tune base size, leading, axes, rhythm, and spacing.</p>
	</header>

	{#if fontMode === 'sans'}
		<article class="space-y-4">
			<p class={`uni-type-base font-sans uni-axes ${gridClass}`} style={`--leading-units: ${sansUnits}`}>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
				ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<p class={`uni-type-base font-sans uni-axes ${gridClass}`} style={`--leading-units: ${sansUnits}; margin-top: calc(var(--type-rhythm) * ${paraUnits})`}>
				Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
				pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
				mollit anim id est laborum.
			</p>
		</article>
	{:else}
		<article class="space-y-4">
			<p class={`bm-type-base font-mono bm-axes ${gridClass}`} style={`--leading-units: ${monoUnits}`}>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
				ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
				laboris nisi ut aliquip ex ea commodo consequat.
			</p>
			<p class={`bm-type-base font-mono bm-axes ${gridClass}`} style={`--leading-units: ${monoUnits}; margin-top: calc(var(--type-rhythm) * ${paraUnits})`}>
				Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
				pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
				mollit anim id est laborum.
			</p>
		</article>
	{/if}
</section>
