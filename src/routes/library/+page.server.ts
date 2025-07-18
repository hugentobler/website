import { error } from "@sveltejs/kit";
import {
	HARDCOVER_API_BEARER_TOKEN,
	LITERAL_EMAIL,
	LITERAL_PASSWORD,
} from "$env/static/private";
import { photographs } from "$lib/data/photographs.js";
import { webpages } from "$lib/data/webpages.js";
import type { LibraryItem } from "$lib/types/library.js";

import type { PageServerLoad } from "./$types";

const LITERAL_API = "https://literal.club/graphql/";
const HARDCOVER_API = "https://api.hardcover.app/v1/graphql";

/**
 * CACHING STRATEGY & BUILD APPROACH
 *
 * Development: In-memory token cache ONLY helps during a single dev server session
 *             - Gets wiped on any dev server restart (file changes, manual restart)
 *             - Only prevents API calls during page refreshes within same session
 *
 * Production (Static Build): Process runs once and exits, so cache is irrelevant
 *
 * Reality: This cache has limited value since dev server restarts frequently.
 * Main benefit: Avoiding repeated auth calls when refreshing page during development.
 *
 * For static builds, we fetch data once during `vite build` and pre-render HTML.
 * No subsequent API calls happen after deployment to static hosting.
 */

// Simple in-memory cache - only lasts until dev server restart
let tokenCache: { token: string; profileId: string; expires: number } | null =
	null;
const TOKEN_DURATION = 1000 * 60 * 15; // 15 minutes (reasonable for a dev session)

async function getLiteralToken() {
	const options = {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			query: `mutation login($email: String!, $password: String!) {
				login(email: $email, password: $password) {
					token
					profile { id }
				}
			}`,
			variables: {
				email: LITERAL_EMAIL,
				password: LITERAL_PASSWORD,
			},
		}),
	};

	const res = await fetch(LITERAL_API, options);
	if (!res.ok) {
		const errorText = await res.text();
		console.error("Token fetch failed:", res.status, errorText);
		throw error(res.status, {
			message: "Failed to fetch authentication token",
			details: errorText,
		});
	}

	const result = await res.json();

	if (result.errors) {
		throw error(400, {
			message: "Authentication failed",
			details: result.errors[0]?.message,
		});
	}

	return result;
}

// Hardcover API types
interface HardcoverActivity {
	event: string;
	data: {
		userBook: {
			id: number;
			rating: string;
			statusId: number;
			reviewSlate?: {
				document: {
					object: string;
					children: Array<{
						type: string;
						children: Array<{
							text: string;
							object: string;
						}>;
					}>;
				};
			};
		};
	};
	book: {
		subtitle: string | null;
		title: string;
		release_year: number;
		editions: Array<{
			isbn_13: string;
			release_date: string;
		}>;
	};
}

interface HardcoverResponse {
	data: {
		me: Array<{
			activities: HardcoverActivity[];
		}>;
	};
}

interface LiteralBookResponse {
	data: {
		book: {
			title: string;
			cover: string;
			authors: Array<{
				name: string;
			}>;
		} | null;
	};
}

interface ValidLiteralBook {
	title: string;
	cover: string;
	authors: Array<{
		name: string;
	}>;
}

async function getHardcoverBooks(): Promise<{
	books: HardcoverActivity[];
	error?: string;
}> {
	try {
		const response = await fetch(HARDCOVER_API, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `${HARDCOVER_API_BEARER_TOKEN}`,
			},
			body: JSON.stringify({
				query: `query BooksWithReviews {
          me {
            activities(
              where: {event: {_eq: "UserBookActivity"}, data: {}}
              distinct_on: book_id
            ) {
              event
              data
              book {
                subtitle
                title
                release_year
                editions(
                  order_by: {release_date: desc}
                  limit: 5
                  where: {isbn_13: {_is_null: false}}
                ) {
                  isbn_13
                  release_date
                }
              }
            }
          }
        }`,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Hardcover API failed:", response.status, errorText);
			if (response.status === 401) {
				return {
					books: [],
					error:
						"Hardcover API authorization token has expired. Please update HARDCOVER_API_BEARER_TOKEN.",
				};
			}
			return { books: [], error: `Hardcover API error: ${response.status}` };
		}

		const result: HardcoverResponse = await response.json();

		if (!result.data?.me?.[0]?.activities) {
			return {
				books: [],
				error: "No book activities found in Hardcover response",
			};
		}

		return { books: result.data.me[0].activities };
	} catch (err) {
		console.error("Error fetching from Hardcover:", err);
		return {
			books: [],
			error: `Hardcover API connection failed: ${err instanceof Error ? err.message : "Unknown error"}`,
		};
	}
}

async function getLiteralBookData(isbns: string[]): Promise<ValidLiteralBook> {
	let token: string;

	// Check if we have a valid cached token
	if (tokenCache && Date.now() < tokenCache.expires) {
		token = tokenCache.token;
	} else {
		// Get new token and cache it
		const {
			data: {
				login: {
					token: newToken,
					profile: { id: newId },
				},
			},
		} = await getLiteralToken();

		tokenCache = {
			token: newToken,
			profileId: newId,
			expires: Date.now() + TOKEN_DURATION,
		};

		token = newToken;
	}

	// Try each ISBN until we get a valid response
	for (const isbn of isbns) {
		const response = await fetch(LITERAL_API, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				query: `query GetBookByIsbn($isbn13: String!) {
          book(where: { isbn13: $isbn13 }) {
            title
            cover
            authors {
              name
            }
          }
        }`,
				variables: { isbn13: isbn },
			}),
		});

		if (!response.ok) {
			console.warn(`Literal API failed for ISBN ${isbn}:`, response.status);
			continue; // Try next ISBN
		}

		const result: LiteralBookResponse = await response.json();
		const book = result.data.book;

		// Check if we have valid data (title, cover, and at least one author)
		if (book && book.title && book.cover && book.authors.length > 0) {
			return book as ValidLiteralBook;
		}
	}

	// If we get here, none of the ISBNs worked
	throw new Error(
		`Could not find valid book data for any ISBN: ${isbns.join(", ")}`,
	);
}

