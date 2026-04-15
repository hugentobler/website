/**
 * POST /api/visit — client-side analytics beacon (write-only).
 *
 * Records a visit to D1. Geo (city, country) is read from Cloudflare's
 * platform.cf headers — the client only sends { path }.
 * Visitor data for display is loaded server-side in +layout.server.ts.
 */

import { dev } from "$app/environment";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ platform, request, url }) => {
	if (!dev) {
		const origin = request.headers.get("origin") ?? "";
		if (origin !== url.origin) return new Response(null, { status: 403 });
	}

	// Write-only analytics beacon: ANY failure should be absorbed as 204.
	// Previously `await request.json()` sat outside the try/catch, so an empty
	// body or malformed JSON (from browser preflights, resets, or a broken
	// client call) became a 500/503 response in production.
	try {
		const db = platform?.env?.DB ?? null;
		if (!db) return new Response(null, { status: 204 });

		const { path } = (await request.json()) as { path?: string };
		if (!path) return new Response(null, { status: 204 });

		const city = (platform?.cf?.city as string) ?? "";
		const country = (platform?.cf?.country as string) ?? "";

		await db
			.prepare("INSERT INTO visits (path, city, country, timestamp) VALUES (?, ?, ?, ?)")
			.bind(path, city, country, Date.now())
			.run();
	} catch {
		// Non-essential — fail silently.
	}

	return new Response(null, { status: 204 });
};
