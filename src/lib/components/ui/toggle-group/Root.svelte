<script lang="ts">
	import { mergeProps, ToggleGroup } from "bits-ui";
	import type { Snippet } from "svelte";

	// Defaults
	const baseClass =
		"bg-card border border-border flex gap-1 items-center p-1 rounded shadow-border/50 shadow-xs";

	// Props
	let { value = $bindable(), ...incoming } = $props();

	// Merge
	const base = {
		class: baseClass,
		onValueChange: (next: unknown) => {
			value = next as never;
		},
	};
	const merged = mergeProps(base, incoming);

	// Children
	const children = incoming.children as Snippet<[]> | undefined;
	const { children: _children, ...rest } = merged;
</script>

<ToggleGroup.Root {...rest} {value} type={incoming.type as "single" | "multiple"}>
	{@render children?.()}
</ToggleGroup.Root>