function extractReviewText(
	reviewSlate?: HardcoverActivity["data"]["userBook"]["reviewSlate"],
): string {
	if (!reviewSlate?.document?.children?.[0]?.children?.[0]?.text) {
		return "";
	}
	return reviewSlate.document.children[0].children[0].text;
}

async function getBooks(): Promise<LibraryItem[]> {
	// Get books with reviews from Hardcover
	const { books: hardcoverBooks, error: hardcoverError } =
		await getHardcoverBooks();

	if (hardcoverError) {
		console.error("Hardcover API error:", hardcoverError);
		throw error(500, {
			message: "Failed to fetch books from Hardcover API",
			details: hardcoverError,
		});
	}

	if (hardcoverBooks.length === 0) {
		console.warn("No books returned from Hardcover API");
		return [];
	}

	// Process each book: get ISBN from Hardcover, then fetch cover/authors from Literal
	const libraryBooks: LibraryItem[] = [];

	for (const activity of hardcoverBooks) {
		const isbns = activity.book.editions
			.map((edition) => edition.isbn_13)
			.filter(Boolean);
		if (isbns.length === 0) {
			console.warn(`No ISBNs found for book: ${activity.book.title}`);
			continue;
		}

		try {
			// Get cover and author info from Literal API
			const literalBook = await getLiteralBookData(isbns);

			// Extract review text from Hardcover
			const reviewText = extractReviewText(activity.data.userBook.reviewSlate);

			// Combine data into LibraryItem format
			const libraryItem: LibraryItem = {
				id: `hardcover-${activity.data.userBook.id}`,
				type: "book" as const,
				title: activity.book.title,
				published: new Date(activity.book.release_year, 0, 1).toISOString(),
				published_by: literalBook.authors
					.map((author) => author.name)
					.join(", "),
				thumbnail: literalBook.cover,
				note: reviewText || `Finished reading: ${activity.book.title}`,
			};

			libraryBooks.push(libraryItem);
		} catch (err) {
			console.error(
				`Could not get valid data for book "${activity.book.title}" from Literal API (tried ISBNs: ${isbns.join(", ")}). Omitting from library.`,
			);
		}
	}

	return libraryBooks;
}

/**
 * PAGE SERVER LOAD FUNCTION
 *
 * This function runs:
 * - During development: On every page refresh/navigation
 * - During build (`vite build`): Once per route, data gets baked into static HTML
 * - After deployment: Never (static files served directly)
 *
 * Perfect for static site generation because:
 * 1. API data fetched at build time
 * 2. Pre-rendered into HTML
 * 3. No runtime dependencies on external APIs
 * 4. Fast loading (no client-side API calls)
 *
 * To rebuild with fresh data: `npm run build`
 */
export const load: PageServerLoad = async () => {
	try {
		// Fetch books from Literal API (happens once during build)
		const books = await getBooks();

		// Combine all library items and sort by published date (newest first)
		const allItems: LibraryItem[] = [
			...books,
			...webpages,
			...photographs,
		].sort(
			(a, b) =>
				new Date(b.published).getTime() - new Date(a.published).getTime(),
		);

		return {
			items: allItems,
			buildTime: new Date().toISOString(), // Timestamp of when this data was fetched
		};
	} catch (err) {
		console.error("Error loading library content:", err);
		throw error(500, {
			message: "Failed to load library content",
			details: err instanceof Error ? err.message : "Unknown error",
		});
	}
};
