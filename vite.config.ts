//https://vite.dev/config/
import Markdoc from '@markdoc/markdoc';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // markdoc(),
    // {
    //   name: 'markdoc',
    //   transform(src, id) {
    //     if (!id.endsWith('.md')) return null;

    //     // Parse the markdown file into a Markdoc AST
    //     const ast = Markdoc.parse(src);

    //     // Parse the frontmatter
    //     const frontmatter = yaml.parse(ast.attributes.frontmatter);

    //     // Transform the AST to a Markdoc "renderable tree"
    //     const config = {
    //       variables: {
    //         markdoc: {
    //           frontmatter // Make parsed frontmatter accessible via $markdoc.frontmatter inside markdown files
    //         }
    //       }
    //     };
    //     const content = Markdoc.transform(ast, config);

    //     // Return it to Vite
    //     return {
    //       code: `
    //         export const frontmatter = ${JSON.stringify(frontmatter)};
    //         const content = ${JSON.stringify(content)};
    //         export default content;
    //       `,
    //       map: null
    //     };
    //   }
    // },
    // enhancedImages(),
    sveltekit(),
    tailwindcss()
  ]
});
