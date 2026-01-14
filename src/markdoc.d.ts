declare module "*.md" {
	import type { MarkdocModule } from "markdoc-svelte";

	const component: MarkdocModule["default"];
	export default component;

	export const slug: MarkdocModule["slug"];
	export const frontmatter: MarkdocModule["frontmatter"];
	export const headings: MarkdocModule["headings"];
}

