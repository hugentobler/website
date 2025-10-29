<!--
	@component ToggleGroup

	A group of toggle buttons that allows single or multiple selection.
	Each option is displayed as a button that can be toggled on/off.
	Features an animated background indicator that slides between selected items.

	@see https://bits-ui.com/docs/components/toggle-group

	@prop {string | string[]} [value] - Current selected value(s) (single mode: string, multiple mode: string[])
	@prop {"single" | "multiple"} [type="single"] - Selection mode
	@prop {Option[]} [options=[]] - Array of options with value and label
	@prop {boolean} [disabled=false] - Disable all toggle items
	@prop {boolean} [loop=true] - Whether to loop keyboard navigation
	@prop {"horizontal" | "vertical"} [orientation="horizontal"] - Layout orientation
	@prop {boolean} [rovingFocus=true] - Enable roving focus for keyboard navigation

	All other ToggleGroup.Root props are supported and passed through.
-->
<script lang="ts">
	import type { WithoutChildrenOrChild } from "bits-ui";
	import { ToggleGroup } from "bits-ui";
	import type { ComponentProps } from "svelte";
	import { untrack } from "svelte";
	import { cn } from "$lib/utils/cn";

	type Option = {
		value: string;
		label: string;
		disabled?: boolean;
	};

	type BaseProps = WithoutChildrenOrChild<ComponentProps<typeof ToggleGroup.Root>>;
	type Props = Omit<BaseProps, "value" | "type"> & {
		value?: string | string[];
		type?: "single" | "multiple";
		options?: Option[];
		disabled?: boolean;
	};

	let {
		value = $bindable(),
		ref = $bindable(null),
		options = [],
		type = "single",
		disabled = false,
		...restProps
	}: Props = $props();

	// Track refs for each toggle item to measure position/size
	let itemRefs = $state<Map<string, HTMLButtonElement>>(new Map());
	// Trigger to force recalculation after refs are populated
	let refsReady = $state(0);

	// Reactive indicator positioning
	let indicatorStyle = $derived.by(() => {
		// Access refsReady to trigger recalculation when refs populate
		refsReady;
		if (!value) return "opacity: 0;";

		// Get the active value (in single mode it's a string, in multiple mode we take the first)
		const activeValue = Array.isArray(value) ? value[0] : value;
		if (!activeValue) return "opacity: 0;";

		const activeEl = itemRefs.get(activeValue);
		if (!activeEl) return "opacity: 0;";

		// Measure the active element's position and size
		// offsetLeft/offsetWidth/offsetHeight include the element's padding and border
		// offsetLeft is measured from parent's content box (already accounts for parent's padding)
		const { offsetLeft, offsetWidth, offsetHeight } = activeEl;

		return `
			transform: translateX(${offsetLeft}px);
			width: ${offsetWidth}px;
			height: ${offsetHeight}px;
			opacity: 1;
		`;
	});
</script>

<ToggleGroup.Root
	bind:value
	bind:ref
	{...restProps as any}
	{type}
	{disabled}
	class={cn(
		// Base styles
		"bg-background border-border shadow-border/50 relative flex gap-1 rounded border p-px shadow-xs",
		// Layout
		"h-fit w-fit items-center",
		// Disabled state
		"data-disabled:cursor-not-allowed data-disabled:opacity-50"
	)}
>
	<!-- Animated background indicator -->
	<!-- Positioned at top-1 for vertical padding, left-0 since offsetLeft already includes horizontal padding offset -->
	<div
		class="from-accent to-primary pointer-events-none absolute top-px left-0 rounded-sm bg-linear-to-r transition-[transform,width,height,opacity] duration-200 ease-out"
		style={indicatorStyle}
	></div>

	{#each options as opt (opt.value)}
		{@const itemRef = (() => {
			let el: HTMLButtonElement | null = $state(null);
			$effect(() => {
				if (el) {
					itemRefs.set(opt.value, el);
					// Trigger indicator recalculation (untrack to prevent infinite loop)
					untrack(() => refsReady++);
				}
			});
			return {
				get current() {
					return el;
				},
				set current(value) {
					el = value;
				},
			};
		})()}
		<ToggleGroup.Item
			bind:ref={itemRef.current}
			value={opt.value}
			disabled={opt.disabled}
			aria-label={`Toggle ${opt.label}`}
			class={cn(
				// Base styles - no background, indicator handles it
				"relative z-10 inline-flex items-center justify-center rounded-xs bg-transparent px-2 py-1.5",
				// Text styles
				"text-sm leading-none transition-colors",
				// Interactive states - text color changes based on state
				"data-[state=off]:text-foreground/66",
				"data-[state=on]:text-foreground data-[state=on]:invert",
				// Cursor states
				"cursor-alias",
				// Active state animation
				"active:scale-[0.98]",
				// Focus states - only show ring on keyboard focus, not programmatic focus
				"focus-visible:ring-accent focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
				// Disabled state
				"data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50"
			)}
		>
			{opt.label}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
