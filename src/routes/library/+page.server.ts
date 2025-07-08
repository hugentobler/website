import { error } from '@sveltejs/kit';

import { LITERAL_EMAIL, LITERAL_PASSWORD } from '$env/static/private';
import type { LibraryItem } from '$lib/types/library.js';
import { webpages } from '$lib/data/webpages.js';
import { photographs } from '$lib/data/photographs.js';

import type { PageServerLoad } from './$types';

const LITERAL_API = 'https://literal.club/graphql/';

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
let tokenCache: { token: string; profileId: string; expires: number } | null = null;
const TOKEN_DURATION = 1000 * 60 * 15; // 15 minutes (reasonable for a dev session)

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

async function getBooks(): Promise<LibraryItem[]> {
  let token: string;
  let id: string;
  
  // Check if we have a valid cached token
  if (tokenCache && Date.now() < tokenCache.expires) {
    // Use cached token
    token = tokenCache.token;
    id = tokenCache.profileId;
  } else {
    // Get new token and cache it
    const {
      data: {
        login: {
          token: newToken,
          profile: { id: newId }
        }
      }
    } = await getLiteralToken();
    
    tokenCache = {
      token: newToken,
      profileId: newId,
      expires: Date.now() + TOKEN_DURATION
    };
    
    token = newToken;
    id = newId;
  }

  // Query finished books from Literal API
  // Note: The API documentation mentions reviews field but it doesn't exist in the actual schema
  // We get book data but not personal review text - that would need to be added manually
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
          publishedDate
          cover
          authors {
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

  // Transform to simplified LibraryItem format
  // Note: We get finished books but not review data with this query
  // The Literal API doesn't expose reviews field on Profile as documented
  const libraryBooks: LibraryItem[] = books.map((book: any) => ({
    id: book.id,
    type: 'book' as const,
    title: book.title,
    published: book.publishedDate || new Date().toISOString(),
    published_by: book.authors.map((author: any) => author.name).join(', '),
    image: book.cover,
    note: `Finished reading: ${book.title}` // Placeholder - reviews field not available in API
  }));

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
    const allItems: LibraryItem[] = [...books, ...webpages, ...photographs]
      .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

    return {
      items: allItems,
      buildTime: new Date().toISOString() // Timestamp of when this data was fetched
    };
  } catch (err) {
    console.error('Error loading library content:', err);
    throw error(500, {
      message: 'Failed to load library content',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};
