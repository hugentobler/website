<!--
	@component Output

	A simple output component for displaying values.
	Uses HTML output element with consistent styling.

	@prop {string} [for] - Associates output with form controls
	@prop {string} [class] - Additional CSS classes

	All other output element props are supported and passed through.
-->
<script lang="ts">
	import type { HTMLOutputAttributes } from "svelte/elements";
	import { cn } from "$lib/utils/cn";

	type Props = HTMLOutputAttributes & {
		class?: string;
	};

	let { for: htmlFor, class: className, children, ...restProps }: Props = $props();
</script>

<output
	for={htmlFor}
	{...restProps}
	class={cn(
		// Base styles
		"bg-background border-border shadow-border/50 relative inline-flex items-center justify-center rounded-sm border shadow-xs",
		// Text styles
		"text-muted-foreground text-xs",
		// Custom class
		className
	)}
>
	{@render children?.()}
</output>
