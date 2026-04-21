import { error } from "@sveltejs/kit";
import type { MarkdocModule } from "markdoc-svelte";
import type { TocEntry } from "$lib/toc";
import { loadToc } from "$lib/toc";

import type { PageLoad } from "./$types";

const modules = import.meta.glob<MarkdocModule>("$lib/nook/*.md");
const rawModules = import.meta.glob("$lib/nook/*.md", {
	import: "default",
	query: "?raw",
});

/**
 * For entries with --- separators but no headings, generate a numbered
 * chapter TOC from the thematic breaks.
 */
function chapterTocFromRaw(raw: string): TocEntry[] {
	// Strip frontmatter
	const body = raw.replace(/^---\n[\s\S]*?\n---\n?/, "");
	// Split on thematic breaks
	const sections = body.split(/^\s*---\s*$/m);
	if (sections.length <= 1) return [];

	return sections.map((section, i) => {
		const text = section.replace(/\s+/g, " ").trim();
		return { chars: text.length, id: `chapter-${i + 1}`, level: 2, title: `Chapter ${i + 1}` };
	});
}

export const load: PageLoad = async ({ data }) => {
	const { entry } = data;
	const match = Object.entries(modules).find(([path]) => path.endsWith(`/${entry.slug}.md`));
	if (!match) throw error(404, `No content for "${entry.slug}"`);

	const markdown = await match[1]();
	const headingToc = await loadToc(entry.slug, markdown.headings, rawModules);

	// Use heading-based TOC if headings exist, otherwise fall back to chapter numbers
	let toc: TocEntry[];
	if (headingToc.length > 0) {
		toc = headingToc;
	} else {
		const rawEntry = Object.entries(rawModules).find(([key]) => key.endsWith(`/${entry.slug}.md`));
		const raw = rawEntry ? ((await rawEntry[1]()) as string) : "";
		toc = chapterTocFromRaw(raw);
	}

	toc = [...toc, { chars: 0, id: "source", level: 2, title: "Source" }];
	return { entry, markdown, nextSlug: data.nextSlug, toc };
};
