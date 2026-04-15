import { error } from "@sveltejs/kit";
import type { MarkdocModule } from "markdoc-svelte";

import type { EntryGenerator, PageLoad } from "./$types";

const markdownModules = import.meta.glob("$lib/markdown/*.md");

// Year-prefixed routes resolve to flat markdown filenames.
// Must stay in sync with SLUG_ALIASES in hooks.server.ts.
const SLUG_ALIASES: Record<string, string> = {
	"2025/durable-ai-initiatives": "durable-ai-initiatives",
	"2026/feeding-computer-agents": "feeding-computer-agents",
	"2026/pragmatists-guide-to-ai": "pragmatists-guide-to-ai",
};

export const load: PageLoad = async ({ params }) => {
	const slug = SLUG_ALIASES[params.catchall] ?? params.catchall;

	try {
		const markdown = (await import(`$lib/markdown/${slug}.md`)) as MarkdocModule;
		return { markdown };
	} catch {
		throw error(404, `No content for "${params.catchall}"`);
	}
};

// Generate entries for prerendering: both HTML pages and .md versions.
// During the prerender pass, /{slug}.md requests are intercepted by
// handle in hooks.server.ts, which returns raw markdown content.
export const entries: EntryGenerator = async () => {
	const slugs = await Promise.all(
		Object.values(markdownModules).map(async (importModule) => {
			const module = (await importModule()) as MarkdocModule;
			return module.slug;
		}),
	);

	return slugs.flatMap((slug) => [{ catchall: slug }, { catchall: `${slug}.md` }]);
};
