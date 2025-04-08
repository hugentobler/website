import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { markdoc } from 'markdoc-svelte';

import link from './markdoc/nodes/link.js';
import paragraph from './markdoc/nodes/paragraph.js';
import decoratedLink from './markdoc/tags/decorated-link.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // File extensions to treat as Svelte files
  extensions: ['.svelte', '.md'],

  preprocess: [
    // Ref: https://svelte.dev/docs/svelte/svelte-compiler#preprocess
    // TypeScript, PostCSS etc as needed by Tailwind in Svelte
    // Ref: https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/preprocess.md
    vitePreprocess(),
    // Process Markdown files with Markdoc
    markdoc({
      nodes: {
        paragraph,
        link
      },
      tags: {
        decoratedLink
      }
    })
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
