/**
 * Single source of truth for the live writing list.
 *
 * Eagerly loads every `$lib/markdown/*.md` module at build time, pulls
 * metadata out of its frontmatter, and exposes the subset that is not a
 * draft. All other places in the codebase that need to enumerate live
 * writing (homepage list, allowed-path guard, slug aliases, og.png
 * prerender entries) import from here.
 *
 * Frontmatter contract:
 *   - `draft` defaults to true — entries are drafts unless a file sets
 *     `draft: false` explicitly.
 *   - Live entries must set `title`, `subheader`, and `published`.
 *     `published` is parsed for its year to build the `/YYYY/slug` URL.
 */

import type { MarkdocModule } from "markdoc-svelte";

type Frontmatter = {
	title?: string;
	subheader?: string;
	published?: string;
	draft?: boolean;
};

const modules = import.meta.glob<MarkdocModule>("$lib/markdown/*.md", {
	eager: true,
});

export type Writing = {
	slug: string;
	title: string;
	subheader: string;
	published: string;
	year: number;
	href: string;
};

function slugFromPath(path: string): string {
	return path.match(/\/([^/]+)\.md$/)?.[1] ?? "";
}

const all = Object.entries(modules).map(([path, mod]) => {
	const slug = slugFromPath(path);
	const fm = (mod.frontmatter ?? {}) as Frontmatter;
	const draft = fm.draft !== false;
	return { draft, fm, slug };
});

export const liveWritings: Writing[] = all
	.filter(({ draft }) => !draft)
	.map(({ slug, fm }) => {
		if (!fm.published) {
			throw new Error(`Live writing "${slug}" is missing frontmatter.published`);
		}
		const year = new Date(fm.published).getUTCFullYear();
		return {
			href: `/${year}/${slug}`,
			published: fm.published,
			slug,
			subheader: fm.subheader ?? "",
			title: fm.title ?? slug,
			year,
		};
	})
	.sort((a, b) => b.published.localeCompare(a.published));

// Maps the public URL form (`YYYY/slug`) to the flat markdown filename (`slug`)
// used by $lib/markdown/*.md imports.
export const slugAliases: Record<string, string> = Object.fromEntries(
	liveWritings.map((w) => [`${w.year}/${w.slug}`, w.slug]),
);
