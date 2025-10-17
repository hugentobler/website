<script lang="ts">
	import type { WithoutChildrenOrChild } from "bits-ui";
	import { Checkbox, Label } from "bits-ui";
	import type { ComponentProps } from "svelte";
	import { cn } from "$lib/utils/cn";

	type BaseProps = WithoutChildrenOrChild<ComponentProps<typeof Checkbox.Root>>;
	type Props = Omit<BaseProps, "checked"> & {
		checked?: boolean;
		label?: string;
	};

	let { checked = $bindable(false), ref = $bindable(null), label, ...restProps }: Props = $props();

	// Generate a unique ID if not provided
	const checkboxId = restProps.id || `checkbox-${Math.random().toString(36).slice(2, 11)}`;
</script>

<div class="flex items-center gap-3">
	<Checkbox.Root
		bind:checked
		bind:ref
		id={checkboxId}
		{...restProps as any}
		class={cn(
			"border-border bg-foreground data-[state=unchecked]:bg-background data-[state=unchecked]:hover:bg-muted data-[state=checked]:hover:bg-foreground/80 inline-flex size-6 cursor-grab items-center justify-center rounded-md border transition-all active:scale-[0.98] active:cursor-grabbing",
			"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
		)}
	>
		{#snippet children({ checked })}
			<div class="text-card inline-flex items-center justify-center">
				{#if checked}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-4"
					>
						<polyline points="20 6 9 17 4 12"></polyline>
					</svg>
				{/if}
			</div>
		{/snippet}
	</Checkbox.Root>
	{#if label}
		<Label.Root
			for={checkboxId}
			class="cursor-grab text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 active:cursor-grabbing"
		>
			{label}
		</Label.Root>
	{/if}
</div>
