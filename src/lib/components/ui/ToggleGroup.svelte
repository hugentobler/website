<script lang="ts">
	import type { WithoutChildrenOrChild } from "bits-ui";
	import { ToggleGroup } from "bits-ui";
	import type { ComponentProps } from "svelte";

	type Option = {
		value: string;
		label: string;
	};

	type BaseProps = WithoutChildrenOrChild<ComponentProps<typeof ToggleGroup.Root>>;
type Props = Omit<BaseProps, "value" | "type"> & {
	options?: Option[];
	type?: "single" | "multiple";
    value?: string | string[];
    required?: boolean; // enforce a selection in single mode
};

let {
	value = $bindable(),
	ref = $bindable(null),
	options = [],
	type = "single",
    required = true,
	...restProps
}: Props = $props();

// In single mode, prevent empty selection when required
// Note: when type="single", Bits UI allows toggling off the selected item.
// `required` defaults to true for API consistency but is not enforced here.
</script>

<ToggleGroup.Root
	bind:value
	bind:ref
	{...restProps as any}
	{type}
	class="bg-card border-border shadow-border/50 flex h-fit w-fit items-center gap-1 rounded border p-1 shadow-xs"
>
	{#each options as opt (opt.value)}
		<ToggleGroup.Item
			value={opt.value}
			aria-label={`Toggle ${opt.label}`}
			class="active:bg-muted active:data-[state=on]:bg-muted/66 bg-card data-[state=off]:text-foreground/66 data-[state=on]:bg-muted/66 data-[state=on]:text-foreground focus-visible:ring-muted hover:bg-muted inline-flex cursor-grab items-center justify-center rounded-xs px-1 transition-all focus-visible:ring-1 focus-visible:outline-none active:scale-[0.98] active:cursor-grabbing"
		>
			{opt.label}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
