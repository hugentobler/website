import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ platform, url }) => {
	const db = platform?.env?.DB ?? null;
	if (!db) return { visitor: { city: null, country: null } };

	const path = url.pathname;

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
		if (!results.length) return { visitor: { city: null, country: null } };

		const pick = results[Math.floor(Math.random() * results.length)];
		return {
			visitor: { city: pick.city, country: pick.country },
		};
	} catch {
		return { visitor: { city: null, country: null } };
	}
};
