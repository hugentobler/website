/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
export default {
  // rules
  printWidth: 100,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false,
  // sort-imports
  importOrder: [
    // 1. Svelte core imports
    '^svelte$',
    '^svelte/(.*)$',
    // 2. External libraries/dependencies
    '<THIRD_PARTY_MODULES>',
    // 3. Your app's internal modules/aliases
    '^\\$lib/(.*)$',
    '^\\$app/(.*)$',
    '^\\$env/(.*)$',
    // 4. Components
    '^\\$components/(.*)$',
    // 5. Stores
    '^\\$stores/(.*)$',
    // 6. Other internal modules (if you have custom aliases)
    '^@/(.*)$',
    // 7. Relative imports
    '^[./]'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  // tailwindcss
  tailwindStylesheet: './src/app.css', // for tailwindcss v4
  // default parser
  parser: 'typescript',
  // plugins
  plugins: [
    '@trivago/prettier-plugin-sort-imports', // https://github.com/trivago/prettier-plugin-sort-imports
    'prettier-plugin-svelte', // https://github.com/sveltejs/prettier-plugin-svelte
    'prettier-plugin-tailwindcss' // auto sort tailwindcss classes https://github.com/tailwindlabs/prettier-plugin-tailwindcss
  ],
  // overrides
  overrides: [
    {
      files: '*.svelte',
      options: {
        parser: 'svelte'
      }
    },
    {
      files: '*.css',
      options: {
        parser: 'css'
      }
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'always'
      }
    }
  ]
};
