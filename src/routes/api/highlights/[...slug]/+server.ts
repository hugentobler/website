/**
 * GET/POST /api/highlights/[...slug] — sentence highlight counts.
 *
 * GET  returns { [sentenceKey]: count } for all highlights in an article.
 * POST accepts { key, text, action: 'add' | 'remove' } and returns 204.
 *
 * Follows the same pattern as /api/visit: D1 via platform.env.DB,
 * origin check in production, silent failure on errors.
 */

import { json } from "@sveltejs/kit";
import { dev } from "$app/environment";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, platform }) => {
	const db = platform?.env?.DB ?? null;
	if (!db) return json({});

	const slug = params.slug;

	try {
		const { results } = await db
			.prepare("SELECT key, count FROM highlights WHERE slug = ? AND count > 0")
			.bind(slug)
			.all<{ key: string; count: number }>();

		const highlights: Record<string, number> = {};
		for (const row of results) {
			highlights[row.key] = row.count;
		}
		return json(highlights);
	} catch {
		return json({});
	}
};

export const POST: RequestHandler = async ({ params, platform, request, url }) => {
	if (!dev) {
		const origin = request.headers.get("origin") ?? "";
		if (origin !== url.origin) return new Response(null, { status: 403 });
	}

	const db = platform?.env?.DB ?? null;
	if (!db) return new Response(null, { status: 204 });

	const { key, text, action } = (await request.json()) as {
		key?: string;
		text?: string;
		action?: "add" | "remove";
	};
	if (!key || !action) return new Response(null, { status: 204 });

	const slug = params.slug;

	try {
		if (action === "add") {
			await db
				.prepare(
					`INSERT INTO highlights (slug, key, text, count)
					 VALUES (?, ?, ?, 1)
					 ON CONFLICT(slug, key) DO UPDATE SET count = count + 1`,
				)
				.bind(slug, key, text ?? "")
				.run();
		} else if (action === "remove") {
			await db
				.prepare("UPDATE highlights SET count = MAX(0, count - 1) WHERE slug = ? AND key = ?")
				.bind(slug, key)
				.run();
		}
	} catch {
		// Non-essential — fail silently.
	}

	return new Response(null, { status: 204 });
};
