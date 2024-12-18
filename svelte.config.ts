// https://svelte.dev/docs/kit/configuration

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import type { Config } from '@sveltejs/kit';
import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  extensions: ['.svelte', '.md'],
  // File extensions that should be treated as Svelte files

  preprocess: [
    // Ref: https://svelte.dev/docs/svelte/svelte-compiler#preprocess
    vitePreprocess(),
    // TypeScript, PostCSS etc as needed by Tailwind in Svelte
    // Ref: https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/preprocess.md
    mdsvex({ extensions: ['.md', '.mdx'] })
    // Markdown in Svelte
    // Ref: https://github.com/pngwn/MDsveX
  ],

  kit: {
    // Cloudflare Pages adapter
    // https://svelte.dev/docs/kit/adapter-cloudflare
    adapter: adapter({
      // See below for an explanation of these options
      routes: {
        include: ['/*'],
        exclude: ['<all>']
      },
      platformProxy: {
        configPath: 'wrangler.toml',
        environment: undefined,
        experimentalJsonConfig: false,
        persist: false
      }
    })
  }
} satisfies Config;
