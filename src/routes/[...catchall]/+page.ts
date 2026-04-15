import { error } from "@sveltejs/kit";
import type { MarkdocModule } from "markdoc-svelte";
import { slugAliases } from "$lib/writing";

import type { EntryGenerator, PageLoad } from "./$types";

const markdownModules = import.meta.glob("$lib/markdown/*.md");

export const load: PageLoad = async ({ params }) => {
	const slug = slugAliases[params.catchall] ?? params.catchall;

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
