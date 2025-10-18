<script lang="ts">
import { Slider } from "bits-ui";
export let value: number;
export let min: number;
export let max: number;
export let step: number;
export let tickLabels: readonly (string | number)[] | undefined;
export let sideLabels: readonly (string | number)[] | undefined;
</script>

<div class="h-60 justify-center flex">
	<Slider.Root
		type="single"
		orientation="vertical"
		bind:value={value}
		min={min}
		max={max}
		step={step}
		class="relative flex h-full touch-none select-none flex-col items-center"
		trackPadding={3}
	>
		{#snippet children({ tickItems })}
			<span class="bg-(--background) relative h-full w-2 cursor-pointer overflow-hidden rounded-full">
				<Slider.Range class="bg-(--foreground) absolute w-full" />
			</span>
			<Slider.Thumb
				index={0}
				class="border-border-border bg-(--background) hover:border-dark-40 focus-visible:ring-foreground dark:bg-foreground dark:shadow-card data-active:border-dark-40 z-5 focus-visible:outline-hidden data-active:scale-[0.98] block size-[25px] cursor-pointer rounded-full border shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
			/>
			{#each tickItems as { index, value: tickVal } (index)}
				<Slider.Tick {index} class="dark:bg-background/20 bg-background z-1 h-2 w-[1px]" />
				{#if tickLabels}
					<Slider.TickLabel
						{index}
						class="text-muted-foreground data-bounded:text-foreground ml-5 text-sm font-medium leading-none"
						position="right"
					>
						{tickLabels[tickVal] ?? tickVal}
					</Slider.TickLabel>
				{/if}
			{/each}
		{/snippet}
	</Slider.Root>
	{#if sideLabels}
		<div class="flex flex-col justify-between h-60 py-1 ml-4">
			{#each sideLabels as lbl}
				<span class="type-sans-xs">{lbl}</span>
			{/each}
		</div>
	{/if}
</div>

