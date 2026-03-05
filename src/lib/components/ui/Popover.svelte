<!--
	@component Popover

	@see https://bits-ui.com/docs/components/popover

	@prop {Snippet} [trigger] - Optional snippet for the trigger button content
	@prop {Snippet} [children] - Optional snippet for the popover content
	@prop {HTMLElement | string | null} [customAnchor] - Custom element to anchor the popover to instead of the trigger

	All other Popover.Content props are supported and passed through.
	```
-->
<script lang="ts">
	import type { WithoutChildren } from "bits-ui";
	import { Popover } from "bits-ui";
	import type { ComponentProps, Snippet } from "svelte";

	type RootProps = WithoutChildren<ComponentProps<typeof Popover.Root>>;
	type ContentProps = ComponentProps<typeof Popover.Content>;
	type Props = RootProps &
		ContentProps & {
			trigger?: Snippet;
		};

	let { open = $bindable(false), trigger, children, ...restProps }: Props = $props();
</script>

<Popover.Root bind:open>
	{#if trigger}
		<Popover.Trigger
			class="focus-visible:ring-accent focus-visible:ring-offset-background inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
		>
			{@render trigger()}
		</Popover.Trigger>
	{/if}
	<Popover.Content
		class="text-card-foreground border-border shadow-border/50 z-50 rounded-lg border p-4 shadow-md"
		{...restProps as any}
	>
		{@render children?.()}
	</Popover.Content>
</Popover.Root>
