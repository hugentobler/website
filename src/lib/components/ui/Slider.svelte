<script lang="ts">
	import type { WithoutChildrenOrChild } from "bits-ui";
	import { Slider } from "bits-ui";
	import type { ComponentProps } from "svelte";
	import { cn } from "$lib/utils/cn";

	type BaseProps = WithoutChildrenOrChild<ComponentProps<typeof Slider.Root>>;
	type Label = string | number;
	type Props = Omit<BaseProps, "type" | "orientation" | "value"> & {
		type?: "single" | "multiple";
		orientation?: "horizontal" | "vertical";
		value?: number | number[];
		// Allow sparse labels by index using undefined entries
		tickLabels?: Array<Label | undefined>;
		thumbLabels?: Label[];
		hideThumbLabels?: boolean;
	};

	let {
		value = $bindable<number | number[]>(),
		ref = $bindable(null),
		type = "single",
		orientation = "horizontal",
		tickLabels = [],
		thumbLabels = [],
		hideThumbLabels = false,
		...restProps
	}: Props = $props();
</script>

<Slider.Root
	bind:value
	bind:ref
	{type}
	{orientation}
	direction="ltr"
	thumbPositioning="exact"
	trackPadding={5}
	{...restProps as any}
	class={cn(
		"relative flex touch-none items-center place-self-center-safe select-none",
		// Disabled styling centralized on Root
		"data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
		orientation === "vertical" ? "h-full w-fit flex-col" : "h-fit w-full"
	)}
>
	{#snippet children({ thumbItems, tickItems })}
		<span
			class={cn(
				// Track wrapper without cursor/pointer handling; handled by Bits UI parts
				"bg-card relative grow overflow-hidden rounded-full",
				orientation === "vertical" ? "h-full w-2" : "h-2 w-full"
			)}
		>
			<Slider.Range
				class={cn(
					"bg-foreground absolute",
					// Centralized disabled handling
					"data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed",
					orientation === "vertical" ? "w-full" : "h-full"
				)}
			/>
		</span>

		{#each thumbItems as { index, value } (index)}
			<Slider.Thumb
				{index}
				class={cn(
					"border-border hover:bg-muted bg-card shadow-border/50 focus-visible:ring-muted z-5 block size-6 cursor-grab rounded-full border shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50 data-active:scale-[0.98]",
					// Centralized disabled handling
					"data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed"
				)}
			/>
			{#if !hideThumbLabels}
				<Slider.ThumbLabel
					{index}
					position={orientation === "vertical" ? "left" : "top"}
					style={orientation === "vertical" ? "translate: 0 50% !important;" : undefined}
					class={cn(
						"bg-card text-foreground rounded-md px-2 py-px text-sm text-nowrap data-[position=bottom]:mt-4 data-[position=left]:mr-4 data-[position=right]:ml-4 data-[position=top]:mb-4",
						orientation === "vertical" ? "!translate-y-1/2 transform" : undefined
					)}
				>
					{thumbLabels?.[index] ?? value}
				</Slider.ThumbLabel>
			{/if}
		{/each}

		{#each tickItems as { index, value } (index)}
			{@const hasCustomLabels = tickLabels && tickLabels.length > 0}
			{@const label = hasCustomLabels ? tickLabels?.[index] : value}
			<Slider.Tick
				{index}
				class={cn(
					"bg-background z-1",
					// Centralized disabled handling
					"data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed",
					orientation === "vertical" ? "h-px w-2" : "h-2 w-px"
				)}
			/>
			{#if label !== undefined}
				<Slider.TickLabel
					{index}
					position={orientation === "vertical" ? "right" : "bottom"}
				class={cn(
					"text-foreground/66 data-bounded:text-foreground text-sm leading-none font-medium data-[position-left]:mr-3 data-[position-top]:mb-3 data-[position=bottom]:mt-3 data-[position=right]:ml-3",
					// Centralized disabled handling
					"data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed"
				)}
			>
					{label}
				</Slider.TickLabel>
			{/if}
		{/each}
	{/snippet}
</Slider.Root>
