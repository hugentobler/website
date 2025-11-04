<!--
	@component ButtonGroup

	A wrapper component that groups buttons and other elements together,
	adjusting border radius to create a seamless connected appearance.

	Automatically handles first/last child styling to remove inner borders
	and adjust border radius appropriately.

	@prop {string} [class] - Additional CSS classes for the wrapper
	@prop {string} [orientation="horizontal"] - Layout direction

	@example
	```svelte
	<ButtonGroup>
		<Button>First</Button>
		<Button>Middle</Button>
		<Button>Last</Button>
	</ButtonGroup>
	```
-->
<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils/cn";

	type Props = HTMLAttributes<HTMLDivElement> & {
		class?: string;
		orientation?: "horizontal" | "vertical";
	};

	let { class: className, orientation = "horizontal", children, ...restProps }: Props = $props();
</script>

<div
	{...restProps}
	class={cn(
		"button-group inline-flex items-stretch gap-0",
		orientation === "horizontal" ? "flex-row" : "flex-col",
		className
	)}
>
	{@render children?.()}
</div>

<style lang="postcss">
	@reference "@/styles/app.css";

	.button-group {
		/* Remove gap between children for seamless connection */
		/*gap: 0;*/
	}

	/* Horizontal orientation */
	.button-group.flex-row > :global(*:not(:first-child):not(:last-child)) {
		@apply rounded-none;
		@apply border-x-0;
	}

	.button-group.flex-row > :global(*:first-child:not(:last-child)) {
		@apply rounded-r-none;
		@apply border-r-0;
	}

	.button-group.flex-row > :global(*:last-child:not(:first-child)) {
		@apply rounded-l-none;
		@apply border-l-0;
	}

	/* Vertical orientation */
	.button-group.flex-col > :global(*:not(:first-child):not(:last-child)) {
		@apply rounded-none;
		@apply border-y-0;
	}

	.button-group.flex-col > :global(*:first-child:not(:last-child)) {
		@apply rounded-b-none;
		@apply border-b-0;
	}

	.button-group.flex-col > :global(*:last-child:not(:first-child)) {
		@apply rounded-t-none;
		@apply border-t-0;
	}

	/* Ensure child elements maintain proper border */
	.button-group > :global(*:only-child) {
		/* Single child keeps all borders and corners */
		@apply rounded-sm;
	}
</style>
