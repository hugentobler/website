import type { Webpage } from '$lib/types/library.js';

export const webpages: Webpage[] = [
  {
    id: 'webpage-1',
    type: 'webpage',
    title: 'Building Modern Web Applications',
    date: '2024-01-15T10:00:00Z',
    content: 'Exploring the latest trends in web development and how they shape the future of digital experiences.',
    tags: ['web-development', 'technology', 'frontend'],
    slug: 'building-modern-web-applications',
    review: 'Great insights on modern web architecture patterns.'
  },
  {
    id: 'webpage-2',
    type: 'webpage',
    title: 'The Art of Minimalist Design',
    date: '2024-01-10T14:30:00Z',
    content: 'How less can be more when it comes to creating compelling user interfaces and experiences.',
    tags: ['design', 'minimalism', 'ui-ux'],
    slug: 'art-of-minimalist-design'
  },
  {
    id: 'webpage-3',
    type: 'webpage',
    title: 'Photography and Light',
    date: '2024-01-05T09:15:00Z',
    content: 'Understanding how natural light transforms ordinary moments into extraordinary captures.',
    tags: ['photography', 'light', 'art'],
    slug: 'photography-and-light',
    url: 'https://example.com/photography-light',
    review: 'Comprehensive guide to natural lighting techniques.'
  }
];
