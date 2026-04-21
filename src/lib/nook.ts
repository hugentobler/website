/**
 * Single source of truth for the nook library.
 *
 * Eagerly loads every `$lib/nook/*.md` module at build time and pulls
 * metadata from frontmatter. Every file in the directory is included —
 * remove the file to remove the entry.
 *
 * Frontmatter contract:
 *   Required: `title`, `author`, `source`, `date`.
 *   Optional: `publication`, `language` (defaults to "en").
 *
 * `date` is an ISO date string (YYYY-MM-DD, YYYY-MM, or YYYY).
 * The `year` field on Entry is derived from `date`.
 */

import type { MarkdocModule } from "markdoc-svelte";

type Frontmatter = {
	title: string;
	author: string;
	source: string;
	date: string;
	publication?: string;
	language?: string;
};

const modules = import.meta.glob<MarkdocModule>("$lib/nook/*.md", {
	eager: true,
});

export type Entry = {
	slug: string;
	title: string;
	author: string;
	source: string;
	date: string;
	year: number;
	publication?: string;
	language: string;
};

function slugFromPath(path: string): string {
	return path.match(/\/([^/]+)\.md$/)?.[1] ?? "";
}

export const entries: Entry[] = Object.entries(modules).map(([path, mod]) => {
	const slug = slugFromPath(path);
	const fm = mod.frontmatter as Frontmatter;
	if (!fm?.title || !fm?.author || !fm?.source || !fm?.date) {
		throw new Error(
			`Nook entry "${slug}" is missing required frontmatter (title, author, source, date)`,
		);
	}
	return {
		author: fm.author,
		date: fm.date,
		language: fm.language ?? "en",
		publication: fm.publication,
		slug,
		source: fm.source,
		title: fm.title,
		year: new Date(fm.date).getUTCFullYear(),
	};
});

export const slugs: string[] = entries.map((e) => e.slug);
