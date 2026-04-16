/**
 * GET /api/visitor?path=<pathname> — client heartbeat for the footer.
 *
 * Runs the same random-of-last-N query as +layout.server.ts so the polled
 * value stays consistent with the SSR first-paint.
 *
 * Cache-Control: no-store is load-bearing. The adapter's outer cache wrapper
 * (see hooks.server.ts gotcha #2) will store ANY response whose Cache-Control
 * isn't private/no-cache/no-store, and that outer cache is un-versioned and
 * survives deploys. Leaving this response cacheable would rebuild the exact
 * staleness problem we're polling to escape.
 */

import { pickRecentVisitor } from "$lib/server/visitor";
import type { RequestHandler } from "./$types";

// No origin check: this is a read-only endpoint returning a city name for
// the current path. There's nothing sensitive to protect from cross-origin
// callers, and browsers don't reliably send Origin on same-origin GETs.
export const GET: RequestHandler = async ({ platform, url }) => {
	const path = url.searchParams.get("path");
	if (!path) {
		return json({ city: null, country: null });
	}

	const visitor = await pickRecentVisitor(platform?.env?.DB, path);
	return json(visitor);
};

function json(body: unknown) {
	return new Response(JSON.stringify(body), {
		headers: {
			"Cache-Control": "no-store",
			"Content-Type": "application/json",
		},
	});
}
