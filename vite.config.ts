//https://vite.dev/config/
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { typographyPlugin } from "./src/lib/vite-typography-plugin";

export default defineConfig({
	plugins: [typographyPlugin(), enhancedImages(), sveltekit(), tailwindcss()],
	server: {
		watch: {
			ignored: ["**/src/lib/generated/**"],
		},
	},
});
