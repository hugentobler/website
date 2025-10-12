<script lang="ts">
	import type { WithoutChildrenOrChild } from "bits-ui";
	import { Slider } from "bits-ui";
	import type { ComponentProps } from "svelte";
	import { cn } from "$lib/utils/cn";

	type Props = WithoutChildrenOrChild<ComponentProps<typeof Slider.Root>>;

	let { value = $bindable(), ref = $bindable(null), ...restProps }: Props = $props();

	const orientation = (restProps.orientation ?? "horizontal") as "horizontal" | "vertical";
</script>

<Slider.Root
	bind:value
	bind:ref
	thumbPositioning="contain"
	trackPadding={10}
	{...restProps as any}
	class={cn(
		"relative flex touch-none items-center select-none",
		orientation === "vertical" ? "h-full flex-col" : "w-full"
	)}
>
	{#snippet children({ thumbItems, tickItems })}
		<span
			class={cn(
				"bg-card relative grow cursor-pointer overflow-hidden rounded-full",
				orientation === "vertical" ? "h-full w-2" : "h-2 w-full"
			)}
		>
			<Slider.Range
				class={cn("bg-foreground absolute", orientation === "vertical" ? "w-full" : "h-full")}
			/>
		</span>

		{#each thumbItems as { index, value } (index)}
			<Slider.Thumb
				{index}
				class={cn(
					"border-border hover:bg-muted bg-card shadow-border/50 focus-visible:ring-muted z-5 block size-6 cursor-grab rounded-full border shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50 data-active:scale-[0.98]"
				)}
			/>
			<Slider.ThumbLabel
				{index}
				class={cn(
					"bg-card text-foreground rounded-md px-2 py-px text-sm text-nowrap data-[position=bottom]:mt-4 data-[position=left]:mr-4 data-[position=right]:ml-4 data-[position=top]:mb-4"
				)}
			>
				{value}
			</Slider.ThumbLabel>
		{/each}

		{#each tickItems as { index, value } (index)}
			<Slider.Tick
				{index}
				class={cn("bg-background z-1", orientation === "vertical" ? "h-px w-2" : "h-2 w-px")}
			/>
			<Slider.TickLabel
				{index}
				position={orientation === "vertical" ? "right" : "bottom"}
				class={cn(
					"text-foreground/66 data-bounded:text-foreground text-sm leading-none font-medium data-[position-left]:mr-3 data-[position-top]:mb-3 data-[position=bottom]:mt-3 data-[position=right]:ml-3"
				)}
			>
				{value}
			</Slider.TickLabel>
		{/each}
	{/snippet}
</Slider.Root>
