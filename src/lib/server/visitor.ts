/**
 * Shared visitor query: random pick from the most recent N visits to `path`.
 *
 * Used by both the SSR layout load (first paint) and the client heartbeat
 * endpoint, so the selection logic stays in sync.
 */

export type Visitor = { city: string | null; country: string | null };

const EMPTY: Visitor = { city: null, country: null };

export async function pickRecentVisitor(
	db: D1Database | null | undefined,
	path: string,
): Promise<Visitor> {
	if (!db) return EMPTY;

	try {
		const rows = await db
			.prepare(
				`SELECT city, country FROM visits
				 WHERE path = ? AND city != ''
				 ORDER BY timestamp DESC
				 LIMIT 8`,
			)
			.bind(path)
			.all<{ city: string; country: string }>();

		const results = rows?.results ?? [];
		if (!results.length) return EMPTY;

		const pick = results[Math.floor(Math.random() * results.length)];
		return { city: pick.city, country: pick.country };
	} catch {
		return EMPTY;
	}
}
