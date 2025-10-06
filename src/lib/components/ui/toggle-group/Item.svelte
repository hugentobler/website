<script lang="ts">
	import { mergeProps, ToggleGroup } from "bits-ui";
	import type { Snippet } from "svelte";

	// Defaults
	const baseClass =
		"active:bg-muted active:cursor-grabbing active:data-[state=on]:bg-muted/66 active:scale-[0.98] bg-card cursor-grab data-[state=off]:text-foreground/66 data-[state=on]:bg-muted/66 data-[state=on]:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-muted hover:bg-muted inline-flex items-center justify-center rounded-xs transition-all";

	// Props
	const incoming = $props();

	// Merge
	const base = { class: baseClass };
	const merged = mergeProps(base, incoming);

	// Children
	const children = incoming.children as Snippet<[]> | undefined;
	const { children: _children, ...rest } = merged;
</script>

<ToggleGroup.Item {...rest}>
	{@render children?.()}
</ToggleGroup.Item>
