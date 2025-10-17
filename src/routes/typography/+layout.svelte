<script lang="ts">
	import { setContext } from "svelte";

	// import {
	// 	applyVars,
	// 	defaultTypographyConfig,
	// 	type TypographyConfig,
	// } from "$lib/typography/config";

	// Route-scoped "application variables" for typography section
	// let config = $state<TypographyConfig>({ ...defaultTypographyConfig });

	// Apply to a container to scope to /typography
	let container: HTMLElement | null = null;

	// $effect(() => {
	// 	if (container) applyVars(container, config);
	// });

	// Expose route-scoped config and an apply helper to children
	// const ctx = {
	// 	get: () => config,
	// 	set: (next: TypographyConfig) => (config = next),
	// 	apply: () => {
	// 		if (container) applyVars(container, config);
	// 	},
	// };
	// setContext("typographyConfig", ctx);
</script>

<div bind:this={container} class="min-h-dvh">
	<slot />
</div>
