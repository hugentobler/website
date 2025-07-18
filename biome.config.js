/**
 * Biome configuration file
 *
 * @see https://biomejs.dev
 * @type {import("biome").BiomenConfig}
 */
export default {
  files: {
    "includes": ["src/**/*.{js,ts,svelte,json}"],
  },
  overrides: [
    {
      "includes": ["**/*.svelte"], // Support .svelte files
      "linter": {
        "rules": {
          "style": {
            "useConst": "off",
            "useImportType": "off"
          },
          "correctness": {
            "noUnusedVariables": "off",
            "noUnusedImports": "off"
          }
        }
      }
    }
  ]
}
