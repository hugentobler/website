<!--
	@component Slider

	@see https://bits-ui.com/docs/components/slider

	@prop {number | number[]} [value] - Current slider value(s)
	@prop {"single" | "multiple"} [type="single"] - Single or multiple thumb mode
	@prop {"horizontal" | "vertical"} [orientation="horizontal"] - Slider orientation
	@prop {Array<string | number | undefined>} [tickLabels] - Labels for tick marks (sparse arrays supported with undefined entries)
	@prop {Array<string | number>} [thumbLabels] - Custom labels for thumbs (defaults to value)
	@prop {boolean} [hideThumbLabels=false] - Hide thumb value labels

	All other Slider.Root props are supported and passed through.
-->
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
		// Base styles
		"relative flex touch-none items-center select-none",
		// Orientation
		orientation === "vertical" ? "h-full w-fit flex-col" : "h-fit w-full",
		// Disabled state
		"data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50"
	)}
>
	{#snippet children({ thumbItems, tickItems })}
		<span
			class={cn(
				// Base styles
				"bg-muted relative grow overflow-hidden rounded-xs",
				// Orientation
				orientation === "vertical" ? "h-full w-2.5" : "h-2.5 w-full"
			)}
		>
			<Slider.Range
				class={cn(
					// Base styles
					"from-accent to-primary absolute transition-(--primary) duration-150",
					// Gradient based on orientation
					orientation === "vertical" ? "w-full bg-linear-to-b" : "h-full bg-linear-to-r",
					// Disabled state
					"data-disabled:pointer-events-none data-disabled:cursor-not-allowed"
				)}
			/>
		</span>

		{#each thumbItems as { index, value } (index)}
			<Slider.Thumb
				{index}
				class={cn(
					// Base styles
					"bg-background border-border shadow-border/50 z-5 block size-5 rounded-sm border shadow-xs transition-colors",
					// Interactive states
					"cursor-grab active:cursor-grabbing",
					"hover:border-muted-foreground hover:bg-card",
					"data-active:border-accent data-active:scale-[0.98]",
					// Focus states
					"focus-visible:ring-accent focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
					// Disabled state
					"disabled:pointer-events-none disabled:opacity-50",
					"data-disabled:pointer-events-none data-disabled:cursor-not-allowed"
				)}
			/>
			{#if !hideThumbLabels}
				{@const labelValue = String(thumbLabels?.[index] ?? value)}
				<Slider.ThumbLabel
					{index}
					position={orientation === "vertical" ? "left" : "top"}
					style={orientation === "vertical" ? "translate: 0 50% !important;" : undefined}
					class={cn(
						// Base styles
						// TODO: Replace with better text sizing solution
						"bg-background text-foreground border-border shadow-border/50 flex rounded-full border px-1 pt-0.5 text-xs leading-none text-nowrap tabular-nums shadow-xs",
						// Positioning
						"data-[position=bottom]:mt-2.5 data-[position=left]:mr-2.5 data-[position=right]:ml-2.5 data-[position=top]:mb-2.5",
						// Orientation
						orientation === "vertical" ? "translate-y-1/2! transform" : undefined
					)}
				>
					{#each labelValue.split("") as char}
						{#if /[0-9]/.test(char)}
							{@render digitWheel(char)}
						{:else}
							{char}
						{/if}
					{/each}
				</Slider.ThumbLabel>
			{/if}
		{/each}

		{#each tickItems as { index, value } (index)}
			{@const hasCustomLabels = tickLabels && tickLabels.length > 0}
			{@const label = hasCustomLabels ? tickLabels?.[index] : value}
			<Slider.Tick
				{index}
				class={cn(
					// Base styles
					"bg-border z-1",
					// Orientation
					orientation === "vertical" ? "h-px w-1.5" : "h-1.5 w-px",
					// Disabled state
					"data-disabled:pointer-events-none data-disabled:cursor-not-allowed"
				)}
			/>
			{#if label !== undefined}
				<Slider.TickLabel
					{index}
					position={orientation === "vertical" ? "right" : "bottom"}
					class={cn(
						// Base styles
						// TODO: Replace negative margin with better text sizing solution
						"text-muted-foreground -my-[0.15em] block text-xs leading-none text-nowrap",
						// Interactive states
						"hover:text-foreground cursor-alias",
						// States
						"data-bounded:text-foreground",
						// Positioning
						"data-position-left:mr-3 data-position-top:mb-3 data-[position=bottom]:mt-3 data-[position=right]:ml-3",
						// Disabled state
						"data-disabled:pointer-events-none data-disabled:cursor-not-allowed"
					)}
				>
					{label}
				</Slider.TickLabel>
			{/if}
		{/each}
	{/snippet}
</Slider.Root>

{#snippet digitWheel(digit: string)}
	<span
		class="relative inline-block h-3.5 w-[1ch] overflow-hidden tabular-nums perspective-distant"
	>
		<span
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out transform-3d"
			style="transform: translate(-50%, -50%) rotateX(calc({Number(digit)} * -36deg));"
		>
			{#each Array.from({ length: 10 }, (_, i) => i) as num}
				<span
					class="absolute top-1/2 left-1/2 backface-hidden"
					style="transform: translate(-50%, -50%) rotateX({num * 36}deg) translateZ(2em);"
				>
					{num}
				</span>
			{/each}
		</span>
	</span>
{/snippet}
