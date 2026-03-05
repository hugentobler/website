<!--
	@component AnimatedNumber

	Displays a number or string value with animated digit wheels for numeric characters.
	Non-numeric characters are rendered as plain text.

	@prop {string | number} value - The value to display
	@prop {string} [class] - Additional CSS classes for the wrapper

	@example
	```svelte
	<AnimatedNumber value={42} />
	<AnimatedNumber value="3.14" />
	```
-->
<script lang="ts">
	import { cn } from "$lib/utils/cn";
	import DigitWheel from "./DigitWheel.svelte";

	type Props = {
		value: string | number;
		class?: string;
	};

	let { value, class: className }: Props = $props();
</script>

<span class={cn("inline-flex items-center tabular-nums", className)}>
	{#each String(value).split("") as char}
		{#if /[0-9]/.test(char)}
			<DigitWheel digit={char} />
		{:else}
			{char}
		{/if}
	{/each}
</span>
