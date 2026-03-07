<!--
  Visitor feed component. Fires a beacon to POST /api/visit on each
  navigation, which records the visit and returns { total, city, country }
  in one round trip. Passes data to a consumer snippet.
  Renders nothing during SSR — data fills in client-side only.
-->
<script lang="ts">
	import type { Snippet } from "svelte";
	import { afterNavigate } from "$app/navigation";
	import type { VisitorFeedData } from "$lib/types";

	let {
		path = "/",
		children,
	}: {
		path?: string;
		children: Snippet<[VisitorFeedData]>;
	} = $props();

	let total = $state(0);
	let city = $state<string | null>(null);
	let country = $state<string | null>(null);

	afterNavigate(async () => {
		try {
			const res = await fetch("/api/visit", {
				body: JSON.stringify({ path }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			if (res.ok) {
				const data: VisitorFeedData = await res.json();
				total = data.total;
				city = data.city;
				country = data.country;
			}
		} catch {
			// Non-essential — fail silently
		}
	});
</script>

{#if total > 0 || city}
	{@render children({ total, city, country })}
{/if}
