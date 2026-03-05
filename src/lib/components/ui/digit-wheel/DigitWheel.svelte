<!--
	@component DigitWheel

	A 3D rotating digit wheel that animates between numbers 0-9.
	Used for animated numeric displays in sliders, counters, etc.

	@prop {string} digit - The digit to display (0-9)
	@prop {string} [class] - Additional CSS classes for the wrapper

	@example
	```svelte
	<DigitWheel digit="5" />
	```
-->
<script lang="ts">
	import { cn } from "$lib/utils/cn";

	type Props = {
		digit: string;
		class?: string;
	};

	let { digit, class: className }: Props = $props();
</script>

<span
	class={cn(
		"relative inline-block h-[1em] w-[1ch] overflow-hidden leading-none tabular-nums perspective-distant",
		className
	)}
>
	<span
		class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out"
		style="transform: translate(-50%, -50%) rotateX(calc({Number(
			digit
		)} * -36deg)); transform-style: preserve-3d;"
	>
		{#each Array.from({ length: 10 }, (_, i) => i) as num}
			<span
				class="absolute top-1/2 left-1/2 backface-hidden"
				style="transform: translate(-50%, -50%) rotateX({num * 36}deg) translateZ(1.5em);"
			>
				{num}
			</span>
		{/each}
	</span>
</span>
