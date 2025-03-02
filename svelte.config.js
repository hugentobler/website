import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

// NOTE: Using svelte.config.ts breaks mdsvex .md file handling.
// TODO: See if mdsvex fix missing types export.

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  // File extensions that should be treated as Svelte files

  preprocess: [
    // Ref: https://svelte.dev/docs/svelte/svelte-compiler#preprocess
    vitePreprocess(),
    // TypeScript, PostCSS etc as needed by Tailwind in Svelte
    // Ref: https://github.com/sveltejs/vite-plugin-svelte/blob/main/docs/preprocess.md
    mdsvex({
      extensions: ['.md'],
      // set layout in markdown frontmatter
      layout: {
        magazine: './src/routes/[...catchall]/magazine.svelte',
        _: './src/routes/[...catchall]/default.svelte' // default when no layout is specified
      },
      remarkPlugins: [],
      rehypePlugins: []
    })
    // markdown in svelte
    // Ref: https://github.com/pngwn/MDsveX
  ],

  kit: {
    // cloudflare Pages adapter
    // https://svelte.dev/docs/kit/adapter-cloudflare
    adapter: adapter({
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
};

export default config;
