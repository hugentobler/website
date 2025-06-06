import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import * as svelteParser from 'svelte-eslint-parser';
import ts from 'typescript-eslint';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'], // https://sveltejs.github.io/eslint-plugin-svelte/user-guide/#usage
  // default modifications
  {
    // https://eslint.org/docs/latest/use/configure/language-options
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  // use svelteParser to lint .svelte files, and ts.parser to handle script blocks inside .svelte files
  // https://github.com/sveltejs/eslint-plugin-svelte#book-usage
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: ts.parser,
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte', '.svelte.ts']
      }
    }
  },
  // ignores https://eslint.org/docs/latest/use/configure/ignore
  {
    ignores: ['build/', '.svelte-kit/', 'dist/', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock']
  }
);
