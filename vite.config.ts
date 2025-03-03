//https://vite.dev/config/
import Markdoc from '@markdoc/markdoc';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import yaml from 'yaml';

export default defineConfig({
  plugins: [
    enhancedImages(),
    {
      name: 'process-markdown',
      transform(src, id) {
        if (!id.endsWith('.md')) return null;

        const ast = Markdoc.parse(src);
        const frontmatter = yaml.parse(ast.attributes.frontmatter);

        const config = {
          variables: {
            markdoc: {
              frontmatter // make parsed frontmatter accessible via $markdoc.frontmatter inside markdown files
            }
          }
        };
        const content = Markdoc.transform(ast, config);

        return {
          code: `
            export const frontmatter = ${JSON.stringify(frontmatter)};
            const content = ${JSON.stringify(content)};
            export default content;
          `,
          map: null
        };
      }
    },
    sveltekit(),
    tailwindcss()
  ]
});
