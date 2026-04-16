import { error } from "@sveltejs/kit";
import type { MarkdocModule } from "markdoc-svelte";

import type { EntryGenerator, PageLoad } from "./$types";

const markdownModules = import.meta.glob("$lib/markdown/*.md");
const rawModules = import.meta.glob("$lib/markdown/*.md", {
	import: "default",
	query: "?raw",
});

// Year-prefixed routes resolve to flat markdown filenames.
// Must stay in sync with SLUG_ALIASES in hooks.server.ts.
const SLUG_ALIASES: Record<string, string> = {
	"2025/durable-ai-initiatives": "durable-ai-initiatives",
	"2026/feeding-computer-agents": "feeding-computer-agents",
	"2026/pragmatists-guide-to-ai": "pragmatists-guide-to-ai",
};

export type TocEntry = {
	level: number;
	title: string;
	id: string;
	chars: number;
};

// Fixed weights for Markdoc tags that take significant vertical
// space but contain little or no inline text. Tuned by eye against
// how much scroll the rendered element usually consumes, relative
// to a paragraph of body copy.
const PANZOOM_WEIGHT = 400;

function computeSectionSizes(raw: string): number[] {
	// Strip frontmatter so `---` rules don't confuse the walker.
	const withoutFrontmatter = raw.replace(/^---\n[\s\S]*?\n---\n?/, "");

	// Strip fenced code blocks so `##` inside code doesn't register
	// as a heading and doesn't contribute text to section sizes.
	const withoutCode = withoutFrontmatter.replace(/```[\s\S]*?```/g, "");

	const headingRegex = /^(#{1,6})\s+(.+)$/gm;
	const positions: { start: number; end: number }[] = [];
	for (
		let match = headingRegex.exec(withoutCode);
		match !== null;
		match = headingRegex.exec(withoutCode)
	) {
		positions.push({
			end: match.index + match[0].length,
			start: match.index,
		});
	}

	const sizes: number[] = [];
	for (let i = 0; i < positions.length; i++) {
		const bodyStart = positions[i].end;
		const bodyEnd = i + 1 < positions.length ? positions[i + 1].start : withoutCode.length;
		const body = withoutCode.slice(bodyStart, bodyEnd);

		const panzoomCount = (body.match(/\{%\s*panzoom\b/g) ?? []).length;

		const text = body
			// Strip Markdoc tags entirely (attributes, content within custom
			// block tags is not user-visible text in a reading sense).
			.replace(/\{%[\s\S]*?%\}/g, "")
			// Keep alt text for images, drop the URL.
			.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
			// Keep link text, drop the URL.
			.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
			// Drop inline code.
			.replace(/`[^`]*`/g, "")
			// Drop emphasis markers.
			.replace(/[*_]+/g, "")
			// Drop blockquote markers at line starts.
			.replace(/^>\s?/gm, "")
			// Collapse whitespace.
			.replace(/\s+/g, " ")
			.trim();

		sizes.push(text.length + panzoomCount * PANZOOM_WEIGHT);
	}

	return sizes;
}

async function loadToc(slug: string, headings: MarkdocModule["headings"]): Promise<TocEntry[]> {
	if (!headings || headings.length === 0) return [];

	const rawEntry = Object.entries(rawModules).find(([key]) => key.endsWith(`/${slug}.md`));
	if (!rawEntry) return [];

	const raw = (await rawEntry[1]()) as string;
	const sizes = computeSectionSizes(raw);

	// Zip heading metadata with section sizes by document order, then
	// restrict the TOC to h2 + h3. h1 is dropped because posts render
	// their title from frontmatter, not the markdown body.
	return headings
		.map((h, i) => ({
			chars: sizes[i] ?? 0,
			id: h.id ?? "",
			level: h.level,
			title: h.title,
		}))
		.filter((h) => (h.level === 2 || h.level === 3) && h.id);
}

export const load: PageLoad = async ({ params }) => {
	const slug = SLUG_ALIASES[params.catchall] ?? params.catchall;

	try {
		const markdown = (await import(`$lib/markdown/${slug}.md`)) as MarkdocModule;
		const toc = await loadToc(slug, markdown.headings);
		return { markdown, toc };
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
