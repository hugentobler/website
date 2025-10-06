<script lang="ts">
	import { Popover } from "bits-ui";
	import { ToggleGroupItem, ToggleGroupRoot } from "$lib/components/ui/toggle-group";
	import { FONTS } from "$lib/typography/config";

	type FontKey = keyof typeof FONTS;
	const fonts = Object.entries(FONTS) as [FontKey, string][];
	const [firstKey] = Object.keys(FONTS) as FontKey[];
	let fontSelected = $state<FontKey>(firstKey);
</script>

<div class="fixed bottom-6 right-6 z-50">
	<Popover.Root open>
		<Popover.Trigger>Trigger</Popover.Trigger>
		<Popover.Content side="top" class="bg-white p-6">
			<div class="grid grid-cols-[auto_1fr] gap-6">
				<ToggleGroupRoot bind:value={fontSelected} type="single">
					{#each fonts as [key, label]}
						<ToggleGroupItem aria-label={`Toggle font ${label}`} value={key}>
							<span class="text-base leading-none p-1">{label}</span>
						</ToggleGroupItem>
					{/each}
				</ToggleGroupRoot>
			</div>
		</Popover.Content>
	</Popover.Root>
</div>
