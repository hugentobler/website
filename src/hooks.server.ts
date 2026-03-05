/**
 * Server hook: visit recording + bot detection.
 *
 * 1. Records every request to D1 with pathname, city, country (from request.cf geo).
 *    Only the pathname is stored — query params and hash fragments are stripped
 *    so the same page isn't fragmented across rows. Hashes never reach the server
 *    anyway (browsers don't send them).
 *    Failures are swallowed — analytics must never break the site.
 *
 * 2. Serves Markdown to bots instead of HTML. Looks up static/{route}.md by convention
 *    (e.g. "/" → static/home.md, "/library" → static/library.md).
 *    Bot detection uses Cloudflare's botManagement (verifiedBot flag or score < 30).
 *    Requires Bot Fight Mode enabled in CF dashboard (Security → Bots).
 *    In dev, append ?bot to test: http://localhost:5173/?bot
 */

import type { Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";

/**
 * Maps URL pathname to a route name for markdown file lookup.
 * "/" → "home", "/library" → "library"
 */
function routeName(pathname: string): string {
  if (pathname === "/") return "home";
  return pathname.replace(/^\//, "").replace(/\/$/, "");
}

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

/** Cloudflare bot detection: verifiedBot (free) or score < 30 (paid Bot Management). */
function isBot(cf: CfProperties | undefined): boolean {
  const bm = cf?.botManagement as
    | { verifiedBot?: boolean; score?: number }
    | undefined;

  if (bm?.verifiedBot) return true;
  if (typeof bm?.score === "number" && bm.score < 30) return true;

  return false;
}

export const handle: Handle = async ({ event, resolve }) => {
  const { platform } = event;
  const db = getDB(platform);
  const cf = getCf(platform);

  // Record visit to D1 (pathname only — query params / hashes are not stored)
  if (db) {
    try {
      await db
        .prepare(
          "INSERT INTO visits (path, city, country, timestamp) VALUES (?, ?, ?, ?)",
        )
        .bind(
          event.url.pathname,
          (cf?.city as string) ?? "",
          (cf?.country as string) ?? "",
          Date.now(),
        )
        .run();
    } catch {
      // Non-blocking — don't let analytics failures break the site
    }
  }

  // Serve Markdown to bots if static/{route}.md exists (use ?bot in dev to test)
  if (isBot(cf) || (dev && event.url.searchParams.has("bot"))) {
    const route = routeName(event.url.pathname);
    const md = await event.fetch(`/${route}.md`);
    if (md.ok) {
      return new Response(md.body, {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      });
    }
  }

  return resolve(event);
};
