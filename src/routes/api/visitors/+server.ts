/** GET /api/visitors?path=/ → { total: number } — all-time visit count for a path. */
import type { VisitorsResponse } from "$lib/types";
import type { RequestHandler } from "./$types";

export const prerender = false;

export const GET: RequestHandler = async ({ platform, url }) => {
	if (!platform?.env?.DB) {
		return Response.json({ total: 0 } satisfies VisitorsResponse);
	}

	const path = url.searchParams.get("path") ?? "/";

	try {
		const row = await platform.env.DB.prepare(
			"SELECT COUNT(*) as total FROM visits WHERE path = ?",
		)
			.bind(path)
			.first<{ total: number }>();

		return Response.json({ total: row?.total ?? 0 } satisfies VisitorsResponse);
	} catch {
		return Response.json({ total: 0 } satisfies VisitorsResponse);
	}
};
