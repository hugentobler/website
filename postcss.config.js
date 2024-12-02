// provide tailwind-specific postcss config even though vitepreprocess already includes postcss

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
