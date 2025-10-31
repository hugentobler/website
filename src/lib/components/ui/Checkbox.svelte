<!--
	@component Checkbox

	A checkbox input that supports checked, unchecked, and indeterminate states.
	Includes an optional label and follows accessibility best practices.

	@see https://bits-ui.com/docs/components/checkbox

	@prop {boolean} [checked=false] - The checked state of the checkbox
	@prop {boolean} [indeterminate=false] - Whether the checkbox is in an indeterminate state
	@prop {string} [label] - Optional label text to display next to the checkbox
	@prop {boolean} [disabled=false] - Whether the checkbox is disabled
	@prop {boolean} [required=false] - Whether the checkbox is required for form submission
	@prop {boolean} [readonly=false] - Whether the checkbox is read-only
	@prop {string} [name] - Name for form submission (renders hidden input)
	@prop {string} [value] - Value for form submission when checked

	All other Checkbox.Root props are supported and passed through.
-->
<script lang="ts">
	import type { WithoutChildrenOrChild } from "bits-ui";
	import { Checkbox, Label, useId } from "bits-ui";
	import type { ComponentProps } from "svelte";
	import { cn } from "$lib/utils/cn";

	type BaseProps = WithoutChildrenOrChild<ComponentProps<typeof Checkbox.Root>>;
	type Props = Omit<BaseProps, "checked"> & {
		checked?: boolean;
		label?: string;
	};

	let {
		checked = $bindable(false),
		ref = $bindable(null),
		label,
		disabled = false,
		indeterminate = false,
		...restProps
	}: Props = $props();

	// Generate a unique ID if not provided
	const checkboxId = restProps.id || useId();
</script>

<div class="flex items-center gap-3">
	<Checkbox.Root
		bind:checked
		bind:ref
		bind:indeterminate
		id={checkboxId}
		{disabled}
		{...restProps as any}
		class={cn(
			// Base styles
			"bg-background border-border shadow-border/50 relative inline-flex size-5 items-center justify-center rounded-sm border shadow-xs transition-colors",
			// Unchecked state
			"data-[state=unchecked]:bg-background",
			// Checked/Indeterminate state - gradient background
			"data-[state=checked]:from-accent data-[state=checked]:to-primary data-[state=checked]:bg-linear-to-br",
			"data-[state=indeterminate]:from-accent data-[state=indeterminate]:to-primary data-[state=indeterminate]:bg-linear-to-br",
			// Hover states
			"data-[state=unchecked]:hover:bg-muted",
			// Cursor states
			"cursor-alias",
			// Active state animation
			"active:scale-[0.98]",
			// Focus states
			"focus-visible:ring-accent focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
			// Disabled state
			"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
			"data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50"
		)}
	>
		{#snippet children({ checked, indeterminate })}
			<div class="inline-flex items-center justify-center">
				{#if indeterminate}
					<!-- Indeterminate icon (minus) -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="text-background size-5"
					>
						<line x1="5" y1="12" x2="19" y2="12"></line>
					</svg>
				{:else if checked}
					<!-- Check icon (Font Awesome) -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 640 640"
						class="text-background size-5"
					>
						<path
							fill="currentColor"
							d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"
						/>
					</svg>
				{/if}
			</div>
		{/snippet}
	</Checkbox.Root>
	{#if label}
		<Label.Root
			for={checkboxId}
			class={cn(
				// Base styles
				"text-sm leading-none font-medium select-none",
				// Cursor states
				"cursor-alias",
				// Disabled state
				"peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
			)}
		>
			{label}
		</Label.Root>
	{/if}
</div>
