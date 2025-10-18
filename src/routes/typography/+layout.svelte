<script lang="ts">
	import { getNavbar } from "$lib/components/Navbars.svelte";

	let { children } = $props();

	// Get the default navbar
	const navbar = getNavbar("magazine");

	// Typography layout-specific color overrides
	// These will cascade to all child routes under /typography/*
	let container: HTMLElement;
</script>

<!-- Navbar using existing system -->
<nav
	class="fixed inset-x-1 top-0 z-30 mx-auto flex h-(--navbar-height) max-w-[calc(var(--container-5xl)*2)] gap-1 py-1"
>
	{@render navbar()}
</nav>

<!-- Main content with bottom padding for fixed navbar -->
<div bind:this={container} class="min-h-dvh pb-(--navbar-height)">
	{@render children?.()}
</div>

<style lang="postcss">
	div {
		/* Typography-specific color scheme - light theme */
		/* Uncomment and customize as needed */
		/* --background: var(--color-charcoal-50); */
		/* --foreground: var(--color-charcoal-900); */
		/* --card: var(--color-zinc-100); */
		/* --card-foreground: var(--color-charcoal-900); */
		/* --muted: var(--color-charcoal-200); */
		/* --muted-foreground: var(--color-charcoal-600); */
		/* --border: var(--color-charcoal-300); */
	}

	/* Dark theme overrides for typography section */
	:global([data-theme="dark"]) div {
		/* --background: var(--color-zinc-900); */
		/* --foreground: var(--color-sky-50); */
		/* --card: var(--color-zinc-800); */
		/* --card-foreground: var(--color-sky-100); */
		/* --muted: var(--color-zinc-700); */
		/* --muted-foreground: var(--color-zinc-400); */
		/* --border: var(--color-zinc-700); */
	}
</style>
