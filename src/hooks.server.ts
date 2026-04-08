/**
 * Server hook: markdown serving + bot detection.
 *
 * Runs at build time (prerendering) and at runtime (SSR pages only —
 * prerendered pages are served by the CDN and bypass this hook).
 *
 * Build time + runtime:
 *   - Serves raw markdown for /{slug}.md requests. At build time this
 *     produces prerendered .md static files alongside the HTML versions.
 *   - Injects <link rel="alternate" type="text/markdown"> into <head>
 *     via transformPageChunk. Baked into prerendered HTML too.
 *
 * Runtime only (guarded by !building):
 *   - 302-redirects bots to /{slug}.md (user-agent detection via
 *     crawler-user-agents: https://github.com/monperrus/crawler-user-agents).
 *
 * Analytics are handled by the client-side beacon (POST /api/visit),
 * not by this hook, so they work for both SSR and SSG pages.
 *
 * Dev: append ?bot to any URL to simulate bot detection.
 */

import type { Handle } from "@sveltejs/kit";
import crawlers from "crawler-user-agents";
import { building, dev } from "$app/environment";

// Raw markdown content, loaded at build time via Vite's ?raw query.
// markdoc-svelte processes the same files separately for HTML rendering.
const rawModules = import.meta.glob("/src/lib/markdown/*.md", {
	eager: true,
	import: "default",
	query: "?raw",
}) as Record<string, string>;

const markdownBySlug = new Map<string, string>();
for (const [path, content] of Object.entries(rawModules)) {
	const slug = path.match(/\/([^/]+)\.md$/)?.[1];
	if (slug) markdownBySlug.set(slug, content);
}

// TODO: derive route→slug mapping automatically instead of hardcoding aliases.
const SLUG_ALIASES: Record<string, string> = {
	"2026/feeding-computer-agents": "feeding-computer-agents",
};

// Bot detection: single compiled regex from all crawler-user-agents patterns.
const botPattern = new RegExp(crawlers.map((c) => `(?:${c.pattern})`).join("|"), "i");

function isBot(userAgent: string): boolean {
	return botPattern.test(userAgent);
}

// Production routes — only these paths are live. Everything else 404s.
const ALLOWED_PATHS = new Set(["/", "/2026/feeding-computer-agents"]);

export const handle: Handle = async ({ event, resolve }) => {
	const { url, request } = event;
	const pathname = url.pathname;

	// Production route guard: 404 anything not explicitly allowed.
	// Skipped in dev and during prerendering so all routes remain accessible.
	if (
		!dev &&
		!building &&
		!ALLOWED_PATHS.has(pathname) &&
		!pathname.endsWith(".md") &&
		!pathname.startsWith("/api/")
	) {
		return new Response("Not found", { status: 404 });
	}

	// Serve raw markdown for /{slug}.md URLs (available to anyone).
	// At build time, this produces prerendered .md static files.
	// At runtime, serves .md for SSR pages (SSG .md files are on the CDN).
	// Static summaries (e.g. /home.md) are served by the CDN/Vite before
	// reaching this hook.
	if (pathname.endsWith(".md")) {
		const rawSlug = pathname.slice(1, -3); // "/bowtie.md" → "bowtie"
		const slug = SLUG_ALIASES[rawSlug] ?? rawSlug;
		const content = markdownBySlug.get(slug);
		if (content) {
			return new Response(content, {
				headers: { "Content-Type": "text/markdown; charset=utf-8" },
			});
		}
	}

	// Runtime only: redirect bots to /{slug}.md.
	// Skipped during prerendering (building) since there's no real user-agent.
	if (!building) {
		const ua = request.headers.get("user-agent") ?? "";
		if (
			!pathname.endsWith(".md") &&
			!pathname.startsWith("/api/") &&
			(isBot(ua) || (dev && url.searchParams.has("bot")))
		) {
			const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\/$/, "");
			return new Response(null, {
				headers: { Location: `/${slug}.md` },
				status: 302,
			});
		}
	}

	// Inject <link rel="alternate"> into <head> for all HTML pages.
	// Runs during both prerendering and SSR, so the tag is baked into
	// all static HTML and present on all SSR pages.
	const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\/$/, "");

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace(
				"</head>",
				`<link rel="alternate" type="text/markdown" href="/${slug}.md">\n</head>`,
			),
	});
};
