// https://tailwindcss.com/docs/configuration

import aspectRatio from "@tailwindcss/aspect-ratio";
import containerQueries from "@tailwindcss/container-queries";
import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

import type { Config } from "tailwindcss";

export default {
  // template paths https://tailwindcss.com/docs/content-configuration
  content: ["./src/**/*.{html,js,svelte,ts}"],

  // theme https://tailwindcss.com/docs/theme
  theme: {
    extend: {},
    fontFamily: {
      mono: ["Berkeley Mono Variable", "Berkeley Mono", "monospace"],
    },
  },

  // plugins https://tailwindcss.com/docs/plugins
  plugins: [typography, forms, containerQueries, aspectRatio],
} satisfies Config;
