import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { markdocPreprocess } from "markdoc-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// File extensions to treat as Svelte files
	extensions: [".svelte", ".md"],

	kit: {
		// Cloudflare Pages adapter
		// https://svelte.dev/docs/kit/adapter-cloudflare
		adapter: adapter({
			platformProxy: {
				configPath: "wrangler.toml",
				environment: undefined,
				persist: true,
			},
			routes: {
				exclude: ["<all>"],
				include: ["/*"],
			},
		}),

		alias: {
			$data: "src/data",
			$styles: "src/styles",
		},

		// Global prerender configuration. Route entries are generated
		// dynamically by the og.png route's `entries` exporter from
		// $lib/writing — no hardcoded list here.
		prerender: {
			handleHttpError: "warn",
			handleMissingId: "warn",
		},
	},

	preprocess: [
		// Process Markdown files with Markdoc
		markdocPreprocess({
			headingIds: true,
			linkify: true,
			schema: "./src/lib/markdoc",
		}),
		// Ref: https://svelte.dev/docs/svelte/svelte-compiler#preprocess
		// TypeScript, PostCSS etc as needed by Tailwind in Svelte
		// Ref: https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/preprocess.md
		vitePreprocess(),
	],
};

export default config;
