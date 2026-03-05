<!--
  Renderless visitor feed component. Fetches /api/location (and /api/visitors in dev)
  on mount, then passes { total, city, country } to a consumer snippet.
  Renders nothing during SSR — data fills in client-side only.
-->
<script lang="ts">
	import { onMount, type Snippet } from "svelte";
	import { dev } from "$app/environment";
	import type {
		LocationResponse,
		VisitorFeedData,
		VisitorsResponse,
	} from "$lib/types";

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

	onMount(async () => {
		try {
			const params = new URLSearchParams({ path });
			const fetches: Promise<Response>[] = [fetch(`/api/location?${params}`)];
			if (dev) fetches.push(fetch(`/api/visitors?${params}`));

			const [locationRes, visitorsRes] = await Promise.all(fetches);

			if (locationRes.ok) {
				const data: LocationResponse = await locationRes.json();
				city = data.city;
				country = data.country;
			}
			if (visitorsRes?.ok) {
				const data: VisitorsResponse = await visitorsRes.json();
				total = data.total;
			}
		} catch {
			// Non-essential — fail silently
		}
	});
</script>

{#if total > 0 || city}
	{@render children({ total, city, country })}
{/if}
