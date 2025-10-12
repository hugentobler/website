<script lang="ts">
	import { Popover } from "bits-ui";
	import { Slider } from "$lib/components/ui";
	import { ToggleGroupItem, ToggleGroupRoot } from "$lib/components/ui/toggle-group";
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
			<div class="grid grid-cols-[auto_1fr_1fr] gap-6">
				<ToggleGroupRoot bind:value={fontSelected} type="single">
					{#each fonts as [key, label]}
						<ToggleGroupItem aria-label={`Toggle font ${label}`} value={key}>
							<span class="p-1 text-base leading-none">{label}</span>
						</ToggleGroupItem>
					{/each}
				</ToggleGroupRoot>
				<!-- Minimal vertical slider -->
				<div class="w-40">
					<Slider type="single" bind:value={sliderValue} min={0} max={100} step={25} />
				</div>

				<!-- Example with ticks and labels (discrete step labels) -->
				<div class="w-40">
					<Slider
						type="single"
						step={[0, 25, 50, 75, 100]}
						orientation="vertical"
						bind:value={sliderValue}
					/>
					<div class="ml-4 text-sm">{sliderValue}</div>
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>
</div>
