/**
 * Server hook: bot-friendly markdown serving + visit recording.
 *
 * This site has two types of pages:
 *
 *   Content pages (/bowtie, /luxor, …)
 *     Source markdown lives in src/lib/markdown/.
 *     - Humans see HTML — markdoc-svelte compiles .md → Svelte component.
 *     - Bots are 302-redirected to /{slug}.md, which serves the raw markdown.
 *     - Anyone can access /{slug}.md directly.
 *
 *   Non-content pages (/, /library, …)
 *     Built as custom Svelte components with no markdown source.
 *     - Hand-written summaries should be placed in static/ (e.g. static/home.md).
 *       These are served by the CDN (production) or Vite's static handler (dev)
 *       and never reach this hook.
 *     - Bots are always redirected to .md — missing summaries naturally 404.
 *
 * Bot detection uses the community-maintained crawler-user-agents list
 * (https://github.com/monperrus/crawler-user-agents), matched as a single
 * compiled regex against the request's User-Agent header.
 * In dev, append ?bot to any URL to simulate bot behavior.
 *
 * Visit recording writes pathname + geo (city/country from Cloudflare) to D1.
 * Failures are swallowed — analytics must never break the site.
 */

import type { Handle } from "@sveltejs/kit";
import crawlers from "crawler-user-agents";
import { dev } from "$app/environment";

/* ------------------------------------------------------------------ */
/*  Raw markdown content (eager, build-time)                          */
/* ------------------------------------------------------------------ */

const rawModules = import.meta.glob("/src/lib/markdown/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

/** Content markdown keyed by slug, e.g. "bowtie" → raw markdown string. */
const markdownBySlug = new Map<string, string>();
for (const [path, content] of Object.entries(rawModules)) {
  const slug = path.match(/\/([^/]+)\.md$/)?.[1];
  if (slug) markdownBySlug.set(slug, content);
}

/* ------------------------------------------------------------------ */
/*  Bot detection (user-agent based)                                  */
/* ------------------------------------------------------------------ */

/** Single regex compiled from all crawler-user-agents patterns. */
const botPattern = new RegExp(
  crawlers.map((c) => `(?:${c.pattern})`).join("|"),
  "i",
);

function isBot(userAgent: string): boolean {
  return botPattern.test(userAgent);
}

/* ------------------------------------------------------------------ */
/*  Platform helpers                                                  */
/* ------------------------------------------------------------------ */

/** Safe accessor — platform.env throws on prerenderable routes. */
function getDB(platform: App.Platform | undefined): D1Database | null {
  try {
    return platform?.env?.DB ?? null;
  } catch {
    return null;
  }
}

/** Safe accessor — platform.cf unavailable in dev and on prerenderable routes. */
function getCf(platform: App.Platform | undefined): CfProperties | undefined {
  try {
    return platform?.cf;
  } catch {
    return undefined;
  }
}

/* ------------------------------------------------------------------ */
/*  Hook                                                              */
/* ------------------------------------------------------------------ */

export const handle: Handle = async ({ event, resolve }) => {
  const { platform, url, request } = event;
  const pathname = url.pathname;

  // Serve raw markdown for /{slug}.md URLs (available to anyone).
  // Only content pages (those in src/lib/markdown/) are handled here.
  // Static summaries like /home.md are served by the CDN/Vite before this runs.
  if (pathname.endsWith(".md")) {
    const slug = pathname.slice(1, -3); // "/bowtie.md" → "bowtie"
    const content = markdownBySlug.get(slug);
    if (content) {
      return new Response(content, {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      });
    }
  }

  // Record visit to D1 (pathname only — query params / hashes not stored).
  const db = getDB(platform);
  const cf = getCf(platform);
  if (db) {
    try {
      await db
        .prepare(
          "INSERT INTO visits (path, city, country, timestamp) VALUES (?, ?, ?, ?)",
        )
        .bind(
          pathname,
          (cf?.city as string) ?? "",
          (cf?.country as string) ?? "",
          Date.now(),
        )
        .run();
    } catch {
      // Non-blocking — analytics failures must not break the site
    }
  }

  // Redirect bots to /{slug}.md unconditionally.
  // Content pages are served from the build-time glob above.
  // Non-content pages need a hand-written summary in static/ (e.g. static/home.md).
  // Missing .md files naturally 404 — that's our signal to add one.
  // In dev, append ?bot to simulate: http://localhost:5173/bowtie?bot
  const ua = request.headers.get("user-agent") ?? "";
  if (
    !pathname.endsWith(".md") &&
    (isBot(ua) || (dev && url.searchParams.has("bot")))
  ) {
    const slug =
      pathname === "/"
        ? "home"
        : pathname.replace(/^\//, "").replace(/\/$/, "");
    return new Response(null, {
      headers: { Location: `/${slug}.md` },
      status: 302,
    });
  }

  return resolve(event);
};
