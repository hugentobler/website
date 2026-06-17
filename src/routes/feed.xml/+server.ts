/**
 * Prerendered RSS 2.0 feed for all live writings.
 *
 * Mirrors the structure of sitemap.xml/+server.ts: hand-rolled XML, no
 * dependencies, sourced from `liveWritings` so a new `.md` with
 * `draft: false` appears in the feed on the next build.
 *
 * Format choices:
 *   - RSS 2.0 (most broadly supported by readers).
 *   - <atom:link rel="self"> included — W3C validator requires it and
 *     readers use it to detect the canonical feed URL after redirects.
 *   - <description> carries the frontmatter `description` (same excerpt
 *     the homepage shows). Full-content <content:encoded> is a possible
 *     follow-up but intentionally out of scope here.
 *   - <guid isPermaLink="true"> is the canonical article URL, so readers
 *     dedupe correctly even if titles or dates are edited later.
 *
 */

import { feedPath, origin, siteDescription, siteLanguage, siteTitle } from "$lib/config";
import { liveWritings } from "$lib/writing";

export const prerender = true;

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function rfc822(date: string): string {
	return new Date(date).toUTCString();
}

export function GET() {
	const feedUrl = `${origin}${feedPath}`;
	const lastBuildDate = rfc822(liveWritings[0]?.published ?? new Date().toISOString());

	const items = liveWritings.map((w) => {
		const url = `${origin}${w.href}`;
		return [
			`    <item>`,
			`      <title>${escapeXml(w.title)}</title>`,
			`      <link>${escapeXml(url)}</link>`,
			`      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
			`      <pubDate>${rfc822(w.published)}</pubDate>`,
			`      <description>${escapeXml(w.description)}</description>`,
			`    </item>`,
		].join("\n");
	});

	const xml = [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
		`  <channel>`,
		`    <title>${escapeXml(siteTitle)}</title>`,
		`    <link>${escapeXml(origin)}</link>`,
		`    <description>${escapeXml(siteDescription)}</description>`,
		`    <language>${escapeXml(siteLanguage)}</language>`,
		`    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
		`    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
		...items,
		`  </channel>`,
		`</rss>`,
	].join("\n");

	return new Response(xml, {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
	});
}
