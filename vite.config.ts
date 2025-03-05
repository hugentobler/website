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
      name: 'markdoc',
      transform(src, id) {
        if (!id.endsWith('.md')) return null;

        // Parse the markdown file
        const ast = Markdoc.parse(src);
        // Parse the frontmatter
        const frontmatter = yaml.parse(ast.attributes.frontmatter);

        const config = {
          variables: {
            markdoc: {
              frontmatter // Make parsed frontmatter accessible via $markdoc.frontmatter inside markdown files
            }
          }
        };
        // Create renderable node tree
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
