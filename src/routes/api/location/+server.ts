/** GET /api/location?path=/ → { city, country } — random pick from last 10 visitors. */
import type { LocationResponse } from "$lib/types";
import type { RequestHandler } from "./$types";

export const prerender = false;

export const GET: RequestHandler = async ({ platform, url }) => {
	if (!platform?.env?.DB) {
		return Response.json({ city: null, country: null } satisfies LocationResponse);
	}

	const path = url.searchParams.get("path") ?? "/";

	try {
		const { results } = await platform.env.DB.prepare(
			`SELECT city, country FROM visits
			 WHERE path = ? AND city != ''
			 ORDER BY timestamp DESC
			 LIMIT 10`,
		)
			.bind(path)
			.all<{ city: string; country: string }>();

		if (!results?.length) {
			return Response.json({ city: null, country: null } satisfies LocationResponse);
		}

		const pick = results[Math.floor(Math.random() * results.length)];
		return Response.json({ city: pick.city, country: pick.country } satisfies LocationResponse);
	} catch {
		return Response.json({ city: null, country: null } satisfies LocationResponse);
	}
};
