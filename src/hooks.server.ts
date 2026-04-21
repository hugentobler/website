/**
 * Server hook: edge caching + markdown serving.
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
 * Markdown content negotiation: requests with Accept: text/markdown
 * receive the raw markdown source instead of HTML.
 *
 * ─── CACHE GOTCHAS (learned the hard way — see below before editing) ──────
 *
 * 1. SvelteKit rewrites event.url for data requests
 *    When a client-side navigation fetches /path/__data.json, SvelteKit's
 *    internal_respond strips the suffix before the handle hook runs
 *    (node_modules/@sveltejs/kit/src/runtime/server/respond.js:120). Inside
 *    this hook, event.url.pathname for a /__data.json request is "/path",
 *    NOT "/path/__data.json". So `pathname.endsWith("/__data.json")` is
 *    ALWAYS false here — use `event.isDataRequest` instead.
 *
 *    Consequence if missed: data-request responses (which contain per-
 *    request load() return values like visitor geolocation) get cached
 *    under the same key as the page URL, and every subsequent page load
 *    from that PoP serves stale JSON instead of HTML.
 *
 * 2. There are TWO nested caches, not one
 *    The @sveltejs/adapter-cloudflare _worker.js wraps its own worktop-
 *    based cache around caches.default at the Worker entry point (see
 *    .svelte-kit/cloudflare/_worker.js — search for `r2(req)`). That
 *    "outer" cache:
 *      - Runs BEFORE this hook (a cache hit there never reaches us)
 *      - Keys by the raw Request URL — NO version stamp, NO query param
 *        munging
 *      - Caches any response whose Cache-Control header is not
 *        private/no-cache/no-store
 *      - Does NOT bust on deploy (our CACHE_VERSION only affects the inner
 *        cache below)
 *
 *    Consequence: if a bad response gets written to the outer cache, it
 *    persists across deploys until its s-maxage expires. A new deploy
 *    alone will NOT clear it. Options to recover:
 *      - Wait for TTL.
 *      - Use Cloudflare's global cache purge API (Purge Everything, or
 *        Purge by Host/Prefix). The dashboard button works too. This is
 *        the *correct* lever — it clears every PoP in one call.
 *      - A Worker calling caches.default.delete(new Request(url)) only
 *        purges the ONE data center the Worker is currently running in
 *        (per Cloudflare's own docs:
 *        https://developers.cloudflare.com/workers/reference/how-the-cache-works/#purge-assets-stored-with-the-cache-api).
 *        Don't rely on this for incident recovery — reach for the purge
 *        API instead.
 *
 * 3. Never leak the inner cache's Cache-Control header to the outer cache
 *    This hook stores a `toCache` copy with `Cache-Control: private,
 *    max-age=...` in the inner cache. The `private` directive is load-
 *    bearing: on a cache HIT we return the stored response as-is, and the
 *    adapter's worktop wrapper in _worker.js tries to re-cache it via
 *    `caches.default.put`. Its cacheability check is:
 *
 *        let pragma = res.headers.get("cache-control") || "";
 *        return !/(private|no-cache|no-store)/i.test(pragma);
 *
 *    With `private`, that check returns false and the outer un-versioned
 *    cache stays empty. That's critical, because the outer cache is the
 *    exact layer that cannot be busted by a redeploy (see gotcha #2).
 *
 *    Workers Cache API only rejects `put()` for `Cache-Control: no-store`,
 *    `Vary: *`, or status 206 — `private` is stored and retrieved
 *    normally, so the inner cache is unaffected.
 *
 *    DO NOT change this back to `public, s-maxage=...`. The very first
 *    version of this hook did, and it caused two incidents:
 *      - Data-request responses leaked into the outer cache under page
 *        URL keys (when combined with gotcha #1 above).
 *      - Even after the keying bug was fixed, any stale outer-cache entry
 *        would persist through deploys because the outer cache is
 *        un-versioned.
 *    A one-off ?__purge handler was added to delete poisoned entries
 *    (see 590b34e / bb80c55 if you want to resurrect it for future
 *    surgical cache cleanups — it deletes page URLs and every plausible
 *    /path/__data.json?x-sveltekit-invalidated=XXX variant by enumerating
 *    binary strings of 2-4 bits).
 */

import type { Handle } from "@sveltejs/kit";
import { building, dev } from "$app/environment";
import { entries as nookEntries } from "$lib/nook";
import { liveWritings, slugAliases } from "$lib/writing";

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

// Production routes — only these paths are live. Everything else 404s.
// Derived from $lib/writing and $lib/reading (which read `draft: false` frontmatter).
const ALLOWED_PATHS = new Set([
	"/",
	...liveWritings.map((w) => w.href),
	"/nook",
	...nookEntries.map((e) => `/nook/${e.slug}`),
]);

