import { photographs } from "$lib/data/photographs.js";
import { webpages } from "$lib/data/webpages.js";
import type { Item } from "$lib/types/library.js";
import type { PageServerLoad } from "./$types";
import { getHardcoverBooks } from "./hardcover.server";
import { getLiteralDataForIsbn } from "./literal.server";

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
      return null;
    }

    // Hardcover data
    const itemBook: Partial<Item> = {
      type: "book",
      title: `${book.title}${book.subtitle ? `, ${book.subtitle}` : ""}`,
      published: new Date(book.releaseYear, 0, 1).toISOString(),
      decade: Math.floor(book.releaseYear / 10) * 10,
      note: book.reviewText,
    };

    // Literal data from first valid ISBN
    let literalData = null;
    for (const isbn of isbns) {
      const { data } = await getLiteralDataForIsbn(isbn);
      if (data?.cover) {
        literalData = data;
        break; // Stop once we find a valid ISBN with cover data
      }
    }

    if (!literalData) {
      console.warn(
        `No Literal data found for any ISBN for book: ${book.title}`,
      );
      return null; // Skip this book if we couldn't get cover data
    }

    itemBook.published_by =
      literalData.authors?.map((author) => author.name).join(", ") || "Unknown";
    itemBook.thumbnail = literalData.cover;

    return itemBook as Item;
  });

  return (await Promise.all(bookPromises)).filter(Boolean) as Item[];
};

// DATA LOADING - Runs once during build, data gets baked into static HTML
export const load: PageServerLoad = async () => {
  const books = await getBooks();

  // Add decade to webpages and photographs
  const itemsWithDecades = [...books, ...webpages, ...photographs].map(item => ({
    ...item,
    decade: item.decade || Math.floor(new Date(item.published).getFullYear() / 10) * 10
  }));

  const items = itemsWithDecades.sort(
    (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
  );

  // Generate available types from data
  const types = Array.from(new Set(items.map((item) => item.type))).sort(
    (a, b) => a.localeCompare(b),
  ); // Sort alphabetically

  // Generate available decades from data
  const decades = Array.from(
    new Set(items.map((item) => item.decade)),
  ).sort((a, b) => b - a); // Sort newest first

  return {
    items,
    types,
    decades,
  };
};
