/**
 * POST /api/visit — client-side analytics beacon.
 *
 * Records a visit to D1 and returns visitor data in one round trip.
 * Geo (city, country) is read from Cloudflare's platform.cf headers
 * on this request — the client only sends { path }.
 *
 * Response: { total, city, country }
 *   - total: all-time visit count for this path
 *   - city/country: random pick from the last 10 visitors to this path
 */
import type { VisitorFeedData } from "$lib/types";
import type { RequestHandler } from "./$types";

const empty: VisitorFeedData = { city: null, country: null, total: 0 };

export const POST: RequestHandler = async ({ platform, request }) => {
	const db = platform?.env?.DB ?? null;
	if (!db) return Response.json(empty);

	const { path } = (await request.json()) as { path?: string };
	if (!path) return Response.json(empty);

	const city = (platform?.cf?.city as string) ?? "";
	const country = (platform?.cf?.country as string) ?? "";

	try {
		// Record the visit and query visitor data in parallel.
		const [, countRow, recentRows] = await Promise.all([
			db
				.prepare("INSERT INTO visits (path, city, country, timestamp) VALUES (?, ?, ?, ?)")
				.bind(path, city, country, Date.now())
				.run(),
			db
				.prepare("SELECT COUNT(*) as total FROM visits WHERE path = ?")
				.bind(path)
				.first<{ total: number }>(),
			db
				.prepare(
					`SELECT city, country FROM visits
           WHERE path = ? AND city != ''
           ORDER BY timestamp DESC
           LIMIT 10`,
				)
				.bind(path)
				.all<{ city: string; country: string }>(),
		]);

		const total = countRow?.total ?? 0;
		const results = recentRows?.results ?? [];
		const pick = results.length ? results[Math.floor(Math.random() * results.length)] : null;

		return Response.json({
			city: pick?.city ?? null,
			country: pick?.country ?? null,
			total,
		} satisfies VisitorFeedData);
	} catch {
		return Response.json(empty);
	}
};
