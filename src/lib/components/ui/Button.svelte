<!--
	@component Button

	A simple button component wrapping bits-ui button primitive.

	@see https://bits-ui.com/docs/components/button

	All Button.Root props are supported and passed through.
-->
<script lang="ts">
	import type { WithoutChild } from "bits-ui";
	import { Button as ButtonPrimitive } from "bits-ui";
	import type { ComponentProps } from "svelte";
	import { cn } from "$lib/utils/cn";

	type Props = WithoutChild<ComponentProps<typeof ButtonPrimitive.Root>>;

	let { ref = $bindable(null), class: className, ...restProps }: Props = $props();
</script>

<ButtonPrimitive.Root
	bind:ref
	{...restProps}
	class={cn(
		// Base styles
		"bg-background border-border shadow-border/50 text-muted-foreground relative inline-flex items-center justify-center rounded-sm border shadow-xs transition-colors",
		// Hover states
		"hover:bg-muted hover:text-foreground",
		// Cursor states
		"cursor-alias",
		// Active state animation
		"active:scale-[0.98]",
		// Focus states
		"focus-visible:ring-accent focus-visible:ring-offset-background focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
		// Disabled state
		"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
		// Custom class
		className
	)}
>
	{@render restProps.children?.()}
</ButtonPrimitive.Root>
