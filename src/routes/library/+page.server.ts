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

// RESPONSE TYPES
interface HardcoverActivity {
	data: {
		userBook: {
			id: number;
			reviewSlate?: {
				document: {
					children: Array<{
						children: Array<{
							text: string;
						}>;
					}>;
				};
			};
		};
	};
	book: {
		title: string;
		release_year: number;
		editions: Array<{
			isbn_13: string;
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

// Extract types from responses
type LiteralBook = NonNullable<LiteralBookResponse['data']['book']>;
type Author = LiteralBook['authors'][0];

// TOKEN MANAGEMENT
// In-memory cache to avoid repeated auth calls during development
let tokenCache: { token: string; profileId: string; expires: number } | null = null;
const TOKEN_DURATION = 1000 * 60 * 15;

const getLiteralToken = async () => {
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
};

const getHardcoverBooks = async (): Promise<{
	books: HardcoverActivity[];
	error?: string;
}> => {
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
};

const getLiteralBookData = async (isbns: string[]): Promise<LiteralBook> => {
	let token: string;

	if (tokenCache && Date.now() < tokenCache.expires) {
		token = tokenCache.token;
	} else {
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

		if (book?.title && book?.cover && book?.authors.length > 0) {
			return book as LiteralBook;
		}
	}

	// If we get here, none of the ISBNs worked
	throw new Error(
		`Could not find valid book data for any ISBN: ${isbns.join(", ")}`,
	);
};

const extractReviewText = (
	reviewSlate?: HardcoverActivity["data"]["userBook"]["reviewSlate"],
): string => {
	if (!reviewSlate?.document?.children?.[0]?.children?.[0]?.text) {
		return "";
	}
	return reviewSlate.document.children[0].children[0].text;
};

const getBooks = async (): Promise<LibraryItem[]> => {
	const { books: hardcoverBooks, error: hardcoverError } = await getHardcoverBooks();

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
			const literalBook = await getLiteralBookData(isbns);
			const reviewText = extractReviewText(activity.data.userBook.reviewSlate);

			const libraryItem: LibraryItem = {
				id: `hardcover-${activity.data.userBook.id}`,
				type: "book" as const,
				title: activity.book.title,
				published: new Date(activity.book.release_year, 0, 1).toISOString(),
				published_by: literalBook.authors
					.map((author: Author) => author.name)
					.join(", "),
				thumbnail: literalBook.cover,
				note: reviewText || `Finished reading: ${activity.book.title}`,
			};

			libraryBooks.push(libraryItem);
		} catch {
			console.error(
				`Could not get valid data for book "${activity.book.title}" from Literal API (tried ISBNs: ${isbns.join(", ")}). Omitting from library.`,
			);
		}
	}

	return libraryBooks;
};

// DATA LOADING - Runs once during build, data gets baked into static HTML
export const load: PageServerLoad = async () => {
	try {
		const books = await getBooks();

		const allItems: LibraryItem[] = [
			...books,
			...webpages,
			...photographs,
		].sort(
			(a, b) =>
				new Date(b.published).getTime() - new Date(a.published).getTime(),
		);

		// Generate available decades from the data
		const decades = Array.from(
			new Set(
				allItems.map((item) => {
					const year = new Date(item.published).getFullYear();
					return Math.floor(year / 10) * 10; // Convert year to decade (e.g., 2023 -> 2020)
				})
			)
		).sort((a, b) => b - a); // Sort newest first

		return {
			items: allItems,
			decades,
		};
	} catch (err) {
		console.error("Error loading library content:", err);
		throw error(500, {
			message: "Failed to load library content",
			details: err instanceof Error ? err.message : "Unknown error",
		});
	}
};
