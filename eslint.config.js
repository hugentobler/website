import prettier from "eslint-config-prettier";
import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import ts from "typescript-eslint";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  prettier,
  ...svelte.configs["flat/prettier"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          useTabs: false,
          singleQuote: true,
          trailingComma: "none",
          printWidth: 100,
          tabWidth: 2,
          plugins: ["prettier-plugin-svelte", "prettier-plugin-tailwindcss"],
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
  {
    files: ["**/*.svelte"],

    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
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
