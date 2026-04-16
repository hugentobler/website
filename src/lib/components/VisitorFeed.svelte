<!--
  Visitor feed component. Renders the "last visitor" line and keeps it fresh
  via a client heartbeat against GET /api/visitor. Also fires the existing
  write-only POST /api/visit beacon on each navigation.

  Polling strategy: unconditional exponential backoff. Start at BASE_DELAY_MS
  and double each tick up to MAX_DELAY_MS, regardless of whether the polled
  value changed. The tick counter resets on:
    - SPA navigation (path prop changes)
    - Tab returning to foreground after being hidden
  Polling pauses entirely while document.hidden is true.
-->
<script lang="ts">
	import type { Snippet } from "svelte";
	import { onMount } from "svelte";
	import { afterNavigate } from "$app/navigation";

	type Visitor = { city: string | null; country: string | null };

	let {
		path,
		city: ssrCity,
		country: ssrCountry,
		children,
	}: {
		path: string;
		city: string | null;
		country: string | null;
		children: Snippet<[{ city: string; country: string | null }]>;
	} = $props();

	// `polled` holds the client-polled value once available; when null, the
	// derived view falls back to the SSR-loaded props. Setting polled = null
	// on navigation / visibility-reset lets the new SSR value for the new
	// path show through until the first successful poll lands.
	let polled = $state<Visitor | null>(null);
	const city = $derived(polled?.city ?? ssrCity);
	const country = $derived(polled?.country ?? ssrCountry);

	const BASE_DELAY_MS = 3_000;
	const MAX_DELAY_MS = 60_000;

	// Number of polls already completed in the current backoff window.
	// After the Nth poll, the next delay is BASE * 2^(N-1), capped at MAX,
	// giving the intended 3s → 6s → 12s → 24s → 48s → 60s sequence.
	let completed = 0;
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	function clearPending() {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	}

	async function poll() {
		timeoutId = null;
		if (typeof document !== "undefined" && document.hidden) return;

		try {
			const res = await fetch(
				`/api/visitor?path=${encodeURIComponent(path)}`,
			);
			if (res.ok) {
				polled = (await res.json()) as Visitor;
			}
		} catch {
			// Non-essential — swallow and keep backing off.
		}

		completed += 1;
		const delay = Math.min(
			BASE_DELAY_MS * 2 ** (completed - 1),
			MAX_DELAY_MS,
		);
		if (typeof document !== "undefined" && document.hidden) return;
		timeoutId = setTimeout(poll, delay);
	}

	function reset() {
		completed = 0;
		clearPending();
		// Poll immediately so the user sees fresh data on nav / focus.
		timeoutId = setTimeout(poll, 0);
	}

	function onVisibilityChange() {
		if (document.hidden) {
			clearPending();
		} else {
			reset();
		}
	}

	onMount(() => {
		document.addEventListener("visibilitychange", onVisibilityChange);
		reset();
		return () => {
			document.removeEventListener("visibilitychange", onVisibilityChange);
			clearPending();
		};
	});

	afterNavigate(async () => {
		// Existing write beacon: record the visit. Path is the component prop,
		// which is already updated to the new pathname by the time this fires.
		try {
			await fetch("/api/visit", {
				body: JSON.stringify({ path }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
		} catch {
			// Non-essential — fail silently.
		}

		// Drop the stale polled value so the footer shows the new path's SSR
		// value until the first poll for the new path resolves, then restart
		// the backoff loop.
		polled = null;
		reset();
	});
</script>

{#if city}
	{@render children({ city, country })}
{/if}
