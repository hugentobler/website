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
	"2025/durable-ai-initiatives": "durable-ai-initiatives",
	"2026/feeding-computer-agents": "feeding-computer-agents",
	"2026/pragmatists-guide-to-ai": "pragmatists-guide-to-ai",
};

// TODO: Re-enable when bot redirect is turned back on
// const botPattern = new RegExp(crawlers.map((c) => `(?:${c.pattern})`).join("|"), "i");
// function isBot(userAgent: string): boolean {
// 	return botPattern.test(userAgent);
// }

// Production routes — only these paths are live. Everything else 404s.
const ALLOWED_PATHS = new Set([
	"/",
	"/2025/durable-ai-initiatives",
	"/2026/feeding-computer-agents",
	"/2026/pragmatists-guide-to-ai",
]);

// TEMP (remove after ~1h post-deploy): per-PoP one-shot self-heal for
// outer-cache entries poisoned earlier today. caches.default.delete() is
// per-PoP, and the CF dashboard "Purge Everything" button does NOT clear
// caches.default entries, so we lazily evict known-bad URL keys the first
// time any request lands on each PoP after this deploy. The architectural
// fix in bb80c55 (private max-age on toCache) prevents new poisoning, so
// once this sweep has run on every active PoP we can drop it.
let outerCacheSwept = false;
async function sweepPoisonedOuterCache(origin: string): Promise<void> {
	if (outerCacheSwept) return;
	outerCacheSwept = true;
	if (typeof caches === "undefined") return;
	const pages = [
		"/",
		"/2025/durable-ai-initiatives",
		"/2026/feeding-computer-agents",
		"/2026/pragmatists-guide-to-ai",
	];
	// All plausible x-sveltekit-invalidated strings for routes with
	// up to 4 data nodes (1-4 bits, all binary combinations).
	const invalidated: string[] = [];
	for (let bits = 1; bits <= 4; bits++) {
		for (let i = 0; i < 1 << bits; i++) {
			invalidated.push(i.toString(2).padStart(bits, "0"));
		}
	}
	const del = (u: string) => caches.default.delete(new Request(u));
	for (const p of pages) {
		const base = p === "/" ? "" : p;
		// Page URL itself
		await del(`${origin}${p}`);
		// Bare /__data.json (with and without trailing-slash flag)
		await del(`${origin}${base}/__data.json`);
		await del(`${origin}${base}/__data.json?x-sveltekit-trailing-slash=1`);
		// Each invalidation variant, both with and without trailing-slash flag
		for (const inv of invalidated) {
			await del(`${origin}${base}/__data.json?x-sveltekit-invalidated=${inv}`);
			await del(
				`${origin}${base}/__data.json?x-sveltekit-trailing-slash=1&x-sveltekit-invalidated=${inv}`,
			);
		}
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const { url, request } = event;
	const pathname = url.pathname;

	// TEMP: fire-and-forget per-PoP self-heal of poisoned outer-cache
	// entries. No-op on PoPs already swept this isolate. See the
	// sweepPoisonedOuterCache definition above for context.
	if (!dev && !building) {
		const sweepCtx = event.platform?.ctx;
		if (sweepCtx?.waitUntil) {
			sweepCtx.waitUntil(sweepPoisonedOuterCache(url.origin));
		}
	}

	// SvelteKit's client-navigation data payload. Contains the return value of
	// +layout.server.ts / +page.server.ts load functions — including per-request
	// visitor geolocation — so it must never enter a shared cache.
	//
	// IMPORTANT: SvelteKit strips the `/__data.json` suffix from `event.url`
	// before the handle hook runs, so `pathname.endsWith("/__data.json")` is
	// always false here — always use `event.isDataRequest` instead.
	const isDataRequest = event.isDataRequest;

	// Edge cache: serve cached SSR HTML from the nearest Cloudflare datacenter.
	const isPageRequest =
		request.method === "GET" &&
		!pathname.endsWith(".md") &&
		!pathname.endsWith(".png") &&
		!pathname.startsWith("/api/") &&
		!isDataRequest;

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
		isPageRequest &&
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
