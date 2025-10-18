<script lang="ts">
	import { browser } from "$app/environment";
	import { setupTheme } from "$lib/themes.svelte";

	import "$styles/app.css";

	let { children } = $props();

	if (browser) {
		setupTheme();
	}
</script>

<svelte:head>
	<!-- Set initial theme in head to avoid FOUC -->
	<script>
		// Initial theme is either in localStorage or system preference
		document.documentElement.dataset.theme =
			localStorage.getItem("theme") === "dark" ||
			(!("theme" in localStorage) && window.matchMedia(`(prefers-color-scheme: dark)`).matches)
				? "dark"
				: "light";
	</script>

	<!-- Preconnect to CDN -->
	<link rel="preconnect" href="https://cdn.hugentobler.xyz" crossorigin="anonymous" />
</svelte:head>

{@render children()}
