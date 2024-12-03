// provide tailwind-specific postcss config even though vitepreprocess already includes postcss

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    // "postcss-import": {}, // handle @imports https://github.com/postcss/postcss-import
    tailwindcss: {}, // install tailwindcss https://tailwindcss.com/docs/installation/using-postcss
    autoprefixer: {}, // handle vendor prefixes
  },
};
