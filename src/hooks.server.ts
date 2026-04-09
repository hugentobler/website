/**
 * Server hook: edge caching, markdown serving + bot detection.
 *
 * Runs at build time (prerendering) and at runtime (SSR pages only —
 * prerendered pages are served by the CDN and bypass this hook).
 *
 * Runtime only:
 *   - Edge cache: SSR HTML responses are cached per-datacenter via the
 *     Cloudflare Workers Cache API (caches.default). First request triggers
 *     full SSR; subsequent requests from the same PoP are served from cache
 *     until CACHE_TTL expires (24h). A build timestamp is embedded in the
 *     cache key so each deploy automatically invalidates stale entries.
 *     Cache is guarded by typeof caches check so it's safely skipped in
 *     local preview / non-Workers runtimes.
 *   - 302-redirects bots to /{slug}.md (user-agent detection via
 *     crawler-user-agents: https://github.com/monperrus/crawler-user-agents).
 *
 * Build time + runtime:
 *   - Serves raw markdown for /{slug}.md requests. At build time this
 *     produces prerendered .md static files alongside the HTML versions.
 *   - Injects <link rel="alternate" type="text/markdown"> into <head>
 *     via transformPageChunk. Baked into prerendered HTML too.
 *
 * Analytics are handled by the client-side beacon (POST /api/visit),
 * not by this hook, so they work for both SSR and SSG pages.
 *
 * Dev: append ?bot to any URL to simulate bot detection.
 */

import type { Handle } from "@sveltejs/kit";
// TODO: Re-enable when bot redirect is turned back on
// import crawlers from "crawler-user-agents";
import { building, dev } from "$app/environment";

// Edge cache TTL for SSR pages (seconds).
// Cached per-datacenter via the Cloudflare Workers Cache API.
// Long TTL is safe because CACHE_VERSION (set at build time) is embedded in the
// cache key — each deploy produces a new version, so stale entries are never matched.
const CACHE_TTL = 86400; // 24 hours
const CACHE_VERSION = __BUILD_TIMESTAMP__;

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

// TODO: Re-enable when bot redirect is turned back on
// const botPattern = new RegExp(crawlers.map((c) => `(?:${c.pattern})`).join("|"), "i");
// function isBot(userAgent: string): boolean {
// 	return botPattern.test(userAgent);
// }

// Production routes — only these paths are live. Everything else 404s.
const ALLOWED_PATHS = new Set(["/", "/2026/feeding-computer-agents"]);

export const handle: Handle = async ({ event, resolve }) => {
	const { url, request } = event;
	const pathname = url.pathname;

	// Edge cache: serve cached SSR HTML from the nearest Cloudflare datacenter.
	const isPageRequest =
		request.method === "GET" &&
		!pathname.endsWith(".md") &&
		!pathname.endsWith(".png") &&
		!pathname.startsWith("/api/");

	const cacheUrl = new URL(url.toString());
	cacheUrl.searchParams.set("__v", CACHE_VERSION);
	const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });

	if (!dev && !building && isPageRequest && typeof caches !== "undefined") {
		const cached = await caches.default.match(cacheKey);
		if (cached) return cached;
	}

	// Production route guard: 404 anything not explicitly allowed.
	// Skipped in dev and during prerendering so all routes remain accessible.
	if (
		!dev &&
		!building &&
		!ALLOWED_PATHS.has(pathname) &&
		!pathname.endsWith(".md") &&
		!pathname.endsWith(".png") &&
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

	// Bot redirect disabled for now — it prevents social crawlers from seeing
	// OG meta tags. Raw markdown is still available via <link rel="alternate">.
	// if (!building) {
	// 	const ua = request.headers.get("user-agent") ?? "";
	// 	if (
	// 		!pathname.endsWith(".md") &&
	// 		!pathname.endsWith(".png") &&
	// 		!pathname.startsWith("/api/") &&
	// 		(isBot(ua) || (dev && url.searchParams.has("bot")))
	// 	) {
	// 		const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\/$/, "");
	// 		return new Response(null, {
	// 			headers: { Location: `/${slug}.md` },
	// 			status: 302,
	// 		});
	// 	}
	// }

	// Inject <link rel="alternate"> into <head> for all HTML pages.
	// Runs during both prerendering and SSR, so the tag is baked into
	// all static HTML and present on all SSR pages.
	const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\/$/, "");

	const response = await resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace(
				"</head>",
				`<link rel="alternate" type="text/markdown" href="/${slug}.md">\n</head>`,
			),
	});

	// Store SSR response in edge cache (non-blocking).
	if (
		!dev &&
		!building &&
		isPageRequest &&
		response.status === 200 &&
		typeof caches !== "undefined"
	) {
		const headers = new Headers(response.headers);
		headers.set("Cache-Control", `public, s-maxage=${CACHE_TTL}`);
		const toCache = new Response(response.clone().body, {
			headers,
			status: response.status,
		});
		const ctx = event.platform?.ctx;
		if (ctx?.waitUntil) {
			ctx.waitUntil(caches.default.put(cacheKey, toCache));
		}
	}

	return response;
};