export const handle: Handle = async ({ event, resolve }) => {
	const { url, request } = event;
	const pathname = url.pathname;

	// SvelteKit's client-navigation data payload. Contains the return value of
	// +layout.server.ts / +page.server.ts load functions — including per-request
	// visitor geolocation — so it must never enter a shared cache.
	//
	// IMPORTANT: SvelteKit strips the `/__data.json` suffix from `event.url`
	// before the handle hook runs, so `pathname.endsWith("/__data.json")` is
	// always false here — always use `event.isDataRequest` instead.
	const isDataRequest = event.isDataRequest;

	// Edge cache: serve cached SSR HTML from the nearest Cloudflare datacenter.
	const wantsMarkdown = request.headers.get("accept")?.includes("text/markdown") ?? false;
	const isPageRequest =
		request.method === "GET" &&
		!pathname.endsWith(".md") &&
		!pathname.endsWith(".png") &&
		!pathname.startsWith("/api/") &&
		!isDataRequest;

	// Routes that return non-deterministic responses (redirects to random
	// content, etc.) must never be edge-cached.
	// Excluded routes: /nook
	const excludeCache = pathname === "/nook";
	const isCacheable = isPageRequest && !excludeCache;

	const cacheUrl = new URL(url.toString());
	cacheUrl.searchParams.set("__v", CACHE_VERSION);
	const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });

	if (!dev && !building && isCacheable && !wantsMarkdown && typeof caches !== "undefined") {
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
	if (pathname.endsWith(".md")) {
		const rawSlug = pathname.slice(1, -3); // "/bowtie.md" → "bowtie"
		const slug = slugAliases[rawSlug] ?? rawSlug;
		const content = markdownBySlug.get(slug);
		if (content) {
			return new Response(content, {
				headers: { "content-type": "text/markdown; charset=utf-8" },
			});
		}
	}

	// Content negotiation: serve raw markdown when agents request it
	// via Accept: text/markdown.
	if (isPageRequest && wantsMarkdown) {
		const mdSlug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\/$/, "");
		const content = markdownBySlug.get(slugAliases[mdSlug] ?? mdSlug);
		if (content) {
			return new Response(content, {
				headers: {
					"content-signal": "ai-train=yes, search=yes, ai-input=yes", // https://contentsignals.org
					"content-type": "text/markdown; charset=utf-8",
					vary: "accept",
					"x-markdown-tokens": String(Math.ceil(new TextEncoder().encode(content).length / 4)), // estimate: ~4 bytes/token
				},
			});
		}
	}

	// Inject <link rel="alternate"> into <head> for pages that have a
	// raw markdown counterpart. Routes serving third-party or non-original
	// content are excluded to avoid exposing it for redistribution.
	// Excluded routes: /nook
	const excludeMarkdownAlt = pathname.startsWith("/nook");
	const slug = pathname === "/" ? "home" : pathname.replace(/^\//, "").replace(/\/$/, "");

	const response = await resolve(event, {
		transformPageChunk: ({ html }) =>
			excludeMarkdownAlt
				? html
				: html.replace(
						"</head>",
						`<link rel="alternate" type="text/markdown" href="/${slug}.md">\n</head>`,
					),
	});

	// Link headers for agent discovery (RFC 8288).
	if (!excludeMarkdownAlt) {
		response.headers.append("Link", `</${slug}.md>; rel="alternate"; type="text/markdown"`);
	}
	response.headers.append("Link", `</sitemap.xml>; rel="sitemap"; type="application/xml"`);

	// Store SSR response in edge cache (non-blocking).
	//
	// The Cache-Control on `toCache` is deliberately `private, max-age=...`,
	// NOT `public, s-maxage=...`. Reasons:
	//
	//   - Workers Cache API stores it fine — `caches.default.put()` only
	//     rejects responses with `Cache-Control: no-store` (and Vary: *, 206).
	//     `private` is accepted and retrieved normally.
	//   - If this cached response is ever served as a cache HIT and leaks
	//     back up to the adapter's worktop cache wrapper, the adapter's
	//     cacheability check rejects it (it looks for /private|no-cache|no-store/),
	//     so the outer un-versioned cache stays clean — critical, because
	//     outer-cache entries cannot be busted by a redeploy.
	//   - CACHE_TTL drives behavior here via `max-age`; `s-maxage` is
	//     irrelevant inside caches.default.
	if (
		!dev &&
		!building &&
		isCacheable &&
		response.status === 200 &&
		typeof caches !== "undefined"
	) {
		const headers = new Headers(response.headers);
		headers.set("Cache-Control", `private, max-age=${CACHE_TTL}`);
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
