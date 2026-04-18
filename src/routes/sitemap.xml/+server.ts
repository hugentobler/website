/**
 * Prerendered sitemap listing the homepage and all live writings.
 * Uses each article's `published` date as `<lastmod>`.
 *
 * TODO: Support an `updated` frontmatter field so <lastmod> reflects
 * the most recent edit, not just the original publication date.
 */

import { origin } from "$lib/config";
import { liveWritings } from "$lib/writing";

export const prerender = true;

export function GET() {
	const today = new Date().toISOString().split("T")[0];

	const entries = [
		`  <url>\n    <loc>${origin}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
		...liveWritings.map(
			(w) =>
				`  <url>\n    <loc>${origin}${w.href}</loc>\n    <lastmod>${w.published}</lastmod>\n  </url>`,
		),
	];

	const xml = [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		...entries,
		`</urlset>`,
	].join("\n");

	return new Response(xml, {
		headers: { "Content-Type": "application/xml" },
	});
}
