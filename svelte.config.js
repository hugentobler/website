import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { markdocPreprocess } from "markdoc-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // File extensions to treat as Svelte files
  extensions: [".svelte", ".md"],

  preprocess: [
    // Process Markdown files with Markdoc
    markdocPreprocess({
      schema: "./src/lib/markdoc",
      linkify: true,
    }),
    // Ref: https://svelte.dev/docs/svelte/svelte-compiler#preprocess
    // TypeScript, PostCSS etc as needed by Tailwind in Svelte
    // Ref: https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/preprocess.md
    vitePreprocess(),
  ],

  kit: {
    // Cloudflare Pages adapter
    // https://svelte.dev/docs/kit/adapter-cloudflare
    adapter: adapter({
      routes: {
        include: ["/*"],
        exclude: ["<all>"],
      },
      platformProxy: {
        configPath: "wrangler.toml",
        environment: undefined,
        persist: false,
      },
    }),

    alias: {
      $data: "src/data",
    },

    // Global prerender configuration
    prerender: {
      handleHttpError: "warn",
      handleMissingId: "warn",
    },
  },
};

export default config;
