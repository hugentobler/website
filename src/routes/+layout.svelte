<script lang="ts">
	// TODO: Enable dark mode theme setup after testing
	// import { browser } from "$app/environment";
	// import { setupTheme } from "$lib/themes.svelte";

	import "$styles/app.css";

	let { children } = $props();

	// TODO: Enable dark mode theme setup after testing
	// if (browser) {
	// 	setupTheme();
	// }
</script>

<svelte:head>
	<!-- TODO: Enable dark mode FOUC prevention after testing -->
	<!-- <script>
		document.documentElement.dataset.theme =
			localStorage.getItem("theme") === "dark" ||
			(!("theme" in localStorage) &&
				window.matchMedia(`(prefers-color-scheme: dark)`).matches)
				? "dark"
				: "light";
	</script> -->

	<!-- Preconnect to CDN -->
	<link
		rel="preconnect"
		href="https://cdn.hugentobler.xyz"
		crossorigin="anonymous"
	/>
</svelte:head>

{@render children()}
