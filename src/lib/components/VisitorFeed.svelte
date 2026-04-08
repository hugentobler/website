<!--
  Visitor feed component. Displays server-loaded visitor data and fires
  a write-only beacon to POST /api/visit on each navigation.
-->
<script lang="ts">
	import type { Snippet } from "svelte";
	import { afterNavigate } from "$app/navigation";

	let {
		path,
		city,
		country,
		children,
	}: {
		path: string;
		city: string | null;
		country: string | null;
		children: Snippet<[{ city: string; country: string | null }]>;
	} = $props();

	afterNavigate(async () => {
		try {
			await fetch("/api/visit", {
				body: JSON.stringify({ path }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
		} catch {
			// Non-essential — fail silently
		}
	});
</script>

{#if city}
	{@render children({ city, country })}
{/if}
