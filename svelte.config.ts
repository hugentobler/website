import adapter from '@sveltejs/adapter-cloudflare';
import type { Config } from '@sveltejs/kit';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

import markdoc from './markdoc-plugin';

const config: Config = {
  // File extensions to treat as Svelte files
  extensions: ['.svelte'],

  preprocess: [
    markdoc(),
    // Ref: https://svelte.dev/docs/svelte/svelte-compiler#preprocess
    vitePreprocess()
    // TypeScript, PostCSS etc as needed by Tailwind in Svelte
    // Ref: https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/preprocess.md
  ],

  kit: {
    // Cloudflare Pages adapter
    // https://svelte.dev/docs/kit/adapter-cloudflare
    adapter: adapter({
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      },
      platformProxy: {
        configPath: 'wrangler.toml',
        environment: undefined,
        persist: false
      }
    })
  }
};

export default config;
