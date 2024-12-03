// https://eslint.org/docs/latest/use/configure/

import globals from "globals";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import ts from "typescript-eslint";

export default ts.config(
  // packages
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  prettier,
  ...svelte.configs["flat/prettier"],
  // default modifications
  {
    // https://eslint.org/docs/latest/use/configure/language-options
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    // https://eslint.org/docs/latest/use/configure/rules
    rules: {
      "prettier/prettier": [
        "error", // severity
        {
          useTabs: false,
          singleQuote: true,
          trailingComma: "none",
          printWidth: 100,
          tabWidth: 2,
          importOrder: [
            "^@core/(.*)$",
            "^@server/(.*)$",
            "^@ui/(.*)$",
            "^[./]",
          ],
          importOrderSeparation: true,
          importOrderSortSpecifiers: true,
          plugins: [
            "prettier-plugin-svelte", // handle svelte file parsing https://github.com/sveltejs/prettier-plugin-svelte
            "@trivago/prettier-plugin-sort-imports", // auto sort imports https://github.com/trivago/prettier-plugin-sort-imports
            "prettier-plugin-tailwindcss", // auto sort tailwindcss classes https://github.com/tailwindlabs/prettier-plugin-tailwindcss
          ],
          overrides: [
            {
              files: "*.svelte",
              options: {
                parser: "svelte",
              },
            },
          ],
        },
      ],
    },
  },
  // svelte specific modifications https://github.com/sveltejs/eslint-plugin-svelte
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
  // ignores https://eslint.org/docs/latest/use/configure/ignore
  {
    ignores: [
      "build/",
      ".svelte-kit/",
      "dist/",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
    ],
  }
);
