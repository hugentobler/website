/**
 * Single source of truth for the nook library.
 *
 * Eagerly loads every `$lib/nook/*.md` module at build time and pulls
 * metadata from frontmatter. Every file in the directory is included —
 * remove the file to remove the entry.
 */

import type { MarkdocModule } from "markdoc-svelte";
import { type Entry, parseNookFrontmatter } from "./nook-schema";

export type { Entry };

const modules = import.meta.glob<MarkdocModule>("$lib/nook/*.md", {
	eager: true,
});

function slugFromPath(path: string): string {
	return path.match(/\/([^/]+)\.md$/)?.[1] ?? "";
}

export const entries: Entry[] = Object.entries(modules).map(([path, mod]) => {
	const slug = slugFromPath(path);
	const fm = parseNookFrontmatter(slug, mod.frontmatter);
	return {
		archive: fm.archive,
		author: fm.author,
		captured: fm.captured,
		date: fm.date,
		kind: fm.kind,
		language: fm.language ?? "en",
		publication: fm.publication,
		slug,
		source: fm.source,
		title: fm.title,
		// Essays use YYYY, YYYY-MM, or YYYY-MM-DD, so date is not format-checked.
		year: new Date(fm.date).getUTCFullYear(),
	};
});

export const slugs: string[] = entries.map((e) => e.slug);
