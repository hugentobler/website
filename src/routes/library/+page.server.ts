import type { PageServerLoad } from "./$types";
import { getHardcoverBooks } from "./hardcover.server";
import type { Item } from "./item.server";
import { createItem } from "./item.server";
import { getLiteralDataForIsbn } from "./literal.server";
import { getPhotographs } from "./photographs.server.js";
import { getWebpages } from "./webpages.server.js";

const getBooks = async () => {
	const ratedBooks = await getHardcoverBooks();

	if (ratedBooks.length === 0) {
		console.warn("No books returned from Hardcover API");
		return [];
	}

	const bookPromises = ratedBooks.map(async (book) => {
		const isbns = book.editionIsbns.filter(Boolean);
		if (isbns.length === 0) {
			console.warn(`No ISBNs found for book: ${book.title}`);
			return null; // Skip this book
		}

		// Literal data from first valid ISBN
		let literalData = null;
		for (const isbn of isbns) {
			const { data } = await getLiteralDataForIsbn(isbn);
			if (data?.cover) {
				literalData = data;
				break; // Stop once cover found
			}
		}

		if (!literalData) {
			console.warn(
				`No Literal data found for any ISBN for book: ${book.title}`,
			);
			return null; // Skip this book
		}

		try {
			return createItem("book", {
				title: `${book.title}${book.subtitle ? `, ${book.subtitle}` : ""}`,
				published: book.releaseYear.toString() + "-01-01",
				published_by:
					literalData.authors?.map((author) => author.name).join(", ") ||
					"Unknown",
				thumbnail: literalData.cover,
				note: book.reviewText,
			});
		} catch (error) {
			console.warn(`Failed to create book item:`, error);
			return null;
		}
	});

	return (await Promise.all(bookPromises)).filter(Boolean) as Item[];
};

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
	const types = Array.from(new Set(items.map((item) => item.type))).sort(
		(a, b) => a.localeCompare(b),
	);

	// Generate available decades and sort ascending
	const decades = Array.from(new Set(items.map((item) => item.decade))).sort(
		(a, b) => a - b,
	);

	return {
		items,
		types,
		decades,
	};
};
