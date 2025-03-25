import type { PreprocessorGroup } from 'svelte/compiler';

import Markdoc from '@markdoc/markdoc';
import type { Plugin } from 'vite';
import yaml from 'yaml';

const markdoc = (): PreprocessorGroup => {
  return {
    name: 'markdoc',
    markup: async ({ content, filename }) => {
      console.log('>>> markdoc markup called with:', filename);
      if (filename?.endsWith('.md')) {
        console.log('markdoc intercepted');
        return {
          code: '<script lang="ts"></script>\n<h1>Hello World</h1>\n'
        };
      }
    }
  };
};

export default markdoc;

/**
 * Convert Markdoc markdown into a Svelte component string.
 * @param src The raw markdown source
 * @param id The file path (for reference)
 */
// const markdocToSvelte = (src: string, id: string): string => {
//   // 1) Parse the markdown into a Markdoc AST
//   const ast = Markdoc.parse(src);

//   // 2) Parse frontmatter if present
//   const frontmatter = ast.attributes.frontmatter ? yaml.parse(ast.attributes.frontmatter) : {};

//   // 3) Create Markdoc config
//   // Markdoc Variables: https://markdoc.dev/docs/variables
//   const config: Config = {
//     variables: {
//       frontmatter
//     }
//   };

//   // 4) Transform AST into a Markdoc "renderable" tree
//   const content = Markdoc.transform(ast, config);

//   // We'll collect import statements (for each image) plus the main markup
//   let imageIndex = 0;
//   const imports: string[] = [];

//   // 5) Recursively convert the Markdoc render tree to Svelte markup
//   function renderNode(node: any): string {
//     // If it's just a text string
//     if (typeof node === 'string') {
//       return node;
//     }

//     // Markdoc Tag object
//     const { name, attributes = {}, children = [] } = node;

//     // If it's an <img>, replace with <enhanced:img>
//     if (name === 'img') {
//       const src = attributes.src ?? '';
//       const alt = attributes.alt ?? '';
//       const title = attributes.title ?? '';

//       // Make a unique variable name for each image
//       const varName = `__enhanced_img_${imageIndex++}__`;

//       // Add a static import statement with ?enhanced
//       // Adjust the path resolution if needed
//       imports.push(`import ${varName} from '${src}?enhanced';`);

//       // Return <enhanced:img> markup
//       return `<enhanced:img src={${varName}} alt="${escapeQuotes(alt)}" title="${escapeQuotes(title)}" />`;
//     }

//     // Otherwise, handle as a regular tag
//     // Recursively render children
//     const inner = Array.isArray(children) ? children.map(renderNode).join('') : '';
//     return `<${name}>${inner}</${name}>`;
//   }

//   // Markdoc.transform() typically returns an array or a single node
//   let body = '';
//   if (Array.isArray(content)) {
//     body = content.map(renderNode).join('');
//   } else if (content) {
//     body = renderNode(content);
//   }

//   // 5) Construct the final Svelte file
//   return `
//   <script>
//   </script>
//   <h1>Hello World</h1>
//   `;
// };

// /** Helper to escape double quotes inside a string */
// const escapeQuotes = (str: string): string => {
//   return String(str).replace(/"/g, '\\"');
// };
