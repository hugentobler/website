import { error } from '@sveltejs/kit';

import { LITERAL_EMAIL, LITERAL_PASSWORD } from '$env/static/private';

import type { PageServerLoad } from './$types';

type Author = {
  id: string;
  name: string;
};

type Book = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  slug: string;
  cover?: string;
  authors: Author[];
};

type FinishedBook = Book & {
  finishedDate?: string;
};

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

async function getBooks(): Promise<FinishedBook[]> {
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

  // For now, return books without finish dates
  // We can add finish dates in a follow-up if needed
  const finishedBooks: FinishedBook[] = books.map((book: Book) => ({
    ...book
  }));

  return finishedBooks;
}

export const load: PageServerLoad = async () => {
  try {
    const books = await getBooks();
    return {
      books,
      buildTime: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error fetching books:', err);
    throw error(500, {
      message: 'Failed to load books',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};
