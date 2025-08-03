import { error } from "@sveltejs/kit";
import {
  HARDCOVER_API_BEARER_TOKEN,
  LITERAL_EMAIL,
  LITERAL_PASSWORD,
} from "$env/static/private";
import { photographs } from "$lib/data/photographs.js";
import { webpages } from "$lib/data/webpages.js";
import type { Item } from "$lib/types/library.js";
import { ITEM_TYPE } from "$lib/types/library.js";
import type { PageServerLoad } from "./$types";

import {
  HardcoverBooksWithReviewQuery,
  LiteralTokenQuery,
  LiteralBookQuery,
} from "./hardcover.server";
import type {
  HardcoverBook,
  HardcoverBooksResponse,
  LiteralBook,
  LiteralBookResponse,
  LiteralTokenResponse,
  Author,
} from "./hardcover.server";

// Local type alias
type LibraryItem = Item;

const LITERAL_API = "https://literal.club/graphql/";
// RESPONSE TYPES

// TOKEN MANAGEMENT
// In-memory cache to avoid repeated auth calls during development
let tokenCache: { token: string; profileId: string; expires: number } | null =
  null;
const TOKEN_DURATION = 1000 * 60 * 15;

const getLiteralToken = async (): Promise<LiteralTokenResponse> => {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: LiteralTokenQuery,
      variables: {
        email: LITERAL_EMAIL,
        password: LITERAL_PASSWORD,
      },
    }),
  };

  const res = await fetch(LITERAL_API, options);
  if (!res.ok) throw error(res.status, "Token fetch failed");

  const result: LiteralTokenResponse = await res.json();
  return result;
};

// const getHardcoverBooks = async (): Promise<HardcoverBook[]> => {
//   const response = await fetch(HARDCOVER_API, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `${HARDCOVER_API_BEARER_TOKEN}`,
//     },
//     body: JSON.stringify({
//       query: HardcoverBooksWithReviewQuery,
//     }),
//   });

//   if (!response.ok) throw error(response.status, "Hardcover API failed");

//   const result: HardcoverBooksResponse = await response.json();

//   console.log(JSON.stringify(result));

//   if (!result.data?.me?.[0]?.activities) {
//     throw error(500, "No book activities found");
//   }

//   return result.data.me[0].activities;
// };

const getLiteralBookData = async (isbns: string[]): Promise<LiteralBook> => {
  let token: string;

  if (tokenCache && Date.now() < tokenCache.expires) {
    token = tokenCache.token;
  } else {
    const result = await getLiteralToken();
    const newToken = result.data.login.token;
    const newId = result.data.login.profile.id;

    tokenCache = {
      token: newToken,
      profileId: newId.toString(),
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
        query: LiteralBookQuery,
        variables: { isbn13: isbn },
      }),
    });

    if (!response.ok) continue;

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
  reviewSlate?: HardcoverBook["data"]["userBook"]["reviewSlate"],
): string => {
  if (!reviewSlate?.document?.children?.[0]?.children?.[0]?.text) {
    return "";
  }
  return reviewSlate.document.children[0].children[0].text;
};

const getBooks = async (): Promise<LibraryItem[]> => {
  const hardcoverBooks = await getHardcoverBooks();

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
        }),
      ),
    ).sort((a, b) => b - a); // Sort newest first

    return {
      items: allItems,
      contentTypes: ITEM_TYPE,
      decades,
    };
  } catch (err) {
    console.error("Error loading library content:", err);
    throw error(500, "Failed to load library content");
  }
};
