import { error } from '@sveltejs/kit';

import { LITERAL_EMAIL, LITERAL_PASSWORD } from '$env/static/private';
import type { LibraryItem, Book, Author } from '$lib/types/library.js';
import { webpages } from '$lib/data/webpages.js';
import { photographs } from '$lib/data/photographs.js';

import type { PageServerLoad } from './$types';

const LITERAL_API = 'https://literal.club/graphql/';

async function getLiteralToken() {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation login($email: String!, $password: String!) {
				login(email: $email, password: $password) {
					token
					profile { id }
				}
			}`,
      variables: {
        email: LITERAL_EMAIL,
        password: LITERAL_PASSWORD
      }
    })
  };

  const res = await fetch(LITERAL_API, options);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Token fetch failed:', res.status, errorText);
    throw error(res.status, {
      message: 'Failed to fetch authentication token',
      details: errorText
    });
  }

  const result = await res.json();

  if (result.errors) {
    throw error(400, {
      message: 'Authentication failed',
      details: result.errors[0]?.message
    });
  }

  return result;
}

async function getBooks(): Promise<Book[]> {
  const {
    data: {
      login: {
        token,
        profile: { id }
      }
    }
  } = await getLiteralToken();

  const readingStatus = 'FINISHED';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `query booksByReadingStateAndProfile(
				$limit: Int!
				$offset: Int!
				$readingStatus: ReadingStatus!
				$profileId: String!
			) {
				booksByReadingStateAndProfile(
					limit: $limit
					offset: $offset
					readingStatus: $readingStatus
					profileId: $profileId
				) {
					id
					title
					subtitle
					description
					slug
					cover
					authors {
						id
						name
					}
				}
			}`,
      variables: { limit: 100, offset: 0, readingStatus, profileId: id }
    })
  };

  const res = await fetch(LITERAL_API, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw error(res.status, {
      message: 'Failed to fetch books from Literal API',
      details: errorText
    });
  }

  const result = await res.json();

  if (result.errors) {
    throw error(400, {
      message: 'GraphQL query failed',
      details: result.errors[0]?.message
    });
  }

  const books = result.data.booksByReadingStateAndProfile;

  // Transform to LibraryItem format
  const finishedBooks: Book[] = books.map((book: any) => ({
    ...book,
    type: 'book' as const,
    date: new Date().toISOString() // Use current date since we don't have finish dates
  }));

  return finishedBooks;
}

export const load: PageServerLoad = async () => {
  try {
    // Fetch books from Literal API
    const books = await getBooks();
    
    // Combine all library items and sort by date (newest first)
    const allItems: LibraryItem[] = [...books, ...webpages, ...photographs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      items: allItems,
      buildTime: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error loading library content:', err);
    throw error(500, {
      message: 'Failed to load library content',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};
