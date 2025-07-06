import { error } from '@sveltejs/kit';

import { LITERAL_EMAIL, LITERAL_PASSWORD } from '$env/static/private';

import type { PageServerLoad } from './$types';

// Content type definitions
type ContentType = 'book' | 'post' | 'photo';

type BaseContent = {
  id: string;
  type: ContentType;
  title: string;
  date: string; // ISO date string
};

type Author = {
  id: string;
  name: string;
};

type Book = BaseContent & {
  type: 'book';
  subtitle?: string;
  description?: string;
  slug: string;
  cover?: string;
  authors: Author[];
  finishedDate?: string;
};

type Post = BaseContent & {
  type: 'post';
  content: string;
  tags: string[];
  slug: string;
};

type Photo = BaseContent & {
  type: 'photo';
  url: string;
  caption?: string;
  location?: string;
  camera?: string;
};

type ContentItem = Book | Post | Photo;

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

  // Transform to ContentItem format
  const finishedBooks: Book[] = books.map((book: any) => ({
    ...book,
    type: 'book' as const,
    date: new Date().toISOString() // Use current date since we don't have finish dates
  }));

  return finishedBooks;
}

function getMockPosts(): Post[] {
  return [
    {
      id: 'post-1',
      type: 'post',
      title: 'Building Modern Web Applications',
      date: '2024-01-15T10:00:00Z',
      content:
        'Exploring the latest trends in web development and how they shape the future of digital experiences.',
      tags: ['web-development', 'technology', 'frontend'],
      slug: 'building-modern-web-applications'
    },
    {
      id: 'post-2',
      type: 'post',
      title: 'The Art of Minimalist Design',
      date: '2024-01-10T14:30:00Z',
      content:
        'How less can be more when it comes to creating compelling user interfaces and experiences.',
      tags: ['design', 'minimalism', 'ui-ux'],
      slug: 'art-of-minimalist-design'
    },
    {
      id: 'post-3',
      type: 'post',
      title: 'Photography and Light',
      date: '2024-01-05T09:15:00Z',
      content:
        'Understanding how natural light transforms ordinary moments into extraordinary captures.',
      tags: ['photography', 'light', 'art'],
      slug: 'photography-and-light'
    }
  ];
}

function getMockPhotos(): Photo[] {
  return [
    {
      id: 'photo-1',
      type: 'photo',
      title: 'Mountain Sunrise',
      date: '2024-01-20T06:00:00Z',
      url: 'https://picsum.photos/800/600?random=1',
      caption: 'Golden hour over the Swiss Alps',
      location: 'Swiss Alps, Switzerland',
      camera: 'Canon EOS R5'
    },
    {
      id: 'photo-2',
      type: 'photo',
      title: 'Urban Architecture',
      date: '2024-01-18T12:00:00Z',
      url: 'https://picsum.photos/800/600?random=2',
      caption: 'Modern lines and shadows in the city',
      location: 'Zurich, Switzerland',
      camera: 'Sony A7III'
    },
    {
      id: 'photo-3',
      type: 'photo',
      title: 'Forest Path',
      date: '2024-01-16T16:30:00Z',
      url: 'https://picsum.photos/800/600?random=3',
      caption: 'A quiet trail through autumn woods',
      location: 'Black Forest, Germany',
      camera: 'Fujifilm X-T4'
    },
    {
      id: 'photo-4',
      type: 'photo',
      title: 'Lake Reflection',
      date: '2024-01-12T08:45:00Z',
      url: 'https://picsum.photos/800/600?random=4',
      caption: 'Perfect mirror on a calm morning',
      location: 'Lake Geneva, Switzerland',
      camera: 'Canon EOS R5'
    }
  ];
}

export const load: PageServerLoad = async () => {
  try {
    // Fetch books from Literal API
    const books = await getBooks();

    // Get mock data for other content types
    const posts = getMockPosts();
    const photos = getMockPhotos();

    // Combine all content and sort by date (newest first)
    const allContent: ContentItem[] = [...books, ...posts, ...photos].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      content: allContent,
      buildTime: new Date().toISOString()
    };
  } catch (err) {
    console.error('Error loading archive content:', err);
    throw error(500, {
      message: 'Failed to load archive content',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};
