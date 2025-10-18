<script module lang="ts">
	import type { Snippet } from "svelte";

	import Clock from "$lib/components/Clock.svelte";
	import { getNextTheme, toggleTheme } from "$lib/themes.svelte";

	// Map layout names to snippets
	const navbars: Record<string, Snippet> = {
		default: all,
		magazine: magazine,
	};

	// Get the correct navbar with fallback to default
	export const getNavbar = (name: string = "default"): Snippet => {
		return navbars[name] || navbars.default;
	};
</script>

{#snippet all()}
	<ul>
		<li>
			<a href="/">Default</a>
		</li>
	</ul>
{/snippet}

{#snippet magazine()}
	<button
		class="m-px flex flex-1 items-center rounded-lg bg-zinc-50 inset-shadow-sm inset-shadow-zinc-600/40 hover:inset-shadow-none dark:bg-zinc-800 dark:inset-shadow-zinc-950/40"
		tabindex="-1"
	>
		<a
			class="group flex h-full w-full items-center justify-center rounded-lg text-lg leading-0 font-light tracking-tight text-(--foreground) uppercase font-stretch-ultra-condensed focus:inset-ring-2 focus:outline-none lg:text-2xl"
			href="/content"
		>
			<span
				class="flex h-full translate-y-1 items-center group-hover:translate-x-px group-focus:translate-x-px"
				>Blog</span
			>
		</a>
	</button>
	<button
		class="m-px hidden flex-1 rounded-lg bg-zinc-100 inset-shadow-sm inset-shadow-zinc-600/40 hover:inset-shadow-none lg:flex dark:bg-zinc-700 dark:inset-shadow-zinc-950/40"
		tabindex="-1"
	>
		<a
			href="#top"
			class="group flex h-full w-full items-center justify-center rounded-lg text-lg leading-0 font-light tracking-tight text-(--foreground) uppercase font-stretch-ultra-condensed focus:inset-ring-2 focus:outline-none lg:text-2xl"
		>
			<span
				class="flex h-full translate-y-1 items-center group-hover:translate-x-px group-focus:translate-x-px"
				>Top</span
			>
		</a>
	</button>
	<div
		class="m-px flex flex-1 items-center justify-center rounded-lg bg-zinc-100 hover:cursor-wait dark:bg-zinc-700"
	>
		<span
			class="flex h-full translate-y-px items-center font-normal font-stretch-ultra-condensed invert-50 [--clock-height:0.875rem] lg:[--clock-height:1.25rem]"
		>
			<Clock />
		</span>
	</div>
	<div class="m-px flex flex-1 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700">
		<span
			class=" flex h-full translate-y-1 items-center text-lg leading-0 font-light tracking-tight uppercase font-stretch-ultra-condensed invert-50 lg:text-2xl"
			>Los Angeles</span
		>
	</div>
	<button
		on:click={() => toggleTheme()}
		class="group focus:inset-rung-2 m-px flex flex-1 items-center justify-center rounded-lg bg-zinc-100 inset-shadow-sm inset-shadow-zinc-600/40 hover:cursor-pointer hover:inset-shadow-none focus:inset-shadow-none focus:outline-none dark:bg-zinc-700 dark:inset-shadow-zinc-950/40"
	>
		<span class="sr-only">Toggle theme</span>
		<span
			class="translate-y-1 text-lg leading-0 font-light tracking-tight text-(--foreground) uppercase font-stretch-ultra-condensed group-hover:translate-x-px group-focus:translate-x-px lg:text-2xl"
		>
			{getNextTheme()}
		</span>
	</button>
{/snippet}
