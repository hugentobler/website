<script lang="ts">
	import { Popover } from "bits-ui";
	import { Slider, ToggleGroup } from "$lib/components/ui";
	import { FONTS } from "$lib/typography/config";

	type FontKey = keyof typeof FONTS;
	const fonts = Object.entries(FONTS) as [FontKey, string][];
	const [firstKey] = Object.keys(FONTS) as FontKey[];
	let fontSelected = $state<FontKey>(firstKey);

	// Minimal slider state
	let sliderValue = $state<number>(50);
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
				<!-- Minimal vertical slider -->
				<!-- <div class="w-40"> -->
				<Slider type="single" bind:value={sliderValue} min={0} max={100} step={25} />
				<!-- </div> -->

				<!-- Example with ticks and labels (discrete step labels) -->
				<Slider
					type="single"
					step={[0, 25, 50, 75, 100]}
					orientation="vertical"
					bind:value={sliderValue}
				/>
			</div>
		</Popover.Content>
	</Popover.Root>
</div>
