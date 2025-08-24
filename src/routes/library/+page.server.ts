import type { PageServerLoad } from "./$types";
import { getBooks } from "./books.server";
import { getPhotographs } from "./photographs.server.js";
import { getWebpages } from "./webpages.server.js";

// DATA LOADING - Build and prerender
export const load: PageServerLoad = async () => {
	const books = await getBooks();
	const webpages = getWebpages();
	const photographs = getPhotographs();

	const items = [...books, ...webpages, ...photographs].sort(
		// TODO - implement proper sorting based on when it was added to collection
		(a, b) => b.published.localeCompare(a.published),
	);

	// Generate available types and sort alphabetically
	const types = Array.from(new Set(items.map((item) => item.type))).sort((a, b) =>
		a.localeCompare(b),
	);

	// Generate available decades and sort ascending
	const decades = Array.from(new Set(items.map((item) => item.decade))).sort((a, b) => a - b);

	return {
		items,
		types,
		decades,
	};
};
