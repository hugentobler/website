<script lang="ts">
	import { Popover } from "bits-ui";
	import { Slider, ToggleGroup } from "$lib/components/ui";
	import { FONTS, UNI_STRETCH } from "$lib/typography/config";

	type FontKey = keyof typeof FONTS;
	const fonts = Object.entries(FONTS) as [FontKey, string][];

	// Font toggle (allow empty)
	let fontSelected = $state<FontKey | "">("UNI");
	let lastFontSelected = $state<FontKey>("UNI");
	$effect(() => {
		if (fontSelected !== "") lastFontSelected = fontSelected as FontKey;
	});

	// Derived UI state
	const activeFont = $derived(fontSelected === "" ? lastFontSelected : fontSelected);
	const slidersDisabled = $derived(fontSelected === "");

	// Slider states
	let UniStretchIdx = $state<number>(1);
	let BerStretchValue = $state<number>(80);
</script>

<div class="fixed right-6 bottom-6 z-50">
	<Popover.Root open>
		<Popover.Trigger>Trigger</Popover.Trigger>
		<Popover.Content side="top" class="bg-white p-6">
			<div class="grid grid-cols-3 grid-rows-[minmax(12rem,1fr)] gap-6">
				<ToggleGroup
					bind:value={fontSelected}
					options={fonts.map(([value, label]) => ({ value, label }))}
				/>
				<div>
					<p>Stretch</p>
					{#if activeFont === "UNI"}
						{@const step = UNI_STRETCH.map((_, i) => i)}
						<Slider
							orientation="vertical"
							bind:value={UniStretchIdx}
							{step}
							tickLabels={UNI_STRETCH}
							disabled={slidersDisabled}
							hideThumbLabels
						/>
					{/if}
					{#if activeFont === "BER"}
						{@const min = 60}
						{@const max = 100}
						{@const step = 5}
						{@const tickCount = (max - min) / step + 1}
						{@const tickLabels = Array.from({ length: tickCount }, (_, i) => {
							const v = min + i * step;
							return v % 10 === 0 ? v : undefined;
						})}
						<Slider
							orientation="vertical"
							bind:value={BerStretchValue}
							{min}
							{max}
							{step}
							{tickLabels}
							disabled={slidersDisabled}
							hideThumbLabels
						/>
					{/if}
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>
</div>
